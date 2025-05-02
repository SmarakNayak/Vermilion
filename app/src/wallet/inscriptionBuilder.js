import * as bitcoin from 'bitcoinjs-lib'
import { toXOnly } from 'bitcoinjs-lib/src/psbt/bip371'
import { ECPairFactory } from 'ecpair'
import * as ecc from '@bitcoinerlab/secp256k1' // 'tiny-secp256k1' needs a wasm plugin in bun

import { NETWORKS } from './networks'
import { getAddressType, selectUtxos, appendUtxoEffectiveValues, estimateVSize } from './transactionUtils'
import { broadcastTx, submitPackage, getRecommendedFees, getConfirmedCardinalUtxos, getTxData } from './mempoolApi'

bitcoin.initEccLib(ecc);
const ECPair = ECPairFactory(ecc);

class Inscription {
  constructor({
    content = null,
    contentType = null,
    contentEncoding = null,
    metaprotocol = null,
    //parent = null,
    delegate = null,
    pointer = null,
    //metadata = null,
    //rune = null,
    postage = 546
  }) {
    this.content = content;
    this.contentType = contentType;
    this.contentEncoding = contentEncoding;
    this.metaprotocol = metaprotocol;
    //this.parent = parent;
    this.delegate = delegate;
    this.pointer = pointer;
    //this.metadata = metadata;
    //this.rune = rune;
    this.postage = postage;
  }

  getInscriptionScript() {
    if (this.content !== null && this.content.length > 0 && !Buffer.isBuffer(this.content)) {
      throw new Error("Content must be a Buffer");
    }
    const script = [bitcoin.opcodes.OP_0, bitcoin.opcodes.OP_IF, Buffer.from('ord', 'utf-8')];
    if (this.contentType !== null) {
      script.push(bitcoin.opcodes.OP_1, Buffer.from(this.contentType, 'utf-8'));
    }
    if (this.pointer !== null) {
      script.push(bitcoin.opcodes.OP_2, intToLeBytes(this.pointer));
    }
    if (this.contentEncoding !== null) {
      script.push(bitcoin.opcodes.OP_9, Buffer.from(this.contentEncoding, 'utf-8'));
    }
    if (this.metaprotocol !== null) {
      script.push(bitcoin.opcodes.OP_7, Buffer.from(this.metaprotocol, 'utf-8'));
    }
    if (this.delegate !== null) {
      script.push(bitcoin.opcodes.OP_11, getDelegateBytes(this.delegate));
    }
    if (this.metadata !== null) {
      //script.push(bitcoin.opcodes.OP_5, Buffer.from(this.metadata));
    }
    if (this.content !== null && this.content.length > 0) {
      script.push(bitcoin.opcodes.OP_0);
      const contentChunks = [];
      for (let i = 0; i < this.content.length; i += 520) {
        contentChunks.push(this.content.subarray(i, i + 520));
      }
      script.push(...contentChunks);
    }
    script.push(bitcoin.opcodes.OP_ENDIF);
    return script;
  }
}

// Reveal tx functions
function getRevealScript(inscriptions, revealPublicKey) {
  let script = [revealPublicKey, bitcoin.opcodes.OP_CHECKSIG];
  let running_postage = 0;
  for (let i = 0; i < inscriptions.length; i++) {
    let inscription = inscriptions[i];
    if (i>0) {
      inscription.pointer = running_postage;
    }
    const inscriptionScript = inscription.getInscriptionScript();
    script.push(...inscriptionScript);
    running_postage += inscription.postage;
  }
  const compiledScript = bitcoin.script.compile(script);
  return compiledScript;
}

function getRevealTaproot(inscriptions, scriptPathPublicKey, network, keyPathInternalKey=scriptPathPublicKey) {
  const script = getRevealScript(inscriptions, scriptPathPublicKey);
  const tapLeaf = {
    leafVersion: 192, // Tapscript leaf version (0xc0)
    output: script, // Serialized Tapscript
  }
  const revealTaproot = bitcoin.payments.p2tr({
    internalPubkey: keyPathInternalKey,
    scriptTree: tapLeaf,
    redeem: tapLeaf,
    network: NETWORKS[network].bitcoinjs
  });
  return revealTaproot;
}

