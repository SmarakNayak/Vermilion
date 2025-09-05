import { GridContainer } from "./GalleryInfiniteScroll";
import { foldersAtomFamily } from "../atoms/familyAtomics";
import { useAtomValue, Result } from "@effect-atom/atom-react";
////////////////////////////////////////////////////////////////
import theme from '../styles/theme';
import styled from 'styled-components';
import {
  UnstyledLink,
  TextLink,
  ItemContainer,
  MediaContainer,
  ItemText,
  InfoContainer
} from './common/GridItemStyles';
import { PlaylistPreviewSchema } from '../../../shared/types/playlist';
import type { Schema } from 'effect/Schema';
import { DotGridIcon, GridIcon, ImageBadgeIcon } from './common/Icon';
import { EmptyStateContainer } from "./GalleryInfiniteScroll";
import { FolderIcon } from "./common/Icon";
import GridToggle from "./grid/GridToggle";
import { useState } from "react";
import { RowContainer } from "./grid/Layout";
import Stack from "./Stack";
import { useGridControls } from "../hooks/useGridControls";

const FolderInfo = styled.p`
  color: ${theme.colors.text.secondary};
  font-family: ${theme.typography.fontFamilies.medium};
  font-size: ${theme.typography.fontSize.xs};
  font-style: normal;
  font-weight: 500;
  line-height: normal;
  margin: 0;
`;

const FrontPreview = styled.img<{ renderedSrc: string }>`
  //style
  border-radius: 12px;
  border: 1px solid #E9E9E9;
  background: url(${props => props.renderedSrc}) lightgray 50% / cover no-repeat;
  box-shadow: 0 1px 6px 0 rgba(0, 0, 0, 0.09);
  // stack effect
  width: 70%;
  height: 70%;
  z-index: 3;
  position: absolute;
  transform: scale(1) translate(0%, 5%);
`

const MidPreview = styled.img<{ renderedSrc: string }>`
  //style
  border-radius: 12px;
  border: 1px solid #E9E9E9;
  background: url(${props => props.renderedSrc}) lightgray 50% / cover no-repeat;
  box-shadow: 0 1px 6px 0 rgba(0, 0, 0, 0.09);
  // stack effect
  z-index: 2;
  width: 70%;
  height: 70%;
  position: absolute;
  transform: scale(0.9) translate(0%, -5%);

`

const RearPreview = styled.img<{ renderedSrc: string }>`
  //style
  border-radius: 12px;
  border: 1px solid #E9E9E9;
  background: url(${props => props.renderedSrc}) lightgray 50% / cover no-repeat;
  box-shadow: 0 1px 6px 0 rgba(0, 0, 0, 0.09);
  // stack effect
  z-index: 1;
  width: 70%;
  height: 70%;
  position: absolute;
  transform: scale(0.8) translate(0%, -15%);
`

const FolderItemContainer = ({ folder }: { folder: Schema.Type<typeof PlaylistPreviewSchema> }) => {
  return (
    <ItemContainer>
      <UnstyledLink to={`/folder/${folder.playlist_id}`}>
        <MediaContainer>
          {folder.inscription_previews.length === 0 && FolderIcon({ size: '10rem', color: theme.colors.text.secondary })}
          {folder.inscription_previews[2] && <RearPreview renderedSrc={'/bun/rendered_content/' + folder.inscription_previews[2]} />}
          {folder.inscription_previews[1] && <MidPreview renderedSrc={'/bun/rendered_content/' + folder.inscription_previews[1]} />}
          {folder.inscription_previews[0] && <FrontPreview renderedSrc={'/bun/rendered_content/' + folder.inscription_previews[0]} />}
        </MediaContainer>
      </UnstyledLink>
      <InfoContainer>
        <TextLink to={`/folder/${folder.playlist_id}`}>
          <ItemText>{folder.playlist_name}</ItemText>
        </TextLink>
        <FolderInfo>{folder.count > 0 ? folder.count + ' items' : null}</FolderInfo>
      </InfoContainer>
    </ItemContainer>
  );
}

export const FolderInfiniteScroll = ({ address}: {address: string | undefined }) => {
  const folders = useAtomValue(foldersAtomFamily(address));
  const [zoomGrid, setZoomGrid] = useState(false);
  return (
    <>
      <RowContainer>
        <Stack horizontal={true} center={true} style={{gap: '.75rem'}}>
          <GridToggle value={zoomGrid} onToggle={() => setZoomGrid(!zoomGrid)} />
        </Stack>
      </RowContainer>
      {Result.builder(folders)
        .onInitial(() => <p>Loading...</p>)
        .onSuccess((folders) => (
          <>
            {folders.length === 0 && (
              <EmptyStateContainer>
                <ImageBadgeIcon size={'1.5rem'} color={theme.colors.text.secondary} />
                <h2>No bookmarks found</h2>
                <p>This user has not made any bookmarks</p>
              </EmptyStateContainer>
            )}
            <GridContainer zoomGrid={zoomGrid}>
              {folders.map((folder) => (
                <FolderItemContainer key={folder.playlist_id} folder={folder} />
              ))}
            </GridContainer>
          </>
        ))
        .orNull()}
    </>
  );
};