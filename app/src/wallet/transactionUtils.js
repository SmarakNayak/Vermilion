import * as bitcoin from 'bitcoinjs-lib';
import { NETWORKS, getNetworksFromAddress } from './networks';
import { isP2PKH, isP2SHScript, isP2WPKH, isP2TR } from 'bitcoinjs-lib/src/psbt/psbtutils';

const getAddressType = (addressScript, publicKey, network) => {
  if (isP2TR(addressScript)) {
    return 'P2TR';
  }
  if (isP2WPKH(addressScript)) {
    return 'P2WPKH';
  }
  if (isP2SHScript(addressScript)) {
    // for nested segwit, we have:
    // pubKey -> pubkeyhash -> pubkeyhashscript (witness program/p2pkh) -> pubkeyhashscripthash (witness program hash/scripthash) -> pubkeyhashscripthashscript (P2SH script)

    // Parse the P2SH script (OP_HASH160 <scripthash> OP_EQUAL) to extract the witness program hash stored inside it
    const p2sh = bitcoin.payments.p2sh({
      output: addressScript,
      network: NETWORKS[network].bitcoinjs
    })

    // Create pubkeyhash from pubkey
    const pubkeyHash = bitcoin.crypto.hash160(Buffer.from(publicKey, 'hex'))

    // Create the witness program (OP_0 <pubkeyhash>) that would be wrapped inside P2SH for this pubkey
    const p2wpkh = bitcoin.payments.p2wpkh({
      hash: pubkeyHash,
      network: NETWORKS[network].bitcoinjs
    })

    // Check if:
    // scripthash inside P2SH script (p2sh.hash) equals hash of witness program we generated (hash160(p2wpkh.output))
    // If equal -> this P2SH script is wrapping the SegWit script for this pubkey
    if (p2sh.hash.equals(bitcoin.crypto.hash160(p2wpkh.output))) {
      return 'P2SH-P2WPKH'
    } else {
      throw new Error("Unsupported address type");
    }
  }
  if (isP2PKH(addressScript)) {
    return 'P2PKH';
  }
  throw new Error("Unsupported address type");
}

const appendUtxoEffectiveValues = (utxos, addressType, feeRate) => {
  //https://bitcoin.stackexchange.com/questions/84004/how-do-virtual-size-stripped-size-and-raw-size-compare-between-legacy-address-f/84006#84006
  if (addressType === 'P2TR') {
    utxos.map(utxo => {
      utxo.effectiveValue = utxo.value - feeRate * (40 + 1 + 66/4);
    });
  }
  if (addressType === 'P2WPKH') {
    utxos.map(utxo => {
      utxo.effectiveValue = utxo.value - feeRate * (40 + 1 + 108/4);
    });
  }
  if (addressType === 'P2SH-P2WPKH') {
    utxos.map(utxo => {
      utxo.effectiveValue = utxo.value - feeRate * (40 + 24 + 108/4);
    });
  }
  if (addressType === 'P2PKH') {
    utxos.map(utxo => {
      utxo.effectiveValue = utxo.value - feeRate * (40 + 108);
    });
  }
  return utxos;
}

const selectUtxos = (utxos, targetAmount) => {
  utxos.sort((a, b) => a.effectiveValue - b.effectiveValue);
  
  // 1. Exact match
  for (let i = 0; i < utxos.length; i++) {
    if (utxos[i].effectiveValue === targetAmount) {
      return [utxos[i]];
    }
  }
  
  // 2. Branch and Bound
  let selectedUtxos = branchAndBound(utxos, targetAmount);
  if (selectedUtxos) {
    return selectedUtxos;
  }

  // 3. Accumulator Fallback
  let selected = [];
  let totalInput = 0;
  for (let i = 0; i < utxos.length; i++) {
    selected.push(utxos[i]);
    totalInput += utxos[i].effectiveValue;
    if (totalInput >= targetAmount) {
      return selected;
    }
  }

  throw new Error("Insufficient funds");
}

const branchAndBound = (utxos, targetAmount) => {
  let bestSolution = null;
  let minWaste = Infinity;

  const explore = (remainingUtxos, selectedUtxos, currentSum, depth) => {
    // Base case
    if (currentSum >= targetAmount) {
      let waste = currentSum - targetAmount;
      if (waste < minWaste) {
        bestSolution = selectedUtxos;
        minWaste = waste;
      }
      return;
    }
    // Pruning: unreachable target
    if (currentSum + remainingUtxos.reduce((acc, utxo) => acc + utxo.effectiveValue, 0) < targetAmount) {
      return;
    }
    // Pruning: too deep
    if (depth > remainingUtxos.length) {
      return;
    }
    //Branch
    for (let i = 0; i < remainingUtxos.length; i++) {
      // moving across the tree - add one utxo to the selected utxos
      // if target is hit, stop
      // if target is not hit, move across the tree again and add another utxo
      // repeat until target is hit
      let newRemainingUtxos = remainingUtxos.slice(i + 1);
      let newSelectedUtxos = selectedUtxos.concat(remainingUtxos[i]);
      let newSum = currentSum + remainingUtxos[i].effectiveValue;
      explore(newRemainingUtxos, newSelectedUtxos, newSum, depth + 1);
    }
  }
  explore(utxos, [], 0, 0);
  return bestSolution;
}