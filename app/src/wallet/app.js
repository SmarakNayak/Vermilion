import { useState, useRef, useEffect } from 'react'
import './App.css'

import * as bitcoin from 'bitcoinjs-lib'
import { isP2PKH, isP2SHScript, isP2WPKH, isP2TR } from 'bitcoinjs-lib/src/psbt/psbtutils'
import { toXOnly } from 'bitcoinjs-lib/src/psbt/bip371'
import { ECPairFactory } from 'ecpair'
import * as tinyecc from 'tiny-secp256k1'

import { UnisatWallet, XverseWallet, LeatherWallet, OkxWallet, MagicEdenWallet, PhantomWallet, OylWallet } from './wallets'
import { NETWORKS } from './networks'

bitcoin.initEccLib(tinyecc);
const ECPair = ECPairFactory(tinyecc);

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

const getDelegateBytes = (delegateId) => {
  const [txHash, index] = delegateId.split("i");
  const txHashBytes = Buffer.from(txHash, 'hex').reverse();
  const indexBytes = intToLeBytes(parseInt(index));
  return Buffer.concat([txHashBytes, indexBytes]);
}

const intToLeBytes = (value) => {
  const bytes = [];
  while (value > 0) {
    bytes.push(value & 0xff); //push smallest byte
    value >>= 8; //shift right 1 byte, look at next smallest byte
  }
  return Buffer.from(bytes);
}

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

