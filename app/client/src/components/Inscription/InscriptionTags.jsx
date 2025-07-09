import React from 'react';
import styled from 'styled-components';
import LinkTag from '../LinkTag';
import { addCommas } from '../../utils/format';

const InscriptionTags = ({ data, limit = 6 }) => {
  if (!data || data.length === 0) return null;
  
  const displayedTags = data.slice(0, limit);
  
  return (
    <TagsContainer>
      {displayedTags.map((item, index) => (
        <LinkTag 
          key={`tag-${item.number}-${index}`}
          hideIcon={true} 
          link={`/inscription/${item.number}`} 
          value={addCommas(item.number)} 
          category={item.content_category} 
        />
      ))}
    </TagsContainer>
  );
};

const TagsContainer = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 0.5rem;
`;

export default InscriptionTags;