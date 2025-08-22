import styled from 'styled-components';
import { theme } from '../../styles/theme';
import React, { useEffect, useRef } from 'react';
import { useModalScrollLock } from '../../hooks/useModalScrollLock';
import { 
  Modal,
  ModalHeader, 
  ModalContent,
  ModalSection,
  ModalSectionTitle,
 } from './common/ModalComponents';
 import { StyledInput } from '../common/inputs/StyledInput';
 import { StyledTextarea } from '../common/inputs/StyledTextarea';
 import { SaveButton } from '../common/buttons/SaveButton';

export const BookmarkModal = ({isOpen, onClose}: {
  isOpen: boolean, 
  onClose: () => void
}) => {
  const modalContentRef = useRef<HTMLDivElement>(null);
  useModalScrollLock(isOpen, modalContentRef);
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalHeader title='Create bookmark folder' onClose={onClose}/>
      <ModalContent ref={modalContentRef}>

        <ModalSection>
          <ModalSectionTitle>Folder Name</ModalSectionTitle>
          <StyledInput type="text" placeholder="Enter folder name" />
        </ModalSection>

        <ModalSection>
          <ModalSectionTitle>Description</ModalSectionTitle>
          <StyledTextarea placeholder="Enter folder description"/>
        </ModalSection>

        <ModalSection>
          <SaveButton onClick={onClose}>
            Create folder
          </SaveButton>
        </ModalSection>

      </ModalContent>
    </Modal>
  );
};