import styled from 'styled-components';
import { theme } from '../../../styles/theme';

export const StyledTextarea = styled.textarea<{ $isError?: boolean }>`
  width: 100%;
  max-width: 100%;
  min-height: 7rem;
  max-height: 45vh;
  field-sizing: content;
  padding: 0.5rem 0.75rem;
  background-color: ${theme.colors.background.primary};
  font-family: ${theme.typography.fontFamilies.medium};
  font-size: 1rem;
  line-height: 1.5rem;
  color: ${theme.colors.text.primary};
  border: 2px solid ${props => (props.$isError ? theme.colors.text.errorSecondary : 'transparent')};
  border-radius: 0.75rem;
  box-sizing: border-box;
  outline: none;
  transition: all 200ms ease;
  resize: none;
  overflow-y: hidden;


  &:hover {
    border: 2px solid ${props => (props.$isError ? theme.colors.text.errorSecondary : theme.colors.border)};
  }

  &:focus {
    border: 2px solid ${props => (props.$isError ? theme.colors.text.errorSecondary : theme.colors.border)};
  }

  &::placeholder { /* Chrome, Firefox, Opera, Safari 10.1+ */
    color: ${theme.colors.text.tertiary};
  }
  
  &:-ms-input-placeholder { /* Internet Explorer 10-11 */
    color: ${theme.colors.text.tertiary};
  }
  
  &::-ms-input-placeholder { /* Microsoft Edge */
    color: ${theme.colors.text.tertiary};
  }
`;