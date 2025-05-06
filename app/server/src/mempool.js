const isProd = process.env.NODE_ENV === 'production';
const apiBaseUrl = isProd ? 'http://127.0.0.1:80' : 'https://blue.vermilion.place';

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

async function getTxStatus(txId, network='mainnet') {
  if (network === 'testnet' || network === 'signet') {
    
    const url = `https://mempool.space/${network}/api/tx/${txId}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    let text = await response.text();    
    if (text === 'Transaction not found') {
      return 'not_found';
    }

    let json = JSON.parse(text);
    if (json?.status?.confirmed === true) {
      return 'confirmed';
    }
    if (json?.status?.confirmed === false) {
      return 'pending';
    }
    throw new Error('Error fetching transaction status, invalid response');
  }
  if (network === 'mainnet') {
    const url = `${apiBaseUrl}/api/get_raw_transaction/${txId}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
  
    let json = await response.json();
    if (json?.error) {
      return 'not_found';
    }
    if (json?.confirmations > 0) {
      return 'confirmed';
    }
    if (json?.confirmations === null) {
      return 'pending';
    }

    throw new Error('Error fetching transaction status, invalid response');
  }
  throw new Error('Invalid network');
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