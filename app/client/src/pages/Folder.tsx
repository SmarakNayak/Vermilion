import { useParams } from "react-router-dom";
import PageContainer from "../components/layout/PageContainer";
import { Atom, Result, useAtomValue } from "@effect-atom/atom-react";
import { folderAtomFamily, folderInscriptionsAtomFamily, profileFromIdAtomFamily } from "../atoms/familyAtomics";
import GridHeaderSkeleton from "../components/grid/GridHeaderSkeleton";
import { HeaderContainer, MainContentStack, SocialStack } from "../components/grid/Layout";
import InfoText from "../components/common/text/InfoText";
import { Cause } from "effect";
import { flatMap } from "../atoms/atomHelpers";
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
                      <IconButton>
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
            {
              Result.builder(folderInscriptions)
                .onInitial(() => <p>Loading...</p>)
                .onSuccess((inscriptions) => {
                  return (
                    <GridContainer zoomGrid={true}>
                      {inscriptions.map(
                        (entry) => 
                          <GridItemContainer 
                            id={entry.inscription_id} 
                          />
                      )}
                    </GridContainer>
                  )
                })
                .orNull()
            }
          </>
        ))
        .onDefect((defect) => <p>Something went wrong</p>)
        .orNull()
      }
    </PageContainer>
  );
}

export default Folder;