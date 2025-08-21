import styled from 'styled-components';
import { theme } from '../../styles/theme';
import React, { useEffect, useRef } from 'react';
import { useModalScrollLock } from '../../hooks/useModalScrollLock';

export const BookmarkModal = ({isOpen, onClose}: {
  isOpen: boolean, 
  onClose: any
}) => {
  const modalContentRef = useRef<HTMLDivElement>(null);
  useModalScrollLock(isOpen, modalContentRef);
  return (
    <ModalOverlay isOpen={isOpen} onClick={onClose}>
      <ModalContainer isOpen={isOpen} onClick={(e) => e.stopPropagation()}>
        Hello this is a Bookmark Modal!
      </ModalContainer>
    </ModalOverlay>
  );
}

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
