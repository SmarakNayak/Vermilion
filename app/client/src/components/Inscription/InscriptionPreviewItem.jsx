import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { addCommas } from '../../utils/format';
import theme from '../../styles/theme';
import InscriptionIcon from '../InscriptionIcon';

const InscriptionPreviewItem = ({ inscriptionNumber, contentCategory, size = 'half', linkTo }) => {
  if (inscriptionNumber === undefined) return null;
    
  return (
    <ItemLinkWrapper 
      to={`/${linkTo}/${inscriptionNumber}`} 
      size={size}
    >
      <InscriptionItemContainer>
        <PreviewContainer>
          <InscriptionIcon
            endpoint={`/bun/rendered_content_number/${inscriptionNumber}`}
            useBlockIconDefault={false}
            size={'3rem'}
          />
        </PreviewContainer>
        <TextContainer>
          <InscriptionText isMain={true}>
            {addCommas(inscriptionNumber)}
          </InscriptionText>
          <InscriptionText isMain={false}>
            {contentCategory}
          </InscriptionText>
        </TextContainer>
      </InscriptionItemContainer>
    </ItemLinkWrapper>
  );
};

const ItemLinkWrapper = styled(Link)`
  color: unset;
  text-decoration: unset;
  width: ${props => props.size === 'half' ? 'calc(50% - .375rem)' : '100%'};
  box-sizing: border-box;
  min-width: 0;
  
  @media (max-width: 400px) {
    width: 100%;
  }
`;

const InscriptionItemContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
  box-sizing: border-box;
  min-width: 0; 
  transition: opacity 200ms ease;
  
  &:hover {
    opacity: 0.6;
  }
`;

const TextContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
  flex: 1;
  min-width: 0;
`;

const InscriptionText = styled.p`
  font-family: ${theme.typography.fontFamilies.medium};
  font-size: 0.875rem;
  color: ${props => props.isMain ? theme.colors.text.primary : theme.colors.text.secondary};
  line-height: 1.25rem;
  margin: 0;
  padding: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  min-width: 0;
`;

const PreviewContainer = styled.div`
  width: 3rem;
  height: 3rem;
  overflow: hidden;
  border-radius: 0.25rem;
  background-color: ${theme.colors.background.primary};
  display: flex;
  align-items: center;
  justify-content: center;
`;

export default InscriptionPreviewItem;
