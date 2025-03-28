//overall philosophy: we want to take as little information from the wallets as possible
//and do the rest ourselves. If we expect too much from the wallets, we will have compatibility
//issues with wallets that don't support the features we want. We also want to avoid
//having to write a lot of code for each wallet, so we want to keep the code as simple as possible.

import * as bitcoin from 'bitcoinjs-lib'
import * as jsontokens from 'jsontokens'
import { NETWORKS, getNetworkFromAddress } from './networks'

export const unisat = {
  walletType: 'unisat',
  network: null,
  paymentAddress: null,
  ordinalsAddress: null,
  paymentPublicKey: null,
  ordinalsPublicKey: null,
  _accountChangedListener: null,

  windowCheck() {
    if (!window.unisat) throw new Error('Unisat not installed');
  },
  async connect(network) {
    this.windowCheck();
    const chain = await window.unisat.getChain();
    if (chain.enum === NETWORKS[network].unisat) {
      this.network = network;
    } else {
      try {
        await window.unisat.switchChain(NETWORKS[network].unisat);
        this.network = network;
      } catch (error) {
        throw new Error('Could not switch to the specified network');
      }
    }

    const accounts = await window.unisat.requestAccounts();
    const publicKey = await window.unisat.getPublicKey();
    this.paymentAddress = accounts[0];
    this.ordinalsAddress = accounts[0];
    this.paymentPublicKey = publicKey;
    this.ordinalsPublicKey = publicKey

    return {
      paymentAddress: accounts[0],
      ordinalsAddress: accounts[0],
      paymentPublicKey: publicKey,
      ordinalsPublicKey: publicKey,
    };
  },
  async getNetwork() {
    this.windowCheck();
    let chain = await window.unisat.getChain();
    return chain.enum;
  },
  async switchNetwork(network) {
    this.windowCheck();
    await window.unisat.switchChain(network);
  },
  async signPsbt(psbt) {
    this.windowCheck();
    let psbtHex = psbt.toHex();
    let signedPsbtHex = await window.unisat.signPsbt(psbtHex);
    let signedPsbt = bitcoin.Psbt.fromHex(signedPsbtHex);
    return signedPsbt;
  },
  async signPsbts(psbtArray, signingIndexesArray) {
    this.windowCheck();
    let psbtHexs = psbtArray.map(psbt => psbt.toHex());
    let unisatOptions = signingIndexesArray.map(signingIndexes => {
      return {
        toSignInputs: signingIndexes,
        autoFinalized: true
      }
    });
    let signedPsbtHexs = await window.unisat.signPsbts(psbtHexs, unisatOptions);
    let signedPsbts = signedPsbtHexs.map(hex => bitcoin.Psbt.fromHex(hex));
    return signedPsbts;
  },
  async setupAccountChangeListener(callback) {
    this.windowCheck();
    this._accountChangedListener = async (accounts) => {
      console.log('Accounts changed:', accounts);
      // handle dc
      if (accounts.length === 0) {
        console.log("Wallet disconnected or empty address received");
    
        // Clear the wallet addresses
        this.paymentAddress = null;
        this.ordinalsAddress = null;
        this.paymentPublicKey = null;
        this.ordinalsPublicKey = null;
        
        // Notify the app about disconnection
        callback({
          paymentAddress: null,
          ordinalsAddress: null,
          paymentPublicKey: null,
          ordinalsPublicKey: null,
          disconnected: true
        });
        this.removeAccountChangeListener();
        return;
      };

      // handle switch
      const publicKey = await window.unisat.getPublicKey();
      this.paymentAddress = accounts[0];
      this.ordinalsAddress = accounts[0];
      this.paymentPublicKey = publicKey;
      this.ordinalsPublicKey = publicKey;
      callback({
        paymentAddress: accounts[0],
        ordinalsAddress: accounts[0],
        paymentPublicKey: publicKey,
        ordinalsPublicKey: publicKey,
      });
    };
    window.unisat.on('accountsChanged', this._accountChangedListener);
  },
  removeAccountChangeListener() {
    this.windowCheck();
    window.unisat.removeListener('accountsChanged', this._accountChangedListener);
  }
}

