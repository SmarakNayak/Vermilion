import db from './src/db';
import bundexer from './src/bundexer';
import { renderContent, browserPool } from './src/puppeteer';
import { addInscriptionPreviewsToHtml, renderInscriptionCard } from './src/ssr';
import { broadcastTx } from './src/mempool';
import { Authenticator } from './src/authenticator';
import type { CreateProfileRequest, UpdateProfileRequest, ProfileResponse } from './src/types/profile';
import { ServerLive } from './src/effectServer/effectServer';
import { Layer, Effect, Fiber } from 'effect';

// Configuration - use local address in production or fall back to external URL
const isProd = process.env.NODE_ENV === 'production';
const apiBaseUrl = isProd ? 'http://127.0.0.1:80' : 'https://blue.vermilion.place';

const server = Bun.serve({
  port: 1082,
  routes: {
    '/': new Response('If Bitcoin is to change the culture of money, it needs to be cool. Ordinals was the missing piece. The path to $1m is preordained'),
    // api routes
    '/rendered_content/:id': async (req: any) => {
      let metadata =  await fetch(apiBaseUrl + "/api/inscription_metadata/" + req.params.id);
      let metadataJson: any = await metadata.json();
      return await getRenderedContentResponse(metadataJson.id, metadataJson.content_type, metadataJson.is_recursive, req.headers);  
    },
    '/rendered_content_number/:number': async (req: any) => {
      let metadata =  await fetch(apiBaseUrl + "/api/inscription_metadata_number/" + req.params.number);
      let metadataJson: any = await metadata.json();
      return await getRenderedContentResponse(metadataJson.id, metadataJson.content_type, metadataJson.is_recursive, req.headers);     
    },
    '/block_icon/:block': async (req: any) => {
      const row = await db.getBlockIcon(req.params.block);
      if (!row) return new Response('No inscriptions found in block', { status: 404 });
      return await getRenderedContentResponse(row.id, row.content_type, row.is_recursive, req.headers);     
    },
    '/sat_block_icon/:block': async (req: any) => {
      const row = await db.getSatBlockIcon(req.params.block);
      if (!row) return new Response('No inscriptions found in block', { status: 404 });
      return await getRenderedContentResponse(row.id, row.content_type, row.is_recursive, req.headers);      
    },
    '/inscription_card/:id': async (req: any) => {
      let metadata =  await fetch(apiBaseUrl + "/api/inscription_metadata/" + req.params.id);
      let metadataJson: any = await metadata.json();
      let card = await renderInscriptionCard({
        inscriptionMetadata: metadataJson,
        host: 'blue.vermilion.place'
      });
      return new Response(card, {
        headers: { 'Content-Type': 'image/png' },
      });
    },
    // ssr routes
    '/ssr/inscription/:number': async (req: any) => {
      let metadata =  await fetch(apiBaseUrl + "/api/inscription_metadata_number/" + req.params.number);
      let metadataJson: any = await metadata.json();
      let hydratedHtml = await addInscriptionPreviewsToHtml({ 
        inscriptionMetadata: metadataJson,
        host: req.headers.get('host') as string,
      });
      return new Response(hydratedHtml, {
        headers: { 'Content-Type': 'text/html' },
      });
    },
    // social routes
    '/social/boost': async (req: any) => {
      if (req.method !== 'POST') {
        return new Response('Method Not Allowed', { status: 405 });
      }
      try {
        let body: any = await req.json();
        const authFail = checkAuthFail(req.headers.get('Authorization'), body.ordinals_address);
        if (authFail) return authFail;

        // we need to insert the entire body into the boosts table without the ephemeral_sweep_backups
        // but we also need to insert the ephemeral_sweep_backups later
        // so we store it in a variable and delete it from the body
        let backups = body.ephemeral_sweep_backups;
        delete body.ephemeral_sweep_backups;

        let [ insertRecord ] = await db.recordBoost({
          ...body,
          broadcast_status: 'scheduled',
          commit_tx_status: 'scheduled',
          reveal_tx_status: 'scheduled',
        });
        let boostId = insertRecord.boost_id;
        if (body.inscription_method === 'ephemeral') {
          if (!backups || backups.length === 0) {
            let errorString = 'Error: ephemeral_sweep_backups is empty, did not broadcast';
            await db.updateBoost(boostId, {
              broadcast_status: 'failed',
              broadcast_error: errorString,
              commit_tx_status: 'failed',
              reveal_tx_status: 'failed'
            });
            return new Response(errorString, { status: 500 });
          }
          backups = backups.map((backup: any) => ({
            ...backup,
            boost_id: boostId,
            ordinals_address: body.ordinals_address,
            payment_address: body.payment_address,
            network: body.network,
          }));
          await db.storeEphemeralSweeps(backups);
        }
        if (body.network === 'testnet' || body.network === 'signet') {
          let commitResponse = await broadcastTx(body.commit_tx_hex, body.network + '/');
          if (!commitResponse.ok) {
            let text = await commitResponse.text();
            let errorString = `Error broadcasting commit transaction: ${text}, ${commitResponse.statusText}`;
            await db.updateBoost(boostId, {
              broadcast_status: 'failed',
              broadcast_error: errorString,
              commit_tx_status: 'failed',
              reveal_tx_status: 'failed'
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
          //let revealTxId = 'lmao';
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

          const data: any = await response.json();
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
        } else {
          let errorString = `Error: Unsupported network ${body.network}`;
          await db.updateBoost(boostId, {
            broadcast_status: 'failed',
            broadcast_error: errorString,
            commit_tx_status: 'failed',
            reveal_tx_status: 'failed'
          });
          return new Response(errorString, { status: 500 });
        }
      } catch (err: any) {
        console.error('Error boosting:', err);
        return new Response('Error boosting: ' + err.message, { status: 500 });
      }
      //return new Response('Unknown error', { status: 500 });
    },
    '/social/boost_history/:address': async (req: any) => { //TODO: not used, remove?
      try {
        const authFail = checkAuthFail(req.headers.get('Authorization'), req.params.address);
        if (authFail) return authFail;

        const boosts = await db.getBoostsForAddress(req.params.address);
        return Response.json(boosts);
      } catch (err: any) {
        console.error('Error fetching boost history:', err);
        return new Response('Error fetching boost history: ' + err.message, { status: 500 });
      }
    },
    '/social/get_stored_sweeps/:boost_id': async (req: any) => {
      try {
        const authorizedAddress = getAuthorizedAddress(req.headers.get('Authorization'));
        if (authorizedAddress && authorizedAddress.isValid === false) {
          return Response.json(authorizedAddress, {
            status: 401,
            statusText: 'Unauthorized: ' + authorizedAddress.error,
            headers: { 'Content-Type': 'application/json' }
          });
        }
        let storedSweeps = await db.getStoredEphemeralSweeps(req.params.boost_id, authorizedAddress?.address);
        return Response.json(storedSweeps);
      } catch (err: any) {
        console.error('Error fetching stored sweeps:', err);
        return new Response('Error fetching stored sweeps: ' + err.message, { status: 500 });
      }
    },
    '/social/broadcast_sweep': async (req: any) => {
      if (req.method !== 'POST') {
        return new Response('Method Not Allowed', { status: 405 });
      }
      try {
        let body: any = await req.json();
        const authFail = checkAuthFail(req.headers.get('Authorization'), body.ordinals_address);
        if (authFail) return authFail;

        let [insertRecord] = await db.recordSweep({
          sweep_type: body.sweep_type,
          boost_id: body.boost_id,
          ordinals_address: body.ordinals_address,
          payment_address: body.payment_address,
          sweep_tx_id: body.sweep_tx_id,
          fee_rate: body.fee_rate,
          wallet_type: body.wallet_type,
          network: body.network,
          broadcast_status: 'scheduled',
          sweep_tx_status: 'scheduled'
        });
        let broadcast_sweep_id = insertRecord.broadcast_sweep_id;
        let networkString = ['testnet', 'signet'].includes(body.network) ? body.network + '/' : '';
        let response = await broadcastTx(body.sweep_tx_hex, networkString);
        if (!response.ok) {
          let text = await response.text();
          let errorString = `Error broadcasting sweep transaction: ${text}, ${response.statusText}`;
          await db.updateSweep(broadcast_sweep_id, {
            broadcast_status: 'failed',
            broadcast_error: errorString,
            sweep_tx_status: 'failed'
          });
          return new Response(errorString, { status: 500 });
        }
        let sweepTxId = await response.text();
        await db.updateSweep(broadcast_sweep_id, {
          broadcast_status: 'broadcasted',
          sweep_tx_status: 'pending',
          sweep_tx_id: sweepTxId
        });
        return Response.json([ sweepTxId ]);

      } catch (err: any) {
        console.error('Error broadcasting sweep:', err);
        return new Response('Error broadcasting sweep: ' + err.message, { status: 500 });
      }
    },
    '/social/sweep_history/:address': async (req: any) => { //TODO: not used, remove?
      try {
        const authFail = checkAuthFail(req.headers.get('Authorization'), req.params.address);
        if (authFail) return authFail;
        const sweeps = await db.getSweepsForAddress(req.params.address);
        return Response.json(sweeps);
      } catch (err: any) {
        console.error('Error fetching sweep history:', err);
        return new Response('Error fetching sweep history: ' + err.message, { status: 500 });
      }
    },
    '/social/full_boost_history/:address': async (req: any) => {
      try {
        const authFail = checkAuthFail(req.headers.get('Authorization'), req.params.address);
        if (authFail) return authFail;
        const sweeps = await db.getBoostsAndSweepsForAddress(req.params.address);
        return Response.json(sweeps);
      } catch (err: any) {
        console.error('Error fetching sweep history:', err);
        return new Response('Error fetching sweep history: ' + err.message, { status: 500 });
      }
    },
    '/social/generate_sign_in_message': async (req: any) => {
      if (req.method !== 'POST') {
        return new Response('Method Not Allowed', { status: 405 });
      }
      try {
        let body: any = await req.json();
        let address = body.address;
        let walletType = body.walletType;
        let headers = req.headers;
        let authenticator = new Authenticator();
        let signInMessage = await authenticator.GenerateSignInMessage(address, walletType, headers);
        return Response.json({ signInMessage });
      } catch (err: any) {
        console.error('Error generating sign in message:', err);
        return new Response('Error generating sign in message: ' + err.message, { status: 500 });
      }
    },
    '/social/verify_signature': async (req: any) => {
      console.log('Verifying signature');
      if (req.method !== 'POST') {
        return new Response('Method Not Allowed', { status: 405 });
      }
      try {
        let body: any = await req.json();
        let address = body.address;
        let message = body.signInMessage;
        let signature = body.signature;
        let signatureType = body.signatureType;
        let authenticator = new Authenticator();
        let response = await authenticator.VerifySignature(address, message, signature, signatureType);
        return Response.json(response);
      } catch (err: any) {
        console.error('Error verifying signature:', err);
        return new Response('Error verifying signature: ' + err.message, { status: 500 });
      }
    },
    // social profile routes
    '/social/create_profile/:address': async (req: any) => {
      if (req.method !== 'POST') {
        return new Response('Method Not Allowed', { status: 405 });
      }
      try {
        const authFail = checkAuthFail(req.headers.get('Authorization'), req.params.address);
        if (authFail) return authFail;

        const body = await req.json() as CreateProfileRequest;
        // let [insertRecord] = await db.createProfile({
        //   //user_id: body.user_id, //this is auto-generated by the database
        //   user_handle: body.user_handle,
        //   user_name: body.user_name,
        //   user_picture: body.user_picture, //inscription ID
        //   user_bio: body.user_bio,
        //   user_twitter: body.user_twitter,
        //   user_discord: body.user_discord,
        //   user_website: body.user_website,
        // });
        // add some validation here
        const insertRecord = await db.createProfile(body, req.params.address);
        return Response.json(insertRecord as ProfileResponse);
      } catch (err: any) {
        console.error('Error creating profile:', err);
        return new Response('Error creating profile: ' + err.message, { status: 500 });
      }
    },
    '/social/update_profile/:address': async (req: any) => {
      if (req.method !== 'POST') {
        return new Response('Method Not Allowed', { status: 405 });
      }
      try {
        const authFail = checkAuthFail(req.headers.get('Authorization'), req.params.address);
        if (authFail) return authFail;

        const body = await req.json() as UpdateProfileRequest;
        // let [updateRecord] = await db.updateProfile({
        //   user_id: body.user_id,
        //   user_handle: body.user_handle,
        //   user_name: body.user_name,
        //   user_picture: body.user_picture, //inscription ID
        //   user_bio: body.user_bio,
        //   user_twitter: body.user_twitter,
        //   user_discord: body.user_discord,
        //   user_website: body.user_website,
        // });
        // add some validation here
        const updateRecord = await db.updateProfile(req.params.address, body.user_id, body);
        if (!updateRecord) {
          return new Response('Error updating profile: Valid profile not found', { status: 404 });
        }
        return Response.json(updateRecord as ProfileResponse);
      } catch (err: any) {
        console.error('Error updating profile:', err);
        return new Response('Error updating profile: ' + err.message, { status: 500 });
      }
    },
    '/social/get_profile_by_id/:user_id': async (req: any) => {
      try {
        const profile = await db.getProfileById(req.params.user_id);
        if (!profile) {
          return new Response('Profile not found', { status: 404 });
        }
        return Response.json(profile as ProfileResponse);
      } catch (err: any) {
        console.error('Error fetching profile:', err);
        return new Response('Error fetching profile: ' + err.message, { status: 500 });
      }
    },
    '/social/get_profile_by_address/:address': async (req: any) => {
      try {
        const profile = await db.getProfileByAddress(req.params.address);
        if (!profile) {
          return new Response('Profile not found', { status: 404 });
        }
        return Response.json(profile as ProfileResponse);
      } catch (err: any) {
        console.error('Error fetching profile by address:', err);
        return new Response('Error fetching profile by address: ' + err.message, { status: 500 });
      }
    },
    '/social/get_profile_by_handle/:handle': async (req: any) => {
      try {
        const profile = await db.getProfileByHandle(req.params.handle);
        if (!profile) {
          return new Response('Profile not found', { status: 404 });
        }
        return Response.json(profile as ProfileResponse);
      } catch (err: any) {
        console.error('Error fetching profile by handle:', err);
        return new Response('Error fetching profile by handle: ' + err.message, { status: 500 });
      }
    }

  }
});

await db.setupDatabase();
bundexer.runBundexer();

// Start the Effect server
const effectServerFiber = Effect.runFork(
  Layer.launch(ServerLive).pipe(
    Effect.tapError((err) => Effect.logError(err, "Failed to start Effect server")),
    Effect.tap(() => Effect.logInfo("Effect server successfully stopped running at http://localhost:1083"))
  )
);

async function getRenderedContentResponse(id: any, content_type: any, is_recursive: any, originalHeaders: any) {
  if (content_type?.startsWith('text/html') || (content_type?.startsWith('image/svg') && is_recursive)) {
    let row = await db.getRenderedContent(id);
    let ss = row?.content;
    if (!ss) {
      ss = await renderContent(`${apiBaseUrl}/content/${id}`);
      db.safeInsertRenderedContent({ 
        id: id,
        content: ss.buffer, 
        content_type: 'image/png', 
        render_status: ss.renderStatus 
      });
    }
    if (!ss) return new Response('Error rendering content', { status: 404 });
    return new Response(ss.buffer, {
      headers: { 'Content-Type': 'image/png' },
    });
  } else {
    const upstreamHeaders = new Headers();
    if (originalHeaders?.has('accept')) {
      upstreamHeaders.set('accept', originalHeaders.get('accept'));
    }
    if (originalHeaders?.has('accept-encoding')) {
      upstreamHeaders.set('accept-encoding', originalHeaders.get('accept-encoding'));
    }
    let content = await fetch(apiBaseUrl + "/content/" + id, {
      headers: upstreamHeaders,
    });
    if (!content.ok) return new Response('Content fetch failed', { status: content.status });
    let body = await content.arrayBuffer();
    return new Response(body, {
      headers: content.headers,
    });
  }
}

function checkAuthFail(authHeader: any, ordinalsAddress: any) {
  if (!authHeader?.startsWith('Bearer ')) {
    console.log('Unauthorized: No bearer token provided');
    return new Response('Unauthorized: No bearer token provided', { status: 401, statusText: 'Unauthorized' });
  }
  const token = authHeader.slice(7);
  let authenticator = new Authenticator();
  const verification = authenticator.VerifyAccessToken(token, ordinalsAddress);
  if (!verification.isValid) {
    let response = new Response(JSON.stringify(verification), {
      status: 401,
      statusText: 'Unauthorized: ' + verification.error,
      headers: { 'Content-Type': 'application/json' }
    })
    return response;
  }
  return undefined; // No auth failure, continue processing
}

function getAuthorizedAddress(authHeader: any) {
  if (!authHeader?.startsWith('Bearer ')) {
    console.log('Unauthorized: No bearer token provided');
    return { isValid: false, error: 'Unauthorized: No bearer token provided' };
  }
  const token = authHeader.slice(7);
  let authenticator = new Authenticator();
  const verification = authenticator.GetAuthorizedAddressFromToken(token);
  return verification;
}

// Shutdown function to clean up everything
async function shutdown() {
  // Stop Effect server
  await Effect.runPromise(Fiber.interrupt(effectServerFiber));
  console.log("Effect server stopped");

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

console.log(`🚀 Bun server running at ${server.url}`);