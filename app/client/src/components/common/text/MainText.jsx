import styled from 'styled-components';
import { theme } from '../../../styles/theme';

const MainText = styled.p`
  font-family: ${theme.typography.fontFamilies.bold};
  font-size: 2rem;
  line-height: 2.5rem;
  color: ${theme.colors.text.primary};
  margin: 0;
`;

export default MainText;
