import React from 'react';
import styled from 'styled-components';
import { theme } from '../../../styles/theme';

const StyledButton = styled.button<{ gap?: string | undefined}>`
  width: 2.75rem;
  height: 2.75rem;
  min-width: 2.75rem;
  min-height: 2.75rem;
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

interface IconButtonProps {
  onClick?: () => void;
  children: React.ReactNode;
  gap?: string;
  [key: string]: any;
}

const IconButton = ({ 
  onClick, 
  children, 
  gap,
  ...props 
}: IconButtonProps) => {
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