export const xverse = {
  walletType: 'xverse',
  network: null,
  paymentAddress: null,
  ordinalsAddress: null,
  paymentPublicKey: null,
  ordinalsPublicKey: null,

  windowCheck() {
    if (!window.XverseProviders?.BitcoinProvider) throw new Error('Xverse not installed');
  },
  async connect(network) {
    this.windowCheck();
    const response = await window.XverseProviders.BitcoinProvider.request("wallet_connect", {
      addresses: ['payment', 'ordinals'],
      message: 'Connect to Vermilion dot place plz'
    });
    const accounts = response.result.addresses;
    const paymentAddress = accounts.find(address => address.purpose === 'payment');
    const ordinalsAddress = accounts.find(address => address.purpose === 'ordinals');
    await this.getNetwork();
    if (getNetworkFromAddress(paymentAddress.address) === network) {
      this.network = network;
    } else {
      throw new Error('Connected to wrong network');
    }
    this.paymentAddress = paymentAddress.address;
    this.ordinalsAddress = ordinalsAddress.address;
    this.paymentPublicKey = paymentAddress.publicKey;
    this.ordinalsPublicKey = ordinalsAddress.publicKey;

    return {
      paymentAddress: paymentAddress.address,
      ordinalsAddress: ordinalsAddress.address,
      paymentPublicKey: paymentAddress.publicKey,
      ordinalsPublicKey: ordinalsAddress.publicKey,
    };
  },
  async getNetwork() {
    this.windowCheck();
    const res = await window.XverseProviders.BitcoinProvider.request('wallet_getNetwork', null);
    if (res.status === 'error') {
      console.error(res.error);
      return;
    }
    let network = res.result.bitcoin.name;
  },
  async switchNetwork(network) {
    throw new Error('Xverse does not support network switching');
  },
  async signPsbt(psbt) {
    this.windowCheck();
    let inputsToSign = { [this.ordinalsAddress]: [], [this.paymentAddress]: [] };

    psbt.data.inputs.forEach((input, inputIndex) => {
      let inputAddress;
      if (input.nonWitnessUtxo) {
        const transaction = bitcoin.Transaction.fromBuffer(input.nonWitnessUtxo);
        const output = transaction.outs[input.index];
        inputAddress = bitcoin.address.fromOutputScript(
          output.script,
          NETWORKS[this.network].bitcoinjs
        );
      } else if (input.witnessUtxo) {
        inputAddress = bitcoin.address.fromOutputScript(
          input.witnessUtxo.script,
          NETWORKS[this.network].bitcoinjs
        );
      } else {
        throw new Error('Malformed PSBT: input is missing nonWitnessUtxo or witnessUtxo');
      }
      
      if (inputAddress === this.paymentAddress || inputAddress === this.ordinalsAddress) {
        inputsToSign[inputAddress].push(inputIndex);
      }
    });

    let psbtBase64= psbt.toBase64();
    let response = await window.XverseProviders.BitcoinProvider.request("signPsbt", {
      psbt: psbtBase64,
      signInputs: inputsToSign,
      broadcast: false
    });
    if (response.error) throw new Error(response.error.message);
    let signedPsbt = bitcoin.Psbt.fromBase64(response.result.psbt);
    let finalizedPsbt = signedPsbt.finalizeAllInputs();
    return finalizedPsbt;
  },
  async signPsbts(psbtArray, signingIndexesArray) {
    this.windowCheck();
    let base64Psbts = psbtArray.map(psbt => psbt.toBase64());
    let xverseobject = [];
    for (let i = 0; i < psbtArray.length; i++) {
      let inputsToSign = { [this.ordinalsAddress]: [], [this.paymentAddress]: [] };
      signingIndexesArray[i].forEach(signingIndex => {
        if (signingIndex.address === this.paymentAddress) {
          inputsToSign[this.paymentAddress].push(signingIndex.index);
        }
        if (signingIndex.address === this.ordinalsAddress) {
          inputsToSign[this.ordinalsAddress].push(signingIndex.index);
        }
      });
      let entry = {
        psbtBase64: base64Psbts[i],
        inputsToSign,
        broadcast: false
      }
      xverseobject.push(entry);
    }
    let response = await window.XverseProviders.BitcoinProvider.request("signMultipleTransactions", {
      payload: {
        network: {
          type: NETWORKS[this.network].xverse
        },
        message: "Sign these transactions plz",
        psbts: xverseobject
      }
    });
    console.log(response);
    if (response.error) {
      if (response.error.message.includes('is not supported')) {
        console.log('Xverse does not support signMultipleTransactions, trying one at a time');
        let signedPsbts = [];
        for (const [index, psbt] of psbtArray.entries()) {
          let signedPsbt = await this.signPsbt(psbt);
          signedPsbts[index] = signedPsbt;
        }
        return signedPsbts;
      } else {
        throw new Error(response.error);
      }
    }
  },
  async setupAccountChangeListener(callback) {
    console.log('Account change listener not supported for Xverse');     
  },
  async removeAccountChangeListener() {
    //No listener to remove
  }
}

