import styled from 'styled-components';
import { theme } from '../../../styles/theme';

const InfoText = styled.p`
  font-family: ${theme.typography.fontFamilies.medium};
  font-size: ${props => (props.islarge ? '1rem' : '.875rem')};
  line-height: ${props => (props.islarge ? '1.5rem' : '1.25rem')};
  color: ${theme.colors.text.secondary};
  margin: 0;
`;

export default InfoText;
