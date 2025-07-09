//overall philosophy: we want to take as little information from the wallets as possible
//and do the rest ourselves. If we expect too much from the wallets, we will have compatibility
//issues with wallets that don't support the features we want. We also want to avoid
//having to write a lot of code for each wallet, so we want to keep the code as simple as possible.
import * as bitcoin from 'bitcoinjs-lib';
import { isP2PKH, isP2SHScript, isP2WPKH, isP2TR } from 'bitcoinjs-lib/src/psbt/psbtutils';
import { toXOnly } from 'bitcoinjs-lib/src/psbt/bip371';
import * as jsontokens from 'jsontokens';
import { NETWORKS, getNetworksFromAddress } from './networks';

class Wallet {
  constructor(walletType, supportsCustomAddressSigning = false, supportsKeyPathSigning = false) {
    this.walletType = walletType;
    // allows for signing of any custom p2tr address even if not the standard p2tr
    this.supportsCustomAddressSigning = supportsCustomAddressSigning;
    // allows for signing of custom p2tr addresses with internal key tweaked by merkle root of p2tr script
    this.supportsKeyPathSigning = supportsKeyPathSigning;
    this.network = null;
    this.paymentAddress = null;
    this.ordinalsAddress = null;
    this.paymentPublicKey = null;
    this.ordinalsPublicKey = null;
    this._accountChangedListener = null;
  }

  windowCheck() {
    throw new Error('windowCheck must be implemented by subclass');
  }

  async connect(network) {
    throw new Error('connect must be implemented by subclass');
  }

  async getNetwork() {
    throw new Error('getNetwork must be implemented by subclass');
  }

  async switchNetwork(network) {
    throw new Error('switchNetwork must be implemented by subclass');
  }

  async signPsbt(psbt, signingIndexes = null) {
    throw new Error('signPsbt must be implemented by subclass');
  }

  async signPsbts(psbtArray, signingIndexesArray) {
    // Default implementation signs each PSBT one at a time
    this.windowCheck();
    let signedPsbts = []
    for (let i = 0; i < psbtArray.length; i++) {
      let signedPsbt = await this.signPsbt(psbtArray[i], signingIndexesArray[i]);
      signedPsbts.push(signedPsbt);
    }
    return signedPsbts;
  }

  async signMessage(message, type, address = this.ordinalsAddress) {
    throw new Error('signMessage must be implemented by subclass');
  }

  async setupAccountChangeListener(callback) {
    console.log(`${this.walletType} does not support account change listener by default`);
  }

  async removeAccountChangeListener() {
    // Default implementation does nothing
  }

  getAccountInfo() {
    return {
      paymentAddress: this.paymentAddress,
      ordinalsAddress: this.ordinalsAddress,
      paymentPublicKey: this.paymentPublicKey,
      ordinalsPublicKey: this.ordinalsPublicKey
    };
  }

  handleDisconnect(callback) {
    console.log("Wallet disconnected or empty address received");
    this.paymentAddress = null;
    this.ordinalsAddress = null;
    this.paymentPublicKey = null;
    this.ordinalsPublicKey = null;
    callback({ ...this.getAccountInfo(), disconnected: true });
    this.removeAccountChangeListener();
  }

  getInputAddress(input) {
    if (!this.network) throw new Error('Network not set');
    if (input.nonWitnessUtxo) {
      const tx = bitcoin.Transaction.fromBuffer(input.nonWitnessUtxo);
      return bitcoin.address.fromOutputScript(
        tx.outs[input.index].script,
        NETWORKS[this.network].bitcoinjs
      );
    } else if (input.witnessUtxo) {
      return bitcoin.address.fromOutputScript(
        input.witnessUtxo.script,
        NETWORKS[this.network].bitcoinjs
      );
    }
    throw new Error('Malformed PSBT: input is missing nonWitnessUtxo or witnessUtxo');
  }

