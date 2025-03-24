import React from 'react';
import styled from 'styled-components';
import { theme } from '../../../styles/theme';

const StyledButton = styled.button`
  height: 2.75rem;
  width: 2.75rem;
  border-radius: 1.375rem;
  border: none;
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  gap: ${props => props.gap || '0'};
  background-color: ${theme.colors.background.primary};
  transition: all 200ms ease;
  transform-origin: center center;

  &:hover {
    background-color: ${theme.colors.background.secondary};
  }

  &:active {
    transform: scale(0.96);
  }
`;

const IconButton = ({ 
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

export default IconButton;
