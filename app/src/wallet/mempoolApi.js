import { NETWORKS } from './networks';

async function broadcastTx(txHex, network) {
  const url = `https://mempool.space/${NETWORKS[network].mempool}api/tx`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'text/plain',
    },
    body: txHex,
  });

  if (!response.ok) {
    console.log(response);
    throw new Error(`Failed to broadcast transaction: ${response.statusText}`);
  }

  const data = await response.text();
  return data;
}

async function submitPackage(commitHex, revealHex) {
  const url = `https://blue.vermilion.place/api/submit_package`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify([commitHex, revealHex]),
  });

  if (!response.ok) {
    console.log(response);
    let text = await response.text();
    console.log(text);
    throw new Error(`Failed to broadcast transactions: ${response.statusText}`);
  }

  const data = await response.json();
  return data;
}

async function submitInscriptionTxs(commitHex, revealHex, network) {
  if (network === 'mainnet') {
    return await submitPackage(commitHex, revealHex);
  } else if (network === 'testnet' || network === 'signet') {
    let pushedCommitTx = await broadcastTx(commitHex, network);
    let pushedRevealTx = await broadcastTx(revealHex, network);
    console.log(pushedCommitTx, pushedRevealTx);
    return [pushedCommitTx, pushedRevealTx];
  } else {
    throw new Error(`Unsupported network: ${network}`);
  }
}