  getInputsToSignGroupedNameless(psbt, signingIndexes = null) {
    const inputsToSign = { [this.ordinalsAddress]: [], [this.paymentAddress]: [] };
    if (signingIndexes) {
      signingIndexes.forEach(idx => {
        if (idx.address === this.paymentAddress) inputsToSign[this.paymentAddress].push(idx.index);
        if (idx.address === this.ordinalsAddress) inputsToSign[this.ordinalsAddress].push(idx.index);
      });
    } else {
      psbt.data.inputs.forEach((input, i) => {
        const address = this.getInputAddress(input);
        if (address === this.paymentAddress || address === this.ordinalsAddress) {
          inputsToSign[address].push(i);
        }
      });
    }
    return inputsToSign;
  }

  getInputsToSignGrouped(psbt, signingIndexes = null) {
    const inputsToSign = this.getInputsToSignGroupedNameless(psbt, signingIndexes);
    return Object.entries(inputsToSign).map(([address, signingIndexes]) => ({
      address,
      signingIndexes
    }));
  }

  hasSignableTweakedTaproot() {
    if (!this.supportsCustomAddressSigning) return false;
    const paymentAddressScript = bitcoin.address.toOutputScript(this.paymentAddress, NETWORKS[this.network].bitcoinjs);
    const ordinalsAddressScript = bitcoin.address.toOutputScript(this.ordinalsAddress, NETWORKS[this.network].bitcoinjs);
    return isP2TR(paymentAddressScript) || isP2TR(ordinalsAddressScript);
  }

  getInscriptionCreationMethod() {
    const paymentAddressScript = bitcoin.address.toOutputScript(this.paymentAddress, NETWORKS[this.network].bitcoinjs);
    const ordinalsAddressScript = bitcoin.address.toOutputScript(this.ordinalsAddress, NETWORKS[this.network].bitcoinjs);
    // no taproot so we have to use an ephemeral key (non-custodial)
    if (!(isP2TR(paymentAddressScript) || isP2TR(ordinalsAddressScript))) return 'ephemeral';
    // has taproot but can't sign reveal, so sign using ephemeral script path, whilst maintaining custody via wallet key path
    if (!this.supportsCustomAddressSigning) return 'ephemeral_with_wallet_key_path';
    // has taproot and can sign reveal, payment address is p2wpkh/p2tr, so we can extract commit tx_id and sign both txs at once
    if (isP2TR(paymentAddressScript) || isP2WPKH(paymentAddressScript)) return 'wallet_one_sign';
    // has taproot and can sign reveal, but legacy/nested payment address, so we can't extract commit tx_id before signing
    return 'wallet_two_sign';
  }

  getTaproot() {
    let paymentAddressScript = bitcoin.address.toOutputScript(this.paymentAddress, NETWORKS[this.network].bitcoinjs);
    let ordinalsAddressScript = bitcoin.address.toOutputScript(this.ordinalsAddress, NETWORKS[this.network].bitcoinjs);
    if (isP2TR(ordinalsAddressScript)) {
      // remove first byte of public key if 33 bytes to get x-only
      let xonlyInternalKey = this.ordinalsPublicKey;
      if (xonlyInternalKey.length === 66) {
        xonlyInternalKey = xonlyInternalKey.slice(2);
      }
      let tweakedTaproot = bitcoin.payments.p2tr({
        internalPubkey: toXOnly(Buffer.from(xonlyInternalKey, 'hex')),
        network: NETWORKS[this.network].bitcoinjs
      }); 

      return tweakedTaproot;
    }

    if (isP2TR(paymentAddressScript)) {
      let xonlyInternalKey = this.paymentPublicKey;
      if (xonlyInternalKey.length === 66) {
        xonlyInternalKey = xonlyInternalKey.slice(2);
      }
      let tweakedTaproot = bitcoin.payments.p2tr({
        internalPubkey: toXOnly(Buffer.from(xonlyInternalKey, 'hex')),
        network: NETWORKS[this.network].bitcoinjs
      });
      return tweakedTaproot;
    }
  }
}

class UnisatWallet extends Wallet {
  constructor() {
    super('unisat', true, false); //supports custom addresses, but not custom key path signing
  }

