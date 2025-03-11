import { parse } from 'yaml';
import puppeteer from 'puppeteer';
import playwright from 'playwright';
import { Jimp, diff } from 'jimp';
import renderContentPuppeteer from './puppeteer';
import pg from 'pg'
const { Pool, Client } = pg

// Configuration - use local address in production or fall back to external URL
const isProd = process.env.NODE_ENV === 'production';
const apiBaseUrl = isProd ? 'http://127.0.0.1:80' : 'https://blue.vermilion.place';
const configFile = Bun.file(`${process.env.HOME}/ord_vermilion.yaml`);
const config = parse(await configFile.text());

const dbpool = new Pool({
  user: config.db_user,
  host: config.db_host,
  database: config.db_name,
  password: config.db_password,
  port: 5432,
});

async function setupDatabase() {
  await dbpool.query(`
    CREATE TABLE IF NOT EXISTS rendered_content (
      id bigint PRIMARY KEY,
      content BYTEA,
      content_type TEXT
    );
  `);
  await dbpool.query(`CREATE INDEX IF NOT EXISTS idx_rendered_content_sha256 ON rendered_content (sha256);`);
}

async function getInscriptionsToRender(limit, offset = 0) {
  // Get inscriptions that are HTML or SVG (recursive)
  const inscriptions = await dbpool.query(`
    SELECT o.id, o.sequence_number, o.sha256, o.content_type, o.is_recursive 
    FROM ordinals o
    WHERE 
      (o.content_type LIKE 'text/html%' OR 
      (o.content_type LIKE 'image/svg%' AND o.is_recursive = true) AND
      o.sha256 is NOT NULL AND
      o.sequence_number >= ${offset})
    ORDER BY o.sequence_number
    LIMIT ${limit};
  `);
  
  return inscriptions;
}

async function renderInscriptions(inscriptions) {
  // Render each inscription in parallel
  const rendered = await Promise.all(inscriptions.map(async row => {
    let url = `${apiBaseUrl}/content/${row.id}`;
    let renderedContent = await renderContentPuppeteer(url);
    return { id: row.id, content: renderedContent, content_type: 'image/png' };
  }));
  return rendered;
}

async function bulkInsertRenderedContent(renderedContent) {
  // Bulk insert rendered content
  const client = await dbpool.connect();
  try {
    await client.query('BEGIN');
    const query = 'INSERT INTO rendered_content (id, content, content_type) VALUES ($1, $2, $3)';
    const values = renderedContent.map(row => [row.id, row.content, row.content_type]);
    await client.query(query, values);
    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}