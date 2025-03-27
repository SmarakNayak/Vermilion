import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { CopyIcon } from '../components/common/Icon';
import { addCommas } from '../utils/format'
import { copyText } from '../utils/clipboard'
import theme from '../styles/theme';

const CopyTag = ({ category, copy, isLarge, value }) => (
  <TagContainer onClick={() => copyText(copy)}>
    <TagSpan isLarge={isLarge} isValue={true}>{value}</TagSpan>
    {category && (
      <TagSpan isLarge={isLarge}>{' • ' + category}</TagSpan>
    )}
    <CopyIcon size='1rem' color={theme.colors.text.secondary} />
  </TagContainer>
);

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
    background-color 350ms ease,
    transform 150ms ease;
  transform-origin: center center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;

  &:hover {
    background-color: ${theme.colors.background.secondary};
  }

  &:active {
    transform: scale(0.96);
  }
`;

const TagSpan = styled.span`
  font-size: ${props => props.isLarge ? '1rem' : '.875rem'};
  color: ${props => props.isValue ? theme.colors.text.primary : theme.colors.text.secondary};
  overflow: hidden;
  text-overflow: ellipsis;
`;

const UnstyledLink = styled(Link)`
  color: unset;
  text-decoration: unset;
`;

export default CopyTag;