  windowCheck() {
    if (!window.unisat) throw new Error('Unisat not installed');
  }

  async connect(network) {
    this.windowCheck();
    const chain = await window.unisat.getChain();
    if (chain.enum !== NETWORKS[network].unisat) {
      try {
        await window.unisat.switchChain(NETWORKS[network].unisat);
      } catch (error) {
        throw new Error('Could not switch to the specified network');
      }
    }
    
    const accounts = await window.unisat.requestAccounts();
    const publicKey = await window.unisat.getPublicKey();
    this.network = network;
    this.paymentAddress = accounts[0];
    this.ordinalsAddress = accounts[0];
    this.paymentPublicKey = publicKey;
    this.ordinalsPublicKey = publicKey;

    return this.getAccountInfo();
  }

  async getNetwork() {
    this.windowCheck();
    const chain = await window.unisat.getChain();
    return chain.enum;
  }

  async switchNetwork(network) {
    this.windowCheck();
    await window.unisat.switchChain(network);
    this.network = network;
  }

  async signPsbt(psbt, signingIndexes = null) {
    this.windowCheck();
    const psbtHex = psbt.toHex();
    let signedPsbtHex;
    if (signingIndexes === null) {
      signedPsbtHex = await window.unisat.signPsbt(psbtHex);
    } else {
      let unisatOptions = {
        autoFinalized: true,
        toSignInputs: signingIndexes
      }
      signedPsbtHex = await window.unisat.signPsbt(psbtHex, unisatOptions);
    }
    return bitcoin.Psbt.fromHex(signedPsbtHex);
  }

  async signPsbts(psbtArray, signingIndexesArray) {
    this.windowCheck();
    const psbtHexs = psbtArray.map(psbt => psbt.toHex());
    const unisatOptions = signingIndexesArray.map(signingIndexes => ({
      toSignInputs: signingIndexes,
      autoFinalized: false
    }));
    const signedPsbtHexs = await window.unisat.signPsbts(psbtHexs, unisatOptions);
    const psbts = signedPsbtHexs.map(hex => bitcoin.Psbt.fromHex(hex));
    const finalizedPsbts = psbts.map(psbt => psbt.finalizeAllInputs());
    return finalizedPsbts;
  }
  // "bip322-simple". default is "ecdsa"
  async signMessage(message, type) {
    this.windowCheck();
    if (type && type === 'bip322') type = 'bip322-simple';
    let signature = await window.unisat.signMessage(message, type);
    return signature;
  } 

  async setupAccountChangeListener(callback) {
    this.windowCheck();
    this._accountChangedListener = async (accounts) => {
      if (accounts.length === 0) {
        this.handleDisconnect(callback);
        return;
      }
      const publicKey = await window.unisat.getPublicKey();
      this.paymentAddress = accounts[0];
      this.ordinalsAddress = accounts[0];
      this.paymentPublicKey = publicKey;
      this.ordinalsPublicKey = publicKey;
      callback(this.getAccountInfo());
    };
    window.unisat.on('accountsChanged', this._accountChangedListener);
  }

  async removeAccountChangeListener() {
    this.windowCheck();
    if (this._accountChangedListener) {
      window.unisat.removeListener('accountsChanged', this._accountChangedListener);
      this._accountChangedListener = null;
    }
  }
}

class XverseWallet extends Wallet {
  constructor() {
    super('xverse', true, true); //supports custom addresses and custom key path signing
  }

  windowCheck() {
    if (!window.XverseProviders?.BitcoinProvider) throw new Error('Xverse not installed');
  }

