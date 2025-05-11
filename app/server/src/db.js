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
      await this.sql`
        CREATE SCHEMA IF NOT EXISTS social;
      `;
      await this.sql`
        CREATE TABLE IF NOT EXISTS social.boosts (
          boost_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          -- boost info
          delegate_id varchar(80) NOT NULL,
          boost_quantity INT NOT NULL,
          boost_comment TEXT,
          platform_address VARCHAR(64),
          platform_fee bigint,
          owner_address VARCHAR(64),
          owner_fee bigint,
          -- wallet info
          network VARCHAR(10) NOT NULL,
          wallet_type VARCHAR(10) NOT NULL,
          inscription_method VARCHAR(40) NOT NULL,
          ordinals_address VARCHAR(64) NOT NULL,
          ordinals_public_key VARCHAR(66) NOT NULL,
          payment_address VARCHAR(64) NOT NULL,
          payment_public_key VARCHAR(66) NOT NULL,
          ephemeral_public_key VARCHAR(66),
          -- inscription info
          fee_rate INT NOT NULL,
          commit_tx_hex TEXT NOT NULL,
          commit_tx_id VARCHAR(64) NOT NULL,
          reveal_tx_hex TEXT NOT NULL,
          reveal_tx_id VARCHAR(64) NOT NULL,
          reveal_address_script TEXT NOT NULL,
          reveal_tapmerkleroot TEXT NOT NULL,
          reveal_input_value BIGINT NOT NULL,
          reveal_script TEXT NOT NULL,
          -- status
          broadcast_status VARCHAR(11),
          broadcast_error TEXT,
          commit_tx_status VARCHAR(11),
          reveal_tx_status VARCHAR(11),

          timestamp TIMESTAMP DEFAULT NOW()
        );
      `;
      await this.sql`
        CREATE TABLE IF NOT EXISTS social.broadcasted_reveal_sweeps (
          broadcast_sweep_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          sweep_type VARCHAR(20) NOT NULL,
          boost_id UUID NOT NULL REFERENCES social.boosts(boost_id),
          ordinals_address VARCHAR(64) NOT NULL,
          payment_address VARCHAR(64) NOT NULL,
          sweep_tx_id VARCHAR(64) NOT NULL,
          fee_rate INT NOT NULL,
          wallet_type VARCHAR(10),
          network VARCHAR(10),
          -- broadcast info
          broadcast_status VARCHAR(11),
          broadcast_error TEXT,
          sweep_tx_status VARCHAR(11),

          timestamp TIMESTAMP DEFAULT NOW()
        );
      `;
      await this.sql`
        CREATE TABLE IF NOT EXISTS social.stored_ephemeral_sweeps (
          ephemeral_sweep_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          boost_id UUID NOT NULL REFERENCES social.boosts(boost_id),
          ordinals_address VARCHAR(64) NOT NULL,
          payment_address VARCHAR(64) NOT NULL,
          network VARCHAR(10),
          fee_rate INT NOT NULL,
          sweep_tx_id VARCHAR(64) NOT NULL,
          sweep_tx_hex TEXT NOT NULL,
          broadcasted BOOLEAN DEFAULT FALSE,
          broadcast_sweep_id UUID REFERENCES social.broadcasted_reveal_sweeps(broadcast_sweep_id)
        );
      `;
      await this.sql`
        CREATE TABLE IF NOT EXISTS social.sign_ins (
          sign_in_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          sign_in_status VARCHAR(20) NOT NULL DEFAULT 'pending',
          signature_type VARCHAR(10) DEFAULT 'bip322',
          address VARCHAR(64) NOT NULL,
          sign_in_message TEXT NOT NULL,
          wallet_type VARCHAR(10),
          timestamp TIMESTAMP DEFAULT NOW(),
          signature TEXT,
          verified BOOLEAN DEFAULT FALSE,
          verified_timestamp TIMESTAMP DEFAULT NULL,
          verify_error TEXT,
          sec_ch_ua TEXT,
          sec_ch_ua_mobile TEXT,
          sec_ch_ua_platform TEXT,
          user_agent TEXT,
          accept_language TEXT
        );
      `;
    } catch (err) {
      console.error(err);
      throw new Error('Error setting up database: ' + err.message);
    }
  },

  async getStartingOffset(retry = false) {
    try {
      const [row] = await this.sql`SELECT MAX(sequence_number) FROM rendered_content`;
      return Number(row.max) + 1 || 0;
    } catch (err) {
      if (retry) {
        console.error('Error fetching starting offset, retrying in a minute:', err);
        await Bun.sleep(60000);
        return this.getStartingOffset();
      }
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

  // Social
  async recordBoost(boost) {
    try {
      let boostId = await this.sql`INSERT INTO social.boosts ${this.sql(boost)} RETURNING boost_id;`;
      return boostId;
    } catch (err) {
      throw new Error(`Error during boost insert: ${err.message}`, { cause: err });
    }
  },
  async updateBoost(boostId, boost) {
    try {
      await this.sql`UPDATE social.boosts SET ${this.sql(boost)} WHERE boost_id = ${boostId}`;
    } catch (err) { 
      throw new Error(`Error during boost update: ${err.message}`, { cause: err });
    }
  },
  async recordSweep(sweep) {
    try {
      let sweepId = await this.sql`INSERT INTO social.broadcasted_reveal_sweeps ${this.sql(sweep)} RETURNING broadcast_sweep_id;`;
      return sweepId;
    } catch (err) {
      throw new Error(`Error during sweep insert: ${err.message}`, { cause: err });
    }
  },
  async updateSweep(sweepId, sweep) {
    try {
      await this.sql`UPDATE social.broadcasted_reveal_sweeps SET ${this.sql(sweep)} WHERE broadcast_sweep_id = ${sweepId}`;
    }
    catch (err) {
      throw new Error(`Error during sweep update: ${err.message}`, { cause: err });
    }
  },
  async storeEphemeralSweeps(sweep) {
    try {
      let sweepId = await this.sql`INSERT INTO social.stored_ephemeral_sweeps ${this.sql(sweep)} RETURNING ephemeral_sweep_id;`;
      return sweepId;
    } catch (err) {
      throw new Error(`Error during sweep backup: ${err.message}`, { cause: err });
    }
  },
  async getStoredEphemeralSweeps(boostId, address) {
    try {
      const sweeps = await this.sql`SELECT * FROM social.stored_ephemeral_sweeps WHERE boost_id = ${boostId} AND ordinals_address = ${address}`;
      return sweeps;
    } catch (err) {
      throw new Error('Error fetching ephemeral backups: ' + err.message, { cause: err });
    }
  },
  async getBoostsToMonitor() {
    try {
      const txs = await this.sql`SELECT boost_id, commit_tx_id, reveal_tx_id, commit_tx_status, reveal_tx_status, network, timestamp FROM social.boosts WHERE commit_tx_status = 'pending' OR reveal_tx_status = 'pending'`;
      return txs;
    } catch (err) {
      throw new Error('Error fetching transactions to monitor: ' + err.message);
    }
  },
  async getSweepsToMonitor() {
    try {
      const txs = await this.sql`SELECT broadcast_sweep_id, sweep_tx_id, sweep_tx_status, network, timestamp FROM social.broadcasted_reveal_sweeps WHERE sweep_tx_status = 'pending'`;
      return txs;
    } catch (err) {
      throw new Error('Error fetching transactions to monitor: ' + err.message);
    }
  },
  async getBoostsForAddress(address) {
    try {
      const boosts = await this.sql`SELECT * FROM social.boosts WHERE (ordinals_address = ${address} OR payment_address = ${address})`;
      return boosts;
    } catch (err) {
      throw new Error('Error fetching boosts: ' + err.message);
    }
  },
  async getSweepsForAddress(address) {
    try {
      const sweeps = await this.sql`SELECT * FROM social.broadcasted_reveal_sweeps WHERE (ordinals_address = ${address} OR payment_address = ${address})`;
      return sweeps;
    } catch (err) {
      throw new Error('Error fetching sweeps: ' + err.message);
    }
  },
  async getBoostsAndSweepsForAddress(address) {
    try {
      const boostsAndSweeps = await this.sql`
        with ranked_sweeps as (
          select 
            boost_id, 
            broadcast_sweep_id, 
            sweep_tx_id, 
            sweep_tx_status, 
            ROW_NUMBER() OVER (PARTITION BY boost_id order by fee_rate desc) as rn 
          from social.broadcasted_reveal_sweeps 
          where sweep_tx_status in ('pending', 'confirmed')
        )
        SELECT 
          b.*, 
          rs.broadcast_sweep_id, 
          rs.sweep_tx_id, 
          rs.sweep_tx_status 
        from social.boosts b
        left join ranked_sweeps rs 
          on b.boost_id=rs.boost_id 
          and rs.rn=1
        where b.ordinals_address = ${address};`
      return boostsAndSweeps;
    } catch (err) {
      throw new Error('Error fetching boosts and sweeps: ' + err.message);
    }
  },
  async appendSignInRecord(signInRecord) {
    try {
      await this.sql`INSERT INTO social.sign_ins ${this.sql(signInRecord)}`;
    } catch (err) {
      throw new Error('Error appending sign in record: ' + err.message);
    }
  },
  async getSignInRecord(address, message) {
    try {
      const signIn = await this.sql`SELECT * FROM social.sign_ins WHERE address = ${address} AND sign_in_message = ${message} LIMIT 1`;
      return signIn;
    } catch (err) {
      throw new Error('Error fetching sign in record: ' + err.message);
    }
  },
  async updateSignInRecord(address, message, signInRecord) {
    try {
      await this.sql`UPDATE social.sign_ins SET ${this.sql(signInRecord)} WHERE address = ${address} AND sign_in_message = ${message}`;
    } catch (err) {
      throw new Error('Error updating sign in record: ' + err.message);
    }
  },

  // Shutdown
  async close() {
    await this.sql.end();
  }
}

export default db;