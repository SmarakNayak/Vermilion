import { GridContainer } from "./GalleryInfiniteScroll";
import { foldersAtomFamily } from "../atoms/familyAtomics";
import { useAtomValue, Result } from "@effect-atom/atom-react";
////////////////////////////////////////////////////////////////
import React from 'react';
import styled from 'styled-components';
import GridTag from './common/GridTag';
import theme from '../styles/theme';
import {
  UnstyledLink,
  TextLink,
  ItemContainer,
  MediaContainer,
  ContentOverlay,
  ItemText,
  InfoContainer,
  TagContainer
} from './common/GridItemStyles';
import { PlaylistPreviewSchema } from '../../../shared/types/playlist';
import type { Schema } from 'effect/Schema';
import { ImageBadgeIcon } from './common/Icon';
import { EmptyStateContainer } from "./GalleryInfiniteScroll";

const FolderItemContainer = ({ folder }: { folder: Schema.Type<typeof PlaylistPreviewSchema> }) => {
  return (
    <ItemContainer>
      <UnstyledLink to={`/folder/${folder.playlist_id}`}>
        <MediaContainer>
          <p>{folder.playlist_name}</p>
        </MediaContainer>
      </UnstyledLink>
      <InfoContainer>
        <TextLink to={`/folder/${folder.playlist_id}`}>{folder.playlist_name}</TextLink>
        <p>13 items</p>
      </InfoContainer>
    </ItemContainer>
  );
}

export const FolderInfiniteScroll = ({ address}: {address: string | undefined }) => {
  const folders = useAtomValue(foldersAtomFamily(address));
  return (
    Result.builder(folders)
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
          <GridContainer>
            {folders.map((folder) => (
              <FolderItemContainer key={folder.playlist_id} folder={folder} />
            ))}
          </GridContainer>
        </>
      ))
      .orNull()
  );
};