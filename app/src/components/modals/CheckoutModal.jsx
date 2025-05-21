import { useEffect, useRef, useState } from 'react';
import { usePostHog } from 'posthog-js/react';
import styled from 'styled-components';
import theme from '../../styles/theme';
// Utils
import { addCommas, formatSatsStringFull, formatSatsToDollars } from '../../utils/format';

// icons
import { 
  InfoCircleIcon,
  ChevronUpDuoIcon,
  CrossIcon,
  MinusIcon,
  PlusIcon,
  LoginIcon,
  ErrorCircleIcon,
} from '../common/Icon';
import InscriptionIcon from '../InscriptionIcon';

import { constructInscriptionTxs, Inscription as InscriptionObject, getRevealVSize, estimateInscriptionFee, guessInscriptionFee} from '../../wallet/inscriptionBuilder';
import { getRecommendedFees, getCoinBaseBtcPrice, getConfirmedCardinalUtxos, submitInscriptionTxs, submitBoost } from '../../wallet/mempoolApi';
import { isAddressValid } from '../../wallet/transactionUtils';

import useStore from '../../store/zustand';
import WalletConnectMenu from '../navigation/WalletConnectMenu';
import Spinner from '../Spinner';
import SuccessModal from './SuccessModal';
import Tooltip from '../common/Tooltip';
import { SkeletonElement } from '../Inscription/LoadingSkeleton';

