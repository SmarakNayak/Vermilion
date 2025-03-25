import React from 'react';
import styled, { keyframes } from 'styled-components';
import { theme } from '../../styles/theme';
import InfoText from '../common/text/InfoText';
import Stack from '../Stack';
import {
  HeaderContainer,
  MainContentStack,
  CollectionStack,
  RowContainer,
} from './Layout';

const pulse = keyframes`
  0% {
    background-color: ${theme.colors.background.secondary};
  }
  50% {
    background-color: ${theme.colors.background.primary};
  }
  100% {
    background-color: ${theme.colors.background.secondary};
  }
`;

const SkeletonBase = styled.div`
  background-color: ${theme.colors.background.primary};
  border-radius: 4px;
  animation: ${pulse} 2s ease-in-out infinite;
`;

const SkeletonRect = styled(SkeletonBase)`
  width: ${props => props.width || '100%'};
  height: ${props => props.height || '1rem'};
`;

export const GridHeaderSkeleton = ({ pageType, hasDescription, numTags }) => (
  <>
    <HeaderContainer>
      <MainContentStack>
        <InfoText>{pageType}</InfoText>
        <CollectionStack>
          <SkeletonRect width={'8rem'} height={'8rem'} />
          <Stack gap={'.5rem'}>
            <SkeletonRect width={'12rem'} height={'2.5rem'} />
            <SkeletonRect width={'8rem'} height={'1.25rem'} />
          </Stack>
        </CollectionStack>
      </MainContentStack>
    </HeaderContainer>
    {hasDescription && (
      <RowContainer>
        <SkeletonRect width={'90%'} height={'3rem'} />
      </RowContainer>
    )}
    <RowContainer style={{gap: '.5rem', flexFlow: 'wrap'}}>
      {[...Array(numTags)].map((_, index) => (
        <SkeletonRect key={index} width={'10rem'} height={'1.75rem'} />
      ))}
    </RowContainer>
  </>
);

export default GridHeaderSkeleton;
