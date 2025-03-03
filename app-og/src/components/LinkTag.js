import React from 'react';
import styled from 'styled-components';
import { Link } from "react-router-dom";
import { addCommas } from '../helpers/utils';
import ArrowSquareIcon from '../assets/icons/ArrowSquareIcon';

const LinkTag = ({ category, hideIcon, isLarge, link, value }) => (
  <UnstyledLink to={link} {...(!hideIcon && { target: '_blank' })}>
    <TagContainer>
      <TagSpan isLarge={isLarge} isValue={true}>{value}</TagSpan>
      {category && (
        <TagSpan isLarge={isLarge}>{' • ' + category}</TagSpan>
      )}
      {!hideIcon && (
        <ArrowSquareIcon svgSize='1rem' svgColor='#959595' />
      )}
    </TagContainer>
  </UnstyledLink>
);

const TagContainer = styled.button`
  border-radius: .5rem;
  border: none;
  padding: .25rem .5rem;
  margin: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  gap: .25rem;
  font-family: Relative Trial Medium;
  background-color: #F5F5F5;
  transition: 
    background-color 350ms ease,
    transform 150ms ease;
  transform-origin: center center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;

  &:hover {
    background-color: #E9E9E9;
  }

  &:active {
    transform: scale(0.96);
  }
`;

const TagSpan = styled.span`
  font-size: ${props => props.isLarge ? '1rem' : '.875rem'};
  color: ${props => props.isValue ? '#000000' : '#959595'};
  overflow: hidden;
  text-overflow: ellipsis;
`;

const UnstyledLink = styled(Link)`
  color: unset;
  text-decoration: unset;
`;

export default LinkTag;