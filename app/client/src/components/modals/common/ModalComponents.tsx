import styled from 'styled-components';
import { theme } from '../../../styles/theme';
import { CrossIcon } from '../../common/Icon';

const ModalOverlay = styled.div<{isOpen: boolean}>`
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

const ModalContainer = styled.div<{isOpen: boolean}>`
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

const ModalHeaderContainer = styled.div`
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

export const Modal = ({ isOpen, onClose, children }: {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) => {
  return (
    <ModalOverlay isOpen={isOpen} onClick={onClose}>
      <ModalContainer isOpen={isOpen} onClick={(e) => e.stopPropagation()}>
        {children}
      </ModalContainer>
    </ModalOverlay>
  );
};

export const ModalHeader = ({ title, onClose } : {
  title: string;
  onClose: () => void;
}) => {
  return (
    <ModalHeaderContainer>
      <HeaderText>{title}</HeaderText>
      <CloseButton onClick={onClose}>
        <CrossIcon size={'1.25rem'} color={theme.colors.text.secondary} />
      </CloseButton>
    </ModalHeaderContainer>
  );
};

export const ModalContent = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1; 
  gap: 1.5rem;
  overflow-y: auto;
  padding: 0.5rem 1.25rem 1.5rem;
`;

export const ModalSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

export const ModalSectionTitle = styled.p`
  font-family: ${theme.typography.fontFamilies.medium};
  font-size: 1rem;
  line-height: 1.5rem;
  color: ${theme.colors.text.primary};
  margin: 0;
`;