function getRevealTransaction(inscriptions, inscriptionReceiveAddress, revealTaproot, revealKeyPair, commitTxId, revealFee, network, sign=true) {
  const psbt = new bitcoin.Psbt({ network: NETWORKS[network].bitcoinjs })
    .addInput({
      hash: commitTxId,
      index: 0,
      witnessUtxo: {
        script: revealTaproot.output,
        value: revealFee,
      },
      tapLeafScript: [{
        leafVersion: 192, // Tapscript leaf version (0xc0)
        script: revealTaproot.redeem.output, // Serialized Tapscript
        controlBlock: revealTaproot.witness[revealTaproot.witness.length - 1], // Control block for script path
      }],
    })
    .addOutputs(inscriptions.map((inscription) => ({
      address: inscriptionReceiveAddress,
      value: inscription.postage,
    })));
  
  if (sign) {
    psbt.signInput(0, revealKeyPair);
    psbt.finalizeAllInputs();
  }
  return psbt;
}

function getRevealVSize(inscriptions, inscriptionReceiveAddress, network) {
  let dummyKeyPair = generateKeyPair(NETWORKS[network].bitcoinjs);    
  let revealTaproot = getRevealTaproot(inscriptions, toXOnly(dummyKeyPair.publicKey), network);
  let total_postage = inscriptions.reduce((acc, inscription) => acc + inscription.postage, 0);
  let dummyRevealTransaction = getRevealTransaction(inscriptions, inscriptionReceiveAddress, revealTaproot, dummyKeyPair, "0".repeat(64), total_postage, network, true);
  let estRevealVSize = dummyRevealTransaction.extractTransaction().virtualSize();
  return estRevealVSize;
}

// need to backup: revealTaproot, revealKeyPair, commitTxId, revealFee if wallet can key-path sign
// need to backup entire signed tx for ephemeral key signing
function getRevealSweepTransaction(receiveAddress, revealTaproot, revealKeyPair, commitTxId, revealFee, feeRate, network, sign = true) {
  let headerSize = 10.5; //wcs for tx header
  let inputSize = 40 + 1 + 66/4; //40 for header, 1 for witness, 66/4 for taproot input
  let outputSize = 43; //43 is wcs for taproot output
  let vSize = headerSize + inputSize + outputSize;

  const psbt = new bitcoin.Psbt({ network: NETWORKS[network].bitcoinjs })
    .addInput({
      hash: commitTxId,
      index: 0,
      witnessUtxo: {
        script: revealTaproot.output,
        value: revealFee,
      },
      tapInternalKey: toXOnly(revealKeyPair.publicKey),
      tapMerkleRoot: revealTaproot.hash,
    })
    .addOutput({
      address: receiveAddress,
      value: revealFee - feeRate * vSize,
    });
  
  if (sign) {
    const tweakedSigner = revealKeyPair.tweak(
      bitcoin.crypto.taggedHash(
        'TapTweak',
        Buffer.concat([toXOnly(revealKeyPair.publicKey), revealTaproot.hash]),
      ),
    );
    psbt.signInput(0, wrapECPairWithBufferPublicKey(tweakedSigner));
    psbt.finalizeAllInputs();
  }

  return psbt;
}

