import styled from "styled-components";
import theme from '../../styles/theme';

export const InlineToastLink = styled.a`
  color: ${props => props.color || theme.colors.text.primary};
  text-decoration: underline;
  text-decoration-color: ${theme.colors.background.secondary};
  text-decoration-thickness: 0.125rem;
  text-underline-offset: 0.125rem;
  transition: all 200ms ease;

  &:hover {
    color: ${theme.colors.text.primary};
    text-decoration-color: ${theme.colors.text.primary};
  }
`;