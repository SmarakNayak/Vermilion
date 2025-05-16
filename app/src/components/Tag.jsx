import React from 'react';
import styled from 'styled-components';
import { Link } from "react-router-dom";
import theme from '../styles/theme';

const Tag = ({ category, isLarge, value }) => (
  <TagContainer>
    <InnerContainer>
      <ValueSpan isLarge={isLarge}>{value}</ValueSpan>
      {category && (
        <>
          <CategorySpan isLarge={isLarge}>
            •
          </CategorySpan>
          <CategorySpan isLarge={isLarge}>{category}</CategorySpan>
        </>
      )}
    </InnerContainer>
  </TagContainer>
);

const TagContainer = styled.button`
  border-radius: .25rem;
  border: none;
  padding: .25rem .5rem;
  margin: 0;
  display: block;
  cursor: pointer;
  font-family: ${theme.typography.fontFamilies.medium};
  background-color: ${theme.colors.background.primary};
  transition: all 200ms ease;
  transform-origin: center center;
  max-width: 100%;
  width: fit-content;
  overflow: hidden;

  &:hover {
    background-color: ${theme.colors.background.secondary};
  }

  &:active {
    transform: scale(0.96);
  }
`;

const InnerContainer = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
  overflow: hidden;
  gap: 0.25rem;
`;

const ValueSpan = styled.span`
  font-size: ${props => props.isLarge ? '1rem' : '.875rem'};
  color: ${theme.colors.text.primary};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  min-width: 0;
  flex: 1 1 auto;
  max-width: 100%;
`;

const CategorySpan = styled.span`
  font-size: ${props => props.isLarge ? '1rem' : '.875rem'};
  color: ${theme.colors.text.secondary};
  white-space: nowrap;
  flex: 0 0 auto;
`;

export default Tag;