// Commit tx functions
async function getCommitTransactionOld(inscriptions, paymentAddress, paymentPublicKey, revealAddress, revealVSize, network, platformFee = 0, platformAddress = null, ownerFee = 0, ownerAddress = null) {
  const paymentAddressScript = bitcoin.address.toOutputScript(paymentAddress, NETWORKS[network].bitcoinjs);
  const paymentAddressType = getAddressType(paymentAddressScript, paymentPublicKey, network);

  let feeRate = await getRecommendedFees(network);
  let estimatedCommitFeeForHeaderAndOutputs = (10.5 + 2 * 43) * feeRate; //tx header 10.5 vBytes, 2 taproot outputs 43 vBytes each - input vB handled in selection
  let total_postage = inscriptions.reduce((acc, inscription) => acc + inscription.postage, 0);
  let estimatedRevealFee = Math.ceil(revealVSize * feeRate + total_postage);

  let utxos = await getConfirmedCardinalUtxos(paymentAddress, network);
  let adjustedUtxos = appendUtxoEffectiveValues(utxos, paymentAddressType, feeRate); //adjust utxos values to account for fee for size of input
  let selectedUtxos = selectUtxos(adjustedUtxos, estimatedRevealFee + estimatedCommitFeeForHeaderAndOutputs);

  let estimatedCommitFeeForInputs = selectedUtxos.reduce((acc, utxo) => acc + utxo.value - utxo.effectiveValue, 0);
  let estimatedCommitFee = Math.ceil(estimatedCommitFeeForHeaderAndOutputs + estimatedCommitFeeForInputs);
  let estimatedInscriptionFee = estimatedCommitFee + estimatedRevealFee;

  const psbt = new bitcoin.Psbt({ network: NETWORKS[network].bitcoinjs });
  
  // 1. inputs
  for (let i = 0; i < selectedUtxos.length; i++) {
    const utxo = selectedUtxos[i];

    switch (paymentAddressType) {
      case 'P2TR':
        psbt.addInput({
          hash: utxo.txid,
          index: utxo.vout,
          witnessUtxo: {
            script: paymentAddressScript,
            value: utxo.value
          },
          tapInternalKey: toXOnly(Buffer.from(paymentPublicKey, 'hex')),
        });
        break;
      case 'P2WPKH':
        psbt.addInput({
          hash: utxo.txid,
          index: utxo.vout,
          witnessUtxo: {
            script: paymentAddressScript,
            value: utxo.value
          }
        });
        break;
      case 'P2SH-P2WPKH':
        const p2wpkh = bitcoin.payments.p2wpkh({
          pubkey: Buffer.from(paymentPublicKey, 'hex'),
          network: NETWORKS[network].bitcoinjs
        });
        psbt.addInput({
          hash: utxo.txid,
          index: utxo.vout,
          witnessUtxo: {
            script: paymentAddressScript,
            value: utxo.value
          },
          redeemScript: p2wpkh.output,
        });
        break;
      case 'P2PKH':
        const prevTx = await getTxData(utxo.txid, network);
        psbt.addInput({
          hash: utxo.txid,
          index: utxo.vout,
          nonWitnessUtxo: Buffer.from(prevTx, 'hex'),
        });
        break;
      default:
        throw new Error("Unsupported address type");
    }
  }

  //2. outputs
  psbt.addOutput({
    address: revealAddress,
    value: estimatedRevealFee
  });

  let change = selectedUtxos.reduce((acc, utxo) => acc + utxo.value, 0) - estimatedInscriptionFee;
  if (change >= 546) {
    psbt.addOutput({
      address: paymentAddress,
      value: change
    });
  }

  return [psbt, estimatedRevealFee];

}

