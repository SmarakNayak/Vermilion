import React, { useState, useEffect, ChangeEvent } from 'react';
import { Link } from "react-router-dom";
import styled from 'styled-components';
import SearchIcon from '../assets/icons/SearchIcon';
import BurgerMenuIcon from '../assets/icons/BurgerMenuIcon';
import CrossIcon from '../assets/icons/CrossIcon';
import BoltIcon from '../assets/icons/BoltIcon';
import ExploreIcon from '../assets/icons/ExploreIcon';
import DiscoverIcon from '../assets/icons/DiscoverIcon';
import SearchMenu from './SearchMenu';

const TopSection = (props) => {
  const [searchInput, setSearchInput] = useState("");
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [collectionData, setCollectionData] = useState([]);
  const [addressData, setAddressData] = useState(null);
  const [menuOpen, setMenuOpen] = useState('');
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);

  const handleTextChange = (e) => {
    e.preventDefault();
    setSearchInput(e.target.value);
    setMenuOpen(e.target.value.trim() !== ''); // Set isOpen based on input value
    if (e.target.value.trim() !== '') {
      fetchTextSearch(e.target.value); // Assuming fetchTextSearch can optionally take a searchTerm
      setCollectionData([]); // clear collection results 
      setAddressData(null); // clear address results
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 13) {      
    }
  };

  // const handleClick = (e) => {
  //   if (searchInput.length > 0) {
  //     setMenuOpen(e.target.value.trim() !== '');
  //   }
  // }

  const handleTextSubmit = async (e) => {
    e.preventDefault();
    if (searchInput.trim() === "") {
      setIsError(true); // Set error state if input is blank
    } else {
      fetchTextSearch(); // Assuming fetchTextSearch can optionally take a searchTerm
      setIsError(false); // Reset error state on valid submission
    }
  };

  const fetchTextSearch = async (searchTerm) => {
    if (searchInput.trim() === "") {
      return
    } else {
      setIsLoading(true); // Start loading
      const response = await fetch("/api/search/" + searchTerm);
      let json = await response.json();
      setSearchResults(json);
      setCollectionData(json['collections']);
      setAddressData(json['address']);
      setIsLoading(false); // End loading
    }
  };

  const toggleMenuVisibility = () => {
    setShowMobileMenu(!showMobileMenu);
  };

  const toggleSearchVisibility = () => {
    setShowMobileSearch(!showMobileSearch);
  };

  const closeSearch = () => {
    toggleSearchVisibility();
    setSearchInput('');
  }

  const clearSearch = () => {
    setSearchInput('');
    setMenuOpen(false);
    setCollectionData([]); // clear collection results 
    setAddressData(null); // clear address results
  }

  console.log(searchInput, searchResults);

  return (
    <HeaderContainer>
      <SiteText to ={'/explore'}>vermilion</SiteText>
      <SearchContainer>
        <SearchIcon svgSize={'1rem'} svgColor={'#959595'}></SearchIcon>
        <form onSubmit={handleTextSubmit}>
          <SearchInput 
            placeholder='Search'
            type='text'
            onChange={handleTextChange}
            onKeyDown={handleKeyPress}
            value={searchInput}
            isError={isError}
          />
        </form>
        {searchInput.length > 0 && (
          <ClearButton onClick={clearSearch}>
            <CrossIcon svgSize={'1rem'} svgColor={'#959595'}></CrossIcon>
          </ClearButton>
        )}
        {menuOpen && (
          <SearchMenu addressData={addressData} collectionData={collectionData} menuOpen={menuOpen} setMenuOpen={setMenuOpen} searchInput={searchInput} searchResults={searchResults} />
        )}
      </SearchContainer>
      <ButtonContainer>
        <MenuButton onClick={toggleSearchVisibility}>
          <SearchIcon svgSize='1rem' svgColor='black'></SearchIcon>
        </MenuButton>
        <MenuButton onClick={toggleMenuVisibility}>
          <BurgerMenuIcon svgSize='1rem' svgColor='black'></BurgerMenuIcon>
        </MenuButton>
        <LinkContainer>
          <UnstyledLink to={'/explore/'}>
            <LinkButton>Explore</LinkButton>
          </UnstyledLink>
          <UnstyledLink to={'/discover'}>
            <LinkButton>Discover</LinkButton>
          </UnstyledLink>
          <UnstyledLink to={'/search'}>
            <LinkButton>Search</LinkButton>
          </UnstyledLink>
        </LinkContainer>
        <ConnectButton>Connect</ConnectButton>
      </ButtonContainer>
      {showMobileSearch && (
        <MobileContainer>
          <MenuHeader>
            <MenuText>Search</MenuText>
            <CloseButton onClick={closeSearch}>
              Close
              <CrossIcon svgColor={'#959595'} svgSize={'1rem'} />
            </CloseButton>
          </MenuHeader>
          <SearchContainer mobile>
            <SearchIcon svgSize={'1rem'} svgColor={'#959595'}></SearchIcon>
            <form onSubmit={handleTextSubmit}>
              <SearchInput 
                placeholder='Search'
                type='text'
                onChange={handleTextChange}
                onKeyDown={handleKeyPress}
                value={searchInput}
                isError={isError}
              />
            </form>
            {searchInput.length > 0 && (
              <ClearButton onClick={clearSearch}>
                <CrossIcon svgSize={'1rem'} svgColor={'#959595'}></CrossIcon>
              </ClearButton>
            )}
            {menuOpen && (
              <SearchMenu addressData={addressData} collectionData={collectionData} menuOpen={menuOpen} setMenuOpen={setMenuOpen} searchInput={searchInput} searchResults={searchResults} />
            )}
          </SearchContainer>
        </MobileContainer>
      )}
      {showMobileMenu && (
        <MobileContainer>
          <MenuHeader>
            <SiteText to ={'/explore'}>vermilion</SiteText>
            <CloseButton onClick={toggleMenuVisibility}>
              Close
              <CrossIcon svgColor={'#959595'} svgSize={'1rem'} />
            </CloseButton>
          </MenuHeader>
          <MenuLinkContainer>
            <UnstyledLink to={'/explore'}>
              <ItemContainer>
                <ExploreIcon svgSize={'1.25rem'} svgColor={'#000000'} />
                <MenuText>Explore</MenuText>
              </ItemContainer>
            </UnstyledLink>
            <UnstyledLink to={'/discover'}>
              <ItemContainer>
                <DiscoverIcon svgSize={'1.25rem'} svgColor={'#000000'} />
                <MenuText>Discover</MenuText>
              </ItemContainer>
            </UnstyledLink>
            <UnstyledLink to={'/search'}>
              <ItemContainer>
                <BoltIcon svgSize={'1.25rem'} svgColor={'#000000'} />
                <MenuText>Search</MenuText>
              </ItemContainer>
            </UnstyledLink>
            <MobileButton>Connect</MobileButton>
          </MenuLinkContainer>
        </MobileContainer>
      )}
    </HeaderContainer>
  )
}

