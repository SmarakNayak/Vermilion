import { useEffect, useRef } from 'react';
import styled from 'styled-components';
import theme from '../../styles/theme';
// Utils
import { addCommas, formatAddress, shortenBytes } from '../../utils/format';

// icons
import { 
  InfoCircleIcon, 
  FileIcon, 
  RouteIcon, 
  TagIcon, 
  SparklesIcon,
  CommentIcon,
  ChevronUpDuoIcon,
  LinkIcon,
  WebIcon,
  CrossIcon,
  MinusIcon,
  PlusIcon,
} from '../../components/common/Icon';
import InscriptionIcon from '../../components/InscriptionIcon';


import { createInscriptions, Inscription as InscriptionObject } from '../../wallet/inscriptionBuilder';
import useStore from '../../store/zustand';


const CheckoutModal = ({ onClose, isCheckoutModalOpen, delegateData, metadata, number }) => {
  const placeholderFees = [
    { id: 1, btc: "0.00002816 BTC", usd: "$2.55" },
    { id: 2, btc: "0.00002000 BTC", usd: "$1.90" },
    { id: 3, btc: "0.00004816 BTC", usd: "$4.45" },
  ];

  const observer = useRef();
  const modalContentRef = useRef(); // Ref for the modal content
  // Use zustand store to get the wallet (has to be top-level)
  const wallet = useStore(state => state.wallet);

  useEffect(() => {
    if (isCheckoutModalOpen) {
      document.body.style.overflow = 'hidden'; // Disable page scrolling
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

  const handleBoostClick = async (delegateMetadata) => {
    if (!delegateMetadata) {
      console.error("No delegate or inscription ID available for boosting");
      return;
    }

    try {
      // Create a boost inscription with delegate
      const boostInscription = new InscriptionObject({
        delegate: delegateMetadata.id,
        contentType: delegateMetadata.content_type,
        postage: 546 // Minimum sat value
      });
      console.log("Boost inscription created:", boostInscription);
      
      if (!wallet) {
        console.error("Wallet not connected");
        alert("Please connect your wallet to boost");
        return;
      }

      // Create the inscription
      await createInscriptions([boostInscription], wallet);
      
      // Close modal after successful boost
      onClose();
    } catch (error) {
      console.error("Error creating boost inscription:", error);
      alert(`Error creating boost: ${error.message}`);
    }
  };

  return (
    <ModalOverlay isOpen={isCheckoutModalOpen} onClick={onClose}>
      <ModalContainer isOpen={isCheckoutModalOpen} onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <HeaderText>Checkout</HeaderText>
          <CloseButton onClick={onClose}>
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
                endpoint={`/api/inscription_number/${delegateData?.metadata.number || number}`}
                number={metadata?.delegate || number}
              />
              <SummaryDetails>
                <PlainText>
                  {addCommas(delegateData?.metadata.number) || addCommas(number)}
                </PlainText>
                <ContentTag>
                  {delegateData?.metadata.content_type || metadata?.content_type}
                </ContentTag>
              </SummaryDetails>
            </SummaryRow>
          </SummaryDiv>

          {/* Divider */}
          <Divider />

          {/* Input Fields Section */}
          <InputFieldsContainer>
            {/* First Input Field */}
            <InputFieldDiv>
              <InputLabel>
                <PlainText>Comment</PlainText>
                <PlainText color={theme.colors.text.tertiary}>
                  (Optional)
                </PlainText>
                <InfoCircleIcon size="1.25rem" color={theme.colors.text.tertiary} />
              </InputLabel>
              <StyledInput placeholder="Add a comment" />
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
                <StyledInput placeholder="1" />
                <QuantityButton>
                  <MinusIcon size="1.25rem" color={theme.colors.text.tertiary} />
                </QuantityButton>
                <QuantityButton>
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
              <PlainText color={theme.colors.text.secondary}>Network fees</PlainText>
              <FeeDetails>
                <PlainText color={theme.colors.text.secondary}>{placeholderFees[0].btc}</PlainText>
                <PlainText color={theme.colors.text.tertiary}>{placeholderFees[0].usd}</PlainText>
              </FeeDetails>
            </FeeRow>

            {/* Row 2: Service Fees */}
            <FeeRow>
              <PlainText color={theme.colors.text.secondary}>Service fees</PlainText>
              <FeeDetails>
                <PlainText color={theme.colors.text.secondary}>{placeholderFees[1].btc}</PlainText>
                <PlainText color={theme.colors.text.tertiary}>{placeholderFees[1].usd}</PlainText>
              </FeeDetails>
            </FeeRow>

            {/* Dotted Divider */}
            <DottedDivider />

            {/* Row 3: Total Fees */}
            <FeeRow>
              <PlainText color={theme.colors.text.primary}>Total fees</PlainText>
              <FeeDetails>
                <PlainText color={theme.colors.text.primary}>{placeholderFees[2].btc}</PlainText>
                <PlainText color={theme.colors.text.tertiary}>{placeholderFees[2].usd}</PlainText>
              </FeeDetails>
            </FeeRow>
          </FeeSummaryContainer>

          {/* Boost Button Section */}
          <BoostButtonContainer>
            <ModalBoostButton onClick={() => handleBoostClick(delegateData?.metadata || metadata)}>
              <ChevronUpDuoIcon size="1.25rem" color={theme.colors.background.white} />
              Boost
            </ModalBoostButton>
          </BoostButtonContainer>
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
  z-index: 1000;
  opacity: ${props => (props.isOpen ? 1 : 0)};
  visibility: ${props => (props.isOpen ? 'visible' : 'hidden')};
  transition: opacity 200ms ease, visibility 200ms ease, backdrop-filter 200ms ease;
`;

const ModalContainer = styled.div`
  background: ${theme.colors.background.white};
  border-radius: 1rem;
  max-width: 400px;
  max-height: 630px;
  width: 90vw;
  height: 90vh;
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
  cursor: pointer;
  transition: all 200ms ease;

  &:hover {
    background-color: ${theme.colors.background.primary};
  }

  &:active {
    transform: scale(0.96);
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
  gap: 0.75rem;
`;

const SummaryDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

const ContentTag = styled.div`
  background: ${theme.colors.background.primary};
  border-radius: 0.25rem;
  padding: 0.125rem 0.25rem;
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
  max-width: calc(100% - 1.5rem);
  padding: 0 0.75rem;
  background-color: ${theme.colors.background.primary};
  font-family: ${theme.typography.fontFamilies.medium};
  font-size: 1rem;
  line-height: 1.5rem;
  color: ${theme.colors.text.primary};
  border: none;
  border-radius: 0.75rem;
  outline: none;

  &::placeholder {
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
  font-family: ${theme.typography.fontFamilies.bold};
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


export default CheckoutModal;