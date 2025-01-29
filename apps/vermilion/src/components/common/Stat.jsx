import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { ArrowSquareIcon, CopyIcon } from './Icon';

export const Stat = ({ category, isLarge, value }) => (
  <StatContainer>
    <StatSpan isLarge={isLarge} isValue={true}>{value}</StatSpan>
    {category && (
      <StatSpan isLarge={isLarge}>{' • ' + category}</StatSpan>
    )}
  </StatContainer>
);

const StatContainer = styled.button`
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

const StatSpan = styled.span`
  font-size: ${props => props.isLarge ? '1rem' : '.875rem'};
  color: ${props => props.isValue ? '#000000' : '#959595'};
  overflow: hidden;
  text-overflow: ellipsis;
`;
