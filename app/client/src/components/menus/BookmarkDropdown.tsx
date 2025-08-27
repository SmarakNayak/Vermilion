import styled from "styled-components";
import { theme } from '../../styles/theme';
import { FolderIcon, PlusIconCircled } from "../common/Icon";
import { BookmarkModal } from "../modals/BookmarkModal";
import { SkeletonElement } from "../common/skeleton/SkeletonComponents";
import React, { useState } from 'react';
import { useAtomValue, useAtomSuspense, Atom, Result } from "@effect-atom/atom-react";
import { AuthSocialClient } from "../../api/EffectApi";
import { useAuth } from "../../hooks/useAuth";

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

const ScrollableList = styled.div`
  width: 100%;
  max-height: 200px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 8px;
  /* Hide scrollbar for WebKit-based browsers (Chrome, Safari, Edge) */
  &::-webkit-scrollbar {
    display: none;
  }
  /* Hide scrollbar for Firefox */
  scrollbar-width: none; /* Firefox */
`;

const BookmarkSkeletonEntryContainer = styled.div`
  display: flex;
  padding: 8px;
  align-items: center;
  gap: 12px;
  align-self: stretch;
  border-radius: 8px;
`;

const BookmarkSkeletonEntry = () => {
  return (
    <BookmarkSkeletonEntryContainer>
      <SkeletonElement width={'40px'} height={'40px'} radius={'12px'} />
      <SkeletonElement width={'120px'} height={'1rem'} />
    </BookmarkSkeletonEntryContainer>
  );
};

const BookmarkListSkeleton = () => {
  return (
    <>
      {Array.from({ length: 3 }, (_, index) => (
        <BookmarkSkeletonEntry key={index} />
      ))}
    </>
  );
};

const playlistsAtomFam = Atom.family((user_id?: string) =>
  Atom.make((get) => {
    if (!user_id) return [];
    const playlistResult = get(AuthSocialClient.query("playlists", "getPlaylistsByUserId", {  
      path: { user_id }  
    }));  
    return Result.getOrElse(playlistResult, () => []);  
  }).pipe(Atom.keepAlive)
);

export const BookmarkDropdown = ({ref}: {ref: React.Ref<HTMLDivElement>}) => {
  const [isBookmarkModalOpen, setIsBookmarkModalOpen] = useState(false);
  const handleCreateFolderClick = () => {
    setIsBookmarkModalOpen(true);
  };
  const auth = useAuth();
  const playlistsAtom = playlistsAtomFam(auth.state === 'signed-in-with-profile' ? auth.profile.user_id : undefined);
  const folderList = useAtomValue(playlistsAtom);

  return (
    <BookmarkMenuContainer ref={ref}>
      <BookmarkModal isOpen={isBookmarkModalOpen} onClose={() => setIsBookmarkModalOpen(false)} />
      <BookmarkMenuTitle>Add to folder</BookmarkMenuTitle>
      <BookmarkMenuEntryContainer onClick={handleCreateFolderClick}>
        <FolderIconContainer>
          <PlusIconCircled size={'1.25rem'} color={theme.colors.text.primary} />
        </FolderIconContainer>
        Create Folder
      </BookmarkMenuEntryContainer>
      <ScrollableList>
        {folderList.map((folder) => (
          <BookmarkMenuEntryContainer key={folder.playlist_id}>
            <FolderIconContainer>
              <FolderIcon size={'1.25rem'} color={theme.colors.text.primary} />
            </FolderIconContainer>
            {folder.playlist_name}
          </BookmarkMenuEntryContainer>
        ))}
      </ScrollableList>
    </BookmarkMenuContainer>
  );
};