// -- boost info
// delegate_id varchar(80) NOT NULL,
// boost_quantity INT NOT NULL,
// boost_comment TEXT,
// platform_address VARCHAR(64),
// platform_fee bigint,
// owner_address VARCHAR(64),
// owner_fee bigint,
// -- wallet info
// network VARCHAR(10) NOT NULL,
// wallet_type VARCHAR(10) NOT NULL,
// inscription_method VARCHAR(40) NOT NULL,
// ordinals_address VARCHAR(64) NOT NULL,
// ordinals_public_key VARCHAR(66) NOT NULL,
// payment_address VARCHAR(64) NOT NULL,
// payment_public_key VARCHAR(66) NOT NULL,
// ephemeral_public_key VARCHAR(66),
// -- inscription info
// fee_rate INT NOT NULL,
// commit_tx_hex TEXT NOT NULL,
// commit_tx_id VARCHAR(64) NOT NULL,
// reveal_tx_hex TEXT NOT NULL,
// reveal_tx_id VARCHAR(64) NOT NULL,
// reveal_address_script VARCHAR(64) NOT NULL,
// reveal_tapmerkleroot VARCHAR(64) NOT NULL,
// reveal_input_value BIGINT NOT NULL,
// reveal_script TEXT NOT NULL,
async function submitBoost(wallet, authToken, inscriptionInfo, boostInfo, unauthCallback) {
  console.log(wallet, authToken, inscriptionInfo, boostInfo);
  const url = `/bun/social/boost`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`,
    },
    body: JSON.stringify({
      // boost info
      delegate_id: boostInfo.delegate_id,
      boost_quantity: boostInfo.boost_quantity,
      boost_comment: boostInfo.boost_comment,
      platform_address: boostInfo.platform_address,
      platform_fee: boostInfo.platform_fee,
      owner_address: boostInfo.owner_address,
      owner_fee: boostInfo.owner_fee,
      // wallet info
      network: wallet.network,
      wallet_type: wallet.walletType,
      inscription_method: inscriptionInfo.inscription_method,
      ordinals_address: wallet.ordinalsAddress,
      ordinals_public_key: wallet.ordinalsPublicKey,
      payment_address: wallet.paymentAddress,
      payment_public_key: wallet.paymentPublicKey,
      ephemeral_public_key: inscriptionInfo.ephemeral_public_key,
      // inscription info
      fee_rate: inscriptionInfo.fee_rate,
      commit_tx_hex: inscriptionInfo.commit_tx_hex,
      commit_tx_id: inscriptionInfo.commit_tx_id,
      reveal_tx_hex: inscriptionInfo.reveal_tx_hex,
      reveal_tx_id: inscriptionInfo.reveal_tx_id,
      reveal_address_script: inscriptionInfo.reveal_address_script,
      reveal_tapmerkleroot: inscriptionInfo.reveal_tapmerkleroot,
      reveal_input_value: inscriptionInfo.reveal_input_value,
      reveal_script: inscriptionInfo.reveal_script,
      ephemeral_sweep_backups: inscriptionInfo.ephemeral_sweep_backups,
    })
  });
  let body = JSON.stringify({
      // boost info
      delegate_id: boostInfo.delegate_id,
      boost_quantity: boostInfo.boost_quantity,
      boost_comment: boostInfo.boost_comment,
      platform_address: boostInfo.platform_address,
      platform_fee: boostInfo.platform_fee,
      owner_address: boostInfo.owner_address,
      owner_fee: boostInfo.owner_fee,
      // wallet info
      network: wallet.network,
      wallet_type: wallet.walletType,
      inscription_method: inscriptionInfo.inscription_method,
      ordinals_address: wallet.ordinalsAddress,
      ordinals_public_key: wallet.ordinalsPublicKey,
      payment_address: wallet.paymentAddress,
      payment_public_key: wallet.paymentPublicKey,
      ephemeral_public_key: inscriptionInfo.ephemeral_public_key,
      // inscription info
      fee_rate: inscriptionInfo.fee_rate,
      commit_tx_hex: inscriptionInfo.commit_tx_hex,
      commit_tx_id: inscriptionInfo.commit_tx_id,
      reveal_tx_hex: inscriptionInfo.reveal_tx_hex,
      reveal_tx_id: inscriptionInfo.reveal_tx_id,
      reveal_address_script: inscriptionInfo.reveal_address_script,
      reveal_tapmerkleroot: inscriptionInfo.reveal_tapmerkleroot,
      reveal_input_value: inscriptionInfo.reveal_input_value,
      reveal_script: inscriptionInfo.reveal_script,
      ephemeral_sweep_backups: inscriptionInfo.ephemeral_sweep_backups,
    });
  console.log(body);
  if (!response.ok) {
    let errorText = await response.text();
    if (response.status === 401) {
      unauthCallback();
      let json = await JSON.parse(errorText);
      errorText = 'Unauthorized: ' + json.error;
    }
    throw new Error(`${errorText}`);
  }
  const data = await response.json();
  return data;
}

async function submitSweep(wallet, authToken, sweepInfo, unauthCallback) {
  const url = `/bun/social/broadcast_sweep`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`,
    },
    body: JSON.stringify({
      sweep_type: sweepInfo.sweep_type,
      boost_id: sweepInfo.boost_id,
      ordinals_address: wallet.ordinalsAddress,
      payment_address: wallet.paymentAddress,
      sweep_tx_id: sweepInfo.sweep_tx_id,
      sweep_tx_hex: sweepInfo.sweep_tx_hex,
      fee_rate: sweepInfo.fee_rate,
      wallet_type: wallet.walletType,
      network: wallet.network
    })
  });
  if (!response.ok) {
    let errorText = response.statusText;
    if (response.status === 401) {
      unauthCallback();
      let json = await response.json();
      errorText = 'Unauthorized: ' + json.error;
    }
    throw new Error(`Failed to broadcast sweep: ${errorText}`);
  }
  const data = await response.json();
  return data;
}


