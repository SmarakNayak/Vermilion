import db from './src/db';
import bundexer from './src/bundexer';
import { renderContent, browserPool } from './src/puppeteer';
import { addInscriptionPreviewsToHtml, renderInscriptionCard } from './src/ssr';
import { broadcastTx } from './src/mempool';

// Configuration - use local address in production or fall back to external URL
const isProd = process.env.NODE_ENV === 'production';
const apiBaseUrl = isProd ? 'http://127.0.0.1:80' : 'https://blue.vermilion.place';

const server = Bun.serve({
  port: 1082,
  routes: {
    '/': new Response('If Bitcoin is to change the culture of money, it needs to be cool. Ordinals was the missing piece. The path to $1m is preordained'),
    // api routes
    '/rendered_content/:id': async req => {
      let metadata =  await fetch(apiBaseUrl + "/api/inscription_metadata/" + req.params.id);
      let metadataJson = await metadata.json();
      return getRenderedContentResponse(metadataJson.id, metadataJson.content_type, metadataJson.is_recursive);  
    },
    '/rendered_content_number/:number': async req => {
      let metadata =  await fetch(apiBaseUrl + "/api/inscription_metadata_number/" + req.params.number);
      let metadataJson = await metadata.json();
      return getRenderedContentResponse(metadataJson.id, metadataJson.content_type, metadataJson.is_recursive);     
    },
    '/block_icon/:block': async req => {
      const row = db.getBlockIcon(req.params.block);
      if (!row) return new Response('No inscriptions found in block', { status: 404 });
      return getRenderedContentResponse(row.id, row.content_type, row.is_recursive);     
    },
    '/sat_block_icon/:block': async req => {
      const row = db.getSatBlockIcon(req.params.block);
      if (!row) return new Response('No inscriptions found in block', { status: 404 });
      return getRenderedContentResponse(row.id, row.content_type, row.is_recursive);      
    },
    '/inscription_card/:id': async req => {
      let metadata =  await fetch(apiBaseUrl + "/api/inscription_metadata/" + req.params.id);
      let metadataJson = await metadata.json();
      let card = await renderInscriptionCard({
        inscriptionMetadata: metadataJson,
        host: 'blue.vermilion.place'
      });
      return new Response(card, {
        headers: { 'Content-Type': 'image/png' },
      });
    },
    // ssr routes
    '/ssr/inscription/:number': async req => {
      let metadata =  await fetch(apiBaseUrl + "/api/inscription_metadata_number/" + req.params.number);
      let metadataJson = await metadata.json();
      let hydratedHtml = await addInscriptionPreviewsToHtml({ 
        inscriptionMetadata: metadataJson,
        host: req.headers.get('host')
      });
      return new Response(hydratedHtml, {
        headers: { 'Content-Type': 'text/html' },
      });
    },
    // social routes
    '/social/boost': async req => {      
      try {
        let body = await req.json();
        let [ insertRecord ] = await db.recordBoost({
          ...body,
          broadcast_status: 'scheduled',
          commit_tx_status: 'scheduled',
          reveal_tx_status: 'scheduled',
        });
        let boostId = insertRecord.boost_id;
        if (body.network === 'testnet' || body.network === 'signet') {
          let commitResponse = await broadcastTx(body.commit_tx_hex, body.network + '/');
          if (!commitResponse.ok) {
            let text = await commitResponse.text();
            let errorString = `Error broadcasting commit transaction: ${text}, ${commitResponse.statusText}`;
            await db.updateBoost(boostId, {
              broadcast_status: 'failed',
              broadcast_error: errorString,
              commit_tx_status: 'failed',
              reveal_tx_status: 'abandoned'
            });
            return new Response(errorString, { status: 500 });
          }
          let revealResponse = await broadcastTx(body.reveal_tx_hex, body.network + '/');
          if (!revealResponse.ok) {
            let text = await revealResponse.text();
            let errorString = `Error broadcasting reveal transaction: ${text}, ${revealResponse.statusText}`;
            await db.updateBoost(boostId, {
              broadcast_status: 'failed',
              broadcast_error: errorString,
              commit_tx_status: 'failed',
              reveal_tx_status: 'failed'
            });
            return new Response(errorString, { status: 500 });
          }
          let commitTxId = await commitResponse.text();
          let revealTxId = await revealResponse.text();
          await db.updateBoost(boostId, {
            broadcast_status: 'broadcasted',
            commit_tx_status: 'pending',
            reveal_tx_status: 'pending',
            commit_tx_id: commitTxId,
            reveal_tx_id: revealTxId
          });
          return Response.json([ commitTxId, revealTxId ]);
        } else if (body.network === 'mainnet') {
          let response = await fetch(apiBaseUrl + "/api/submit_package", {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify([
              body.commit_tx_hex, body.reveal_tx_hex
            ]),
          });
          if (!response.ok) {
            let text = await response.text();
            let errorString = `Error submitting package: ${text}, ${response.statusText}`;
            await db.updateBoost(boostId, {
              broadcast_status: 'failed',
              broadcast_error: errorString,
              commit_tx_status: 'failed',
              reveal_tx_status: 'failed'
            });
            return new Response(errorString, { status: 500 });
          }

          const data = await response.json();
          if (data[0] !== body.commit_tx_id || data[1] !== body.reveal_tx_id) {
            let errorString = `Error: commit/reveal tx IDs do not match. Expected ${body.commit_tx_id} / ${body.reveal_tx_id}, got ${data[0]} / ${data[1]}`;
            console.warn(errorString);
          }
          await db.updateBoost(boostId, {
            broadcast_status: 'broadcasted',
            commit_tx_status: 'pending',
            reveal_tx_status: 'pending'
          });
          return Response.json(data);
        } 
      } catch (err) {
        console.error('Error boosting:', err);
        return new Response('Error boosting: ' + err.message, { status: 500 });
      }
    },
    '/social/boost_history/:address': async req => {
      try {
        const boosts = await db.getBoostsForAddress(req.params.address);
        return Response.json(boosts);
      } catch (err) {
        console.error('Error fetching boost history:', err);
        return new Response('Error fetching boost history: ' + err.message, { status: 500 });
      }
    }
  }
});

