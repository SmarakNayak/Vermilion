import React from 'react';
import styled, { keyframes } from 'styled-components';
import theme from '../styles/theme';

const Spinner = () => {
  return <SpinnerContainer />;
};

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const SpinnerContainer = styled.div`
  width: 1.25rem;
  height: 1.25rem;
  border: .25rem solid ${theme.colors.background.primary};
  border-top: .1875rem solid ${theme.colors.text.secondary};
  border-radius: 50%;
  animation: ${spin} 1s linear infinite;
`;

export default Spinner;