export const leather = {
  walletType: 'leather',
  network: null,
  paymentAddress: null,
  ordinalsAddress: null,
  paymentPublicKey: null,
  ordinalsPublicKey: null,

  windowCheck() {
    if (!window.LeatherProvider) throw new Error('Leather not installed');
  },
  async connect(network) {
    this.windowCheck();
    const response = await window.LeatherProvider.request('getAddresses');
    const paymentAddress = response.result.addresses.find(address => address.type === 'p2wpkh');
    const ordinalsAddress = response.result.addresses.find(address => address.type === 'p2tr');
    if (getNetworkFromAddress(paymentAddress.address) === network) {
      this.network = network;
    } else {
      throw new Error('Connected to wrong network');
    }
    this.paymentAddress = paymentAddress.address;
    this.ordinalsAddress = ordinalsAddress.address;
    this.paymentPublicKey = paymentAddress.publicKey;
    this.ordinalsPublicKey = ordinalsAddress.publicKey;

    return {
      paymentAddress: paymentAddress.address,
      ordinalsAddress: ordinalsAddress.address,
      paymentPublicKey: paymentAddress.publicKey,
      ordinalsPublicKey: ordinalsAddress.publicKey,
    };
  },
  async getNetwork() {
    throw new Error('Leather does not support getNetwork');
  },
  async switchNetwork(network) {
    throw new Error('Leather does not support network switching');
  },
  async signPsbt(psbt) {
    this.windowCheck();
    let response = await window.LeatherProvider.request('signPsbt', { hex: psbt.toHex() });
    if (response.error) throw new Error(response.error.message);
    console.log(response);
    let signedPsbt = bitcoin.Psbt.fromHex(response.result.hex);
    let finalizedPsbt = signedPsbt.finalizeAllInputs();
    return finalizedPsbt;
  },
  async setupAccountChangeListener(callback) {
    console.log('Account change listener not supported for Leather');     
  },
  async removeAccountChangeListener() {
    //No listener to remove
  }
}

export const okx = {
  walletType: 'okx',
  network: null,
  paymentAddress: null,
  ordinalsAddress: null,
  paymentPublicKey: null,
  ordinalsPublicKey: null,
  // Store the listener functions as properties
  _accountChangedListener: null,

  windowCheck() {
    if (!window.okxwallet) throw new Error('OKX not installed');
  },
  async connect(network) {
    this.windowCheck();
    let response;
    if (network === 'mainnet') {
      response = await window.okxwallet.bitcoin.connect();
    } else if (network === 'testnet') {
      response = await window.okxwallet.bitcoinTestnet.connect();
    }
    this.network = network;
    this.paymentAddress = response.address;
    this.ordinalsAddress = response.address;
    this.paymentPublicKey = response.publicKey;
    this.ordinalsPublicKey = response.publicKey;

    return {
      paymentAddress: response.address,
      ordinalsAddress: response.address,
      paymentPublicKey: response.publicKey,
      ordinalsPublicKey: response.publicKey,
    };
  },
  async getNetwork() {
    this.windowCheck();
    return this.network;
  },
  async switchNetwork(network) {
    this.windowCheck();
    await this.connect(network);
  },
  async signPsbt(psbt) {
    this.windowCheck();
    if (this.network === 'mainnet') {
      let signedPsbtHex = await window.okxwallet.bitcoin.signPsbt(psbt.toHex());
      let signedPsbt = bitcoin.Psbt.fromHex(signedPsbtHex);
      return signedPsbt;
    } else if (this.network === 'testnet') {
      let signedPsbtHex = await window.okxwallet.bitcoinTestnet.signPsbt(psbt.toHex());
      let signedPsbt = bitcoin.Psbt.fromHex(signedPsbtHex);
      return signedPsbt;
    }
  },
  async setupAccountChangeListener(callback) {
    this.windowCheck();

    this._accountChangedListener = async (addressInfo) => {
      if (addressInfo === null) {
        console.log("Wallet disconnected or empty address received");
    
        // Clear the wallet addresses
        this.paymentAddress = null;
        this.ordinalsAddress = null;
        this.paymentPublicKey = null;
        this.ordinalsPublicKey = null;
        
        // Notify the app about disconnection
        callback({
          paymentAddress: null,
          ordinalsAddress: null,
          paymentPublicKey: null,
          ordinalsPublicKey: null,
          disconnected: true
        });
        this.removeAccountChangeListener();
        return;
      };
      // update addresses if exist
      this.paymentAddress = addressInfo.address;
      this.ordinalsAddress = addressInfo.address;
      this.paymentPublicKey = addressInfo.publicKey;
      this.ordinalsPublicKey = addressInfo.publicKey;
      callback({
        paymentAddress: addressInfo.address,
        ordinalsAddress: addressInfo.address,
        paymentPublicKey: addressInfo.publicKey,
        ordinalsPublicKey: addressInfo.publicKey,
      });
    };

    // Use the stored function when adding listeners
    const provider = this.network === 'mainnet' ? 
    window.okxwallet.bitcoin : 
    window.okxwallet.bitcoinTestnet;      
    provider.on('accountChanged', this._accountChangedListener);
  },
  removeAccountChangeListener() {
    this.windowCheck();
    
    if (!this._accountChangedListener) {
      return; // No listeners have been set up
    }
    
    const provider = this.network === 'mainnet' ? 
      window.okxwallet.bitcoin : 
      window.okxwallet.bitcoinTestnet;
    
    // Use the same function references when removing listeners
    provider.removeListener('accountChanged', this._accountChangedListener);
    
    // Clean up the references
    this._accountChangedListener = null;
  }
}