const CheckoutModal = ({ onClose, isCheckoutModalOpen, delegateData }) => {
  const [boostComment, setBoostComment] = useState(''); 
  const [boostQuantity, setBoostQuantity] = useState(1);
  const [isQuantityError, setIsQuantityError] = useState(false);
  const [overlayWalletConnect, setOverlayWalletConnect] = useState(false);
  const [error, setError] = useState(null);
  const [signStatus, setSignStatus] = useState(null);
  const [success, setSuccess] = useState(false);
  const [successDetails, setSuccessDetails] = useState(null);

  const modalContentRef = useRef(); // Ref for the modal content
  const wallet = useStore(state => state.wallet); // Use zustand store to get the wallet (has to be top-level)
  const setWallet = useStore(state => state.setWallet);
  const authToken = useStore(state => state.authToken);
  const setAuthToken = useStore(state => state.setAuthToken);
  const network = useStore(state => state.network);
  const platformFee = useStore(state => state.platformFee);
  const platformAddress = useStore(state => state.platformAddress);
  const ownerFee = useStore(state => state.ownerFee);

  const [feeRate, setFeeRate] = useState(0);
  const [btcusd, setBtcusd] = useState(0);
  const [utxos, setUtxos] = useState(null);
  const [inscriptionFee, setInscriptionFee] = useState(0);
  const [totalPlatformFee, setTotalPlatformFee] = useState(0);
  const [totalOwnerFee, setTotalOwnerFee] = useState(0);
  const [ownerAddress, setOwnerAddress] = useState(null);
  const [canBoost, setCanBoost] = useState(false);

  const posthog = usePostHog();

  useEffect(() => {
    if (isCheckoutModalOpen) {
      document.body.style.overflow = 'hidden'; // Disable page scrolling
      pollFeesAndPrice(); // Poll fees and price every 5 seconds when modal is open
    } else {
      document.body.style.overflow = 'auto'; // Enable page scrolling

      // Reset scroll position when modal is closed
      if (modalContentRef.current) {
        modalContentRef.current.scrollTop = 0;
      }
    }

    return () => {
      document.body.style.overflow = 'auto'; // Cleanup on unmount
    };
  }, [isCheckoutModalOpen]);

  const pollFeesAndPrice = async () => {
    while (isCheckoutModalOpen) {
      let btcusd = await getCoinBaseBtcPrice();
      setBtcusd(btcusd);
      let feerate = await getRecommendedFees(network);
      setFeeRate(feerate);
      //wait for 5 seconds before fetching again
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }

  const getInscriptions = (delegateMetadata, quantity) => {
    let inscriptions = Array(quantity).fill().map(() => 
      new InscriptionObject({
        delegate: delegateMetadata.id,
        contentType: delegateMetadata.content_type,
        postage: 546 // Minimum sat value
      })
    );
    if (boostComment.length > 0) {
      //overwrite the first inscription with the comment        
      const commentInscription = new InscriptionObject({
        delegate: delegateMetadata.id,
        contentType: "text/plain",
        content: Buffer.from(boostComment), // Add comment to the inscription
        postage: 546, // Minimum sat value
      });
      inscriptions[0] = commentInscription;
    }
    return inscriptions;
  }

  useEffect(() => {
    if (isCheckoutModalOpen) {
      console.log("Fetching owner address...");
      getOwnerAddress(delegateData);
    }
  }, [isCheckoutModalOpen, delegateData]);

  useEffect(() => {
    if (wallet && isCheckoutModalOpen) {
      getUtxos();
      // getOwnerAddress(delegateData);
    }
  }, [wallet, isCheckoutModalOpen]);

  const getUtxos = async () => {
    let utxos = await getConfirmedCardinalUtxos(wallet.paymentAddress, network);
    setUtxos(utxos);
  }

  const getOwnerAddress = async (delegateMetadata) => {
    const response = await fetch(`/api/inscription_last_transfer_number/${delegateMetadata.number}`);
    const json = await response.json();
    let address = json.address;
    if (isAddressValid(address, network)) {
      setOwnerAddress(address);
    } else {
      setOwnerAddress('invalid');
    }
    if (network === 'testnet' || network === 'signet') {
      if (!wallet) {
        setOwnerAddress('tb1p25h2pkfjwpha0zd5t4f3t6k85swjcgujjjwa9vp8kefncx5fg58s4g443c'); // Default testnet address
        return;
      }
      setOwnerAddress(wallet.paymentAddress); // Refund wallet address for testnet/signet
    }
  }

  useEffect(() => {
    console.log(isCheckoutModalOpen, feeRate, ownerAddress);
    if (isCheckoutModalOpen & feeRate > 0 & ownerAddress !== null) {
      let quantity = boostQuantity;
      if (quantity < 1) { //early return if 0 (as estiamtion assumes min tx size)
        setInscriptionFee(0);
        setTotalPlatformFee(0);
        setTotalOwnerFee(0);
        return;
      }
      if (quantity > 100) { // no larger than 100 as browser will become unresponsive
        quantity = 100;
      }
      let inscriptions = getInscriptions(delegateData, quantity);
      let totalPlatformFee = platformFee * quantity;
      setTotalPlatformFee(totalPlatformFee);
      let totalOwnerFee = ownerFee * quantity;      
      if (ownerAddress === 'invalid') {
        totalOwnerFee = 0; // no owner fee if address is invalid
      }
      setTotalOwnerFee(totalOwnerFee);
      if (wallet && utxos?.length > 0) {
        let revealVsize = getRevealVSize(inscriptions, wallet.ordinalsAddress, network);
        try{          
          let inscriptionFee = estimateInscriptionFee(inscriptions, wallet.paymentAddress, wallet.paymentPublicKey, revealVsize, feeRate, utxos, network, totalPlatformFee, null, totalOwnerFee, null);
          setInscriptionFee(inscriptionFee - totalPlatformFee - totalOwnerFee);
        } catch (error) {
          //guess without wallet.
          console.warn("Error estimating inscription fee:", error);
          let inscriptionFee = guessInscriptionFee(inscriptions, revealVsize, feeRate, totalPlatformFee, totalOwnerFee);
          setInscriptionFee(inscriptionFee - totalPlatformFee - totalOwnerFee);
        }
      } else {
        //guess without wallet.
        //Assumes 2 taproot inputs and 4 taproot outputs (reveal, change, owner, platform), 
        let revealVsize = getRevealVSize(inscriptions, "tb1p25h2pkfjwpha0zd5t4f3t6k85swjcgujjjwa9vp8kefncx5fg58s4g443c", network);
        let inscriptionFee = guessInscriptionFee(inscriptions, revealVsize, feeRate, totalPlatformFee, totalOwnerFee);
        setInscriptionFee(inscriptionFee - totalPlatformFee - totalOwnerFee);
      }
    }
  }, [boostQuantity, boostComment, delegateData, isCheckoutModalOpen, feeRate, utxos, wallet, ownerAddress]);
  
  // wait for data to load before enabling boost button
  useEffect(() => {
    if (isCheckoutModalOpen && utxos !== null && feeRate > 0 && inscriptionFee > 0 && ownerAddress !== null) {
      setCanBoost(true);
    } else {
      setCanBoost(false);
    }
  }, [isCheckoutModalOpen, utxos, feeRate, inscriptionFee, ownerAddress]);

  const handleBoostClick = async (delegateMetadata) => {
    setError(null); // Reset error state
    try {
      if (boostQuantity < 1 || boostQuantity > 100) {        
        setError("Boost quantity must be between 1 and 100.");
        return;
      }
      if (!wallet) {
        console.log("Wallet not connected");
        setOverlayWalletConnect(true);
        return;
      }
      if (!delegateMetadata || feeRate === 0 || !ownerAddress || utxos === null) {
        setError("Still loading data, try again in a moment.");
        return;
      }

      let inscriptions = getInscriptions(delegateMetadata, boostQuantity);
      console.log("Inscribing following inscriptions: ", inscriptions);

      let platformFeeAddress = platformAddress;
      if (network === 'testnet' || network === 'signet') {
        platformFeeAddress = wallet.paymentAddress; // Refund wallet address for testnet/signet
      }

      // Construct the inscription txs
      let inscriptionInfo = await constructInscriptionTxs({
        inscriptions,
        wallet,
        signStatusCallback: setSignStatus,
        feeRate,
        utxos,
        platformFee: totalPlatformFee,
        platformAddress: platformFeeAddress,
        ownerFee: totalOwnerFee,
        ownerAddress,
      });
      let [commitTxid, revealTxid] = await submitBoost(wallet, authToken, inscriptionInfo, {
          delegate_id: delegateMetadata.id,
          boost_quantity: boostQuantity,
          boost_comment: boostComment,
          platform_address: platformFeeAddress,
          platform_fee: totalPlatformFee,
          owner_address: ownerAddress,
          owner_fee: totalOwnerFee
        },
        () => { // log out on unauthorized
          console.log("Unauthorized, logging out...");
          setWallet(null); // Reset wallet in zustand store
          setAuthToken(null); // Reset auth token in zustand store
        }
      );
      
      // Open success modal after successful inscription
      setSuccessDetails({
        commitTxid,
        revealTxid,
        boostComment,
        boostQuantity,
        delegateMetadata,
      });      
      setSuccess(true);
      setSignStatus(null); // Reset sign status after success
      posthog.capture('boost_inscribed', {
        delegate_id: delegateMetadata.id,
        quantity: boostQuantity,
        comment: boostComment,
        commit_tx_id: commitTxid,
        reveal_tx_id: revealTxid,
      });
    } catch (error) {
      console.warn("Error boosting inscription:", error);
      setError("Failed to boost: " + error.message);
      setSignStatus(null);
    }
  };

  // Handle quantity change with validation
  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value, 10);
  
    if (isNaN(value) || value < 1 || value > 100) {
      setIsQuantityError(true); // Show error outline
    } else {
      setIsQuantityError(false); // Remove error outline
    }
  
    setBoostQuantity(isNaN(value) ? '' : value); // Update state, allow blank input
  };  

  // Handle increment and decrement buttons
  const incrementQuantity = () => {
    if (boostQuantity < 100) {
      setBoostQuantity(boostQuantity + 1);
      setIsQuantityError(false);
    }
  };

  const decrementQuantity = () => {
    if (boostQuantity > 1) {
      const newQuantity = boostQuantity - 1;
  
      // Set error to false only if the new quantity is 100 or less
      if (newQuantity <= 100) {
        setIsQuantityError(false);
      }
  
      setBoostQuantity(newQuantity);
    }
  };

  const handleWalletConnectClose = () => {
    setOverlayWalletConnect(false);
  }

  const handleCheckoutModalClose = () => {
    if (signStatus) {
      return; // Prevent closing if signing is in progress
    }
    setError(null); // Reset error state when closing the modal
    setSignStatus(null); // Reset sign status when closing the modal
    onClose();
  }

  //Note that it looks better to use this effect instead of handleCheckoutModalClose
  //it clears the text after modal close, rather than before close
  useEffect(() => { 
    if (!isCheckoutModalOpen) {
      // Reset boostComment, boostQuantity, and error state when the modal is closed
      setBoostComment('');
      setBoostQuantity(1);
      setIsQuantityError(false); 
    }
  }, [isCheckoutModalOpen]);

  const handleSuccessModalClose = () => {
    handleCheckoutModalClose(); // Use standard modal close function
    setSuccess(false); // Reset success state as well when closing the modal
    setSuccessDetails(null); // Reset success details
  }

  return (
    <MultiModalContainer>
      {/* Checkout cart */}
      <ModalOverlay isOpen={isCheckoutModalOpen && !success} onClick={handleCheckoutModalClose}>
        <ModalContainer isOpen={isCheckoutModalOpen && !success} onClick={(e) => e.stopPropagation()}>
          <ModalHeader>
            <HeaderText>Checkout</HeaderText>
            <CloseButton onClick={handleCheckoutModalClose} disabled={!!signStatus}>
              <CrossIcon size={'1.25rem'} color={theme.colors.text.secondary} />
            </CloseButton>
          </ModalHeader>
          <ModalContent gap="1.5rem" ref={modalContentRef}>
            <SummaryDiv>
              <PlainText color={theme.colors.text.secondary}>
                You are about to boost this inscription:
              </PlainText>
              <SummaryRow>
                <InscriptionIcon
                  size="4rem"
                  useBlockIconDefault={false}
                  endpoint={`/api/inscription_number/${delegateData.number }`}
                  number={delegateData.number}
                />
                <SummaryDetails>
                  <PlainText>
                    {addCommas(delegateData.number)}
                  </PlainText>
                  <ContentTag>
                    {delegateData.content_type}
                  </ContentTag>
                </SummaryDetails>
              </SummaryRow>
            </SummaryDiv>

          {/* Divider */}
          {/* <Divider /> */}

          {/* Input Fields Section */}
          <InputFieldsContainer>
            {/* First Input Field */}
            <InputFieldDiv>
              <InputLabel>
                <PlainText>Comment</PlainText>
                <PlainText color={theme.colors.text.tertiary}>
                  (Optional)
                </PlainText>
                <Tooltip content={'Comments are inscribed on the Bitcoin blockchain.'}>
                  <IconWrapper>
                    <InfoCircleIcon size="1.25rem" color={theme.colors.text.tertiary} />
                  </IconWrapper>
                </Tooltip>
              </InputLabel>
              <StyledInput
                placeholder="Add a comment"
                value={boostComment}
                onChange={(e) => setBoostComment(e.target.value)} // Update boostComment
                disabled={signStatus !== null} // Disable input when signing is in progress
              />
            </InputFieldDiv>

            {/* Second Input Field */}
            <InputFieldDiv>
              <InputLabel>
                <PlainText>Quantity</PlainText>
                <PlainText color={theme.colors.text.tertiary}>
                  (Limit 100 per transaction)
                </PlainText>
              </InputLabel>
              <QuantityRow>
                <StyledInput
                  placeholder="1"
                  value={boostQuantity}
                  onChange={handleQuantityChange} // Validate and update boostQuantity
                  isError={isQuantityError} // Pass error state for styling
                  disabled={signStatus !== null} // Disable input when signing is in progress
                />
                <QuantityButton onClick={decrementQuantity} disabled={signStatus !== null}>
                  <MinusIcon size="1.25rem" color={theme.colors.text.tertiary} />
                </QuantityButton>
                <QuantityButton onClick={incrementQuantity} disabled={signStatus !== null}>
                  <PlusIcon size="1.25rem" color={theme.colors.text.tertiary} />
                </QuantityButton>
              </QuantityRow>
            </InputFieldDiv>
          </InputFieldsContainer>

            {/* Divider */}
            <Divider />

            {/* Fee Summary Section */}
            <FeeSummaryContainer>
              {/* Row 1: Network Fees */}
              <FeeRow>
                <PlainText color={theme.colors.text.secondary}>Network Fees</PlainText>
                <FeeDetails>
                  {inscriptionFee ? (
                    <>
                    <PlainText color={theme.colors.text.secondary}>{formatSatsStringFull(inscriptionFee)}</PlainText>
                    <PlainText color={theme.colors.text.tertiary}>{formatSatsToDollars(inscriptionFee, btcusd)}</PlainText>
                    </>
                  ) : (
                    <>
                      <SkeletonElement width="10rem" height="1.5rem" />
                    </>
                  )}
                </FeeDetails>
              </FeeRow>

              {/* Row 2: Service Fees */}
              <FeeRow>
                <PlainText color={theme.colors.text.secondary}>Service Fee</PlainText>
                <FeeDetails>
                  {inscriptionFee ? (
                    <>
                      <PlainText color={theme.colors.text.secondary}>{formatSatsStringFull(totalPlatformFee)}</PlainText>
                      <PlainText color={theme.colors.text.tertiary}>{formatSatsToDollars(totalPlatformFee, btcusd)}</PlainText>
                    </>
                  ) : (
                    <>
                      <SkeletonElement width="10rem" height="1.5rem" />
                    </>
                  )}
                </FeeDetails>
              </FeeRow>

              {/* Row 3: Owner Royalty */}
              <FeeRow>
                <InputLabel>
                  <PlainText color={theme.colors.text.secondary}>Owner Royalty</PlainText>
                  <Tooltip content={'Paid to the owner of the original inscription.'}>
                    <IconWrapper>
                      <InfoCircleIcon size="1.25rem" color={theme.colors.text.secondary} />
                    </IconWrapper>
                  </Tooltip>
                </InputLabel>
                <FeeDetails>
                  {inscriptionFee ? (
                    <>
                    <PlainText color={theme.colors.text.secondary}>{formatSatsStringFull(totalOwnerFee)}</PlainText>
                    <PlainText color={theme.colors.text.tertiary}>{formatSatsToDollars(totalOwnerFee, btcusd)}</PlainText>
                    </>
                  ) : (
                    <>
                      <SkeletonElement width="10rem" height="1.5rem" />
                    </>
                  )}
                </FeeDetails>
              </FeeRow>

              {/* Dotted Divider */}
              <DottedDivider />

              {/* Row 3: Total Fees */}
              <FeeRow>
                <PlainText color={theme.colors.text.primary}>Total</PlainText>
                <FeeDetails>
                  {inscriptionFee ? (
                    <>
                    <PlainText color={theme.colors.text.primary}>{formatSatsStringFull(inscriptionFee + totalPlatformFee + totalOwnerFee)}</PlainText>
                    <PlainText color={theme.colors.text.tertiary}>{formatSatsToDollars(inscriptionFee + totalPlatformFee + totalOwnerFee, btcusd)}</PlainText>
                    </>
                  ) : (
                    <>
                      <SkeletonElement width="10rem" height="1.5rem" />
                    </>
                  )}
                </FeeDetails>
              </FeeRow>
            </FeeSummaryContainer>

            {/* Boost Button Section */}
            <BoostButtonContainer>
              {!signStatus & (canBoost || !wallet) ? ( // do not enable until all data is loaded if wallet is connected
                <ModalBoostButton onClick={() => handleBoostClick(delegateData)}>
                  {wallet ? (
                    <>
                      <ChevronUpDuoIcon size="1.25rem" color={theme.colors.background.white} />
                      Boost
                    </>
                    ) : (
                    <>
                      <LoginIcon size="1.25rem" color={theme.colors.background.white} />
                      Connect Wallet to Boost
                    </>
                  )}
                </ModalBoostButton>
              ) : (
                <DisabledModalBoostButton>
                  <Spinner isButton={true} /> 
                  {signStatus}
                </DisabledModalBoostButton>
              )}
            </BoostButtonContainer>

            {/* Error message */}
            {error && (
              <ErrorContainer style={{ backgroundColor: theme.colors.background.white }}>
                <ErrorCircleIcon size="1rem" color={theme.colors.text.error} />
                <StatusText style={{ color: theme.colors.text.error }}>{error}</StatusText>
              </ErrorContainer>
            )}
          </ModalContent>
        </ModalContainer>
      </ModalOverlay>
      {/* Wallet Overay */}
      <ModalOverlay isOpen={overlayWalletConnect} onClick={handleWalletConnectClose}>
        <WalletConnectMenu isOpen={overlayWalletConnect} onClose={handleWalletConnectClose}></WalletConnectMenu>
      </ModalOverlay>
      {/* Success Modal */}
      <SuccessModal
        isOpen={isCheckoutModalOpen && success}
        onClose={handleSuccessModalClose}
        boostDetails={successDetails}
        network={wallet?.network}
      />

    </MultiModalContainer>
  );
};