  async connect(network) {
    this.windowCheck();
    let response = await window.XverseProviders.BitcoinProvider.request("wallet_connect", {
      addresses: ['payment', 'ordinals'],
      message: 'Connect to Vermilion dot place plz'
    });
    if (await this.getNetwork() !== NETWORKS[network].xverse) { // we do it after the initial connect due to permissions
      await this.switchNetwork(network);
      response = await window.XverseProviders.BitcoinProvider.request("wallet_connect", {
        addresses: ['payment', 'ordinals'],
        message: 'Connect to Vermilion dot place plz'
      });
    }
    if (response.error) throw new Error(response.error.message);
    const accounts = response.result.addresses;
    const payment = accounts.find(a => a.purpose === 'payment');
    const ordinals = accounts.find(a => a.purpose === 'ordinals');
    
    this.network = network;
    this.paymentAddress = payment.address;
    this.ordinalsAddress = ordinals.address;
    this.paymentPublicKey = payment.publicKey;
    this.ordinalsPublicKey = ordinals.publicKey;

    return this.getAccountInfo();
  }

  async getNetwork() {
    this.windowCheck();
    const res = await window.XverseProviders.BitcoinProvider.request('wallet_getNetwork', null);
    if (res.error) throw new Error(res.error.message);
    return res.result.bitcoin.name;
  }

  async switchNetwork(network) {
    this.windowCheck();
    const xverseNetwork = NETWORKS[network].xverse;
    const res = await window.XverseProviders.BitcoinProvider.request('wallet_changeNetwork', {
      name: xverseNetwork
    });
    if (res.error) throw new Error(res.error.message);
    this.network = network;
  }

  async signPsbt(psbt, signingIndexes = null) {
    this.windowCheck();
    const inputsToSign = this.getInputsToSignGroupedNameless(psbt, signingIndexes);
    const psbtBase64 = psbt.toBase64();
    console.log('Signing PSBT with Xverse:', psbtBase64, inputsToSign);
    const response = await window.XverseProviders.BitcoinProvider.request("signPsbt", {
      psbt: psbtBase64,
      signInputs: inputsToSign,
      broadcast: false
    });
    if (response.error) throw new Error(response.error.message);
    const signedPsbt = bitcoin.Psbt.fromBase64(response.result.psbt);
    if (signedPsbt.data.inputs[0].tapKeySig && signedPsbt.data.inputs[0].tapScriptSig) { // hacky af
      delete signedPsbt.data.inputs[0].tapKeySig;
    }
    let finalizedPsbt = signedPsbt.finalizeAllInputs();
    return finalizedPsbt;
  }

  async signPsbts(psbtArray, signingIndexesArray) {
    this.windowCheck();
    const psbts = psbtArray.map((psbt, i) => ({
      psbtBase64: psbt.toBase64(),
      inputsToSign: this.getInputsToSignGrouped(psbt, signingIndexesArray[i]),
      broadcast: false
    }));
    let payload = {
      network: { type: NETWORKS[this.network].xverse },
      message: 'Sign these transactions plz',
      psbts
    };
    let request = jsontokens.createUnsecuredToken(payload);
    const response = await window.XverseProviders.BitcoinProvider.signMultipleTransactions(request);

    if (response.error){
      console.log(response);
      if (response.error.message.includes('is not supported') || response.error.message.includes('Method not found')) {
        console.log('Xverse does not support signing multiple PSBTs at once, falling back to single signPsbt calls');
        let signedPsbts = []
        for (let i = 0; i < psbtArray.length; i++) {
          let signedPsbt = await this.signPsbt(psbtArray[i], signingIndexesArray[i]);
          signedPsbts.push(signedPsbt);
        }
        return signedPsbts;
      }
      throw new Error(response.error.message);
    }

    return response.map(r => bitcoin.Psbt.fromBase64(r.psbtBase64).finalizeAllInputs());
  }
  
  async signMessage(message, type, address = this.ordinalsAddress) {
    this.windowCheck();
    if (type && (type !== 'bip322' && type !== 'ecdsa')) throw new Error('Xverse only supports bip322 and ecdsa signing');
    if (type === 'bip322') type = 'BIP322';
    if (type === 'ecdsa') type = 'ECDSA';
    const response = await window.XverseProviders.BitcoinProvider.request("signMessage", {
      address,
      message,
      protocol: type
    });
    if (response.error) throw new Error(response.error.message);
    return response.result.signature;
  }

