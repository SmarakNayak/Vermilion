import React, { use } from 'react';
import { useEffect, useState } from 'react';
import styled from 'styled-components';
import theme from '../../styles/theme';
import { CrossIcon, SweepIcon, CheckIcon } from '../common/Icon'; // Added SuccessIcon, LinkIcon (or similar for TX link)
import Spinner from '../Spinner'; // Assuming you have a Spinner component
import { formatAddress, capitalizeFirstLetter, formatSatsStringFull, formatSatsToDollars } from '../../utils';
import { submitSweep, getCoinBaseBtcPrice, getRecommendedFees } from '../../wallet/mempoolApi';
import useStore from '../../store/zustand';
import { NETWORKS } from '../../wallet/networks';
import { getRevealSweepTransaction } from '../../wallet/inscriptionBuilder';
import * as bitcoin from 'bitcoinjs-lib';

const SweepModal = ({
  isOpen,
  onClose,
  boostHistoryRow
}) => {
  useEffect(() => {
    // Prevent background scrolling when the modal is open
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    // Cleanup function to re-enable scrolling when the component unmounts or isOpen changes
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  const wallet = useStore((state) => state.wallet);
  const setWallet = useStore((state) => state.setWallet);
  const authToken = useStore((state) => state.authToken);
  const setAuthToken = useStore((state) => state.setAuthToken);
  const [error, setError] = useState(null);
  const [isSweeping, setIsSweeping] = useState(false);
  const [loadingSweepData, setLoadingSweepData] = useState(true);
  const [success, setSuccess] = useState(false);
  const [btcusd, setBtcusd] = useState(100000);
  const [sweepData, setSweepData] = useState(null);
  const [confirmedSweepTxId, setConfirmedSweepTxId] = useState('');

  useEffect(() => {
    if (isOpen) {
      getCoinBaseBtcPrice()
        .then((price) => {
          setBtcusd(price);
        })
        .catch((error) => {
          console.error('Error fetching BTC price:', error);
          setBtcusd(100000);
        }
      );
    }
  }, [isOpen]);

  const getMempoolTxUrl = (txid) => {
    if (!wallet) return `https://memepool.space/tx/${txid}`;
    let link = `https://memepool.space/${NETWORKS[wallet.network].mempool}tx/${txid}`;
    return link;
  };

  const getMempoolAddressUrl = (txid) => {
    if (!wallet) return `https://memepool.space/address/${txid}`;
    let link = `https://memepool.space/${NETWORKS[wallet.network].mempool}address/${txid}`;
    return link;
  };

  const populateSweepData = async () => {
    setLoadingSweepData(true);
    let feeRate = await getRecommendedFees(wallet.network);
    if (['ephemeral_with_wallet_key_path', 'wallet_one_sign', 'wallet_two_sign'].includes(boostHistoryRow.inscription_method)) {
      let walletTaproot = wallet.getTaproot(wallet, wallet.network);
      let revealKeyPair = {
        publicKey: walletTaproot.internalPubkey,
      }
      const revealTaproot = {
        output: Buffer.from(boostHistoryRow.reveal_address_script, 'hex'),
        hash: Buffer.from(boostHistoryRow.reveal_tapmerkleroot, 'hex'),
      };
      let unsignedSweep;
      try {
        unsignedSweep = getRevealSweepTransaction(wallet.paymentAddress, revealTaproot, revealKeyPair, boostHistoryRow.commit_tx_id, parseInt(boostHistoryRow.reveal_input_value), feeRate, wallet.network, false);
      } catch (error) {
        if (error.message === "Fee rate too high") {
          unsignedSweep = getRevealSweepTransaction(wallet.paymentAddress, revealTaproot, revealKeyPair, boostHistoryRow.commit_tx_id, parseInt(boostHistoryRow.reveal_input_value), boostHistoryRow.fee_rate, wallet.network, false);
        } else {
          console.error('Error creating sweep transaction:', error);
          throw new Error('Error creating sweep transaction:', error);
        }
      }
      // broadcast the sweep transaction and log it
      console.log('Sweep transaction:', unsignedSweep.__CACHE); // Sweep transaction details - visible in console
      const sweepInfo = {
        sweep_type: boostHistoryRow.inscription_method,
        boost_id: boostHistoryRow.boost_id,
        unsigned_sweep: unsignedSweep,
        fee_rate: feeRate,
        reveal_address: bitcoin.address.fromOutputScript(revealTaproot.output, NETWORKS[wallet.network].bitcoinjs),
        reveal_amount: parseInt(boostHistoryRow.reveal_input_value),
        reveal_tx_id: boostHistoryRow.reveal_tx_id,
        reveal_tx_status: boostHistoryRow.reveal_tx_status,
        sweep_fees: parseInt(boostHistoryRow.reveal_input_value) - unsignedSweep.txOutputs[0].value,
      }
      setSweepData(sweepInfo);
    } else if (boostHistoryRow.inscription_method === 'ephemeral') {
      let storedSweepResponse = await fetch('/bun/social/get_stored_sweeps/' + boostHistoryRow.boost_id, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`,
        }
      });
      const storedSweepData = await storedSweepResponse.json();
      // pick the sweep based on how close the fee rate is to the current fee rate
      let closestSweep = storedSweepData.reduce((prev, curr) => {
        return (Math.abs(curr.fee_rate - feeRate) < Math.abs(prev.fee_rate - feeRate) ? curr : prev);
      });
      let sweepTx = bitcoin.Transaction.fromHex(closestSweep.sweep_tx_hex);
      console.log('Sweep transaction:', NETWORKS[wallet.network].bitcoinjs); // Sweep transaction details - visible in console
      let sweepInfo = {
        sweep_type: boostHistoryRow.inscription_method,
        boost_id: closestSweep.boost_id,
        sweep_tx_hex: closestSweep.sweep_tx_hex,
        fee_rate: feeRate,
        reveal_address: bitcoin.address.fromOutputScript(Buffer.from(boostHistoryRow.reveal_address_script, 'hex'), NETWORKS[wallet.network].bitcoinjs),
        reveal_amount: parseInt(boostHistoryRow.reveal_input_value),
        reveal_tx_id: boostHistoryRow.reveal_tx_id,
        reveal_tx_status: boostHistoryRow.reveal_tx_status,
        sweep_fees: parseInt(boostHistoryRow.reveal_input_value) - sweepTx.outs[0].value,
      }
      setSweepData(sweepInfo);
    }
    setLoadingSweepData(false);
  }

  useEffect(() => {
    if (isOpen) {
      if (boostHistoryRow) {
        populateSweepData(boostHistoryRow);
      } else {
        setError('No boost history row provided.');
      }
    }
  }, [isOpen, boostHistoryRow]);

  const handleConfirmSweep = async () => {
    setIsSweeping(true);
    setError(null);
    setSuccess(false); 
    setConfirmedSweepTxId(''); 
    if (!sweepData) {
      setError('No sweep data available.');
      setIsSweeping(false);
      return;
    }
    try {
      let sweepRequestBody;
      if (['ephemeral_with_wallet_key_path', 'wallet_one_sign', 'wallet_two_sign'].includes(sweepData.sweep_type)) {
        if (!(['okx', 'xverse'].includes(wallet.walletType))) {
          if (wallet.walletType === 'unisat' || wallet.walletType === 'phantom') {
            throw new Error(`${wallet.walletType} does not support key-path signing. Please import your wallet into Okx to sweep.`);
          } else {
            throw new Error(`${wallet.walletType} does not support key-path signing. Please import your wallet into Xverse to sweep.`);
          }
        }
        let unsignedSweep = sweepData.unsigned_sweep;
        const signedSweep = await wallet.signPsbt(unsignedSweep, [{ index: 0, address: wallet.ordinalsAddress}]);
        const sweepTx = signedSweep.extractTransaction();
        sweepRequestBody = {
          sweep_type: sweepData.sweep_type,
          boost_id: sweepData.boost_id,
          sweep_tx_hex: sweepTx.toHex(),
          sweep_tx_id: sweepTx.getId(),
          fee_rate: sweepData.fee_rate,
        }
      } else if (sweepData.sweep_type === 'ephemeral') {
        let sweepTx = bitcoin.Transaction.fromHex(sweepData.sweep_tx_hex);
        sweepRequestBody = {
          sweep_type: sweepData.sweep_type,
          boost_id: sweepData.boost_id,
          sweep_tx_hex: sweepData.sweep_tx_hex,
          sweep_tx_id: sweepTx.getId(),
          fee_rate: sweepData.fee_rate,
        }
      } else {
        throw new Error('Invalid sweep type');
      }
      const sweepTxId = await submitSweep(wallet, authToken, sweepRequestBody, () => {
        setWallet(null);
        setAuthToken(null);
      });
      console.log('Sweep transaction submitted:', sweepTxId); // Sweep transaction ID - visible in console
      setConfirmedSweepTxId(sweepTxId); 
      setSuccess(true);
      setIsSweeping(false);
    } catch (error) {
      console.error('Error during sweep:', error);
      setError('Error during sweep: ' + error.message);
      setIsSweeping(false);
    }
  }

  const handleModalClose = () => {
    if (isSweeping) { // Prevent closing the modal while sweeping
      return;
    }
    setError(null); // Reset error state when closing the modal
    setIsSweeping(false); // Reset sign status when closing the modal
    setSuccess(false); 
    setConfirmedSweepTxId(''); 
    onClose();
  }

  if (!isOpen || loadingSweepData) { // Todo: might be a little hacky
    return null;
  }

  return (
    
    <ModalOverlay isOpen={isOpen} onClick={handleModalClose}>
      <ModalContainer isOpen={isOpen} onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <HeaderText>{success ? 'Sweep Successful!' : 'Confirm Sweep'}</HeaderText>
          <CloseButton onClick={handleModalClose} disabled={isSweeping}>
            <CrossIcon size={'1.25rem'} color={theme.colors.text.secondary} />
          </CloseButton>
        </ModalHeader>
        <ModalContent>
          {success ? (
            <>
              <SuccessIconContainer>
                <CheckIcon size={'1.75rem'} color={theme.colors.text.white} />
              </SuccessIconContainer>
              <SectionContainer>
                <SuccessMessage>
                  You have successfully swept the funds from the reveal address.
                </SuccessMessage>
              </SectionContainer>
              <SectionContainer gap="0.375rem">
                <SuccessMessage>View the sweep on memepool.space:</SuccessMessage>
                <TxContainer>
                  <TxLink
                    href={getMempoolTxUrl(confirmedSweepTxId)}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <SweepIcon size={'1.25rem'} />
                    Sweep TX
                  </TxLink>
                </TxContainer>          
              </SectionContainer>
            </>
          ) : (
            <>
              {sweepData && (
                <InfoSection>
                  <InfoText>
                    An inscription requires both a commit and reveal transaction.
                  </InfoText>
                  <InfoText>
                    In rare circumstances, the commit may confirm, while the reveal does not.
                    In this case, we can recover the funds in the reveal address by using a sweep transaction.
                  </InfoText>
                  <InfoText>
                    This will invalidate your boost inscription, so we recommend sweeping only if the reveal has dropped or failed. If it is still pending, you should wait for it to confirm.
                  </InfoText>
                  <FeeSummaryContainer>
                    <FeeRow>
                      <PlainText color={theme.colors.text.primary}>Reveal Address</PlainText>
                      <FeeDetails>
                        <StyledLink href={getMempoolAddressUrl(sweepData.reveal_address)} target="_blank" color={theme.colors.text.secondary}>
                          {formatAddress(sweepData.reveal_address)}
                        </StyledLink>
                      </FeeDetails>
                    </FeeRow>
                    <FeeRow>
                      <PlainText color={theme.colors.text.primary}>Reveal TX Status</PlainText>
                      <FeeDetails>
                        <PlainText color={theme.colors.text.secondary}>{capitalizeFirstLetter(sweepData.reveal_tx_status)} •</PlainText>
                        <StyledLink href={getMempoolTxUrl(sweepData.reveal_tx_id)} target="_blank" color={theme.colors.text.secondary}>
                          {formatAddress(sweepData.reveal_tx_id)}
                        </StyledLink>
                      </FeeDetails>
                    </FeeRow>
                    <FeeRow>
                      <PlainText color={theme.colors.text.primary}>Funds in Reveal Address</PlainText>
                      <FeeDetails>
                        <PlainText color={theme.colors.text.secondary}>{formatSatsStringFull(sweepData.reveal_amount)}</PlainText>
                        <PlainText color={theme.colors.text.tertiary}>{formatSatsToDollars(sweepData.reveal_amount, btcusd)}</PlainText>
                      </FeeDetails>
                    </FeeRow>
                    <FeeRow>
                      <PlainText color={theme.colors.text.primary}>Sweep Fees</PlainText>
                      <FeeDetails>
                        <PlainText color={theme.colors.text.secondary}>{formatSatsStringFull(sweepData.sweep_fees)}</PlainText>
                        <PlainText color={theme.colors.text.tertiary}>{formatSatsToDollars(sweepData.sweep_fees, btcusd)}</PlainText>
                      </FeeDetails>
                    </FeeRow>
                    <FeeRow>
                      <PlainText color={theme.colors.text.primary}>Amount Recovered</PlainText>
                      <FeeDetails>
                        <PlainText color={theme.colors.text.secondary}>{formatSatsStringFull(sweepData.reveal_amount - sweepData.sweep_fees)}</PlainText>
                        <PlainText color={theme.colors.text.tertiary}>{formatSatsToDollars(sweepData.reveal_amount - sweepData.sweep_fees, btcusd)}</PlainText>
                      </FeeDetails>
                    </FeeRow>
                  </FeeSummaryContainer>
                </InfoSection>
              )}

              <ButtonContainer>
                <ConfirmButton onClick={() => handleConfirmSweep()} disabled={isSweeping}>
                  {isSweeping ? (
                    <Spinner isButton={true} />
                  ) : (
                    <SweepIcon size={'1.125rem'} color={theme.colors.background.white} />
                  )}
                  {isSweeping ? 'Sweeping...' : 'Submit Sweep'}
                </ConfirmButton>
              </ButtonContainer>

              {error && (
                <ErrorContainer>
                  <StatusText style={{ color: theme.colors.text.error }}>{error}</StatusText>
                </ErrorContainer>
              )}
            </>
          )}
        </ModalContent>
      </ModalContainer>
    </ModalOverlay>

  );
};

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(0.125rem);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1050; /* Ensure it appears above other elements */
  opacity: ${props => (props.isOpen ? 1 : 0)};
  visibility: ${props => (props.isOpen ? 'visible' : 'hidden')};
  transition: opacity 200ms ease, visibility 200ms ease, backdrop-filter 200ms ease;
`;

const ModalContainer = styled.div`
  background: ${theme.colors.background.white};
  border-radius: 1rem;
  max-width: 450px;
  width: 90vw;
  max-height: 95vh;
  overflow: hidden; 
  display: flex;
  flex-direction: column;
  opacity: ${props => (props.isOpen ? 1 : 0)};
  visibility: ${props => (props.isOpen ? 'visible' : 'hidden')};
  transform: ${props => (props.isOpen ? 'scale(1)' : 'scale(0.92)')};
  transition: opacity 200ms ease, visibility 200ms ease, transform 200ms ease;

  @media (max-width: 400px) {
    max-width: 90vw;
  }
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem 1.5rem;
`;

const HeaderText = styled.p`
  font-family: ${theme.typography.fontFamilies.bold};
  font-size: 1.25rem;
  line-height: 2rem;
  color: ${theme.colors.text.primary};
  margin: 0;
`;

const CloseButton = styled.button`
  background-color: ${theme.colors.background.white};
  border: none;
  border-radius: 1rem;
  height: 2rem;
  width: 2rem;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0;
  font-size: 1.5rem;
  cursor: ${props => (props.disabled ? 'not-allowed' : 'pointer')};
  transition: all 200ms ease;

  &:hover {
    background-color: ${props => (props.disabled ? theme.colors.background.white : theme.colors.background.primary)};
  }

  &:active {
    transform: ${props => (props.disabled ? 'none' : 'scale(0.96)')};
  }
`;

const ModalContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 0.5rem 1.25rem 1.5rem; 
`;

const InfoSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const InfoText = styled.p`
  font-family: ${theme.typography.fontFamilies.regular};
  font-size: 0.875rem;
  line-height: 1.25rem;
  color: ${theme.colors.text.secondary};
  margin: 0;
`;

const FeeSummaryContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.375rem; 
  padding-top: 0.5rem; 
`;

const FeeRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.875rem; 
`;

const FeeDetails = styled.div`
  display: flex;
  flex-direction: row; 
  align-items: baseline;
  gap: 0.375rem; 
  text-align: right;
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
`;

const BaseButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  gap: 0.5rem;
  font-family: ${theme.typography.fontFamilies.medium};
  font-size: 1rem;
  line-height: 1.25rem;
  border-radius: 0.75rem;
  padding: 0.75rem 1rem;
  border: none;
  cursor: pointer;
  transition: all 200ms ease;
  transform-origin: center center;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &:not(:disabled):active {
    transform: scale(0.98);
  }
`;

const ConfirmButton = styled(BaseButton)`
  background-color: ${theme.colors.background.dark};
  color: ${theme.colors.background.white};

  svg {
    fill: ${theme.colors.background.white};
  }

  &:hover:not(:disabled) {
    opacity: 0.75;
  }
`;

const ErrorContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.5rem 0.75rem;
  background-color: ${theme.colors.background.error};
  border-radius: 0.5rem;
  border: 1px solid ${theme.colors.text.error};
`;

const StatusText = styled.span`
  font-family: ${theme.typography.fontFamilies.medium};
  font-size: 0.75rem;
  line-height: 1rem;
  color: ${theme.colors.text.secondary};
`;

const StyledLink = styled.a`
  color: ${props => props.color || theme.colors.text.primary};
  text-decoration: underline;
  text-decoration-color: ${theme.colors.background.secondary};
  text-decoration-thickness: 0.125rem;
  text-underline-offset: 0.125rem;
  transition: all 200ms ease;

  &:hover {
    color: ${theme.colors.text.primary};
    text-decoration-color: ${theme.colors.text.primary};
  }
`;

const PlainText = styled.p`
  font-family: ${theme.typography.fontFamilies.medium};
  font-size: 0.875rem;
  line-height: 1.25rem;
  color: ${props => props.color || theme.colors.text.primary};
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const SectionContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.gap || '0.75rem'};
  width: 100%; /* Take full width to allow text centering */
`;

const TxLink = styled.a`
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-family: ${theme.typography.fontFamilies.medium};
  background-color: ${theme.colors.background.white}; 
  border-radius: 1rem;
  padding: 0.375rem 0.5rem;
  color: ${theme.colors.text.secondary};
  text-decoration: none;
  font-size: 0.875rem;
  line-height: 1.25rem;
  transition: all 200ms ease;
  word-break: break-all; /* Ensure long txid wraps or is handled */

  svg {
    fill: ${theme.colors.text.secondary};
    transition: all 200ms ease;
  }

  span {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 200px; /* Adjust as needed for your layout */
  }

  &:hover {
    background-color: ${theme.colors.background.secondary};
    color: ${theme.colors.text.primary};

    svg {
      fill: ${theme.colors.text.primary};
    }
  }

  &:active {
    transform: scale(0.98);
  }
`;

const SuccessMessage = styled.p`
  font-family: ${theme.typography.fontFamilies.medium};
  font-size: 1rem;
  line-height: 1.5rem;
  color: ${theme.colors.text.primary};
  margin: 0;
  max-width: 100%; /* Prevent overflow */
`;

const SuccessIconContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: ${theme.colors.background.success}; /* Added: Provides background for the icon */
  width: 2.5rem; /* Added: Sets a width for the container */
  height: 2.5rem; /* Added: Sets a height for the container */
  border-radius: 50%; /* Added: Makes the container circular */
  align-self: center; /* Added: Centers the container in the ModalContent flex column */
`;

const TxContainer = styled.div`
  display: flex;
  gap: 0.25rem;
  flex-wrap: wrap;
`;

export default SweepModal;