export const magiceden = {
  walletType: 'magiceden',
  network: null,
  paymentAddress: null,
  ordinalsAddress: null,
  paymentPublicKey: null,
  ordinalsPublicKey: null,
  _accountChangedListener: null,

  windowCheck() {
    if (!window.magicEden.bitcoin) throw new Error('MagicEden not installed');
  },
  async connect(network) {
    this.windowCheck();
    //if (network !== 'mainnet') throw new Error('MagicEden only supports mainnet');
    this.network = network;
    let payload = {
      purposes: ['payment', 'ordinals']
    };
    let request = jsontokens.createUnsecuredToken(payload);
    let response = await window.magicEden.bitcoin.connect(request);
    const accounts = response.addresses;
    const paymentAddress = accounts.find(address => address.purpose === 'payment');
    const ordinalsAddress = accounts.find(address => address.purpose === 'ordinals');
    this.paymentAddress = paymentAddress.address;
    this.ordinalsAddress = ordinalsAddress.address;
    this.paymentPublicKey = paymentAddress.publicKey;
    this.ordinalsPublicKey = ordinalsAddress.publicKey;

    return {
      paymentAddress: paymentAddress.address,
      ordinalsAddress: ordinalsAddress.address,
      paymentPublicKey: paymentAddress.publicKey,
      ordinalsPublicKey: ordinalsAddress.publicKey,
    };
  },
  async getNetwork() {
    throw new Error('MagicEden does not support getNetwork');
  },
  async switchNetwork(network) {
    throw new Error('MagicEden does not support network switching');
  },
  async signPsbt(psbt) {
    this.windowCheck();
    let inputsToSign = [
      {
        address: this.paymentAddress,
        signingIndexes: []
      },
      {
        address: this.ordinalsAddress,
        signingIndexes: []
      }
    ];

    psbt.data.inputs.forEach((input, inputIndex) => {
      let inputAddress;
      if (input.nonWitnessUtxo) {
        const transaction = bitcoin.Transaction.fromBuffer(input.nonWitnessUtxo);
        const output = transaction.outs[input.index];
        inputAddress = bitcoin.address.fromOutputScript(
          output.script,
          this.network
        );
      } else if (input.witnessUtxo) {
        inputAddress = bitcoin.address.fromOutputScript(
          input.witnessUtxo.script,
          this.network
        );
      } else {
        throw new Error('Malformed PSBT: input is missing nonWitnessUtxo or witnessUtxo');
      }
      
      if (inputAddress === this.paymentAddress || inputAddress === this.ordinalsAddress) {
        inputsToSign.find(input => input.address === inputAddress).signingIndexes.push(inputIndex);
      }
    });

    let psbtBase64= psbt.toBase64();
    let payload = {
      network: {
        type: 'Mainnet',
      },
      psbtBase64: psbtBase64,
      broadcast: false,
      inputsToSign: inputsToSign
    };
    let request = jsontokens.createUnsecuredToken(payload);
    let response = await window.magicEden.bitcoin.signPsbt(request);
    if (response.error) throw new Error(response.error.message);
    let signedPsbt = bitcoin.Psbt.fromBase64(response.result.psbt);
    let finalizedPsbt = signedPsbt.finalizeAllInputs();
    return finalizedPsbt;
  },
  async setupAccountChangeListener(callback) {
    this.windowCheck();
    this._accountChangedListener = async (accounts) => {
      // handle switch
      const paymentAddress = accounts.find(address => address.purpose === 'payment');
      const ordinalsAddress = accounts.find(address => address.purpose === 'ordinals');
      if (this.paymentAddress === paymentAddress.address && this.ordinalsAddress === ordinalsAddress.address) {
        return; //address hasn't changed
      };
      this.paymentAddress = paymentAddress.address;
      this.ordinalsAddress = ordinalsAddress.address;
      this.paymentPublicKey = null;
      this.ordinalsPublicKey = null;
      await this.connect(this.network);
      callback({
        paymentAddress: this.paymentAddress,
        ordinalsAddress: this.ordinalsAddress,
        paymentPublicKey: this.paymentPublicKey,
        ordinalsPublicKey: this.ordinalsPublicKey,
      });
    };
    window.magicEden.bitcoin.on('accountsChanged', this._accountChangedListener);
  },
  removeAccountChangeListener() {
    this.windowCheck();
    window.magicEden.bitcoin.removeListener('accountsChanged', this._accountChangedListener);
  }

}

