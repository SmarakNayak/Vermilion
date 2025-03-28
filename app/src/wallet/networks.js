import * as bitcoin from 'bitcoinjs-lib'

export const NETWORKS = {
  'testnet': {
    bitcoinjs: bitcoin.networks.testnet,
    tapscript: 'testnet',
    mempool: 'testnet4/',
    unisat: 'BITCOIN_TESTNET4',
    xverse: 'testnet',
    leather: 'testnet'
  },
  'mainnet': {
    bitcoinjs: bitcoin.networks.bitcoin,
    tapscript: 'mainnet',
    mempool: '',
    unisat: 'BITCOIN_MAINNET',
    xverse: 'Mainnet',
    leather: 'mainnet'
  }
}

export function getNetworkFromAddress(address) {
  try {
    // Try to decode as testnet
    bitcoin.address.toOutputScript(address, bitcoin.networks.testnet);
    return 'testnet';
  } catch (testnetError) {
    try {
      // Try to decode as mainnet
      bitcoin.address.toOutputScript(address, bitcoin.networks.bitcoin);
      return 'mainnet';
    } catch (mainnetError) {
      throw new Error('Invalid Bitcoin address');
    }
  }
}