/// Standard method of constructing bitcoin tx given a fee rate:
// 1. Work out count and types of outputs
// 2. Work out type of header (witness or non-witness)
// 3. Now you know how much the payment, the headers and the outputs will cost, but you don't know how many inputs you need yet
// 4. So select inputs based on their _effective_ value (value - fee for size of input)
//    Rather than targetting a shifting value (spend + size_of_tx*fee_rate) with input values -> sum(a(i)) > f(o + h + sum(i)) + p
//    We are targetting a fixed value (spend + size_of_outputs_and_header*fee_rate) with effective values -> sum(a(i)-fi) > f(o + h) + p
// 5. Now we can confidently add inputs knowing that we will hit the target value
async function getCommitTransaction2({
  paymentAddress, 
  paymentPublicKey, 
  utxos, 
  revealAddress, 
  revealVSize, 
  totalPostage, 
  feeRate, 
  network, 
  platformFee = 0, 
  platformAddress = null, 
  ownerFee = 0, 
  ownerAddress = null
}) {
  // 1 output to taproot reveal, 1 change output to payment address, 1 output to platform fee, 1 output to owner fee
  const paymentAddressScript = bitcoin.address.toOutputScript(paymentAddress, NETWORKS[network].bitcoinjs);
  const paymentAddressType = getAddressType(paymentAddressScript, paymentPublicKey, network);
  let outputTypes = ['P2TR', paymentAddressType];
  if (platformFee > 0) {
    let platformAddressScript = bitcoin.address.toOutputScript(platformAddress, NETWORKS[network].bitcoinjs);
    let platformAddressType = getAddressType(platformAddressScript);
    outputTypes.push(platformAddressType);
  }
  if (ownerFee > 0) {
    let ownerAddressScript = bitcoin.address.toOutputScript(ownerAddress, NETWORKS[network].bitcoinjs);
    let ownerAddressType = getAddressType(ownerAddressScript);
    outputTypes.push(ownerAddressType);
  }

  // we don't know how many inputs yet, but we know it's type so we can work out the size of the header and outputs
  let estimatedCommitFeeForHeaderAndOutputs = estimateVSize([], outputTypes, paymentAddressType) * feeRate;
  let estimatedRevealPayment = Math.ceil(revealVSize * feeRate) + totalPostage;

  let adjustedUtxos = appendUtxoEffectiveValues(utxos, paymentAddressType, feeRate); //adjust utxos values to account for fee for size of input
  let commitSendAmount = estimatedRevealPayment + ownerFee + platformFee;
  let selectedUtxos = selectUtxos(adjustedUtxos, commitSendAmount + estimatedCommitFeeForHeaderAndOutputs);

  // Now we know how many inputs we need, we can calculate the estimated commit fee
  let inputTypes = new Array(selectedUtxos.length).fill(paymentAddressType);
  let estimatedCommitFee = estimateVSize(inputTypes, outputTypes, paymentAddressType) * feeRate;  
  let estimatedInscriptionFee = estimatedCommitFee + commitSendAmount;

  const psbt = new bitcoin.Psbt({ network: NETWORKS[network].bitcoinjs });
  
  // 1. inputs
  for (let i = 0; i < selectedUtxos.length; i++) {
    const utxo = selectedUtxos[i];

    switch (paymentAddressType) {
      case 'P2TR':
        psbt.addInput({
          hash: utxo.txid,
          index: utxo.vout,
          witnessUtxo: {
            script: paymentAddressScript,
            value: utxo.value
          },
          tapInternalKey: toXOnly(Buffer.from(paymentPublicKey, 'hex')),
        });
        break;
      case 'P2WPKH':
        psbt.addInput({
          hash: utxo.txid,
          index: utxo.vout,
          witnessUtxo: {
            script: paymentAddressScript,
            value: utxo.value
          }
        });
        break;
      case 'P2SH-P2WPKH':
        const p2wpkh = bitcoin.payments.p2wpkh({
          pubkey: Buffer.from(paymentPublicKey, 'hex'),
          network: NETWORKS[network].bitcoinjs
        });
        psbt.addInput({
          hash: utxo.txid,
          index: utxo.vout,
          witnessUtxo: {
            script: paymentAddressScript,
            value: utxo.value
          },
          redeemScript: p2wpkh.output,
        });
        break;
      case 'P2PKH':
        const prevTx = await getTxData(utxo.txid, network);
        psbt.addInput({
          hash: utxo.txid,
          index: utxo.vout,
          nonWitnessUtxo: Buffer.from(prevTx, 'hex'),
        });
        break;
      default:
        throw new Error("Unsupported address type");
    }
  }

  //2. outputs
  psbt.addOutput({
    address: revealAddress,
    value: estimatedRevealPayment
  });
  if (platformFee > 0) {
    psbt.addOutput({
      address: platformAddress,
      value: platformFee
    });
  }
  if (ownerFee > 0) {
    psbt.addOutput({
      address: ownerAddress,
      value: ownerFee
    });
  }

  let change = selectedUtxos.reduce((acc, utxo) => acc + utxo.value, 0) - estimatedInscriptionFee;
  if (change >= 546) {
    psbt.addOutput({
      address: paymentAddress,
      value: change
    });
  }

  return [psbt, estimatedRevealPayment];

}

