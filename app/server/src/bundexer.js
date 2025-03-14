import { renderContent } from './puppeteer';
import db from './db';
// Configuration - use local address in production or fall back to external URL
const isProd = process.env.NODE_ENV === 'production';
const apiBaseUrl = isProd ? 'http://127.0.0.1:80' : 'https://blue.vermilion.place';


const bundexer = {
  shouldStop: false,
  stopped: true,

  async renderInscriptions(inscriptions) {
    try {
      // Render each inscription in parallel
      const rendered = await Promise.all(inscriptions.map(async row => {
        let url = `${apiBaseUrl}/content/${row.id}`;
        let renderedContent = await renderContent(url);
        return { id: row.id, sequence_number: row.sequence_number, content: renderedContent, content_type: 'image/png' };
      }));
      return rendered;
    } catch (err) {
      throw err;
    }
  },
  
  // Main loop
  async runBundexer() {
    this.stopped = false;
    await db.setupDatabase();
    let offset = await db.getStartingOffset();
    while (!this.shouldStop) {
      try {
        let t0 = performance.now();
        console.log('Fetching inscriptions starting from:', offset);
        const inscriptions = await db.getInscriptionsToRender(5, offset);
        if (inscriptions.length === 0) {
          console.log('No more inscriptions to render');
          await Bun.sleep(1000);
          continue;
        }
        
        let t1 = performance.now();
        console.log('Rendering inscriptions:', inscriptions.map(i => i.sequence_number));
        const renderedContent = await this.renderInscriptions(inscriptions);
        
        let t2 = performance.now();
        console.log('Inserting rendered content:', renderedContent.length);
        await db.bulkInsertBun(renderedContent);
  
        let t3 = performance.now();
        console.log('Fetched in: ', t1 - t0, 'Rendered in: ', t2-t1, 'inserted in: ', t3-t2, 'Total time:', t3 - t0, 'ms');
        offset = Number(inscriptions[inscriptions.length - 1].sequence_number) + 1;
      } catch (err) {
        console.warn('Error in main loop, waiting a minute', err);
        await Bun.sleep(50000);
      }
    }
    this.stopped = true;
  },

  async stopBundexer() {
    this.shouldStop = true;
    while (!this.stopped) {
      await Bun.sleep(100);
    }
  }
}

export default bundexer;