  async setupAccountChangeListener(callback) {
    this._accountChangedListener = window.XverseProviders.BitcoinProvider.addListener('accountChange', async () => {
      this.handleDisconnect(callback);
    });
  }

  async removeAccountChangeListener() {
    if (this._accountChangedListener) {
      this._accountChangedListener();
      this._accountChangedListener = null;
    }
  }
}

class LeatherWallet extends Wallet {
  constructor() {
    super('leather', false, false); // Error: Can not finalize taproot input #0. No tapleaf script signature provided.
  }

  windowCheck() {
    if (!window.LeatherProvider) throw new Error('Leather not installed');
  }

  async connect(network) {
    this.windowCheck();
    const response = await window.LeatherProvider.request('getAddresses');
    const payment = response.result.addresses.find(a => a.type === 'p2wpkh');
    const ordinals = response.result.addresses.find(a => a.type === 'p2tr');
    
    if (!getNetworksFromAddress(payment.address).includes(network)) {
      throw new Error('Connected to wrong network, please switch to ' + network);
    }
    
    this.network = network;
    this.paymentAddress = payment.address;
    this.ordinalsAddress = ordinals.address;
    this.paymentPublicKey = payment.publicKey;
    this.ordinalsPublicKey = ordinals.publicKey;

    return this.getAccountInfo();
  }

  async getNetwork() {
    throw new Error('Leather does not support getNetwork');
  }

  async switchNetwork(network) {
    throw new Error('Leather does not support network switching');
  }

  async signPsbt(psbt, signingIndexes = null) {
    this.windowCheck();
    const requestParams = { 
      hex: psbt.toHex(),
      ...(signingIndexes && { signAtIndex: signingIndexes.map(idx => idx.index) })
    };
    const response = await window.LeatherProvider.request('signPsbt', requestParams);
    if (response.error) throw new Error(response.error.message);
    const signedPsbt = bitcoin.Psbt.fromHex(response.result.hex);
    return signedPsbt.finalizeAllInputs();
  }

  async signMessage(message, type, address = this.ordinalsAddress) {
    if(type && type !== 'bip322') throw new Error('Leather only supports bip322 signing');
    this.windowCheck();
    let paymentType = address === this.ordinalsAddress ? 'p2tr' : 'p2wpkh';
    const response = await window.LeatherProvider.request('signMessage', {
      message,
      paymentType,
      network: this.network,
    });
    if (response.error) throw new Error(response.error.message);
    return response.result.signature;
  }

}

class OkxWallet extends Wallet {
  constructor() {
    super('okx', true, true); //supports custom addresses and custom key path signing
  }

  // note: zustand cannot store recursive objects, so we use a function to get the provider (which is recursive)
  _getProvider(network) {
    this.windowCheck();
    if (network===undefined) {
      network = this.network;
    }
    if (network === 'mainnet') {
      return window.okxwallet.bitcoin;
    } else if (network === 'testnet') {
      return window.okxwallet.bitcoinTestnet;
    } else if (network === 'signet') {
      return window.okxwallet.bitcoinSignet;
    } else {
      throw new Error('OKX only supports mainnet, testnet and signet');
    }
  }


  windowCheck() {
    if (!window.okxwallet) throw new Error('OKX not installed');
  }

  async connect(network) {
    this.windowCheck();
    let response;
    let provider = await this._getProvider(network);

    response = await provider.connect();
    
    this.network = network;
    this.paymentAddress = response.address;
    this.ordinalsAddress = response.address;
    this.paymentPublicKey = response.publicKey;
    this.ordinalsPublicKey = response.publicKey;

    return this.getAccountInfo();
  }

  async getNetwork() {
    this.windowCheck();
    return this.network;
  }

  async switchNetwork(network) {
    this.windowCheck();
    await this.connect(network);
  }

