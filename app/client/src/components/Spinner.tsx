import styled, { keyframes } from 'styled-components';
import theme from '../styles/theme';

const Spinner = ({ isButton = false }: {isButton?: boolean}) => {
  return <SpinnerContainer isButton={isButton} />;
};

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const SpinnerContainer = styled.div<{isButton: boolean}>`
  width: ${props => (props.isButton ? '0.75rem' : '1rem')};
  height: ${props => (props.isButton ? '0.75rem' : '1rem')};;
  border: .25rem solid ${theme.colors.background.primary};
  border-top: .25rem solid ${theme.colors.text.secondary};
  border-radius: 50%;
  animation: ${spin} 1s linear infinite;
`;

export default Spinner;
