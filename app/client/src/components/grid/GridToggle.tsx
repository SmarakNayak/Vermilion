import React from 'react';
import styled from 'styled-components';
import { theme } from '../../styles/theme';
import { GridIcon, DotGridIcon } from '../common/Icon';

interface GridToggleProps {
  value: boolean;
  onToggle: (value: boolean) => void;
  size?: string;
}

const GridToggle = ({ value, onToggle, size = '1.125rem' }: GridToggleProps) => (
  <ToggleContainer>
    <SlidingBackground active={value} />
    <GridButton
      onClick={() => onToggle(!value)}
      active={value}
      aria-label="Grid view"
    >
      <GridIcon size={size} />
    </GridButton>
    <DotButton
      onClick={() => onToggle(!value)}
      active={!value}
      aria-label="Dot view"
    >
      <DotGridIcon size={size} />
    </DotButton>
  </ToggleContainer>
);

const ToggleContainer = styled.div`
  position: relative;
  height: 2.75rem;
  min-height: 2.75rem;
  padding: .125rem;
  display: flex;
  flex-direction: row;
  align-items: center;
  background-color: ${theme.colors.background.primary};
  border-radius: 1.375rem;
  box-sizing: border-box;
  border: none;
  margin: 0;
  width: 6.75rem;
  overflow: hidden;
`;

const SlidingBackground = styled.div<{ active: boolean }>`
  position: absolute;
  top: 0.125rem;
  left: ${({ active }) => (active ? '0.125rem' : 'calc(50%)')};
  width: 3.25rem;
  height: 2.5rem;
  background: ${theme.colors.background.white};
  border-radius: 1.25rem;
  transition: left 200ms cubic-bezier(.4,0,.2,1);
  z-index: 1;
`;

const GridButton = styled.button<{ active: boolean }>`
  z-index: 2;
  width: 3.25rem;
  min-width: 3.25rem;
  height: 2.5rem;
  min-height: 2.5rem;
  border-radius: 1.625rem;
  border: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  background: transparent;
  transition: color 200ms;
  svg {
    fill: ${({ active }) => active ? theme.colors.text.primary : theme.colors.text.secondary};
    transition: fill 200ms;
  }
`;

const DotButton = styled(GridButton)`
  // Inherit all styles from GridButton
`;

export default GridToggle;