function estimateInscriptionFee(inscriptions, paymentAddress, paymentPublicKey, revealVSize, feeRate, utxos, network, platformFee = 0, platformAddress = null, ownerFee = 0, ownerAddress = null) {
  console.log("Estimating inscription fee");
  const paymentAddressScript = bitcoin.address.toOutputScript(paymentAddress, NETWORKS[network].bitcoinjs);
  const paymentAddressType = getAddressType(paymentAddressScript, paymentPublicKey, network);
  
  let estimatedRevealFee = Math.ceil(revealVSize * feeRate);
  let totalPostage = inscriptions.reduce((acc, inscription) => acc + inscription.postage, 0);
  // this is the total amount the commit tx will need to send
  let commitSendAmount = estimatedRevealFee + totalPostage + ownerFee + platformFee;
  // now we can calculate the estimated commit fee
  // assume 1 output to taproot reveal, 1 change output to payment address, 1 output to platform fee, 1 output to owner fee
  let outputTypes = ['P2TR', paymentAddressType];
  if (platformFee > 0) {
    if (platformAddress !== null) {
      let platformAddressScript = bitcoin.address.toOutputScript(platformAddress, NETWORKS[network].bitcoinjs);
      let platformAddressType = getAddressType(platformAddressScript);
      outputTypes.push(platformAddressType);
    } else {
      outputTypes.push("UNKNOWN");
    }
  }
  if (ownerFee > 0) {
    if (ownerAddress !== null) {
      let ownerAddressScript = bitcoin.address.toOutputScript(ownerAddress, NETWORKS[network].bitcoinjs);
      let ownerAddressType = getAddressType(ownerAddressScript);
      outputTypes.push(ownerAddressType);
    } else {
      outputTypes.push("UNKNOWN");
    }
  }
  // we don't know how many inputs yet, but we know it's type so we can work out the size of the header and outputs
  let estimatedCommitFeeForHeaderAndOutputs = estimateVSize([], outputTypes, paymentAddressType) * feeRate;
  let adjustedUtxos = appendUtxoEffectiveValues(utxos, paymentAddressType, feeRate); //adjust utxos values to account for fee for size of input
  let selectedUtxos = selectUtxos(adjustedUtxos, commitSendAmount + estimatedCommitFeeForHeaderAndOutputs);
  // Method 1
  let estimatedCommitFeeForInputs = selectedUtxos.reduce((acc, utxo) => acc + utxo.value - utxo.effectiveValue, 0);
  let estimatedCommitFee = Math.ceil(estimatedCommitFeeForHeaderAndOutputs + estimatedCommitFeeForInputs);
  // Method 2
  let inputTypes = new Array(selectedUtxos.length).fill(paymentAddressType);
  let estimatedCommitFee2 = estimateVSize(inputTypes, outputTypes, paymentAddressType) * feeRate;  
  console.log("Estimated commit fee: ", estimatedCommitFee, ". estimated commit fee2:", estimatedCommitFee2);
  if (estimatedCommitFee !== estimatedCommitFee2) {
    throw new error("Estimated commit fee method 1 and 2 do not match: ", estimatedCommitFee, estimatedCommitFee2);
  }

  let estimatedInscriptionFee = estimatedCommitFee + commitSendAmount;
  return estimatedInscriptionFee;
}

function guessInscriptionFee(inscriptions, revealVSize, feeRate, platformFee = 0, ownerFee = 0) {
  console.log("Guessing inscription fee");
  let commitVsize = estimateVSize(["P2TR", "P2TR"], ["P2TR","P2TR","P2TR","P2TR"]);
  let commitFee = commitVsize * feeRate;
  let revealFee = revealVSize * feeRate;
  let totalPostage = inscriptions.reduce((acc, inscription) => acc + inscription.postage, 0);
  let totalFee = commitFee + revealFee + totalPostage + platformFee + ownerFee;
  return totalFee;
}

// utility functions
function wrapECPairWithBufferPublicKey(ecpair) {
  return {
    publicKey: Buffer.from(ecpair.publicKey),
    compressed: ecpair.compressed,
    network: ecpair.network,
    lowR: ecpair.lowR,
    privateKey: ecpair.privateKey ? Buffer.from(ecpair.privateKey) : undefined,
    sign: ecpair.sign.bind(ecpair),
    toWIF: ecpair.toWIF.bind(ecpair),
    tweak: ecpair.tweak.bind(ecpair),
    verify: ecpair.verify.bind(ecpair),
    verifySchnorr: ecpair.verifySchnorr.bind(ecpair),
    signSchnorr: ecpair.signSchnorr.bind(ecpair),
  };
}

function generateKeyPair(bitcoinjsNetwork) {
  const keypair = ECPair.makeRandom({ network: bitcoinjsNetwork });
  return wrapECPairWithBufferPublicKey(keypair);
}

function getDelegateBytes(delegateId) {
  const [txHash, index] = delegateId.split("i");
  const txHashBytes = Buffer.from(txHash, 'hex').reverse();
  const indexBytes = intToLeBytes(parseInt(index));
  return Buffer.concat([txHashBytes, indexBytes]);
}

