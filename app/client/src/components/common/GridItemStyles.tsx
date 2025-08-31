import styled from 'styled-components';
import { Link } from 'react-router-dom';
import theme from '../../styles/theme';

export const UnstyledLink = styled(Link)`
  color: unset;
  text-decoration: unset;
  width: 100%; 
  display: block; 
`;

export const TextLink = styled(Link)`
  color: unset;
  text-decoration: unset;
  display: block; 
  max-width: 100%;
`;

export const ItemContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: .75rem;
  width: 100%;
`;

export const MediaContainer = styled.div`
  background-color: ${theme.colors.background.primary};
  border-radius: .125rem;
  padding: 16% 10%;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 80%;
  height: auto;
  aspect-ratio: 1/1;
  cursor: pointer;
  transition: background-color 200ms ease;
  position: relative;

  &:hover {
    background-color: ${theme.colors.border};
  }
`;

export const ContentOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  height: 100%;
  width: 100%;
  cursor: pointer;
`;

export const ItemText = styled.p`
  font-size: 1rem;
  color: #121212;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.375rem;
  max-width: 100%;
  text-decoration-line: underline;
  text-decoration-color: transparent;
  text-decoration-thickness: 2px;
  text-underline-offset: 2px;

  transition: 
    background-color 200ms ease,
    transform 200ms ease;
  transform-origin: center center;

  &:hover {
    text-decoration-color: #121212;
  }
`;

export const InfoContainer = styled.div<{ applySpace?: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: .5rem;
  width: 100%;
  padding-bottom: ${props => props.applySpace ? '1.625rem' : '0'};
  margin-bottom: 1rem;
`;

export const TagContainer = styled.div`
  display: flex;
  flex-direction: row;
  gap: .25rem;
  width: 100%;
  overflow: hidden; 
  white-space: nowrap; 
  
  /* Prioritize first tag */
  & > *:first-child {
    flex-shrink: 0; /* Don't shrink first tag */
    min-width: 1rem; /* Ensure first tag is always visible */
  }
  
  /* Make remaining tags share available space */
  & > *:not(:first-child) {
    flex-shrink: 1; /* Allow shrinking */
    min-width: 0; /* Allow complete shrinking if needed */
  }
`;