export const phantom = {
  walletType: 'phantom',
  network: null,
  paymentAddress: null,
  ordinalsAddress: null,
  paymentPublicKey: null,
  ordinalsPublicKey: null,
  _accountChangedListener: null,

  windowCheck() {
    if (!window.phantom?.bitcoin) throw new Error('Phantom not installed');
  },
  async connect(network) {
    this.windowCheck();
    if (network !== 'mainnet') throw new Error('Phantom only supports mainnet');
    this.network = network;
    let accounts = await window.phantom.bitcoin.requestAccounts();
    let paymentAddress = accounts.find(address => address.purpose === 'payment');
    let ordinalsAddress = accounts.find(address => address.purpose === 'ordinals');
    this.paymentAddress = paymentAddress.address;
    this.ordinalsAddress = ordinalsAddress.address;
    this.paymentPublicKey = paymentAddress.publicKey;
    this.ordinalsPublicKey = ordinalsAddress.publicKey;

    return {
      paymentAddress: paymentAddress.address,
      ordinalsAddress: ordinalsAddress.address,
      paymentPublicKey: paymentAddress.publicKey,
      ordinalsPublicKey: ordinalsAddress.publicKey,
    };
  },
  async getNetwork() {
    this.windowCheck();
    return this.network;
  },
  async switchNetwork(network) {
    throw new Error('Phantom does not support network switching');
  },
  async signPsbt(psbt) {
    this.windowCheck();
    let inputsToSign = [
      {
        address: this.paymentAddress,
        signingIndexes: []
      },
      {
        address: this.ordinalsAddress,
        signingIndexes: []
      }
    ];

    psbt.data.inputs.forEach((input, inputIndex) => {
      let inputAddress;
      if (input.nonWitnessUtxo) {
        const transaction = bitcoin.Transaction.fromBuffer(input.nonWitnessUtxo);
        const output = transaction.outs[input.index];
        inputAddress = bitcoin.address.fromOutputScript(
          output.script,
          this.network
        );
      } else if (input.witnessUtxo) {
        inputAddress = bitcoin.address.fromOutputScript(
          input.witnessUtxo.script,
          NETWORKS[this.network].bitcoinjs
        );
      } else {
        throw new Error('Malformed PSBT: input is missing nonWitnessUtxo or witnessUtxo');
      }
      
      if (inputAddress === this.paymentAddress || inputAddress === this.ordinalsAddress) {
        inputsToSign.find(input => input.address === inputAddress).signingIndexes.push(inputIndex);
      }
    });
    let psbtBytes = new Uint8Array(psbt.toBuffer());
    let signedPSBTBytes = await window.phantom.bitcoin.signPSBT(psbtBytes, {
      inputsToSign: inputsToSign,
      broadcast: false
    });
    let signedPsbt = bitcoin.Psbt.fromBuffer(Buffer.from(signedPSBTBytes));
    let finalizedPsbt = signedPsbt.finalizeAllInputs();
    return finalizedPsbt;
  },
  async setupAccountChangeListener(callback) {
    this.windowCheck();
    this._accountChangedListener = async (accounts) => {
      console.log('Accounts changed:', accounts);
      // handle dc
      if (accounts.length === 0) {
        console.log("Wallet disconnected or empty address received");
    
        // Clear the wallet addresses
        this.paymentAddress = null;
        this.ordinalsAddress = null;
        this.paymentPublicKey = null;
        this.ordinalsPublicKey = null;
        
        // Notify the app about disconnection
        callback({
          paymentAddress: null,
          ordinalsAddress: null,
          paymentPublicKey: null,
          ordinalsPublicKey: null,
          disconnected: true
        });
        this.removeAccountChangeListener();
        return;
      };

      // handle switch
      let paymentAddress = accounts.find(address => address.purpose === 'payment');
      let ordinalsAddress = accounts.find(address => address.purpose === 'ordinals');
      this.paymentAddress = paymentAddress.address;
      this.ordinalsAddress = ordinalsAddress.address;
      this.paymentPublicKey = paymentAddress.publicKey;
      this.ordinalsPublicKey = ordinalsAddress.publicKey;
      callback({
        paymentAddress: paymentAddress.address,
        ordinalsAddress: ordinalsAddress.address,
        paymentPublicKey: paymentAddress.publicKey,
        ordinalsPublicKey: ordinalsAddress.publicKey,
      });
    };
    window.phantom.bitcoin.on('accountsChanged', this._accountChangedListener);
  },
  removeAccountChangeListener() {
    this.windowCheck();
    window.phantom.bitcoin.removeListener('accountsChanged', this._accountChangedListener);
  }
}

