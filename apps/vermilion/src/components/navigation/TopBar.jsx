import styled from 'styled-components';
import SearchBar from './SearchBar';
import NavigationLinks from './NavigationLinks';
import UserActions from './UserActions';
import PlaceholderImage from '../../assets/placeholder-brand.png'

const TopBarContainer = styled.header`
  width: calc(100% - 6rem);
  padding: 1rem 3rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: sticky;
  top: 0;
  gap: 1rem;
  // background-color: red;
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

const BrandText = styled.span`
  font-size: 1.25rem;
  color: ;
  cursor: pointer;
`;

const BrandContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 2.5rem;
  cursor: pointer;
`;

const BrandImage = styled.img`
  height: 2rem;
`;

const TopBar = () => {
  return (
    <TopBarContainer>
      <LeftSection>
        {/* <BrandText>Vermilion</BrandText> */}
        <BrandContainer>
          <BrandImage src={PlaceholderImage} />
        </BrandContainer>
        <NavigationLinks />
      </LeftSection>
      <SearchBar />
      <UserActions />
    </TopBarContainer>
  );
};

export default TopBar;
