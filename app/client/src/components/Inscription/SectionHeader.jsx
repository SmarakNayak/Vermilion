import React from 'react';
import styled from 'styled-components';
import { ChevronUpSmallIcon, ChevronDownSmallIcon } from '../common/Icon';
import theme from '../../styles/theme';

const SectionHeader = ({ section, icon, title, isVisible, onToggle }) => (
  <HeaderContainer onClick={() => onToggle(section)}>
    <TextSpan>
      {icon}
      {title}
    </TextSpan>
    {isVisible ? (
      <ChevronUpSmallIcon size={'1.25rem'} color={theme.colors.text.primary} />
    ) : (
      <ChevronDownSmallIcon size={'1.25rem'} color={theme.colors.text.primary} />
    )}
  </HeaderContainer>
);

const HeaderContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  height: 3rem;
  background-color: ${theme.colors.background.white};
  padding: 0 1rem;
  border-radius: 1.5rem;
  cursor: pointer;
  transition: all 200ms ease;
  transform-origin: center center;
  user-select: none;

  &:hover {
    background-color: ${theme.colors.background.primary};
  }
`;

const TextSpan = styled.span`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: .5rem;
  font-family: ${theme.typography.fontFamilies.medium};
  font-size: 1rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%;
`;

export default SectionHeader;
