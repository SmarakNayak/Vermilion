import { useEffect } from 'react';
import styled from 'styled-components';
import theme from '../../styles/theme';
import {
  CrossIcon,
  CheckIcon
} from '../common/Icon';
import InscriptionIcon from '../InscriptionIcon';
import { NETWORKS } from '../../wallet/networks';
import useStore from '../../store/zustand';

const SuccessModal = ({ isOpen, onClose, boostDetails }) => {
  const wallet = useStore(state => state.wallet);
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

  // Don't render the modal if it's not open
  if (!isOpen) {
    return null;
  }

  // Helper: get mempool URL
  const getMempoolTxUrl = (txid) => {
    let link = `https://memepool.space/${NETWORKS[wallet.network].mempool}tx/${txid}`;
    return link;
  };

  const number = boostDetails?.delegateMetadata?.number;
  const comment = boostDetails?.boostComment;
  const quantity = boostDetails?.boostQuantity;

  return (
    // ModalOverlay handles the background dimming and closing when clicking outside
    <ModalOverlay isOpen={isOpen} onClick={onClose}>
      {/* ModalContainer holds the actual modal content and prevents closing when clicking inside */}
      <ModalContainer isOpen={isOpen} onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <HeaderText>Success!</HeaderText>
          <CloseButton onClick={onClose}>
            <CrossIcon size={'1.25rem'} color={theme.colors.text.secondary} />
          </CloseButton>
        </ModalHeader>
        <ModalContent>
          <InscriptionSuccessIconWrapper>
            <InscriptionIcon
              size="4rem"
              useBlockIconDefault={false}
              endpoint={`/api/inscription_number/${number}`}
              number={number}
            />
            <CheckIconHover>
              <CheckIcon size={'2.25rem'} color={theme.colors.text.success} />
            </CheckIconHover>
          </InscriptionSuccessIconWrapper>
          <SuccessMessage>
            Successfully boosted <b>{number}</b> {quantity} time{quantity > 1 ? 's' : ''}
          </SuccessMessage>
          {comment && (
            // Comment in italics
            <SuccessMessage style={{ fontStyle: 'italic' }}>
              "{comment}"
            </SuccessMessage>
          )}
          <TxLinks>
            {boostDetails?.commitTxid && (
              <TxLink
                href={getMempoolTxUrl(boostDetails.commitTxid)}
                target="_blank"
                rel="noopener noreferrer"
              >
                Commit TX
              </TxLink>
            )}
            {boostDetails?.revealTxid && (
              <TxLink
                href={getMempoolTxUrl(boostDetails.revealTxid)}
                target="_blank"
                rel="noopener noreferrer"
              >
                Reveal TX
              </TxLink>
            )}
          </TxLinks>          
          <TxLink
            href={"/profile/"+wallet.ordinalsAddress}
            target="_blank"
            rel="noopener noreferrer"
          >
            View boost history
          </TxLink>
        </ModalContent>
      </ModalContainer>
    </ModalOverlay>
  );
};

// --- Styled Components (Adapted from CheckoutModal) ---

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
  z-index: 1050; /* Ensure it appears above other elements if necessary */
  opacity: ${props => (props.isOpen ? 1 : 0)};
  visibility: ${props => (props.isOpen ? 'visible' : 'hidden')};
  transition: opacity 200ms ease, visibility 200ms ease, backdrop-filter 200ms ease;
`;

const ModalContainer = styled.div`
  background: ${theme.colors.background.white};
  border-radius: 1rem;
  max-width: 400px;
  width: 90vw;
  max-height: 95vh;
  overflow: hidden; /* Prevents content spill */
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
  border-bottom: 1px solid ${theme.colors.border}; /* Separator line */
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
  align-items: center; /* Center content horizontally */
  gap: 1.5rem;
  padding: 2rem 1.5rem; /* Add more vertical padding */
  text-align: center; /* Center text */
`;

const SuccessIconContainer = styled.div`
  /* Optional: Add styles for the icon container if needed */
`;

const SuccessMessage = styled.p`
  font-family: ${theme.typography.fontFamilies.medium};
  font-size: 1rem;
  line-height: 1.5rem;
  color: ${theme.colors.text.primary};
  margin: 0;
  max-width: 100%; /* Prevent overflow */
`;

const InscriptionSuccessIconWrapper = styled.div`
  position: relative;
  width: 4rem;
  height: 4rem;
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const CheckIconHover = styled.div`
  position: absolute;
  top: -0.5rem;
  right: -0.5rem;
  background: ${theme.colors.background.white};
  border-radius: 50%;
  box-shadow: 0 0 0.25rem rgba(0,0,0,0.08);
  display: flex;
  align-items: center;
  justify-content: center;
`;

const BoostDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  margin-bottom: 0.5rem;
  width: 100%;
  align-items: center;
`;

const BoostDetailRow = styled.div`
  display: flex;
  gap: 0.5rem;
  align-items: baseline;
`;

const DetailLabel = styled.span`
  font-family: ${theme.typography.fontFamilies.medium};
  color: ${theme.colors.text.secondary};
  font-size: 0.95rem;
`;

const DetailValue = styled.span`
  font-family: ${theme.typography.fontFamilies.bold};
  color: ${theme.colors.text.primary};
  font-size: 1rem;
  word-break: break-word;
`;

const TxLinks = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
  flex-wrap: wrap;
  justify-content: center;
`;

const TxLink = styled.a`
  font-family: ${theme.typography.fontFamilies.medium};
  color: ${theme.colors.text.primary};
  text-decoration: underline;
  font-size: 0.95rem;
  transition: color 0.2s;
  &:hover {
    color: ${theme.colors.text.primary};
  }
`;

export default SuccessModal;