async function broadcastTx(txHex, networkString='') {
  const url = `https://mempool.space/${networkString}api/tx`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'text/plain',
    },
    body: txHex,
  });

  return response;
}

async function getTxStatus(txId, networkString='') {
  const url = `https://mempool.space/${networkString}api/tx/${txId}/status`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  return await response.json();
}

async function getMempoolTxids(networkString='') {
  const url = `https://mempool.space/${networkString}api/mempool/txids`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  return await response.json();
}

export {
  broadcastTx,
  getTxStatus,
  getMempoolTxids,
};