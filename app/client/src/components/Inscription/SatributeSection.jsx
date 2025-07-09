import React from 'react';
import styled from 'styled-components';
import { addCommas, formatEditionRange } from '../../utils/format';
import theme from '../../styles/theme';

const SatributeSection = ({ satributes, satributeEditions }) => {
  if (!satributes || satributes.length === 0) return null;
  
  return (
    <Container>
      {satributes.map(satribute => {
        const editionInfo = satributeEditions?.find(se => se.satribute === satribute);
        return (
          <TagContainer key={satribute}>
            <TagSpan isValue={true}>{satribute}</TagSpan>
            {editionInfo && (
              <TagSpan>
                {addCommas(editionInfo.satribute_edition) + '/' + addCommas(editionInfo.total)}
              </TagSpan>
            )}
          </TagContainer>
        );
      })}
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 0.5rem;
`;

const TagContainer = styled.button`
  border-radius: .25rem;
  border: none;
  padding: .25rem .5rem;
  margin: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  gap: .25rem;
  font-family: ${theme.typography.fontFamilies.medium};
  font-size: .875rem;
  background-color: ${theme.colors.background.primary};
  transition: all 200ms ease;
  transform-origin: center center;

  &:hover {
    background-color: ${theme.colors.background.secondary};
  }

  &:active {
    transform: scale(0.96);
  }
`;

const TagSpan = styled.span`
  color: ${props => props.isValue ? theme.colors.text.primary : theme.colors.text.secondary};
`;

export default SatributeSection;