const MultiModalContainer = styled.div`
  //position: fixed;
`;

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
  z-index: ${props => (props?.zIndex ? props.zIndex : 1000)};
  opacity: ${props => (props.isOpen ? 1 : 0)};
  visibility: ${props => (props.isOpen ? 'visible' : 'hidden')};
  transition: opacity 200ms ease, visibility 200ms ease, backdrop-filter 200ms ease;
`;

const ModalContainer = styled.div`
  background: ${theme.colors.background.white};
  border-radius: 1rem;
  max-width: 400px;
  height: auto;
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
  @media (max-height: 630px) {
    max-height: 90vh;
  }
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem 1.5rem;
  background: ${theme.colors.background.white};
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
  cursor: ${props => (props.disabled ? 'not-allowed' : 'pointer')}; /* Change cursor based on disabled prop */
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
  flex: 1; 
  gap: ${props => props.gap || '0'};
  overflow-y: auto;
  padding: 0.5rem 1.25rem 1.5rem;
`;

const SummaryDiv = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const PlainText = styled.p`
  font-family: ${theme.typography.fontFamilies.medium};
  font-size: 1rem;
  line-height: 1.5rem;
  color: ${props => props.color || theme.colors.text.primary};
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const SummaryRow = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  border: none;
  border-radius: 0.75rem;
  gap: 0.75rem;
  padding: 0.375rem;
  background: ${theme.colors.background.primary};
