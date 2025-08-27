import { useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import theme from '../../styles/theme';
import Spinner from '../Spinner';
import { useModalScrollLock } from '../../hooks/useModalScrollLock';

// Utils
import { addCommas, formatAddress, shortenBytes } from '../../utils/format';

// icons
import { 
  ChevronUpDuoIcon,
  CrossIcon
} from '../common/Icon';

const BoostsModal = ({ boostsList, onClose, fetchMoreBoosts, hasMoreBoosts, isBoostsLoading, isBoostsModalOpen }) => {
  const observer = useRef();
  const modalContentRef = useRef(); // Ref for the modal content
  
  useModalScrollLock(isBoostsModalOpen, modalContentRef);

  const lastBoostRef = useCallback(
    (node) => {
      if (isBoostsLoading) return;
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMoreBoosts) {
          fetchMoreBoosts();
        }
      });

      if (node) observer.current.observe(node);
    },
    [isBoostsLoading, hasMoreBoosts, fetchMoreBoosts]
  );

  const isAddressValid = (addressString) => {
    if (!addressString) { // Handle cases where addressString might be null, undefined, or empty
      return false;
    }
    return (
      addressString !== "unbound" &&
      addressString !== "Failed to convert script to address: script is not a p2pkh, p2sh or witness program" &&
      !addressString.includes("script is not a p2pkh")
    );
  };  

  return (
    <ModalOverlay isOpen={isBoostsModalOpen} onClick={onClose}>
      <ModalContainer isOpen={isBoostsModalOpen} onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <HeaderText>Boosts</HeaderText>
          <CloseButton onClick={onClose}>
            <CrossIcon size={'1.25rem'} color={theme.colors.text.secondary} />
          </CloseButton>
        </ModalHeader>
        <ModalContent ref={modalContentRef}>
          {boostsList.length === 0 && isBoostsLoading ? (
            // Loading spinner when boosts are being fetched
            // Renders when list is empty and fetch operation is in progress
            <SpinnerContainer>
              <Spinner />
            </SpinnerContainer>
          ) : boostsList.length === 0 ? (
            // Empty state when there are no boosts
            // Renders when list is empty and fetch operation is complete/not required
            <EmptyStateContainer>
              <EmptyStateIconContainer>
                <ChevronUpDuoIcon size="1.25rem" color={theme.colors.text.secondary} />
              </EmptyStateIconContainer>
              <EmptyStateTextContainer>
                <EmptyStateTitle>No boosts yet</EmptyStateTitle>
                <EmptyStateSubtitle>Be the first to boost this inscription.</EmptyStateSubtitle>
              </EmptyStateTextContainer>
            </EmptyStateContainer>
          ) : (
            // Boosts list
            // Renders when there are boosts in the list
            boostsList.map((boost, index) => {
              const isValidBoostAddress = isAddressValid(boost.address);
              return (
                <BoostEntry
                  key={index}
                  ref={index === boostsList.length - 1 ? lastBoostRef : null}
                >
                  <BoostDetails>
                    <BoostNumber>{boost.bootleg_edition}</BoostNumber>
                    <TextLink to={`/inscription/${boost.bootleg_number}`}>
                      <BoostText islink>
                        #{addCommas(boost.bootleg_number)}
                      </BoostText>
                    </TextLink>
                  </BoostDetails>
                  <OwnerDetails>
                    <SupportText>owned by</SupportText>
                    {isValidBoostAddress ? (
                      <TextLink to={`/address/${boost.address}`}>
                        <BoostText islink>
                          {formatAddress(boost.address)}
                        </BoostText>
                      </TextLink>
                    ) : (
                      <BoostText>
                        {formatAddress(boost.address)}
                      </BoostText>
                    )}
                  </OwnerDetails>
                </BoostEntry>
              );
            })
          )}
          {boostsList.length > 0 && hasMoreBoosts && isBoostsLoading && (
            // Loading spinner when more boosts are being fetched
            // Renders when there are boosts in the list and more boosts are being fetched
            <SpinnerContainer>
              <Spinner />
            </SpinnerContainer>
          )}
          {/* <SpinnerContainer>
            {isBoostsLoading && <Spinner />}
          </SpinnerContainer> */}
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
  width: 90vw;
  max-width: 400px;
  height: auto;
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

const ModalContent = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1; 
  gap: ${props => props.gap || '0'};
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

const BoostEntry = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.375rem;
  background: ${theme.colors.background.white};
  border-radius: 0.75rem;
  padding: 0.75rem 0.5rem;
  transition: background 200ms ease;

  &:hover {
    background: ${theme.colors.background.primary};
  }
`;

const BoostNumber = styled.div`
  width: 1.75rem;
  text-align: left;
  font-family: ${theme.typography.fontFamilies.medium};
  font-size: 1rem;
  line-height: 1.5rem;
  color: ${theme.colors.text.primary};
`;

const BoostDetails = styled.div`
  display: flex;
  align-items: center;
  gap: 0.375rem;
  width: 100%;
`;

const OwnerDetails = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.25rem;
  width: 100%;
`;

const TextLink = styled(Link)`
  color: unset;
  text-decoration: unset;
  display: block; 
`;

const BoostText = styled.p`
  font-size: 1rem;
  color: ${theme.colors.text.primary};
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.5rem;
  // width: 100%;
  text-decoration-line: ${props => props.islink ? 'underline' : 'none'};
  text-decoration-color: ${props => props.islink ? 'transparent' : 'none'};
  text-decoration-thickness: ${props => props.islink ? '2px' : 'none'};
  text-underline-offset: ${props => props.islink ? '2px' : 'none'};

  transition: all 200ms ease;
  transform-origin: center center;

  &:hover {
    text-decoration-color: ${props => props.islink ? theme.colors.text.primary : 'none'};
  }
`;

const SupportText = styled.p`
  font-family: ${theme.typography.fontFamilies.medium};
  font-size: 1rem;
  line-height: 1.5rem;
  color: ${theme.colors.text.tertiary};
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  @media (max-width: 400px) {
    display: none;
  }
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

export default BoostsModal;
