import { parse } from 'yaml';
import { SQL } from 'bun';

const configFile = Bun.file(`${process.env.HOME}/ord.yaml`);
const config = parse(await configFile.text());

const db = {
  sql: new SQL({
    user: config.db_user,
    host: config.db_host,
    database: config.db_name,
    password: config.db_password,
    port: 5432,
  }),

  async setupDatabase() {
    try {
      await this.sql`
        CREATE TABLE IF NOT EXISTS rendered_content (
          id varchar(80) PRIMARY KEY,
          sequence_number BIGINT,
          content BYTEA,
          content_type TEXT,
          render_status TEXT
        );
      `;
    } catch (err) {
      console.error(err);
      throw new Error('Error setting up database: ' + err.message);
    }
  },

  async getStartingOffset() {
    try {
      const [row] = await this.sql`SELECT MAX(sequence_number) FROM rendered_content`;
      return Number(row.max) + 1 || 0;
    } catch (err) {
      throw new Error('Error fetching starting offset: ' + err.message);
    }
  },

  async getInscriptionsToRender(limit, offset = 0) {
    try {
      // Get inscriptions that are HTML or SVG (recursive)
      const inscriptions = await this.sql`
        SELECT o.id, o.sequence_number, o.sha256, o.content_type, o.is_recursive 
        FROM ordinals o
        WHERE 
          ((o.content_type LIKE 'text/html%' OR (o.content_type LIKE 'image/svg%' AND o.is_recursive = true)) AND
          o.sha256 is NOT NULL AND
          o.sequence_number >= ${offset})
        ORDER BY o.sequence_number
        LIMIT ${limit};
      `;
      return inscriptions;
    } catch (err) {
      throw new Error('Error fetching inscriptions: ' + err.message);
    }
  },

  async bulkInsertBun(renderedContent) {    
    try {      
      await this.sql`INSERT INTO rendered_content ${this.sql(renderedContent)} ON CONFLICT (id) DO UPDATE
        SET sequence_number = EXCLUDED.sequence_number,
            content = EXCLUDED.content,
            content_type = EXCLUDED.content_type,
            render_status = EXCLUDED.render_status;`;
    } catch (err) {
      throw new Error('Error during insert: ', { cause: err });
    }
  },

  // Endpoints
  async getBlockIcon(block) {
    const [row] = await this.sql`SELECT id, content_type, is_recursive FROM ordinals 
        WHERE genesis_height = ${block} 
        AND (content_type LIKE 'image%' OR content_type LIKE 'text/html%')
        ORDER BY content_length DESC NULLS LAST
        LIMIT 1`;
    return row;
  },

  async getSatBlockIcon(block) {
    const [row] = await this.sql`SELECT id, content_type, is_recursive FROM ordinals 
        WHERE sat IN (SELECT sat FROM sat WHERE block = ${block})
        AND (content_type LIKE 'image%' OR content_type LIKE 'text/html%')
        ORDER BY content_length DESC NULLS LAST
        LIMIT 1`;
    return row;
  },

  async getRenderedContent(id) {
    const [row] = await this.sql`SELECT content FROM rendered_content WHERE id = ${id}`;
    return row;
  },

  // Shutdown
  async close() {
    await this.sql.end();
  }
}

export default db;