`;

const SummaryDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

const ContentTag = styled.div`
  background: ${theme.colors.background.primary};
  font-family: ${theme.typography.fontFamilies.medium};
  font-size: 0.875rem;
  line-height: 1.25rem;
  color: ${theme.colors.text.secondary};
`;

const Divider = styled.div`
  width: 100%;
  border-bottom: 1px solid ${theme.colors.border};
`;

const QuantityRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.375rem;
`;

const QuantityButton = styled.button`
  width: 2.25rem;
  height: 2.25rem;
  min-width: 2.25rem;
  min-height: 2.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${theme.colors.background.primary};
  border: none;
  border-radius: 0.75rem;
  cursor: pointer;
  transition: all 200ms ease;
  transform-origin: center center;

  &:hover {
    background-color: ${theme.colors.background.secondary};
  }

  &:active {
    transform: scale(0.96);
  }
`;

const InputFieldsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const InputFieldDiv = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
`;

const InputLabel = styled.div`
  display: flex;
  align-items: center;
  gap: 0.25rem;
`;

const StyledInput = styled.input`
  height: 2.25rem;
  width: 100%;
  max-width: 100%;
  padding: 0 0.75rem;
  background-color: ${theme.colors.background.primary};
  font-family: ${theme.typography.fontFamilies.medium};
  font-size: 1rem;
  line-height: 1.5rem;
  color: ${theme.colors.text.primary};
  border: 2px solid ${props => (props.isError ? theme.colors.text.error : 'transparent')};
  border-radius: 0.75rem;
  box-sizing: border-box;
  outline: none;
  transition: all 200ms ease;

  &:hover {
    border: 2px solid ${props => (props.isError ? theme.colors.text.error : theme.colors.border)};
  }

  &:focus {
    border: 2px solid ${props => (props.isError ? theme.colors.text.error : theme.colors.border)};
  }

  &::placeholder { /* Chrome, Firefox, Opera, Safari 10.1+ */
    color: ${theme.colors.text.tertiary};
  }
  
  &:-ms-input-placeholder { /* Internet Explorer 10-11 */
    color: ${theme.colors.text.tertiary};
  }
  
  &::-ms-input-placeholder { /* Microsoft Edge */
    color: ${theme.colors.text.tertiary};
  }