  async signPsbt(psbt, signingIndexes = null) {
    this.windowCheck();
    const provider = this._getProvider();
    let signedPsbtHex;
    if (signingIndexes === null) {
      signedPsbtHex = await provider.signPsbt(psbt.toHex());
    } else {
      let okxOptions = {
        autoFinalized: true,
        toSignInputs: signingIndexes
      }
      signedPsbtHex = await provider.signPsbt(psbt.toHex(), okxOptions);
    }
    return bitcoin.Psbt.fromHex(signedPsbtHex);
  }

  async signPsbts(psbtArray, signingIndexesArray) {
    this.windowCheck();
    const provider = this._getProvider();
    const psbtHexs = psbtArray.map(psbt => psbt.toHex());
    const options = signingIndexesArray.map(signingIndexes => ({
      toSignInputs: signingIndexes,
      autoFinalized: true
    }));
    const signedPsbtHexs = await provider.signPsbts(psbtHexs, options);
    return signedPsbtHexs.map(hex => bitcoin.Psbt.fromHex(hex));
  }

  //type - (optional) 'ecdsa' | 'bip322-simple', default is 'ecdsa'.
  async signMessage(message, type) {
    this.windowCheck();
    if (type && type === 'bip322') type = 'bip322-simple';
    const provider = this._getProvider();
    const signature = await provider.signMessage(message, type);
    return signature;
  }

  async setupAccountChangeListener(callback) {
    this.windowCheck();
    this._accountChangedListener = async (addressInfo) => {
      if (addressInfo === null) {
        this.handleDisconnect(callback);
        return;
      }
      this.paymentAddress = addressInfo.address;
      this.ordinalsAddress = addressInfo.address;
      this.paymentPublicKey = addressInfo.publicKey;
      this.ordinalsPublicKey = addressInfo.publicKey;
      callback(this.getAccountInfo());
    };
    const provider = this._getProvider();
    console.log(provider);
    provider.on('accountChanged', this._accountChangedListener);
  }

  async removeAccountChangeListener() {
    this.windowCheck();
    if (this._accountChangedListener) {
      const provider = this._getProvider();
      provider.removeListener('accountChanged', this._accountChangedListener);
      this._accountChangedListener = null;
    }
  }
}

class MagicEdenWallet extends Wallet {
  constructor() {
    super('magiceden', false, false); //UserRejectedRequestError: The user rejected the request through the wallet.
  }

  windowCheck() {
    if (!window.magicEden?.bitcoin) throw new Error('MagicEden not installed');
  }

  async connect(network) {
    this.windowCheck();
    if (network !== 'mainnet') throw new Error('Magiceden only supports mainnet');
    this.network = network;
    const payload = { purposes: ['payment', 'ordinals'] };
    const request = jsontokens.createUnsecuredToken(payload);
    const response = await window.magicEden.bitcoin.connect(request);
    const accounts = response.addresses;
    const payment = accounts.find(a => a.purpose === 'payment');
    const ordinals = accounts.find(a => a.purpose === 'ordinals');
    
    this.paymentAddress = payment.address;
    this.ordinalsAddress = ordinals.address;
    this.paymentPublicKey = payment.publicKey;
    this.ordinalsPublicKey = ordinals.publicKey;

    return this.getAccountInfo();
  }

  async getNetwork() {
    throw new Error('MagicEden does not support getNetwork');
  }

  async switchNetwork(network) {
    throw new Error('MagicEden does not support network switching');
  }

  async signPsbt(psbt, signingIndexes = null) {
    this.windowCheck();
    const inputsToSign = this.getInputsToSignGrouped(psbt, signingIndexes);
    const psbtBase64 = psbt.toBase64();
    const payload = {
      network: { type: 'Mainnet' },
      psbtBase64,
      broadcast: false,
      inputsToSign
    };
    const request = jsontokens.createUnsecuredToken(payload);
    const response = await window.magicEden.bitcoin.signTransaction(request);
    if (response.error) throw new Error(response.error.message);
    const signedPsbt = bitcoin.Psbt.fromBase64(response.psbtBase64);
    return signedPsbt.finalizeAllInputs();
  }