function intToLeBytes(value) {
  const bytes = [];
  while (value > 0) {
    bytes.push(value & 0xff); //push smallest byte
    value >>= 8; //shift right 1 byte, look at next smallest byte
  }
  return Buffer.from(bytes);
}

// inscription functions
async function createInscriptionsWithTweakedKey({
  inscriptions,
  wallet,
  network,
  signStatusCallback = () => {},
  feeRate = null,
  utxos = null,
  platformFee = 0,
  platformAddress = null,
  ownerFee = 0,
  ownerAddress = null
}) {
  signStatusCallback("Signing 2/2 transactions");
  // 1. get inscription tapscript
  let walletTaproot = wallet.getTaproot(wallet, network);
  let revealKeyPair = {
    publicKey: walletTaproot.internalPubkey,
  }
  let revealTaproot = getRevealTaproot(inscriptions, revealKeyPair.publicKey, network);

  // 2. get estimated reveal vsize to work out how much commit tx should send to the reveal address
  let estRevealVSize = getRevealVSize(inscriptions, wallet.ordinalsAddress, network);
  let totalPostage = inscriptions.reduce((acc, inscription) => acc + inscription.postage, 0);
  
  if (feeRate === null) {
    feeRate = await getRecommendedFees(network);
  }
  if (utxos === null) {
    utxos = await getConfirmedCardinalUtxos(wallet.paymentAddress, network);
  }

  // 3. get commit transaction
  let [ commitPsbt, estimatedRevealFee ]= await getCommitTransaction2({
    paymentAddress: wallet.paymentAddress,
    paymentPublicKey: wallet.paymentPublicKey,
    utxos,
    revealAddress: revealTaproot.address,
    revealVSize: estRevealVSize,
    totalPostage,
    feeRate,
    network,
    platformFee,
    platformAddress,
    ownerFee,
    ownerAddress
  });
  
  let tempCommitTx = commitPsbt.__CACHE.__TX;
  let toSignCommitInputs = commitPsbt.data.inputs.map((input, index) => {
    return {
      index,
      address: wallet.paymentAddress
    }
  });

  // 4. get reveal transaction
  let unsignedRevealPsbt = getRevealTransaction(inscriptions, wallet.ordinalsAddress, revealTaproot, revealKeyPair, tempCommitTx.getId(), estimatedRevealFee, network, false);
  
  // 5. sign both transactions
  let [signedCommitPsbt, signedRevealPsbt] = await wallet.signPsbts(
    [commitPsbt, unsignedRevealPsbt],
    [
      toSignCommitInputs,
      [{ index: 0, address: walletTaproot.address, useTweakSigner: false, useTweakedSigner: false }]
    ]
  );

  // 6. broadcast transactions
  let commitTx = signedCommitPsbt.extractTransaction();
  let revealTx = signedRevealPsbt.extractTransaction();
  let pushedCommitTx = await broadcastTx(commitTx.toHex(), network);
  let pushedRevealTx = await broadcastTx(revealTx.toHex(), network);
  console.log(pushedCommitTx, pushedRevealTx);
  return [pushedCommitTx, pushedRevealTx];
}