`;

const FeeSummaryContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

const FeeRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const FeeDetails = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 0.25rem;
`;

const DottedDivider = styled.div`
  width: 100%;
  border-bottom: 1px dashed ${theme.colors.border};
`;

const BoostButtonContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
`;

const ModalBoostButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  background-color: ${theme.colors.background.dark};
  font-family: ${theme.typography.fontFamilies.medium};
  font-size: 1rem;
  line-height: 1.25rem;
  color: ${theme.colors.background.white};
  border-radius: 0.75rem; /* Updated border radius */
  padding: 0.75rem 1rem;
  border: none;
  cursor: pointer;
  transition: all 200ms ease;
  transform-origin: center center;
  width: 100%;

  &:hover {
    opacity: 75%;
  }

  &:active {
    transform: scale(0.98);
  }
`;

const DisabledModalBoostButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  background-color: ${theme.colors.background.dark};
  font-family: ${theme.typography.fontFamilies.medium};
  font-size: 1rem;
  line-height: 1.25rem;
  color: ${theme.colors.text.white};
  border-radius: 0.75rem; /* Updated border radius */
  padding: 0.75rem 1rem;
  border: none;
  transition: all 200ms ease;
  transform-origin: center center;
  width: 100%;
  opacity: 0.5;
  cursor: not-allowed;
`;

const ErrorContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.375rem;
  background-color: ${theme.colors.background.white};
  padding: 0.5rem 0.5rem 0 0.5rem;
`;

const StatusText = styled.span`
  font-family: ${theme.typography.fontFamilies.medium};
  font-size: 0.75rem;
  line-height: 1rem;
  color: ${theme.colors.text.secondary};
  display: block;
  transition: all 200ms ease;
`;

const IconWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.5rem;
  height: 1.5rem;
  cursor: pointer;
`;

export default CheckoutModal;
