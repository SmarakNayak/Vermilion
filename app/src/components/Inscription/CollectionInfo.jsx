import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { RibbonIcon, RuneIcon, LayersIcon, RepeatIcon, Person2Icon, SproutIcon, ChevronUpDuoIcon } from '../common/Icon';
import Stack from '../Stack';
import { addCommas } from '../../utils/format';
import theme from '../../styles/theme';

const CollectionInfo = ({ metadata, editionNumber, editionCount, childrenInscriptions }) => {
  return (
    <Container>
      {metadata?.collection_name && (
        <CollectionWrapper>
          <CollectionLink to={`/collection/${metadata.collection_symbol}`}>
            <CollectionContainer>
              <CollectionText>
                {metadata.collection_name}
              </CollectionText>
              <IconWrapper>
                <RibbonIcon size={'1.25rem'} color={theme.colors.background.verm} />
              </IconWrapper>
            </CollectionContainer>
          </CollectionLink>
        </CollectionWrapper>
      )}
      
      {metadata?.spaced_rune && (
        <RuneWrapper>
          <RuneContainer isRune={true}>
            <IconWrapper isRune={true}>
              <RuneIcon size={'1.25rem'} color={theme.colors.background.purp} />
            </IconWrapper>
            <CollectionText>
              {metadata.spaced_rune}
            </CollectionText>
          </RuneContainer>
        </RuneWrapper>
      )}
      
      <NumberText>
        {metadata?.off_chain_metadata?.name 
          ? metadata.off_chain_metadata.name 
          : metadata?.number !== undefined && metadata.number !== null 
            ? addCommas(metadata.number) 
            : ""}
      </NumberText>
      
      {(metadata?.delegate || metadata?.is_recursive || 
        (metadata?.parents && metadata?.parents.length > 0) || 
        (childrenInscriptions && childrenInscriptions.length > 0)) && (
        <TagsRow horizontal gap=".5rem" style={{flexWrap: 'wrap'}}>
          {metadata?.delegate && (
            <TagContainer>
              <ChevronUpDuoIcon size={'1.125rem'} color={theme.colors.text.secondary} />
              Boost
            </TagContainer>
          )}
          {metadata?.is_recursive && (
            <TagContainer>
              <RepeatIcon size={'1.125rem'} color={theme.colors.text.secondary} />
              Recursive
            </TagContainer>
          )}
          {childrenInscriptions?.length > 0 && (
            <TagContainer>
              <Person2Icon size={'1.125rem'} color={theme.colors.text.secondary} />
              Parent
            </TagContainer>
          )}
          {metadata?.parents?.length > 0 && (
            <TagContainer>
              <SproutIcon size={'1.125rem'} color={theme.colors.text.secondary} />
              Child
            </TagContainer>
          )}
        </TagsRow>
      )}
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  width: 100%;
`;

const CollectionWrapper = styled.div`
  width: 100%;
  max-width: 100%;
`;

const CollectionLink = styled(Link)`
  display: inline-block;
  max-width: 100%;
  color: unset;
  text-decoration: unset;
`;

const CollectionContainer = styled.div`
  display: inline-flex;
  flex-direction: row;
  align-items: center;
  box-sizing: border-box;
  background-color: ${theme.colors.background.primary};
  padding: .25rem .5rem;
  border-radius: .25rem;
  font-family: ${theme.typography.fontFamilies.medium};
  font-size: 1rem;
  color: ${props => props.isRune ? theme.colors.background.purp : theme.colors.background.verm}; 
  max-width: 100%;
  width: 100%;
  cursor: pointer;
  transition: all 200ms ease;
  transform-origin: center center;

  &:hover {
    background-color: ${theme.colors.background.secondary};
  }
`;

const RuneWrapper = styled.div`
  display: inline-block;
  max-width: 100%;
`;

const RuneContainer = styled(CollectionContainer)`
  width: auto;
`;

const CollectionText = styled.span`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
  min-width: 0;
  max-width: calc(100% - 1.5rem);
`;

const IconWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin: ${props => props.isRune ? '0 .25rem 0 0' : '0 0 0 .25rem'}; 
  width: 1.25rem;
`;

const NumberText = styled.h1`
  font-family: ${theme.typography.fontFamilies.bold};
  color: ${theme.colors.text.primary};
  font-size: 2em;
  margin: 0;
`;

const TagsRow = styled(Stack)`
  flex-direction: row;
  flex-wrap: wrap;
  gap: 0.5rem;
`;

const TagContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  background-color: ${theme.colors.background.primary};
  font-family: ${theme.typography.fontFamilies.medium};
  color: ${theme.colors.text.secondary};
  font-size: .875rem;
  transition: all 200ms ease;
  transform-origin: center center;
  cursor: pointer;

  &:hover {
    background-color: ${theme.colors.background.secondary};
  }
  &:active {
    transform: scale(0.96);
  }
`;

const TagIcon = styled.span`
  width: 1.125rem;
  height: 1.125rem;
`;

const EditionText = styled.p`
  font-family: ${theme.typography.fontFamilies.medium};
  font-size: 0.875rem;
  color: ${theme.colors.text.secondary};
  margin: 0;
`;

export default CollectionInfo;
