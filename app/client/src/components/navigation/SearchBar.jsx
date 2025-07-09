import { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { SearchIcon } from '../common/Icon';
import { theme } from '../../styles/theme';
import SearchMenu from './SearchMenu';

const SearchBar = () => {
  const [isSearchMenuOpen, setIsSearchMenuOpen] = useState(false);
  
  const openSearchMenu = () => {
    setIsSearchMenuOpen(true);
  };

  const closeSearchMenu = () => {
    setIsSearchMenuOpen(false);
  };

  return (
    <>
      <SearchContainer>
        <IconWrapper>
          <SearchIcon size={"1.25rem"} color={theme.colors.text.secondary} />
        </IconWrapper>
        <SearchButton 
          onClick={openSearchMenu}
          aria-label="Open search menu"
        >
          Search inscriptions, collections, or keywords...
        </SearchButton>
      </SearchContainer>

      <MobileSearchButton onClick={openSearchMenu}>
        <SearchIcon size={"1.25rem"} color={theme.colors.text.secondary} />
      </MobileSearchButton>
      
      <Overlay isOpen={isSearchMenuOpen} onClick={closeSearchMenu}>
        <SearchMenu isOpen={isSearchMenuOpen} closeMenu={closeSearchMenu} />
      </Overlay>
    </>
  );
};

const SearchContainer = styled.div`
  position: relative;
  flex: 1;
  max-width: 100%;
  min-width: 0; 
  margin: 0;

  @media (max-width: 630px) {
    display: none;
  }
`;

const SearchButton = styled.button`
  position: relative;
  width: 100%;
  height: 2.5rem;
  padding: 0 1rem 0 2.75rem;
  border: 2px solid transparent;
  border-radius: 1.5rem;
  box-sizing: border-box;
  background-color: ${theme.colors.background.primary};
  color: ${theme.colors.text.secondary};
  font-family: ${theme.typography.fontFamilies.medium};
  font-size: 1rem;
  text-align: left;
  cursor: pointer;
  transition: all 200ms ease;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  text-align: start;
  display: block; 
  min-width: 0; 

  &:hover {
    border: 2px solid ${theme.colors.background.secondary};
  }

  &:focus {
    border: 2px solid ${theme.colors.background.secondary};
    outline: none;
  }

  &::placeholder {
    color: ${theme.colors.text.secondary};
  }
`;

const IconWrapper = styled.div`
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  z-index: 1;
`;

const MobileSearchButton = styled.button`
  display: none;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  border: none;
  border-radius: 1.25rem;
  background-color: ${theme.colors.background.white};
  cursor: pointer;
  transition: all 200ms ease;
  margin-left: auto;

  &:hover {
    background-color: ${theme.colors.background.primary}; 
  }

  &:active {
    transform: scale(0.96);
  }

  @media (max-width: 630px) {
    display: flex;
  }
`;

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(0.125rem);
  z-index: ${props => (props?.zIndex ? props.zIndex : 1000)};
  opacity: ${props => (props.isOpen ? 1 : 0)};
  visibility: ${props => (props.isOpen ? 'visible' : 'hidden')};
  transition: opacity 200ms ease, visibility 200ms ease, backdrop-filter 200ms ease;
`;

export default SearchBar;