  async signMessage(message, type, address = this.ordinalsAddress) {
    if (type && (type !== 'bip322' && type !== 'ecdsa')) throw new Error('MagicEden only supports bip322 and ecdsa signing');
    if (type === 'bip322') type = 'BIP322';
    if (type === 'ecdsa') type = 'ECDSA';
    this.windowCheck();
    const payload = {
      network: { type: 'Mainnet' },
      address,
      message,
    }
    const request = jsontokens.createUnsecuredToken(payload);
    const signedMessage = await window.magicEden.bitcoin.signMessage(request);
    return signedMessage;
  }

  async setupAccountChangeListener(callback) {
    this.windowCheck();
    this._accountChangedListener = async (accounts) => {
      const payment = accounts.find(a => a.purpose === 'payment');
      const ordinals = accounts.find(a => a.purpose === 'ordinals');
      if (this.paymentAddress === payment.address && this.ordinalsAddress === ordinals.address) {
        return;
      }
      await this.connect(this.network);
      callback(this.getAccountInfo());
    };
    window.magicEden.bitcoin.on('accountsChanged', this._accountChangedListener);
  }

  async removeAccountChangeListener() {
    this.windowCheck();
    if (this._accountChangedListener) {
      window.magicEden.bitcoin.removeListener('accountsChanged', this._accountChangedListener);
      this._accountChangedListener = null;
    }
  }
}

class PhantomWallet extends Wallet {
  constructor() {
    super('phantom', false, false); //mandatory-script-verify-flag-failed (Invalid Schnorr signature)
  }

  windowCheck() {
    if (!window.phantom?.bitcoin) throw new Error('Phantom not installed');
  }

  async connect(network) {
    this.windowCheck();
    if (network !== 'mainnet') throw new Error('Phantom only supports mainnet');
    this.network = network;
    const accounts = await window.phantom.bitcoin.requestAccounts();
    const payment = accounts.find(a => a.purpose === 'payment');
    const ordinals = accounts.find(a => a.purpose === 'ordinals');
    
    this.paymentAddress = payment.address;
    this.ordinalsAddress = ordinals.address;
    this.paymentPublicKey = payment.publicKey;
    this.ordinalsPublicKey = ordinals.publicKey;

    return this.getAccountInfo();
  }

  async getNetwork() {
    this.windowCheck();
    return this.network;
  }

  async switchNetwork(network) {
    throw new Error('Phantom does not support network switching');
  }

  async signPsbt(psbt, signingIndexes = null) {
    this.windowCheck();
    const inputsToSign = this.getInputsToSignGrouped(psbt, signingIndexes);
    const psbtBytes = new Uint8Array(psbt.toBuffer());
    const signedPSBTBytes = await window.phantom.bitcoin.signPSBT(psbtBytes, {
      inputsToSign,
      broadcast: false
    });
    const signedPsbt = bitcoin.Psbt.fromBuffer(Buffer.from(signedPSBTBytes));
    return signedPsbt.finalizeAllInputs();
  }

  async signMessage(message, type, address = this.ordinalsAddress) {
    this.windowCheck();
    if (type && type !== 'bip322') throw new Error('Phantom only supports bip322 signing');
    let encoder = new TextEncoder();
    const response =  await window.phantom.bitcoin.signMessage(address, encoder.encode(message));
    let signatureBuffer = Buffer.from(response.signature);
    return signatureBuffer.toString("base64");
  }

  async setupAccountChangeListener(callback) {
    this.windowCheck();
    this._accountChangedListener = async (accounts) => {
      if (accounts.length === 0) {
        this.handleDisconnect(callback);
        return;
      }
      const payment = accounts.find(a => a.purpose === 'payment');
      const ordinals = accounts.find(a => a.purpose === 'ordinals');
      this.paymentAddress = payment.address;
      this.ordinalsAddress = ordinals.address;
      this.paymentPublicKey = payment.publicKey;
      this.ordinalsPublicKey = ordinals.publicKey;
      callback(this.getAccountInfo());
    };
    window.phantom.bitcoin.on('accountsChanged', this._accountChangedListener);
  }