const getRecommendedFees = async(network) => {
  try {
    // Create a timeout promise
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Timeout')), 2000)
    );
    
    // Create the fetch promise
    const fetchPromise = fetch(`https://mempool.space/${NETWORKS[network].mempool}api/v1/fees/recommended`);
    
    // Race between fetch and timeout
    const fees = await Promise.race([fetchPromise, timeoutPromise]);
    const feesJson = await fees.json();
    const fastestFee = feesJson.fastestFee + 1; // add 1 sat/vB to the fastest fee for a little buffer
    return fastestFee;
  } catch (error) {
    // Fallback to Blockstream API
    console.log('Mempool.space timeout, falling back to Blockstream API');
    const fallbackFees = await fetch('https://blockstream.info/api/fee-estimates');
    const fallbackFeesJson = await fallbackFees.json();
    const oneBlockFee = fallbackFeesJson['1'] + 1; // 1 block confirmation rate + 1 sats
    console.log('Blockstream fee:', Math.ceil(oneBlockFee));
    return Math.ceil(oneBlockFee); // Round up to ensure integer
  }
}

const getConfirmedCardinalUtxos = async(address, network) => {
  let utxos = await fetch(`https://mempool.space/${NETWORKS[network].mempool}api/address/${address}/utxo`);
  let utxosJson = await utxos.json();
  let confirmedUtxos = utxosJson.filter(utxo => utxo.status.confirmed == true);
  confirmedUtxos = confirmedUtxos.filter(utxo => utxo.value > 1000);
  if (network === 'testnet' || network === 'signet') {// allow unconfirmed utxos on testnet
    confirmedUtxos = utxosJson.filter(utxo => utxo.value > 1000);
  }

  let confirmedCardinalUtxos = [];
  if (network === 'mainnet') {
    let cardinalUtxos = await fetch(`https://blue.vermilion.place/ord_api/outputs/${address}?type=cardinal`, {
      headers: {
        'Accept': 'application/json',
      }
    });
    let cardinalUtxosJson = await cardinalUtxos.json();
    // filter confirmed utxos that are not in the cardinal list
    confirmedCardinalUtxos = confirmedUtxos.filter(utxo => 
      cardinalUtxosJson.some(cardinalUtxo => cardinalUtxo.outpoint === `${utxo.txid}:${utxo.vout}`)
    )
  } else {//testnet
    confirmedCardinalUtxos = confirmedUtxos; 
  }

  return confirmedCardinalUtxos;
}

const getTxData = async(txId, network) => {
  let txData = await fetch(`https://mempool.space/${NETWORKS[network].mempool}api/tx/${txId}/hex`);
  let txDataJson = await txData.json();
  return txDataJson;
}

async function getCoinBaseBtcPrice() {
  try {
    // Create a timeout promise
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Timeout')), 2000)
    );
    
    // Create the fetch promise
    const fetchPromise = fetch(`https://api.exchange.coinbase.com/products/BTC-USD/book`);
    
    // Race between fetch and timeout
    const response = await Promise.race([fetchPromise, timeoutPromise]);
    const json = await response.json();
    const bid = json.bids[0][0];
    const ask = json.asks[0][0];
    const price = (parseFloat(bid) + parseFloat(ask)) / 2;
    return price;
  } catch (error) {
    // Try Kraken API as fallback
    console.log('Coinbase timeout, falling back to Kraken API');
    try {
      const krakenTimeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), 2000)
      );
      
      const krakenFetchPromise = fetch('https://api.kraken.com/0/public/Ticker?pair=XBTUSD');
      
      const krakenResponse = await Promise.race([krakenFetchPromise, krakenTimeoutPromise]);
      const krakenJson = await krakenResponse.json();
      const krakenPrice = parseFloat(krakenJson.result.XXBTZUSD.c[0]);
      console.log('Kraken price:', krakenPrice);
      return krakenPrice;
    } catch (krakenError) {
      // Final fallback to Binance
      console.log('Kraken failed, falling back to Binance API');
      const binanceResponse = await fetch('https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT');
      const binanceJson = await binanceResponse.json();
      console.log('Binance price:', binanceJson.price);
      return parseFloat(binanceJson.price);
    }
  }
}

export {
  submitInscriptionTxs,
  submitBoost,
  submitSweep,
  getRecommendedFees,
  getConfirmedCardinalUtxos,
  getTxData,
  getCoinBaseBtcPrice
}