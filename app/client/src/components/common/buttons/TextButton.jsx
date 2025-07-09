import React from 'react';
import styled from 'styled-components';
import { theme } from '../../../styles/theme';

const StyledButton = styled.button`
  height: 2.75rem;
  min-height: 2.75rem;
  padding: 0 0.8125rem;
  border-radius: 1.375rem;
  border: none;
  margin: 0;
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 0.5rem;
  font-family: ${theme.typography.fontFamilies.medium};
  font-size: 1rem;
  line-height: 1.5rem;
  color: ${theme.colors.text.primary};
  cursor: pointer;
  background-color: ${theme.colors.background.primary};
  transition: all 200ms ease;
  transform-origin: center center;

  &:hover {
    background-color: ${theme.colors.background.secondary};
  }

  &:active {
    transform: scale(0.98);
  }
`;

const TextButton = ({ 
  onClick, 
  children, 
  gap,
  ...props 
}) => {
  return (
    <StyledButton 
      onClick={onClick} 
      gap={gap}
      {...props}
    >
      {children}
    </StyledButton>
  );
};

export default TextButton;