  async removeAccountChangeListener() {
    this.windowCheck();
    if (this._accountChangedListener) {
      window.phantom.bitcoin.removeListener('accountsChanged', this._accountChangedListener);
      this._accountChangedListener = null;
    }
  }
}

class OylWallet extends Wallet {
  constructor() {
    super('oyl', false, false); //does not support signing custom addresses nor key path signing
  }

  windowCheck() {
    if (!window.oyl) throw new Error('Oyl not installed');
  }

  async connect(network) {
    this.windowCheck();
    const accounts = await window.oyl.getAddresses();
    if (!getNetworksFromAddress(accounts.nativeSegwit.address).includes(network)) {
      throw new Error('Connected to wrong network, please switch to ' + network);
    }    
    this.network = network;
    this.paymentAddress = accounts.nativeSegwit.address;
    this.ordinalsAddress = accounts.taproot.address;
    this.paymentPublicKey = accounts.nativeSegwit.publicKey;
    this.ordinalsPublicKey = accounts.taproot.publicKey;

    return this.getAccountInfo();
  }

  async getNetwork() {
    throw new Error('Oyl does not support getNetwork');
  }

  async switchNetwork(network) {
    throw new Error('Oyl does not support network switching');
  }

  async signPsbt(psbt) {
    this.windowCheck();
    const response = await window.oyl.signPsbt({
      psbt: psbt.toHex(),
      broadcast: false,
      finalize: true
    });
    return bitcoin.Psbt.fromHex(response.psbt);
  }

  async signPsbts(psbtArray, signingIndexesArray) {
    this.windowCheck();
    const response = await window.oyl.signPsbts(
      psbtArray.map(psbt => ({
        psbt: psbt.toHex(),
        broadcast: false,
        finalize: true
      }))
    );
    return response.map(signed => bitcoin.Psbt.fromHex(signed.psbt));
  }

  async signMessage(message, type, address = this.ordinalsAddress) {
    this.windowCheck();
    const response = await window.oyl.signMessage({
      address,
      message,
      protocol: type
    });
    return response.signature;
  }
}

export {
  UnisatWallet,
  XverseWallet,
  LeatherWallet,
  OkxWallet,
  MagicEdenWallet,
  PhantomWallet,
  OylWallet
};

export const connectWallet = async (walletType, network) => {
  let walletInstance;
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
  await walletInstance.connect(network);
  return walletInstance;
}

// Zustand does not store functions, so we need to rehydrate the wallet instance from the persisted state
// and create a new instance of the wallet class with the same properties
export const rehydrateWallet = (persistedWallet) => {
  let walletInstance;
  switch (persistedWallet.walletType) {
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

  for (const key in persistedWallet) {
    if (persistedWallet[key]!== null) {
      walletInstance[key] = persistedWallet[key];
    }
  }
  return walletInstance;
}

export const disconnectWallet = async (wallet) => {
  wallet.removeAccountChangeListener();
}

export const detectWallet = async (walletType) => {
  switch (walletType) {
    case 'unisat':
      return !!window?.unisat;
    case 'xverse':
      return !!window?.XverseProviders?.BitcoinProvider;
    case 'leather':
      return !!window?.LeatherProvider;
    case 'okx':
      return !!window?.okxwallet;
    case 'magiceden':
      return !!window?.magicEden?.bitcoin;
    case 'phantom':
      return !!window?.phantom?.bitcoin;
    case 'oyl':
      return !!window?.oyl;
    default:
      throw new Error('Wallet not supported');
  }
}

export const detectWallets = async () => {
  const walletTypes = [
    'unisat',
    'xverse',
    'leather',
    'okx',
    'magiceden',
    'phantom',
    'oyl'
  ];
  const detectedWallets = [];
  for (const walletType of walletTypes) {
    try {
      const isDetected = await detectWallet(walletType);
      if (isDetected) {
        detectedWallets.push(walletType);
      }
    } catch (error) {
      console.error(`Error detecting wallet ${walletType}:`, error);
    }
  }
  return detectedWallets;
}
