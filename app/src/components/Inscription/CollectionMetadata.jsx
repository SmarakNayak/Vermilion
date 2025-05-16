import React from 'react';
import styled from 'styled-components';
import Tag from '../Tag';
import theme from '../../styles/theme';
import { BorderedTagSection } from './Layout';

const CollectionMetadata = ({ offchainAttributes, onchainAttributes }) => {
  const hasOffchainAttributes = offchainAttributes && offchainAttributes.length > 0;
  const hasOnchainAttributes = onchainAttributes && Object.keys(onchainAttributes).length > 0;
  
  if (!hasOffchainAttributes && !hasOnchainAttributes) return null;

  return (
    <Container>
      {hasOnchainAttributes && (
        <SectionContainer>
          <HeaderText>Onchain Metadata</HeaderText>
          <BorderedTagSection>
            <TagSection>
              {Object.entries(onchainAttributes).map(([key, value], index) => {
                // Skip entries that are arrays or objects
                if (Array.isArray(value) || (typeof value === 'object' && value !== null)) {
                  return null;
                }
                
                return (
                  <Tag 
                    key={`onchain-${index}`} 
                    value={String(value)} 
                    category={key} 
                  />
                );
              }).filter(Boolean)}
            </TagSection>
          </BorderedTagSection>
        </SectionContainer>
      )}
      
      {hasOffchainAttributes && (
        <SectionContainer>
          <HeaderText>Offchain Metadata</HeaderText>
          <BorderedTagSection>
            <TagSection>
              {offchainAttributes.map((attribute, index) => (
                <Tag 
                  key={`offchain-${index}`} 
                  value={attribute.value} 
                  category={attribute.trait_type} 
                />
              ))}
            </TagSection>
          </BorderedTagSection>
        </SectionContainer>
      )}
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const SectionContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const TagSection = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 0.5rem;
  width: 100%;
  
  & > button {
    max-width: 100%;
  }
`;

const InfoText = styled.p`
  font-family: ${theme.typography.fontFamilies.medium};
  font-size: .875rem;
  color: ${theme.colors.text.secondary};
  margin: 0;
  padding: 0;
`;

const HeaderText = styled.p`
  font-family: ${theme.typography.fontFamilies.medium};
  color: ${theme.colors.text.secondary};
  font-size: .875rem;
  line-height: 1.25rem;
  margin: 0;
  padding: 0;
`;

export default CollectionMetadata;
