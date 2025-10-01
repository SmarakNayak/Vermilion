import { useParams } from "react-router-dom";
import PageContainer from "../components/layout/PageContainer";
import { Atom, Result, useAtomValue, useAtomSet } from "@effect-atom/atom-react";
import { folderAtomFamily, folderInscriptionsAtomFamily, profileFromIdAtomFamily } from "../atoms/familyAtomics";
import GridHeaderSkeleton from "../components/grid/GridHeaderSkeleton";
import { HeaderContainer, MainContentStack, RowContainer, SocialStack } from "../components/grid/Layout";
import InfoText from "../components/common/text/InfoText";
import { Cause, Exit, Option } from "effect";
import { flatMap, cleanErrorExit } from "../atoms/atomHelpers";
import MainText from "../components/common/text/MainText";
import { ItemText, TextLink } from "../components/common/GridItemStyles";
import styled from "styled-components";
import { AvatarCircleIcon, CheckIcon, EditIcon, LinkIcon } from "../components/common/Icon";
import Tooltip from '../components/common/Tooltip';
import IconButton from "../components/common/buttons/IconButton";
import theme from "../styles/theme";
import { useAuth } from "../hooks/useAuth";
import { useCopy } from "../hooks/useCopy";
import { GridContainer } from "../components/GalleryInfiniteScroll";
import GridItemContainer from "../components/GridItemContainer";
import { BookmarkModal } from "../components/modals/BookmarkModal";
import { useModal } from "../hooks/useModal";
import GridControls from "../components/grid/GridControls";
import { useGridControls } from "../hooks/useGridControls";
import { AuthSocialClient, getErrorMessage } from "../api/EffectApi";
import { toast } from "sonner";
import { DeleteConfirmModal } from "../components/modals/DeleteConfirmModal";
import { useState } from "react";

const profileFromFolderAtomFamily = Atom.family((folderId?: string) =>
  Atom.make((get) => {
    if (!folderId) return Result.failure(Cause.die("No folder ID provided"));
    const folderResult = get(folderAtomFamily(folderId));
    const profileResult = flatMap(folderResult, (folder) => {
      return get(profileFromIdAtomFamily(folder.user_id));
    });
    return profileResult;
  })
);

const CreatedByContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ProfileContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;

const ProfilePictureSmall = styled.img`
  width: 24px;
  height: 24px;
  object-fit: cover;
  border-radius: 50%;
`;

const ButtonWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  margin: 0;
`;

const Folder = () => {
  const { folderId } = useParams<{ folderId: string }>();
  const folder = useAtomValue(folderAtomFamily(folderId));
  const folderInscriptions = useAtomValue(folderInscriptionsAtomFamily(folderId));
  const userProfile = useAtomValue(profileFromFolderAtomFamily(folderId));
  const auth = useAuth();
  const { copied, copy } = useCopy();
  const { isOpen: isEditModalOpen, open: openEditModal, close: closeEditModal } = useModal();
  const { isOpen: isDeleteModalOpen, open: openDeleteModal, close: closeDeleteModal } = useModal();
  const { zoomGrid, numberVisibility, toggleNumberVisibility, toggleGridType } = useGridControls();

  const [inscriptionToDelete, setInscriptionToDelete] = useState<string | null>(null);
  const deleteFromPlaylist = useAtomSet(AuthSocialClient.mutation("playlists", "deletePlaylistInscriptions"), { mode: 'promiseExit' });

  const handleRemoveInscription = async (inscriptionId: string | null) => {
    if (!folderId) return;
    if (!inscriptionId) return;

    const result = await deleteFromPlaylist({
      path: { playlist_id: folderId },
      payload: [inscriptionId],
      reactivityKeys: [folderId]
    });

    result.pipe(
      cleanErrorExit,
      Exit.match({
        onSuccess: () => {
          toast.success("Inscription removed from folder successfully!");
          closeDeleteModal();
        },
        onFailure: (cause) => {
          toast.error(`Failed to remove inscription from folder${getErrorMessage(cause)}`);
        },
      })
    );
  };

  const openConfirmDelete = (inscriptionId: string) => {
    openDeleteModal();
    setInscriptionToDelete(inscriptionId);
  }

  // Check if the current user owns this folder
  const canEdit = folder._tag === 'Success' &&
                  auth.state === 'signed-in-with-profile' &&
                  auth.profile.user_id === folder.value.user_id;

  return (
    <PageContainer>
      {Result.builder(folder)
        .onInitial(() => 
          <GridHeaderSkeleton 
            pageType={'Bookmark Folder'} 
            isProfile={true}
            removeInfoText={true}
            hasDescription={false} 
            numTags={0}
            removeTags={true}
          />
        )
        .onErrorTag('NotFound', () => <p>Folder not found</p>)
        .onSuccess((folderData) => (
          <>
            <HeaderContainer>
              <MainContentStack>
                <InfoText>{'Bookmark Folder'}</InfoText>
                <MainText>{folderData.playlist_name}</MainText>
                {userProfile._tag === 'Success' ? (
                  <CreatedByContainer>
                    <InfoText>{'Created by'}</InfoText>
                    <ProfileContainer>
                      {userProfile.value.user_picture._tag === 'Some' && userProfile.value.user_picture.value !== '' ? 
                        <ProfilePictureSmall src={'/bun/rendered_content/' + userProfile.value.user_picture.value}/> :
                        <AvatarCircleIcon size={'24px'} color={'#C4C4C4'}/>
                      }
                      <TextLink to={'/address/'+ userProfile.value.user_addresses[0]}><ItemText>{userProfile.value.user_handle}</ItemText></TextLink>
                    </ProfileContainer>
                  </CreatedByContainer>
                ) : null}
              </MainContentStack>
              <SocialStack>
                {(auth.state === 'signed-in-with-profile' && auth.profile.user_id === folderData.user_id) ? (
                  <Tooltip content={"Edit Folder"}>
                    <ButtonWrapper>
                      <IconButton onClick={openEditModal}>
                        <EditIcon size={'1.25rem'} color={theme.colors.text.primary} />
                      </IconButton>
                    </ButtonWrapper>
                  </Tooltip>
                ) : (
                  <Tooltip content={
                    auth.state === 'signed-in-with-profile'
                    ? "Sign in to the correct account to edit this folder"
                    : "Sign in to edit this folder"
                  }>
                    <ButtonWrapper>
                      <IconButton>
                        <EditIcon size={'1.25rem'} color={theme.colors.text.tertiary} />
                      </IconButton>
                    </ButtonWrapper>
                  </Tooltip>
                )}
                <Tooltip content={"Copy Folder Link"}>
                  <ButtonWrapper>
                    <IconButton onClick={() => {copy(window.location.href)}}>
                      {copied ? <CheckIcon size={'1.25rem'} color={theme.colors.background.success} /> : <LinkIcon size={'1.25rem'} />}
                    </IconButton>
                  </ButtonWrapper>
                </Tooltip>
              </SocialStack>
            </HeaderContainer>
            {Option.isSome(folderData.playlist_description) && folderData.playlist_description.value !=='' && (
              <RowContainer>
                <InfoText islarge={true}>{folderData.playlist_description.value}</InfoText>
              </RowContainer>
            )}
            <GridControls
              numberVisibility={numberVisibility}
              toggleNumberVisibility={toggleNumberVisibility}
              zoomGrid={zoomGrid}
              toggleGridType={toggleGridType}
              handleSortOptionChange={() => {}}
              filtersEnabled={false}
              initialOption={'newest'}
              includeRelevance={false}
              sortByEnabled={false}
            />
            {Result.builder(folderInscriptions)
              .onInitial(() => <p>Loading...</p>)
              .onSuccess((inscriptions) => {
                return (
                  <GridContainer zoomGrid={zoomGrid}>
                    {inscriptions.map((entry) => (
                      <GridItemContainer
                        collection={entry.collection_name}
                        collection_symbol={entry.collection_symbol}
                        content_length={entry.content_length}
                        id={entry.id}
                        is_boost={entry.delegate}
                        is_child={entry.parents.length > 0}
                        is_recursive={entry.is_recursive}
                        isCollectionPage={false}
                        item_name={(entry.off_chain_metadata as any)?.name}
                        key={entry.number}
                        number={entry.number}
                        numberVisibility={numberVisibility}
                        rune={entry.spaced_rune}
                        showInlineActionDropdown={canEdit}
                        onDeleteClick={() => openConfirmDelete(entry.id)}
                      />
                    ))}
                  </GridContainer>
                )
              })
              .orNull()
            }
            <DeleteConfirmModal 
              isOpen={isDeleteModalOpen} 
              onClose={closeDeleteModal}
              onDelete={() => {handleRemoveInscription(inscriptionToDelete)}}
              modalText="You may add this inscription back later if you'd like."
              buttonText="Remove inscription"
            />
          </>
        ))
        .onDefect((defect) => <p>Something went wrong</p>)
        .orNull()
      }
      {folderId && (
        <BookmarkModal 
          isOpen={isEditModalOpen} 
          onClose={closeEditModal}
          mode="edit" 
          folderId={folderId} 
        />
      )}
    </PageContainer>
  );
}

export default Folder;