const HeaderContainer = styled.div`
  display: flex;
  flex-direction: row;
  // flex: 1;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  position: sticky;
  top: 0;
  width: calc(100% - 3rem);
  z-index: 1;
  padding: 0 1.5rem;
  margin: 0;
  height: 4.5rem;
  background-color: #FFFFFF;

  z-index: 2;
`;

const ConnectButton = styled.button`
  height: 2.5rem;
  border-radius: 2rem;
  border: none;
  padding: 0 1rem;
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  gap: .5rem;
  font-family: Relative Trial Bold;
  font-size: .875rem;
  color: #FFFFFF;  
  background-color:#000000;
  transition: 
    transform 150ms ease;
  transform-origin: center center;

  &:active {
    transform: scale(0.96);
  }

  @media (max-width: 630px) {
    display: none;
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 1rem;

  @media (max-width: 630px) {
    gap: .25rem;
  }
`;

const LinkContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;

  @media (max-width: 630px) {
    display: none;
  }
`;

const LinkButton = styled.div`
  border-radius: 2rem;
  border: none;
  padding: .5rem 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-family: Relative Trial Bold;
  font-size: .875rem;
  color: #000000;
  background-color: #FFFFFF;
  transition: all 350ms ease;

  &:hover {
    background-color: #F5F5F5;
  }

  @media (max-width: 425px) {
    padding: 0;
    flex-direction: column;
    align-items: flex-start;

    &:hover {
      background-color: transparent;
    }
  }