const getRevealTransaction = (inscriptions, inscriptionReceiveAddress, revealTaproot, revealKeyPair, commitTxId, revealFee, network, sign=true) => {
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

const getRevealVSize = (inscriptions, inscriptionReceiveAddress, network) => {
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

function App() {
  const [network, setNetwork] = useState('testnet');
  const [wallet, setWallet] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const connectWallet = async (walletType) => {
    let accounts = null;
    let walletInstance = null;
    switch (walletType) {
      case 'unisat':    
        walletInstance = new UnisatWallet();
        break;
      case 'xverse':
        walletInstance = new XverseWallet();
        break;
      case 'leather':
        walletInstance = new LeatherWallet();
        break;
      case 'okx':
        walletInstance = new OkxWallet();
        break;
      case 'magiceden':
        walletInstance = new MagicEdenWallet();
        break;
      case 'phantom':
        walletInstance = new PhantomWallet();
        break;
      case 'oyl':
        walletInstance = new OylWallet();
        break;
      default:
        throw new Error('Unsupported wallet type');
    }
    accounts = await walletInstance.connect(network);
    setWallet(walletInstance);
    setIsConnected(true);
    setIsModalOpen(false);
    walletInstance.setupAccountChangeListener((accounts) => {
      console.log(accounts);
      if (accounts?.disconnected === true) {
        setIsConnected(false);
        setWallet(null);
      } else {
        setWallet(walletInstance);
      }      
    });
  }

  const disconnectWallet = async () => {
    await wallet.removeAccountChangeListener();
    setWallet(null);
    setIsConnected(false);
  }

  const createInscriptions = async () => {
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

  const createInscriptionsWithTweakedKey = async (inscriptions) => {
    // 1. get inscription tapscript
    let walletTaproot = wallet.getTaproot(wallet, network);
    let revealKeyPair = {
      publicKey: walletTaproot.internalPubkey,
    }
    let revealTaproot = getRevealTaproot(inscriptions, revealKeyPair.publicKey, network);

    // 2. get estimated reveal vsize to work out how much commit tx should send to the reveal address
    let estRevealVSize = getRevealVSize(inscriptions, wallet.ordinalsAddress, network);

    // 3. get commit transaction
    let [ commitPsbt, estimatedRevealFee ]= await getCommitTransaction(inscriptions, wallet.paymentAddress, wallet.paymentPublicKey, revealTaproot.address, estRevealVSize);
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
    let pushedCommitTx = await broadcastTx(commitTx.toHex());
    let pushedRevealTx = await broadcastTx(revealTx.toHex());
    console.log(pushedCommitTx, pushedRevealTx);
  }

  const createInscriptionsWithTweakedKeyTwoSign = async (inscriptions) => {
    // 1. get inscription tapscript
    let walletTaproot = wallet.getTaproot(wallet, network);
    let revealKeyPair = {
      publicKey: walletTaproot.internalPubkey,
    }
    let revealTaproot = getRevealTaproot(inscriptions, revealKeyPair.publicKey, network);

    // 2. get estimated reveal vsize to work out how much commit tx should send to the reveal address
    let estRevealVSize = getRevealVSize(inscriptions, wallet.ordinalsAddress, network);
    
    // 3. get & sign commit transaction
    let [commitPsbt, estimatedRevealFee ]= await getCommitTransaction(inscriptions, wallet.paymentAddress, wallet.paymentPublicKey, revealTaproot.address, estRevealVSize);
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
    let signedRevealPsbt = await wallet.signPsbt(unsignedRevealPsbt, [{ index: 0, address: walletTaproot.address, useTweakSigner: false, useTweakedSigner: false }]);
    let revealTx = signedRevealPsbt.extractTransaction();

    //5. broadcast transactions
    let pushedCommitTx = await broadcastTx(commitTx.toHex());
    let pushedRevealTx = await broadcastTx(revealTx.toHex());
    console.log(pushedCommitTx, pushedRevealTx);
  }

  const createInscriptionsWithEphemeralKey = async (inscriptions, useWalletForKeyPath=false) => {
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

    // 3. get & sign commit transaction
    let [commitPsbt, estimatedRevealFee ]= await getCommitTransaction(inscriptions, wallet.paymentAddress, wallet.paymentPublicKey, revealTaproot.address, estRevealVSize);
    let signedCommitPsbt = await wallet.signPsbt(commitPsbt); 
    let commitTx = signedCommitPsbt.extractTransaction();
    let commitTxId = commitTx.getId();

    //4. get signed reveal transaction
    let signedRevealPsbt = getRevealTransaction(inscriptions, wallet.ordinalsAddress, revealTaproot, ephemeralKeyPair, commitTxId, estimatedRevealFee, network, true);
    let revealTx = signedRevealPsbt.extractTransaction();

    //5. broadcast transactions
    let pushedCommitTx = await broadcastTx(commitTx.toHex());
    let pushedRevealTx = await broadcastTx(revealTx.toHex());
    console.log(pushedCommitTx, pushedRevealTx);
  }

  const getCommitTransaction = async(inscriptions, paymentAddress, paymentPublicKey, revealAddress, revealVSize) => {
    const paymentAddressScript = bitcoin.address.toOutputScript(paymentAddress, NETWORKS[network].bitcoinjs);
    const paymentAddressType = getAddressType(paymentAddressScript, paymentPublicKey);
    console.log(paymentAddressType);

    let feeRate = await getRecommendedFees();
    let estimatedCommitFeeForHeaderAndOutputs = (10.5 + 2 * 43) * feeRate; //tx header 10.5 vBytes, 2 taproot outputs 43 vBytes each - input vB handled in selection
    let total_postage = inscriptions.reduce((acc, inscription) => acc + inscription.postage, 0);
    let estimatedRevealFee = Math.ceil(revealVSize * feeRate + total_postage);

    let utxos = await getConfirmedCardinalUtxos(paymentAddress);
    let adjustedUtxos = appendUtxoEffectiveValues(utxos, paymentAddressType, feeRate); //adjust utxos values to account for fee for size of input
    let selectedUtxos = selectUtxos(adjustedUtxos, estimatedRevealFee + estimatedCommitFeeForHeaderAndOutputs);
    console.log(selectedUtxos);

    let estimatedCommitFeeForInputs = selectedUtxos.reduce((acc, utxo) => acc + utxo.value - utxo.effectiveValue, 0);
    let estimatedCommitFee = Math.ceil(estimatedCommitFeeForHeaderAndOutputs + estimatedCommitFeeForInputs);
    console.log("Estimated commit fee: ", estimatedCommitFee, ". estimated commit vsize:", estimatedCommitFee / feeRate);
    console.log("Estimated commit input vsize: ", estimatedCommitFeeForInputs / feeRate, ". estimated commit output + header vsize:", estimatedCommitFeeForHeaderAndOutputs / feeRate);
    console.log("Estimated reveal fee: ", estimatedRevealFee);
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
          const prevTx = await getTxData(utxo.txid);
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

  const createTestInscriptions = async () => {
    let inscriptions = [
      new Inscription({
        content: Buffer.from("Chancellor on the brink of second bailout for banks"),
        contentType: "text/plain"
      }),
    ];

    // 1. get inscription tapscript
    let ephemeralKeyPair = generateKeyPair(NETWORKS[network].bitcoinjs);
    let revealTaproot = getRevealTaproot(inscriptions, toXOnly(ephemeralKeyPair.publicKey), network);

    // 2. get estimated reveal vsize to work out how much commit tx should send to the reveal address
    let estRevealVSize = getRevealVSize(inscriptions, wallet.ordinalsAddress, network);

    // 3. get & sign commit transaction
    let [commitPsbt, estimatedRevealFee ]= await getCommitTransaction(inscriptions, wallet.paymentAddress, wallet.paymentPublicKey, revealTaproot.address, estRevealVSize);
    let signedCommitPsbt = await wallet.signPsbt(commitPsbt); 
    let commitTx = signedCommitPsbt.extractTransaction();
    let commitTxId = commitTx.getId();

    //4. get reveal sweep transaction
    let feeRate = await getRecommendedFees();
    let sweepPsbt = getRevealSweepTransaction(wallet.paymentAddress, revealTaproot, ephemeralKeyPair, commitTxId, estimatedRevealFee, feeRate, network, true);
    let revealTx = sweepPsbt.extractTransaction();

    //5. broadcast transactions
    let pushedCommitTx = await broadcastTx(commitTx.toHex());
    let pushedRevealTx = await broadcastTx(revealTx.toHex());
    console.log(pushedCommitTx, pushedRevealTx);
  
  }

  const createTestInscriptions2 = async () => {
    let inscriptions = [
      new Inscription({
        content: Buffer.from("Chancellor on the brink of second bailout for banks"),
        contentType: "text/plain"
      }),
    ];

    // 1. get inscription tapscript
    let walletInternalKey = toXOnly(Buffer.from(wallet.ordinalsPublicKey, 'hex'));
    let revealKeyPair = {
      publicKey: walletInternalKey,
    }
    let revealTaproot = getRevealTaproot(inscriptions, toXOnly(revealKeyPair.publicKey), network);

    // 2. get estimated reveal vsize to work out how much commit tx should send to the reveal address
    let estRevealVSize = getRevealVSize(inscriptions, wallet.ordinalsAddress, network);

    // 3. get & sign commit transaction
    let [commitPsbt, estimatedRevealFee ]= await getCommitTransaction(inscriptions, wallet.paymentAddress, wallet.paymentPublicKey, revealTaproot.address, estRevealVSize);
    let signedCommitPsbt = await wallet.signPsbt(commitPsbt, [{ index: 0, address: wallet.paymentAddress }]); 
    let commitTx = signedCommitPsbt.extractTransaction();
    let commitTxId = commitTx.getId();

    //4. get reveal sweep transaction
    let feeRate = await getRecommendedFees();
    let sweepPsbt = getRevealSweepTransaction(wallet.paymentAddress, revealTaproot, revealKeyPair, commitTxId, estimatedRevealFee, feeRate, network, false);
    let signedSweepPsbt = await wallet.signPsbt(sweepPsbt, [
      { index: 0, 
        address: wallet.ordinalsAddress,
        publicKey: wallet.ordinalsPublicKey,
        // disableTweakSigner: true,
        // publicKey: wallet.ordinalsPublicKey,
        // useTweakSigner: true, 
        // useTweakedSigner: true,
        // useTweakSigner: false,
        // useTweakedSigner: false,
        // tweakHash: revealTaproot.hash,
        // tapMerkleRoot: revealTaproot.hash, 
        // tapLeafHashToSign: revealTaproot.hash 
      }
    ]);
    let revealTx = signedSweepPsbt.extractTransaction();

    //5. broadcast transactions
    let pushedCommitTx = await broadcastTx(commitTx.toHex());
    let pushedRevealTx = await broadcastTx(revealTx.toHex());
    console.log(pushedCommitTx, pushedRevealTx);
  
  }

  const createTestInscriptions3 = async () => {
    let inscriptions = [
      new Inscription({
        content: Buffer.from("Chancellor on the brink of second bailout for banks"),
        contentType: "text/plain"
      }),
    ];

    // 1. get inscription tapscript
    let walletTaproot = wallet.getTaproot(wallet, network);
    let walletInternalKeyPair = {
      publicKey: walletTaproot.internalPubkey,
    }
    let ephemeralKeyPair = generateKeyPair(NETWORKS[network].bitcoinjs);
    let revealTaproot = getRevealTaproot(inscriptions, toXOnly(ephemeralKeyPair.publicKey), network, walletTaproot.internalPubkey);

    // 2. get estimated reveal vsize to work out how much commit tx should send to the reveal address
    let estRevealVSize = getRevealVSize(inscriptions, wallet.ordinalsAddress, network);

    // 3. get & sign commit transaction
    let [commitPsbt, estimatedRevealFee ]= await getCommitTransaction(inscriptions, wallet.paymentAddress, wallet.paymentPublicKey, revealTaproot.address, estRevealVSize);
    let signedCommitPsbt = await wallet.signPsbt(commitPsbt); 
    let commitTx = signedCommitPsbt.extractTransaction();
    let commitTxId = commitTx.getId();

    //4. get reveal sweep transaction
    let feeRate = await getRecommendedFees();
    let sweepPsbt = getRevealSweepTransaction(wallet.paymentAddress, revealTaproot, walletInternalKeyPair, commitTxId, estimatedRevealFee, feeRate, network, false);
    let signedSweepPsbt = await wallet.signPsbt(sweepPsbt, [
      { index: 0, 
        address: wallet.ordinalsAddress,
      }
    ]);
    let revealTx = signedSweepPsbt.extractTransaction();

    //5. broadcast transactions
    let pushedCommitTx = await broadcastTx(commitTx.toHex());
    let pushedRevealTx = await broadcastTx(revealTx.toHex());
    console.log(pushedCommitTx, pushedRevealTx);
  
  }

  async function broadcastTx(txHex) {
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

    const data = await response.text();
    return data;
  }

  const getRecommendedFees = async() => {
    let fees = await fetch(`https://mempool.space/${NETWORKS[network].mempool}api/v1/fees/recommended`);
    let feesJson = await fees.json();
    let fastestFee = feesJson.fastestFee;
    return fastestFee;
  }

  const getConfirmedCardinalUtxos = async(address) => {
    let utxos = await fetch(`https://mempool.space/${NETWORKS[network].mempool}api/address/${address}/utxo`);
    let utxosJson = await utxos.json();
    let confirmedUtxos = utxosJson.filter(utxo => utxo.status.confirmed == true);
    confirmedUtxos = confirmedUtxos.filter(utxo => utxo.value > 1000);
    if (network === 'testnet') {// allow unconfirmed utxos on testnet
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

  const getTxData = async(txId) => {
    let txData = await fetch(`https://mempool.space/${NETWORKS[network].mempool}api/tx/${txId}/hex`);
    let txDataJson = await txData.json();
    return txDataJson;
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

  const getAddressType = (addressScript, publicKey) => {
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

  return (
    <> 
      {!isConnected ? (
        <button onClick={() => setIsModalOpen(true)}>Connect Wallet</button>
      ) : (
        <div>
          <div className="address-display">
            <div><strong>Payment Address:</strong> {wallet?.paymentAddress}</div>
            <div><strong>Ordinals Address:</strong> {wallet?.ordinalsAddress}</div>
          </div>
          
          <button onClick={() => createInscriptions()}>Create Inscription</button>
          <button onClick={() => disconnectWallet()}>Disconnect Wallet</button>
          <button onClick={() => createTestInscriptions3()}>Create Test Inscription</button>
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      >
        {window.unisat ? <button onClick={() => connectWallet('unisat')}>Connect Unisat</button> : <></>}
        {window.XverseProviders?.BitcoinProvider ? <button onClick={() => connectWallet('xverse')}>Connect Xverse</button> : <></>}
        {window.LeatherProvider ? <button onClick={() => connectWallet('leather')}>Connect Leather</button> : <></>}
        {window.magicEden ? <button onClick={() => connectWallet('magiceden')}>Connect Magic Eden</button> : <></>}
        {window.okxwallet ? <button onClick={() => connectWallet('okx')}>Connect Okx</button> : <></>}
        {window.phantom ? <button onClick={() => connectWallet('phantom')}>Connect Phantom</button> : <></>}
        {window.oyl ? <button onClick={() => connectWallet('oyl')}>Connect Oyl</button> : <></>}
      </Modal>

    </>
  )
}

const Modal = ({ isOpen, onClose, children }) => {
  const dialogRef = useRef(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      dialog.showModal();
    } else {
      dialog.close();
    }
  }, [isOpen]);

  return (
    <dialog ref={dialogRef}>
      {children}
      <button onClick={onClose}>Close</button>
    </dialog>
  );
};

export default App

//TODO: Backup Reveal Tx
//TODO: Add mobile wallet support
//TODO: Add hardware wallet support
