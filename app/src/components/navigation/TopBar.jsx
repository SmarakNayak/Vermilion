import styled from 'styled-components';
import SearchBar from './SearchBar';
import NavigationLinks from './NavigationLinks';
import UserActions from './UserActions';
import PlaceholderImage from '../../assets/placeholder-brand.png'
import { Logo } from '../common/Logo';
import { Logo2 } from '../common/Logo2';
import theme from '../../styles/theme';

const TopBarContainer = styled.header`
  width: calc(100% - 6rem);
  padding: 1rem 3rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: sticky;
  top: 0;
  gap: 1rem;
  background-color: ${({theme}) => theme.colors.background.white};
  z-index: 50;

  // @media (max-width: 630px) {
  //   padding: 1rem;
  // }
`;

const LeftSection = styled.div`
  display: flex;
  align-items: center;
  gap: 2rem;
`;

const BrandContainer = styled.div`
  display: flex;
  align-items: center;
  height: 2.5rem;
  gap: .75rem;
  cursor: pointer;

  .variable-color-inside {
    transition: fill 200ms ease-in-out;
  }
  
  &:hover {
    .variable-color-inside {
      fill: ${({theme}) => theme.colors.background.aqua};
    }
  }

  .variable-color-outside {
    transition: fill 200ms ease-in-out;
  }
  
  &:hover {
    .variable-color-outside {
      fill: ${({theme}) => theme.colors.background.aquaLight};
    }
  }
`;

const BrandText = styled.span`
  font-family: relative-bold-pro;
  font-size: 1.375rem;
  letter-spacing: -.075rem;
  color: ${({theme}) => `${theme.colors.primary}`};
  cursor: pointer;
  margin: 0;
`;

const TopBar = () => {
  return (
    <TopBarContainer>
      <LeftSection>
        <BrandContainer>
          {/* <Logo size={'2rem'} color={theme.colors.background.secondary} /> */}
          <Logo2 size={'2.5rem'} colorInside={theme.colors.border} colorOutside={theme.colors.background.primary} />
          <BrandText>Vermilion</BrandText>
        </BrandContainer>
        <NavigationLinks />
      </LeftSection>
      <SearchBar />
      <UserActions />
    </TopBarContainer>
  );
};

export default TopBar;
