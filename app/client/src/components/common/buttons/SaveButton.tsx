import styled from 'styled-components';
import { theme } from '../../../styles/theme';

export const SaveButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  height: 2.5rem;
  min-height: 2.5rem;
  border-radius: 0.75rem; 
  border: none;
  font-family: ${theme.typography.fontFamilies.medium};
  font-size: 1rem;
  line-height: 1.25rem;
  color: ${theme.colors.background.white};
  padding: 1rem;
  margin: 0;
  cursor: pointer;
  background-color: ${theme.colors.background.dark};
  transition: all 200ms ease;
  transform-origin: center center;

  &:hover:not(:disabled) {
    opacity: 0.75;
  }

  &:active:not(:disabled) {
    transform: scale(0.98);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;