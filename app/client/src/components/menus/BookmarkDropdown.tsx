import styled from "styled-components";
import { theme } from '../../styles/theme';
import { FolderIcon, PlusIconCircled } from "../common/Icon";
import { BookmarkModal } from "../modals/BookmarkModal";
import React, { useState } from 'react';

const BookmarkMenuContainer = styled.div`
  //layout  
  display: flex;
  width: 280px;
  padding: 16px 8px 8px 8px;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
  //position
  position: absolute;
  top: 48px;
  //Style
  border-radius: 16px;
  border: 1px solid ${theme.colors.border};
  background-color: ${theme.colors.background.white};
  box-shadow: ${theme.shadows.soft};
`;

const BookmarkMenuTitle = styled.div`
  //layout
  flex: 1 0 0;
  //Typography
  color: ${theme.colors.text.secondary};
  font-family: ${theme.typography.fontFamilies.medium};
  font-size: ${theme.typography.fontSize.xs};
`;

const BookmarkMenuEntryContainer = styled.div`
  //layout
  display: flex;
  padding: 8px;
  align-items: center;
  gap: 12px;
  align-self: stretch;
  //Style
  border-radius: 8px;
  &:hover {
    background-color: ${theme.colors.background.secondary};
    cursor: pointer;
  }
`;

const FolderIconContainer = styled.div`
  //layout
  display: flex;
  width: 40px;
  height: 40px;
  justify-content: center;
  align-items: center;
  gap: 8px;
  //Style
  border-radius: 12px;
  background-color: ${theme.colors.background.primary};
  border: 1px solid ${theme.colors.border};
`;

export const BookmarkDropdown = ({ref}: {ref: React.Ref<HTMLDivElement>}) => {
  const [isBookmarkModalOpen, setIsBookmarkModalOpen] = useState(false);
  const handleCreateFolderClick = () => {
    setIsBookmarkModalOpen(true);
  };
  return (
    <BookmarkMenuContainer ref={ref}>
      <BookmarkModal isOpen={isBookmarkModalOpen} onClose={() => setIsBookmarkModalOpen(false)} />
      <BookmarkMenuTitle>Add to folder</BookmarkMenuTitle>
      <BookmarkMenuEntryContainer onClick={handleCreateFolderClick}>
        <FolderIconContainer>
          <PlusIconCircled size={'1.25rem'} color={theme.colors.text.primary} className={'fake'} />
        </FolderIconContainer>
        Create Folder
      </BookmarkMenuEntryContainer>
      <BookmarkMenuEntryContainer>
        <FolderIconContainer>
          <FolderIcon size={'1.25rem'} color={theme.colors.text.primary} className={'fake'} />
        </FolderIconContainer>
        Wish List
      </BookmarkMenuEntryContainer>
    </BookmarkMenuContainer>
  );
};