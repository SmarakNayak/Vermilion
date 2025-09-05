import styled, { keyframes } from 'styled-components';
import * as Toast from '@radix-ui/react-toast';
import theme from '../../styles/theme';

// Toast animations
const slideIn = keyframes`
  from {
    transform: translateY(100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
`;

const slideOut = keyframes`
  from {
    transform: translateY(0);
    opacity: 1;
  }
  to {
    transform: translateY(100%);
    opacity: 0;
  }
`;

export const StyledToastViewport = styled(Toast.Viewport)`
  position: fixed;
  bottom: 0;
  right: 0;
  display: flex;
  flex-direction: column;
  padding: 1.5rem;
  gap: 0.625rem;
  max-width: 100vw;
  margin: 0;
  list-style: none;
  z-index: 2147483647;
  outline: none;
`;

export const StyledToastRoot = styled(Toast.Root)`
  height: 2.75rem;
  width: auto;
  border-radius: 1.375rem;
  background-color: ${theme.colors.background.dark};
  box-shadow: rgba(10, 10, 10, 0.1) 0px 4px 8px 0px;
  padding: 0 1rem;
  display: flex;
  align-items: center;
  
  &[data-state='open'] {
    animation: ${slideIn} 200ms ease-out;
  }
  
  &[data-state='closed'] {
    animation: ${slideOut} 200ms ease-in;
  }
`;

export const StyledToastContent = styled.div`
  display: flex;
  align-items: center;
  gap: 0.375rem;
`;

export const ToastText = styled.span`
  font-family: ${theme.typography.fontFamilies.medium};
  font-size: 1rem;
  line-height: 1.25rem;
  color: ${theme.colors.text.white};
`;