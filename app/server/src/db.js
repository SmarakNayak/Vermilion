import { parse } from 'yaml';
import pg from 'pg';
const { Pool } = pg;
import { from as copyFrom } from 'pg-copy-streams';

const configFile = Bun.file(`${process.env.HOME}/ord_vermilion.yaml`);
const config = parse(await configFile.text());

const db = {
  pool: new Pool({
    user: config.db_user,
    host: config.db_host,
    database: config.db_name,
    password: config.db_password,
    port: 5432,
  }),

  async setupDatabase() {
    try {
      await this.pool.query(`
        CREATE TABLE IF NOT EXISTS rendered_content (
          id varchar(80) PRIMARY KEY,
          sequence_number BIGINT,
          content BYTEA,
          content_type TEXT
        );
      `);
    } catch (err) {
      console.error(err);
      throw new Error('Error setting up database: ' + err.message);
    }
  },

  async getStartingOffset() {
    try {
      const result = await this.pool.query('SELECT MAX(sequence_number) FROM rendered_content');
      return Number(result.rows[0].max) + 1 || 0;
    } catch (err) {
      throw new Error('Error fetching starting offset: ' + err.message);
    }
  },

  async getInscriptionsToRender(limit, offset = 0) {
    try {
      // Get inscriptions that are HTML or SVG (recursive)
      const inscriptions = await this.pool.query(`
        SELECT o.id, o.sequence_number, o.sha256, o.content_type, o.is_recursive 
        FROM ordinals o
        WHERE 
          ((o.content_type LIKE 'text/html%' OR (o.content_type LIKE 'image/svg%' AND o.is_recursive = true)) AND
          o.sha256 is NOT NULL AND
          o.sequence_number >= ${offset})
        ORDER BY o.sequence_number
        LIMIT ${limit};
      `);
      return inscriptions.rows;
    } catch (err) {
      throw new Error('Error fetching inscriptions: ' + err.message);
    }
  },

  async bulkInsertWithBinaryCopy(renderedContent) {
    const client = await this.pool.connect();
    try {
      // Prepare the binary COPY command for the new table
      const copyQuery = 'COPY rendered_content(id, sequence_number, content, content_type) FROM STDIN BINARY';
      const stream = client.query(copyFrom(copyQuery));
  
      // Binary header (required for COPY BINARY)
      const header = Buffer.from([
        0x50, 0x47, 0x43, 0x4F, 0x50, 0x59, 0x0A, 0xFF, 0x0D, 0x0A, 0x00, // PGCOPY\nFF\r\n\0
        0x00, 0x00, 0x00, 0x00, // Flags field (0)
        0x00, 0x00, 0x00, 0x00  // Extension length (0)
      ]);
  
      stream.write(header);
  
      // Write each row in binary format
      renderedContent.forEach(item => {
        // Tuple header: number of columns (4 in this case)
        const tupleHeader = Buffer.from([0x00, 0x04]); // 4 fields
  
        // id field (VARCHAR(80) as text)
        const idBuffer = Buffer.from(item.id, 'utf8');
        const idLength = Buffer.alloc(4);
        idLength.writeInt32BE(idBuffer.length, 0);
        const idData = Buffer.concat([idLength, idBuffer]);
  
        // sequence_number field (BIGINT as binary)
        const sequenceNumberBuffer = Buffer.alloc(8);
        sequenceNumberBuffer.writeBigInt64BE(BigInt(item.sequence_number), 0);
        const sequenceNumberLength = Buffer.alloc(4);
        sequenceNumberLength.writeInt32BE(sequenceNumberBuffer.length, 0);
        const sequenceNumberData = Buffer.concat([sequenceNumberLength, sequenceNumberBuffer]);
  
        // content field (BYTEA as binary)
        const contentBuffer = item.content; // Already a Buffer
        const contentLength = Buffer.alloc(4);
        contentLength.writeInt32BE(contentBuffer.length, 0);
        const contentData = Buffer.concat([contentLength, contentBuffer]);
  
        // content_type field (text as binary)
        const contentTypeBuffer = Buffer.from(item.content_type, 'utf8');
        const contentTypeLength = Buffer.alloc(4);
        contentTypeLength.writeInt32BE(contentTypeBuffer.length, 0);
        const contentTypeData = Buffer.concat([contentTypeLength, contentTypeBuffer]);
  
        // Combine tuple data
        const tuple = Buffer.concat([tupleHeader, idData, sequenceNumberData, contentData, contentTypeData]);
        stream.write(tuple);
      });
  
      // Trailer: -1 to indicate end of data
      const trailer = Buffer.from([0xFF, 0xFF]);
      stream.write(trailer);
  
      // End the stream
      stream.end();
  
      // Wait for the stream to complete
      await new Promise((resolve, reject) => {
        stream.on('finish', resolve);
        stream.on('error', reject);
      });
  
      console.log('Binary COPY completed successfully');
    } catch (err) {
      console.error('Error during binary COPY:', err);
      throw new Error('Error during binary COPY: ' + err.message);
    } finally {
      client.release();
    }
  },

  // Endpoints
  async getBlockIcon(block) {
    const [row] = await this.pool.query(`SELECT id, content_type, is_recursive FROM ordinals 
        WHERE genesis_height = ${block} 
        AND (content_type LIKE 'image%' OR content_type LIKE 'text/html%')
        ORDER BY content_length DESC NULLS LAST
        LIMIT 1`);
    return row;
  },

  async getSatBlockIcon(block) {
    const [row] = await this.pool.query(`SELECT id, content_type, is_recursive FROM ordinals 
        WHERE sat IN (SELECT sat FROM sat WHERE block = ${block})
        AND (content_type LIKE 'image%' OR content_type LIKE 'text/html%')
        ORDER BY content_length DESC NULLS LAST
        LIMIT 1`);
    return row;
  },

  async getRenderedContenet(id) {
    const [row] = await this.pool.query(`SELECT content FROM rendered_content WHERE id = ${id}`);
    return row;
  },

  // Shutdown
  async close() {
    await this.pool.end();
  }
}

export default db;