async function createInscriptionsWithTweakedKeyTwoSign({
  inscriptions,
  wallet,
  network,
  signStatusCallback = () => {},
  feeRate = null,
  utxos = null,
  platformFee = 0,
  platformAddress = null,
  ownerFee = 0,
  ownerAddress = null
}) {
  signStatusCallback("Signing 1/2 transactions");
  // 1. get inscription tapscript
  let walletTaproot = wallet.getTaproot(wallet, network);
  let revealKeyPair = {
    publicKey: walletTaproot.internalPubkey,
  }
  let revealTaproot = getRevealTaproot(inscriptions, revealKeyPair.publicKey, network);

  // 2. get estimated reveal vsize to work out how much commit tx should send to the reveal address
  let estRevealVSize = getRevealVSize(inscriptions, wallet.ordinalsAddress, network);  
  let totalPostage = inscriptions.reduce((acc, inscription) => acc + inscription.postage, 0);
  
  if (feeRate === null) {
    feeRate = await getRecommendedFees(network);
  }
  if (utxos === null) {
    utxos = await getConfirmedCardinalUtxos(wallet.paymentAddress, network);
  }
  
  // 3. get & sign commit transaction
  let [commitPsbt, estimatedRevealFee ] = await getCommitTransaction2({
    paymentAddress: wallet.paymentAddress,
    paymentPublicKey: wallet.paymentPublicKey, 
    utxos,
    revealAddress: revealTaproot.address,
    revealVSize: estRevealVSize,
    totalPostage,
    feeRate,
    network,
    platformFee,
    platformAddress,
    ownerFee,
    ownerAddress
  });
  let toSignCommitInputs = commitPsbt.data.inputs.map((input, index) => {
    return {
      index,
      address: wallet.paymentAddress
    }
  });
  let signedCommitPsbt = await wallet.signPsbt(commitPsbt, toSignCommitInputs);
  let commitTx = signedCommitPsbt.extractTransaction();

  // 4. get and sign reveal transaction
  let unsignedRevealPsbt = getRevealTransaction(inscriptions, wallet.ordinalsAddress, revealTaproot, revealKeyPair, commitTx.getId(), estimatedRevealFee, network, false);
  signStatusCallback("Signing 2/2 transactions");
  let signedRevealPsbt = await wallet.signPsbt(unsignedRevealPsbt, [{ index: 0, address: walletTaproot.address, useTweakSigner: false, useTweakedSigner: false }]);
  let revealTx = signedRevealPsbt.extractTransaction();

  //5. broadcast transactions
  let pushedCommitTx = await broadcastTx(commitTx.toHex(), network);
  let pushedRevealTx = await broadcastTx(revealTx.toHex(), network);
  console.log(pushedCommitTx, pushedRevealTx);
  return [pushedCommitTx, pushedRevealTx];
}

async function createInscriptionsWithEphemeralKey({
  inscriptions,
  wallet,
  network,
  useWalletForKeyPath = false,
  signStatusCallback = () => {},
  feeRate = null,
  utxos = null,
  platformFee = 0,
  platformAddress = null,
  ownerFee = 0,
  ownerAddress = null
}) {
  signStatusCallback("Signing 1/1 transaction");
  // 1. get inscription tapscript
  let ephemeralKeyPair = generateKeyPair(NETWORKS[network].bitcoinjs);

  let scriptPathPublicKey = toXOnly(ephemeralKeyPair.publicKey);
  let keyPathInternalKey = scriptPathPublicKey;
  if (useWalletForKeyPath) {
    keyPathInternalKey = wallet.getTaproot(wallet, network).internalPubkey;
  }
  let revealTaproot = getRevealTaproot(inscriptions, scriptPathPublicKey, network, keyPathInternalKey);

  // 2. get estimated reveal vsize to work out how much commit tx should send to the reveal address
  let estRevealVSize = getRevealVSize(inscriptions, wallet.ordinalsAddress, network);
  let totalPostage = inscriptions.reduce((acc, inscription) => acc + inscription.postage, 0);
  
  if (feeRate === null) {
    feeRate = await getRecommendedFees(network);
  }
  if (utxos === null) {
    utxos = await getConfirmedCardinalUtxos(wallet.paymentAddress, network);
  }

  // 3. get & sign commit transaction
  let [commitPsbt, estimatedRevealFee ] = await getCommitTransaction2({
    paymentAddress: wallet.paymentAddress,
    paymentPublicKey: wallet.paymentPublicKey, 
    utxos,
    revealAddress: revealTaproot.address,
    revealVSize: estRevealVSize,
    totalPostage,
    feeRate,
    network,
    platformFee,
    platformAddress,
    ownerFee,
    ownerAddress
  });
  let signedCommitPsbt = await wallet.signPsbt(commitPsbt); 
  let commitTx = signedCommitPsbt.extractTransaction();
  let commitTxId = commitTx.getId();

  //4. get signed reveal transaction
  let signedRevealPsbt = getRevealTransaction(inscriptions, wallet.ordinalsAddress, revealTaproot, ephemeralKeyPair, commitTxId, estimatedRevealFee, network, true);
  let revealTx = signedRevealPsbt.extractTransaction();

  //5. broadcast transactions
  let pushedCommitTx = await broadcastTx(commitTx.toHex(), network);
  let pushedRevealTx = await broadcastTx(revealTx.toHex(), network);
  console.log(pushedCommitTx, pushedRevealTx);
  return [pushedCommitTx, pushedRevealTx];
}

