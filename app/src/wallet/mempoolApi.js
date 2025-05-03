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


const getRecommendedFees = async(network) => {
  let fees = await fetch(`https://mempool.space/${NETWORKS[network].mempool}api/v1/fees/recommended`);
  let feesJson = await fees.json();
  let fastestFee = feesJson.fastestFee;
  return fastestFee;
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
  let response = await fetch(`https://api.exchange.coinbase.com/products/BTC-USD/book`);
  let json = await response.json();
  let bid = json.bids[0][0];
  let ask = json.asks[0][0];
  let price = (parseFloat(bid) + parseFloat(ask)) / 2;
  return price;
}

export {
  broadcastTx,
  submitPackage,
  submitInscriptionTxs,
  getRecommendedFees,
  getConfirmedCardinalUtxos,
  getTxData,
  getCoinBaseBtcPrice
}