bundexer.runBundexer();

async function getRenderedContentResponse(id, content_type, is_recursive) {
  if (content_type?.startsWith('text/html') || (content_type?.startsWith('image/svg') && is_recursive)) {
    let row = await db.getRenderedContent(id);
    let ss = row?.content;
    if (!ss) {
      ss = await renderContent(`${apiBaseUrl}/content/${id}`);
    }
    if (!ss) return new Response('Error rendering content', { status: 404 });
    return new Response(ss.buffer, {
      headers: { 'Content-Type': 'image/png' },
    });
  } else {
    let content = await fetch(apiBaseUrl + "/content/" + id, {
      decompress: false
    });
    if (!content.ok) return new Response('Content fetch failed', { status: content.status });
    return content;
  }
}

// Shutdown function to clean up everything
async function shutdown() {
  // Stop Bun server
  await server.stop();
  console.log("Bun server stopped");

  // Stop the bundexer
  await bundexer.stopBundexer();
  console.log("Bundexer stopped");
  
  // Close all browsers in the pool
  await browserPool.closeAll();
  console.log("Browser pool closed");
}

// Close the browsers when the server is stopped
// Handle SIGINT (Ctrl+C)
process.on("SIGINT", async () => {
  console.log("SIGINT received, starting shutdown");
  await shutdown();
  console.log("Shutdown complete");
  process.exit(0);
});

// Handle SIGTERM (termination signal)
process.on("SIGTERM", async () => {
  console.log("SIGTERM received, starting shutdown");
  await shutdown();
  console.log("Shutdown complete");
  process.exit(0);
});