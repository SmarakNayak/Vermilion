import { renderContent } from './puppeteer';
import db from './db';
import { getTxStatus } from './mempool';
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
        return { id: row.id, sequence_number: row.sequence_number, content: renderedContent.buffer, content_type: 'image/png', render_status: renderedContent.renderStatus };
      }));
      return rendered;
    } catch (err) {
      throw err;
    }
  },

  async runRenderLoop() {
    let offset = await db.getStartingOffset(true);
    while (!this.shouldStop) {
      try {
        let t0 = performance.now();
        const inscriptions = await db.getInscriptionsToRender(5, offset);
        if (inscriptions.length === 0) {
          await Bun.sleep(1000);
          continue;
        }
        
        let t1 = performance.now();
        const renderedContent = await this.renderInscriptions(inscriptions);
        
        let t2 = performance.now();
        await db.bulkInsertBun(renderedContent);
  
        let t3 = performance.now();
        console.log(`Fetched from ${offset} in: `, t1 - t0, 'Rendered in: ', t2-t1, 'inserted in: ', t3-t2, 'Total time:', t3 - t0, 'ms');
        offset = Number(inscriptions[inscriptions.length - 1].sequence_number) + 1;

      } catch (err) {
        console.warn('Error in main loop, waiting a minute', err);
        await Bun.sleep(50000);
      }
    }
  },

  async runTxMonitorLoop() {
    while (!this.shouldStop) {
      try {
        let boostsToMonitor = await db.getBoostsToMonitor();
        let sweepsToMonitor = await db.getSweepsToMonitor();
        if (boostsToMonitor.length === 0 && sweepsToMonitor.length === 0) {
          await Bun.sleep(1000);
          continue;
        }

        for (let boost of boostsToMonitor) {
          let boostTime = new Date(boost.timestamp).getTime();
          let fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
          if (boost.commit_tx_status === 'pending') {
            let txStatus = await getTxStatus(boost.commit_tx_id, boost.network);
            if (txStatus ==='confirmed') {
              await db.updateBoost(boost.boost_id, {
                commit_tx_status: 'confirmed'
              });
            }
            if (txStatus ==='not_found' && boostTime < fiveMinutesAgo) {
              await db.updateBoost(boost.boost_id, {
                commit_tx_status: 'not_found'
              });
            }
          }
          if (boost.reveal_tx_status === 'pending') {
            let txStatus = await getTxStatus(boost.reveal_tx_id, boost.network);
            if (txStatus ==='confirmed') {
              await db.updateBoost(boost.boost_id, {
                reveal_tx_status: 'confirmed'
              });
            }
            if (txStatus ==='not_found' && boostTime < fiveMinutesAgo) {
              await db.updateBoost(boost.boost_id, {
                reveal_tx_status: 'not_found'
              });
            }
          }
        }
        for (let sweep of sweepsToMonitor) {
          let sweepTime = new Date(sweep.timestamp).getTime();
          let fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
          if (sweep.sweep_tx_status === 'pending') {
            let txStatus = await getTxStatus(sweep.sweep_tx_id, sweep.network);
            if (txStatus ==='confirmed') {
              await db.updateSweep(sweep.sweep_id, {
                sweep_tx_status: 'confirmed'
              });
            }
            if (txStatus ==='not_found' && sweepTime < fiveMinutesAgo) {
              await db.updateSweep(sweep.sweep_id, {
                sweep_tx_status: 'not_found'
              });
            }
          }
        }
        
        await Bun.sleep(60000);
      } catch (err) {
        console.warn('Error in tx monitor loop, waiting a minute', err);
        await Bun.sleep(60000);
      }
    }
  },
  
  // Main loop
  async runBundexer() {
    this.stopped = false;
    await Promise.all([
      this.runRenderLoop(),
      this.runTxMonitorLoop()
    ]);
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