async function createInscriptions({
  inscriptions,
  wallet,
  signStatusCallback = () => {},
  feeRate = null,
  utxos = null,
  platformFee = 0,
  platformAddress = null,
  ownerFee = 0,
  ownerAddress = null
}) {
  const network = wallet.network;
  if (feeRate === null) {
    feeRate = await getRecommendedFees(network);
  }
  if (utxos === null) {
    utxos = await getConfirmedCardinalUtxos(wallet.paymentAddress, network);
  }
  const creationMethod = wallet.getInscriptionCreationMethod();
  if (creationMethod === 'ephemeral') {
    console.log("Using ephemeral key for script and key path");
    return await createInscriptionsWithEphemeralKey({
      inscriptions,
      wallet,
      network,
      useWalletForKeyPath: false,
      signStatusCallback,
      feeRate,
      utxos,
      platformFee,
      platformAddress,
      ownerFee,
      ownerAddress
    });
  }
  if (creationMethod === 'ephemeral_with_wallet_key_path') {
    console.log("Using ephemeral key for script path, wallet for key path");
    return await createInscriptionsWithEphemeralKey({
      inscriptions,
      wallet,
      network,
      useWalletForKeyPath: true,
      signStatusCallback,
      feeRate,
      utxos,
      platformFee,
      platformAddress,
      ownerFee,
      ownerAddress
    });
  }
  if (creationMethod === 'wallet_one_sign') {
    console.log("Using internal key");
    return await createInscriptionsWithTweakedKey({
      inscriptions,
      wallet,
      network,
      signStatusCallback,
      feeRate,
      utxos,
      platformFee,
      platformAddress,
      ownerFee,
      ownerAddress
    });
  }
  if (creationMethod === 'wallet_two_sign') {
    console.log("Using internal key with two txs");
    return await createInscriptionsWithTweakedKeyTwoSign({
      inscriptions,
      wallet,
      network,
      signStatusCallback,
      feeRate,
      utxos,
      platformFee,
      platformAddress,
      ownerFee,
      ownerAddress
    });
  }
}

async function createInscriptionsExample() {
  let inscriptions = [
    new Inscription({
      content: Buffer.from("Chancellor on the brink of second bailout for banks"),
      contentType: "text/plain"
    }),
  ];
  // let inscriptions = [
  //   new Inscription({
  //     content: Buffer.from("Chancellor on the brink of second bailout for banks"),
  //     contentType: "text/plain;charset=utf-8"
  //   }),
  //   new Inscription({
  //     content: Buffer.from("Chancellor on the brink of second bailout for banks: Billions may be needed as lending squeeze tightens"),
  //     contentType: "text/plain;charset=utf-8"
  //   }),
  //   new Inscription({
  //     content: Buffer.from("The Times 03/Jan/2009 Chancellor on the brink of second bailout for banks."),
  //     contentType: "text/plain;charset=utf-8"
  //   }),
  // ];
  // let inscriptions = Array(1000).fill().map(() => 
  //   new Inscription({
  //     delegate: "d386e79a0c7639805c6a63eb0d1c3e5a616c9dc8cf0dd0691e7d5440e6a175a8i2",
  //     postage: 330,
  //     contentType: "text/plain;charset=utf-8"
  //   })
  // );
  
  let creationMethod = wallet.getInscriptionCreationMethod();
  if (creationMethod === 'ephemeral') {
    //using ephemeral key
    console.log("Using ephemeral key for script and key path");
    createInscriptionsWithEphemeralKey(inscriptions, false);
  }
  if (creationMethod === 'ephemeral_with_wallet_key_path') {
    //using ephemeral key for script path, wallet for key path
    console.log("Using ephemeral key for script path, wallet for key path");
    createInscriptionsWithEphemeralKey(inscriptions, true);
  }
  if (creationMethod === 'wallet_one_sign') {
    //using wallet internal key
    console.log("Using internal key");
    createInscriptionsWithTweakedKey(inscriptions);
  }
  if (creationMethod === 'wallet_two_sign') {
    //using wallet internal key with two txs
    console.log("Using internal key with two txs");
    createInscriptionsWithTweakedKeyTwoSign(inscriptions);
  }
}

export {
  Inscription,
  createInscriptions,
  createInscriptionsExample,
  getRevealSweepTransaction,
  getRevealVSize,
  estimateInscriptionFee,
  guessInscriptionFee
}