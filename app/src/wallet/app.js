import { useState, useRef, useEffect } from 'react'
import './App.css'

import * as bitcoin from 'bitcoinjs-lib'
import { toXOnly } from 'bitcoinjs-lib/src/psbt/bip371'
import { ECPairFactory } from 'ecpair'
import * as tinyecc from 'tiny-secp256k1'

import { UnisatWallet, XverseWallet, LeatherWallet, OkxWallet, MagicEdenWallet, PhantomWallet, OylWallet } from './wallets'
import { NETWORKS } from './networks'

bitcoin.initEccLib(tinyecc);
const ECPair = ECPairFactory(tinyecc);

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

//TODO: Add mobile wallet support
//TODO: Add hardware wallet support
