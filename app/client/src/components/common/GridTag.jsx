import React from 'react';
import styled from 'styled-components';
import { Link } from "react-router-dom";
import theme from '../../styles/theme';

const GridTag = ({ category, color, icon, islarge, link, value }) => {
  // Create the inner content that will be the same regardless of link status
  const tagContent = (
    <>
      {icon && icon}
      <TagSpan islarge={islarge} isValue={true} color={color}>{value}</TagSpan>
      {category && (
        <TagSpan islarge={islarge}>{' • ' + category}</TagSpan>
      )}
    </>
  );

  // Conditionally return either a linked version or a non-linked version
  return link ? (
    <UnstyledLink to={link}>
      <TagContainer>
        {tagContent}
      </TagContainer>
    </UnstyledLink>
  ) : (
    <TagContainer>
      {tagContent}
    </TagContainer>
  );
};
  
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
  background-color: ${theme.colors.background.primary};
  transition: 
    background-color 200ms ease,
    transform 200ms ease;
  transform-origin: center center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
  width: fit-content;

  &:hover {
    background-color: ${theme.colors.border};
  }

  &:active {
    transform: scale(0.96);
  }
`;

const TagSpan = styled.span`
  font-size: ${props => props.islarge ? '1rem' : '.875rem'};
  color: ${props => props.color};
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
  flex: 0 1 auto; /* Allow shrinking */
  white-space: nowrap;
  min-width: 0; /* Critical for text truncation */
`;

const UnstyledLink = styled(Link)`
  color: unset;
  text-decoration: unset;
  display: inline-block;
  max-width: 100%;
`;

export default GridTag;
