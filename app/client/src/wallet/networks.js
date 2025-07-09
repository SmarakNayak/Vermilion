import * as bitcoin from 'bitcoinjs-lib'

export const NETWORKS = {
  'testnet': {
    bitcoinjs: bitcoin.networks.testnet,
    tapscript: 'testnet',
    mempool: 'testnet4/',
    unisat: 'BITCOIN_TESTNET4',
    xverse: 'Testnet4',
    leather: 'testnet'
  },
  'mainnet': {
    bitcoinjs: bitcoin.networks.bitcoin,
    tapscript: 'mainnet',
    mempool: '',
    unisat: 'BITCOIN_MAINNET',
    xverse: 'Mainnet',
    leather: 'mainnet'
  },
  'signet': {
    bitcoinjs: bitcoin.networks.testnet,
    tapscript: 'signet',
    mempool: 'signet/',
    unisat: 'BITCOIN_SIGNET',
    xverse: 'Signet',
    leather: 'signet'
  },
}

export function getNetworksFromAddress(address) {
  try {
    // Try to decode as testnet/signet
    bitcoin.address.toOutputScript(address, bitcoin.networks.testnet);
    return ['testnet', 'signet'];
  } catch (testnetError) {
    try {
      // Try to decode as mainnet
      bitcoin.address.toOutputScript(address, bitcoin.networks.bitcoin);
      return ['mainnet'];
    } catch (mainnetError) {
      throw new Error('Invalid Bitcoin address');
    }
  }
}