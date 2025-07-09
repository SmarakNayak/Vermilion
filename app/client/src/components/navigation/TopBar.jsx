import styled from 'styled-components';
import { theme } from '../../styles/theme';
import SearchBar from './SearchBar';
import NavigationLinks from './NavigationLinks';
import UserActions from './UserActions';
import Brand from './Brand';

const TopBarContainer = styled.header`
  width: calc(100% - 6rem);
  padding: 1rem 3rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: sticky;
  top: 0;
  gap: 1rem;
  background-color: ${theme.colors.background.white};
  transition: all 200ms ease;
  z-index: 50;

  @media (max-width: 864px) {
    width: calc(100% - 2rem);
    padding: 1rem;
  }

  @media (max-width: 630px) {
    gap: 0.5rem;
    padding: 0.75rem 1rem;
  }
`;

const LeftSection = styled.div`
  display: flex;
  align-items: center;
  gap: 1.5rem;
`;

const TopBar = () => {
  return (
    <TopBarContainer>
      <LeftSection>
        <Brand />
        <NavigationLinks />
      </LeftSection>
      <SearchBar />
      <UserActions />
    </TopBarContainer>
  );
};

export default TopBar;
