import styled from 'styled-components';
import { theme } from '../../../styles/theme';

export const FieldError = styled.div`
  background-color: ${theme.colors.background.error};
  color: ${theme.colors.text.errorSecondary};
  padding: 0.5rem 0.75rem;
  border-radius: 0.75rem;
  font-family: ${theme.typography.fontFamilies.medium};
  font-size: 0.875rem;
  line-height: 1.25rem;
  margin-top: 0.25rem;
`;