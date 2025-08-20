import { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import theme from '../../styles/theme';
import Spinner from '../Spinner';
import useStore from '../../store/zustand';
import InnerInscriptionContent from '../common/InnerInscriptionContent';
import InscriptionIcon from '../InscriptionIcon';
import { addCommas } from '../../utils/format';

// icons
import { 
  CrossIcon,
  ImageIcon
} from '../common/Icon';

const InscriptionModal = ({ isOpen, onClose, onSelect, selectedInscription }) => {
  const modalContentRef = useRef();
  const { wallet } = useStore();
  const [inscriptions, setInscriptions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      fetchInscriptions();
    } else {
      document.body.style.overflow = 'auto';
      if (modalContentRef.current) {
        modalContentRef.current.scrollTop = 0;
      }
    }

    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  const fetchInscriptions = async () => {
    if (!wallet?.ordinalsAddress) return;

    setIsLoading(true);
    setError('');

    try {
      // Fetch inscriptions from the user's wallet
      const response = await fetch(`/api/inscriptions_in_address/${wallet.ordinalsAddress}?page_size=100&page_number=0`);
      if (!response.ok) {
        throw new Error('Failed to fetch inscriptions');
      }

      const data = await response.json();
      
      // Filter for image content types only
      const imageInscriptions = data.filter(inscription => 
        inscription.content_type && inscription.content_type.startsWith('image/')
      );
      
      setInscriptions(imageInscriptions);
    } catch (err) {
      console.error('Failed to fetch inscriptions:', err);
      setError('Failed to load inscriptions');
    } finally {
      setIsLoading(false);
    }
  };

  const [tempSelection, setTempSelection] = useState(selectedInscription);

  useEffect(() => {
    setTempSelection(selectedInscription);
  }, [selectedInscription, isOpen]);

  const handleSelect = (inscription) => {
    setTempSelection(inscription);
  };

  const handleSave = () => {
    if (tempSelection) {
      onSelect(tempSelection);
    }
    onClose();
  };

  return (
    <ModalOverlay isOpen={isOpen} onClick={onClose}>
      <ModalContainer isOpen={isOpen} onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <HeaderText>Change Image</HeaderText>
          <CloseButton onClick={onClose}>
            <CrossIcon size={'1.25rem'} color={theme.colors.text.secondary} />
          </CloseButton>
        </ModalHeader>
        <ModalContent ref={modalContentRef}>
          {isLoading ? (
            <SpinnerContainer>
              <Spinner />
            </SpinnerContainer>
          ) : error ? (
            <EmptyStateContainer>
              <EmptyStateTextContainer>
                <EmptyStateTitle>{error}</EmptyStateTitle>
              </EmptyStateTextContainer>
            </EmptyStateContainer>
          ) : inscriptions.length === 0 ? (
            <EmptyStateContainer>
              <EmptyStateIconContainer>
                <ImageIcon size="1.25rem" color={theme.colors.text.secondary} />
              </EmptyStateIconContainer>
              <EmptyStateTextContainer>
                <EmptyStateTitle>No images found</EmptyStateTitle>
                <EmptyStateSubtitle>You don't have any image inscriptions in your wallet.</EmptyStateSubtitle>
              </EmptyStateTextContainer>
            </EmptyStateContainer>
          ) : (
            <>
              <Section>
                <SectionTitle>Current selection</SectionTitle>
                <div>
                  {tempSelection ? (
                    <InscriptionPill isSelected={true}>
                      <InscriptionImageContainer>
                        <InscriptionIcon
                          endpoint={`/bun/rendered_content_number/${tempSelection.number}`}
                          useBlockIconDefault={false}
                          size={'2rem'}
                        />
                      </InscriptionImageContainer>
                      {tempSelection.off_chain_metadata?.name ? (
                        <InscriptionName>{tempSelection.off_chain_metadata.name}</InscriptionName>
                      ) : (
                        <InscriptionName>#{addCommas(tempSelection.number)}</InscriptionName>
                      )}
                    </InscriptionPill>
                  ) : (
                    <InscriptionPill isSelected={false}>
                      <PlaceholderImageContainer />
                      <PlaceholderPillText>Default</PlaceholderPillText>
                    </InscriptionPill>
                  )}
                </div>
              </Section>
              
              <Section>
                <SectionTitle>Your inscriptions</SectionTitle>
                <InscriptionsGrid>
                  {inscriptions.map((inscription) => (
                    <InscriptionPill
                      key={inscription.id}
                      isSelected={tempSelection?.id === inscription.id}
                      onClick={() => handleSelect(inscription)}
                    >
                      <InscriptionImageContainer>
                        <InscriptionIcon
                          endpoint={`/bun/rendered_content_number/${inscription.number}`}
                          useBlockIconDefault={false}
                          size={'2rem'}
                        />
                      </InscriptionImageContainer>
                      {inscription.off_chain_metadata?.name ? (
                        <InscriptionName>{inscription.off_chain_metadata.name}</InscriptionName>
                      ) : (
                        <InscriptionName>#{addCommas(inscription.number)}</InscriptionName>
                      )}
                    </InscriptionPill>
                  ))}
                </InscriptionsGrid>
              </Section>
            </>
          )}
        </ModalContent>
        {!isLoading && !error && inscriptions.length > 0 && (
          <ModalFooter>
            <SaveButton onClick={handleSave}>
              Save changes
            </SaveButton>
          </ModalFooter>
        )}
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
  width: 90vw;
  max-width: 600px;
  height: auto;
  max-height: 95vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  opacity: ${props => (props.isOpen ? 1 : 0)};
  visibility: ${props => (props.isOpen ? 'visible' : 'hidden')};
  transform: ${props => (props.isOpen ? 'scale(1)' : 'scale(0.92)')};
  transition: opacity 200ms ease, visibility 200ms ease, transform 200ms ease;

  @media (max-width: 500px) {
    max-width: 90vw;
  }
`;

const ModalContent = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1; 
  gap: 1.5rem;
  overflow-y: auto;
  padding: 0.5rem 1.25rem 1.5rem;
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

const SpinnerContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  width: 100%;
  padding-top: 1rem;
`;

const EmptyStateContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 1rem 0 1.5rem 0;
`;

const EmptyStateIconContainer = styled.div`
  width: 2.75rem;
  height: 2.75rem;
  background-color: ${theme.colors.background.primary};
  border-radius: 1.375rem;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const EmptyStateTextContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.125rem;
`;

const EmptyStateTitle = styled.p`
  font-family: ${theme.typography.fontFamilies.medium};
  font-size: 1rem;
  line-height: 1.5rem;
  color: ${theme.colors.text.secondary};
  font-weight: bold;
  margin: 0;
`;

const EmptyStateSubtitle = styled.p`
  font-family: ${theme.typography.fontFamilies.medium};
  font-size: 0.875rem;
  line-height: 1.25rem;
  color: ${theme.colors.text.secondary};
  margin: 0;
  text-align: center;
`;

const InscriptionsGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.375rem;
  padding: 0.5rem 0;
`;

const InscriptionPill = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.375rem 0.875rem 0.375rem 0.5rem;
  background-color: ${theme.colors.background.primary};
  border: 2px solid ${props => props.isSelected ? theme.colors.text.primary : 'transparent'};
  border-radius: 2.5rem;
  box-sizing: border-box;
  cursor: pointer;
  transition: all 200ms ease;
  height: auto;
  width: auto;

  &:hover {
    background-color: ${theme.colors.background.secondary};
  }

  &:active {
    transform: scale(0.98);
  }
`;

const InscriptionImageContainer = styled.div`
  width: 2rem;
  height: 2rem;
  min-width: 2rem;
  min-height: 2rem;
  border-radius: 50%;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${theme.colors.background.primary};
  position: relative;
  
  img, svg, iframe, video {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  & > * {
    max-width: 100%;
    max-height: 100%;
  }
`;

const PlaceholderImageContainer = styled.div`
  width: 2rem;
  height: 2rem;
  min-width: 2rem;
  min-height: 2rem;
  border-radius: 50%;
  background: linear-gradient(135deg, ${theme.colors.background.verm} 0%, ${theme.colors.background.white} 100%);
`;

const InscriptionName = styled.span`
  font-family: ${theme.typography.fontFamilies.medium};
  font-size: 0.875rem;
  line-height: 1.25rem;
  color: ${theme.colors.text.primary};
`;

const PlaceholderPillText = styled.span`
  font-family: ${theme.typography.fontFamilies.medium};
  font-size: 0.875rem;
  line-height: 1.25rem;
  color: ${theme.colors.text.tertiary};
`;

const Section = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const SectionTitle = styled.p`
  font-family: ${theme.typography.fontFamilies.medium};
  font-size: 1rem;
  line-height: 1.5rem;
  color: ${theme.colors.text.primary};
  margin: 0;
`;

const PlaceholderText = styled.p`
  font-family: ${theme.typography.fontFamilies.medium};
  font-size: 0.875rem;
  line-height: 2.75rem;
  color: ${theme.colors.text.tertiary};
  margin: 0;
`;

const ModalFooter = styled.div`
  padding: 1rem 1.5rem;
  display: flex;
  justify-content: flex-end;
`;

const SaveButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  height: 2.5rem;
  min-height: 2.5rem;
  border-radius: 0.75rem; 
  border: none;
  font-family: ${theme.typography.fontFamilies.medium};
  font-size: 1rem;
  line-height: 1.25rem;
  color: ${theme.colors.background.white};
  padding: 0 1rem;
  margin: 0;
  cursor: pointer;
  background-color: ${theme.colors.background.dark};
  transition: all 200ms ease;
  transform-origin: center center;

  &:hover {
    opacity: 0.75;
  }

  &:active {
    transform: scale(0.98);
  }
`;

export default InscriptionModal;
