import styled, { keyframes } from 'styled-components';
import { theme } from '../../../styles/theme';

const pulse = keyframes`
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: .5;
  }
`;

export const SkeletonElement = styled.div<{
  radius?: string;
  height: string;
  width: string;
}>`
  background-color: ${theme.colors.background.primary};
  animation: ${pulse} 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  border-radius: ${(props) => props.radius || '0.5rem'};
  height: ${(props) => props.height};
  width: ${(props) => props.width};
  max-width: 100%;
`;