export const oyl = {
  walletType: 'oyl',
  network: null,
  paymentAddress: null,
  ordinalsAddress: null,
  paymentPublicKey: null,
  ordinalsPublicKey: null,

  windowCheck() {
    if (!window.oyl) throw new Error('Oyl not installed');
  },
  async connect(network) {
    this.windowCheck();
    if (network !== 'mainnet') throw new Error('Oyl only supports mainnet');    
    this.network = network;
    let accounts = await window.oyl.getAddresses();
    this.paymentAddress = accounts.nativeSegwit.address;
    this.ordinalsAddress = accounts.taproot.address;
    this.paymentPublicKey = accounts.nativeSegwit.publicKey;
    this.ordinalsPublicKey = accounts.taproot.publicKey;

    return {
      paymentAddress: accounts.nativeSegwit.address,
      ordinalsAddress: accounts.taproot.address,
      paymentPublicKey: accounts.nativeSegwit.publicKey,
      ordinalsPublicKey: accounts.taproot.publicKey,
    };
  },
  async getNetwork() {
    throw new Error('Oyl does not support getNetwork');
  },
  async switchNetwork(network) {
    throw new Error('Oyl does not support network switching');
  },
  async signPsbt(psbt) {
    this.windowCheck();
    let response = await window.oyl.signPsbt({
      psbt: psbt.toHex(),
      broadcast: false,
      finalize: true
    });
    let signedPsbt = bitcoin.Psbt.fromHex(response.psbt);
    return signedPsbt;
  },
  async setupAccountChangeListener(callback) {
    console.log('Account change listener not supported for Oyl');     
  },
  async removeAccountChangeListener() {
    //No listener to remove
  }
}

export const connectWallet = async (walletType, network) => {
  switch (walletType) {
    case 'unisat':
      return await unisat.connect(network);
    case 'xverse':
      return await xverse.connect(network);
    case 'leather':
      return await leather.connect(network);
    case 'okx':
      return await okx.connect(network);
    case 'magiceden':
      return await magiceden.connect(network);
    case 'phantom':
      return await phantom.connect(network);
    case 'oyl':
      return await oyl.connect(network);
    default:
      throw new Error('Unsupported wallet type');
  }
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
  const wallets = [unisat, xverse, leather, okx, magiceden, phantom, oyl];
  const detectedWallets = [];
  for (const wallet of wallets) {
    try {
      const isDetected = await detectWallet(wallet.walletType);
      if (isDetected) {
        detectedWallets.push(wallet.walletType);
      }
    } catch (error) {
      console.error(`Error detecting wallet ${wallet.walletType}:`, error);
    }
  }
  return detectedWallets;
}