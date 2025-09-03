import styled from "styled-components";
import { theme } from '../../styles/theme';
import { FolderIcon, PlusIconCircled } from "../common/Icon";
import { BookmarkModal } from "../modals/BookmarkModal";
import { SkeletonElement } from "../common/skeleton/SkeletonComponents";
import InscriptionIcon from "../InscriptionIcon";
import React, { useState } from 'react';
import { useAtomValue, useAtom, Atom, Result } from "@effect-atom/atom-react";
import { userFoldersAtom } from "../../atoms/userAtoms";
import { cleanErrorResult, cleanErrorExit, flatMap } from "../../atoms/atomHelpers";
import { Option, Exit } from "effect";
import { AuthSocialClient, getErrorMessage } from "../../api/EffectApi";
import { toast } from "sonner";

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

const FolderName = styled.span`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 200px;
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

export const BookmarkDropdown = ({ref, inscriptionId, onClose}: {
  ref: React.Ref<HTMLDivElement>;
  inscriptionId: string;
  onClose: () => void;
}) => {
  const [isBookmarkModalOpen, setIsBookmarkModalOpen] = useState(false);
  
  const handleCreateFolderClick = () => {
    setIsBookmarkModalOpen(true);
  };
  
  const folderList = useAtomValue(userFoldersAtom);
  const [insertResult, insertInscription] = useAtom(AuthSocialClient.mutation("playlists", "insertPlaylistInscriptions"), { mode: 'promiseExit' });

  const handleFolderClick = async (playlistId: string, playlistName: string) => {
    const result = await insertInscription({ 
      payload: [{ playlist_id: playlistId, inscription_id: inscriptionId }],
      reactivityKeys: ['userFolders']
    });
    result.pipe(
      cleanErrorExit,
      Exit.match({
        onSuccess: () => {
          toast.success(`Inscription added to "${playlistName}" successfully!`);
          onClose();
        },
        onFailure: (cause) => {
          toast.error(`Failed to add inscription to "${playlistName}"${getErrorMessage(cause)}`);
        },
      })
    );
  };

  return (
    <BookmarkMenuContainer ref={ref}>
      <BookmarkModal mode='create' isOpen={isBookmarkModalOpen} onClose={() => setIsBookmarkModalOpen(false)} />
      <BookmarkMenuTitle>Add to folder</BookmarkMenuTitle>
      <BookmarkMenuEntryContainer onClick={handleCreateFolderClick}>
        <FolderIconContainer>
          <PlusIconCircled size={'1.25rem'} color={theme.colors.text.primary} />
        </FolderIconContainer>
        Create Folder
      </BookmarkMenuEntryContainer>
      <ScrollableList>
        {folderList._tag === 'Success' && folderList.value.map((folder) => (
          <BookmarkMenuEntryContainer 
            key={folder.playlist_id}
            onClick={() => handleFolderClick(folder.playlist_id, folder.playlist_name)}
          >
            <FolderIconContainer>
              {folder.inscription_previews.length > 0 ? (
                <InscriptionIcon 
                  size={'1.8rem'}
                  endpoint={`/content/${folder.inscription_previews[0]}`}
                  useBlockIconDefault={false}
                />
              ) : (
                <FolderIcon size={'1.25rem'} color={theme.colors.text.primary} />
              )}
            </FolderIconContainer>
            <FolderName>{folder.playlist_name}</FolderName>
          </BookmarkMenuEntryContainer>
        ))}
        {folderList._tag === 'Initial' && BookmarkListSkeleton()}
      </ScrollableList>
    </BookmarkMenuContainer>
  );
};