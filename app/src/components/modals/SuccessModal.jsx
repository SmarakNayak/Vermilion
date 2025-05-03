import { useEffect } from 'react';
import styled from 'styled-components';
import theme from '../../styles/theme';
import {
  CrossIcon,
  CheckIcon,
  MailIcon,
  MailOpenIcon,
  ArchiveIcon
} from '../common/Icon';
import InscriptionIcon from '../InscriptionIcon';
import { NETWORKS } from '../../wallet/networks';
import useStore from '../../store/zustand';
import { BorderedTagSection } from '../Inscription/Layout';
import { addCommas } from '../../utils';

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
          <SuccessIconContainer>
            <InscriptionSuccessIconWrapper>
              <InscriptionIcon
                size="4rem"
                useBlockIconDefault={false}
                endpoint={`/api/inscription_number/${number}`}
                number={number}
              />
              <CheckIconWrapper>
                <CheckIcon size={'1rem'} color={theme.colors.text.white} />
              </CheckIconWrapper>
            </InscriptionSuccessIconWrapper>
          </SuccessIconContainer>
          <SectionContainer>
            <SuccessMessage>
              You successfully boosted <b>#{addCommas(number)}</b> ({quantity}x)
            </SuccessMessage>
            {comment && (
              <BorderedTagSection>
                <CommentText>{comment}</CommentText>
              </BorderedTagSection>
            )}
          </SectionContainer>
          <SectionContainer gap="0.375rem">
            <SuccessMessage>View the transactions on memepool.space:</SuccessMessage>
            <TxContainer>
              {boostDetails?.commitTxid && (
                <TxLink
                  href={getMempoolTxUrl(boostDetails.commitTxid)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MailIcon size={'1.25rem'} />
                  Commit TX
                </TxLink>
              )}
              {boostDetails?.revealTxid && (
                <TxLink
                  href={getMempoolTxUrl(boostDetails.revealTxid)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MailOpenIcon size={'1.25rem'} />
                  Reveal TX
                </TxLink>
              )}
            </TxContainer>          
          </SectionContainer>
          <ButtonContainer>
            <HistoryButton 
              href={"/profile/"+wallet.ordinalsAddress}
              target="_blank"
              rel="noopener noreferrer"
            >
              <ArchiveIcon size={'1.25rem'} color={theme.colors.text.primary} />
              View Transaction History
            </HistoryButton>
          </ButtonContainer>
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
  gap: 1.5rem;
  padding: 0.5rem 1.25rem 1.5rem; 
`;

const SuccessIconContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
`;

const SectionContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.gap || '0.75rem'};
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
  width: 4.75rem;
  height: 4.75rem;
  border-radius: 0.25rem;
  background: ${theme.colors.background.primary};
  display: flex;
  align-items: center;
  justify-content: center;
`;

const CheckIconWrapper = styled.div`
  position: absolute;
  bottom: -0.3125rem;
  right: -0.3125rem;
  background: ${theme.colors.background.success};
  height: 1.25rem;
  width: 1.25rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const CommentText = styled.p`
  font-family: ${theme.typography.fontFamilies.medium};
  font-size: 0.875rem;
  line-height: 1.25rem;
  color: ${theme.colors.text.secondary};
  margin: 0;
  display: -webkit-box; 
  -webkit-line-clamp: 5; 
  -webkit-box-orient: vertical;
  overflow: hidden; 
  text-overflow: ellipsis;

`;

const TxContainer = styled.div`
  display: flex;
  gap: 0.25rem;
  flex-wrap: wrap;
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

  svg {
    fill: ${theme.colors.text.secondary};
  }

  &:hover {
    background-color: ${theme.colors.background.primary};
    color: ${theme.colors.text.primary};

    svg {
      fill: ${theme.colors.text.primary};
      transition: all 200ms ease;
    }
  }

  &:active {
    transform: scale(0.96);
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
`;

const HistoryButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  background-color: ${theme.colors.background.primary};
  font-family: ${theme.typography.fontFamilies.medium};
  font-size: 1rem;
  line-height: 1.25rem;
  color: ${theme.colors.text.primary};
  border-radius: 0.75rem; /* Updated border radius */
  padding: 0.75rem 1rem;
  border: none;
  cursor: pointer;
  transition: all 200ms ease;
  transform-origin: center center;
  width: 100%;

  &:hover {
    background-color: ${theme.colors.background.secondary};
  }

  &:active {
    transform: scale(0.98);
  }
`;

export default SuccessModal;
