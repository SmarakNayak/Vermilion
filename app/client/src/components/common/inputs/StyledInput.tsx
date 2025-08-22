import styled from 'styled-components';
import { theme } from '../../../styles/theme';

// Styled component transient props should start with a dollar sign
// This allows them to be passed through without being forwarded to the DOM element
// This is a common pattern in styled-components to avoid warnings about unknown props:
// React does not recognize the `%s` prop on a DOM element. If you intentionally want it to appear in the DOM as a custom attribute, 
// spell it as lowercase `%s` instead. If you accidentally passed it from a parent component, remove it from the DOM element.

export const StyledInput = styled.input<{ $isError?: boolean }>`
  height: 2.5rem;
  width: 100%;
  max-width: 100%;
  padding: 0 0.75rem;
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