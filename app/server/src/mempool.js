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

export {
  broadcastTx
};