`;

const MenuButton = styled.button`
  height: 40px;
  width: 40px;
  border-radius: .5rem;
  border: none;
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-family: 'ABC Camera Plain Unlicensed Trial Medium';
  font-size: .875rem;
  color: #000000;
  background-color: #FFFFFF;
  transition: 
    background-color 350ms ease,
    transform 150ms ease;
  transform-origin: center center;

  &:hover {
    background-color: #F5F5F5;
  }

  &:focus {
    transform: scale(0.96);
  }

  @media (min-width: 630px) {
    display: none;
  }
`;

const MobileContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  background-color: #FFFFFF;
  max-width: calc(100% - 3rem);  
  max-height: calc(100% - 2.4rem);
  margin-right: 0;  
  width: 100%;     
  height: 100%;    
  position: fixed;  
  top: 0;          
  left: 0;          
  z-index: 1000;    
  padding: 1.2rem 1.5rem;
  gap: 2.5rem;
`;

const MenuHeader = styled.div`
  display: none;

  @media (max-width: 630px) {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    width: 100%;
  }
`;

const CloseButton = styled.button`
  padding: .5rem 1rem;
  border-radius: .5rem;
  border: none;
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  gap: .375rem;
  font-family: Relative Trial Medium;
  font-size: .875rem;
  color: #959595;
  background-color: #F5F5F5;
  transition: 
    background-color 350ms ease,
    transform 150ms ease;
  transform-origin: center center;

  &:hover {
    background-color: #E9E9E9;
  }

  &:active {
    transform: scale(0.96);
  }
`;

const MenuLinkContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 1.5rem;
`;

const ItemContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: .75rem;
`;

const MenuText = styled.p`
  font-family: Relative Trial Bold;
  font-size: 1.25rem;
  color: #000000;
  margin: 0;
  padding: 0;
`;

const UnstyledLink = styled(Link)`
  color: unset;
  text-decoration: unset;
`;

const SiteText = styled(Link)`
  font-family: ABC Camera Unlicensed Trial Bold;
  font-size: 1.25rem;
  color: #E34234;
  padding: 0;
  margin: 0;
  cursor: pointer;
  text-decoration: none;
`;

const SearchContainer = styled.div`
  width: 100%;
  max-width: 25rem;
  height: 2.5rem;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  background-color: #F5F5F5;
  border: none;  
  border-radius: .5rem;
  padding: 0 1rem;
  gap: .5rem;
  position: relative;

  @media (max-width: 630px) {
    display: ${props => props.mobile ? 'flex' : 'none'}; 
    max-width: unset;
    width: calc(100% - 2rem);
  }
`;

const MobileButton = styled.button`
  height: 2.5rem;
  width: 100%;
  border-radius: 2rem;
  border: none;
  padding: 0 1rem;
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  gap: .5rem;
  font-family: Relative Trial Bold;
  font-size: 1rem;
  color: #FFFFFF;  
  background-color:#000000;
  transition: 
    transform 150ms ease;
  transform-origin: center center;

  &:active {
    transform: scale(0.96);
  }
`;

const SearchInput = styled.input`
  width: auto;
  height: auto;
  border: 2px solid transparent;
  border-radius: .5rem;
  transition: all 150ms ease;
  background-color: transparent;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  margin: 0;
  outline: none;
  font-family: Relative Trial Medium;
  font-weight: 500;
  color: #000000;
  font-size: .875rem;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 0 1rem 0 2.5rem;
  box-sizing: border-box;

  &:hover {
    border: 2px solid #E9E9E9;
  }

  &:focus {
    border: 2px solid ${props => props.isError ? '#FF0000' : '#E9E9E9'};
  }

  ::placeholder { /* Chrome, Firefox, Opera, Safari 10.1+ */
    color: #959595;
  }
  
  :-ms-input-placeholder { /* Internet Explorer 10-11 */
    color: #959595;
  }
  
  ::-ms-input-placeholder { /* Microsoft Edge */
    color: #959595;
  }
`;

const ClearButton = styled.button`
  height: 1.5rem;
  width: 1.5rem;
  border-radius: .5rem;
  border: none;
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  gap: .5rem;
  font-family: Relative Trial Bold;
  font-size: .875rem;
  background-color: #F5F5F5;
  transition: 
    transform 150ms ease;
  transform-origin: center center;
  z-index: 1;

  &:hover {
    background-color: #E9E9E9;
  }
`;

export default TopSection;