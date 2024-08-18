// Dropdown.js
import React, { useEffect, useState, useRef } from 'react';
import { Link } from "react-router-dom";
import styled from 'styled-components';
import ChevronDownIcon from '../assets/icons/ChevronDownIcon';
import { addCommas, formatAddress } from '../helpers/utils';

const SearchMenu = ({ addressData, collectionData, inscriptionData, menuOpen, searchInput, searchResults, setMenuOpen, setShowMobileSearch }) => {
  const [isOpen, setIsOpen] = useState(true);
  const menuRef = useRef(null);
  const isNumberInput = !isNaN(searchInput);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target) && window.innerWidth > 630) {
        setIsOpen(false); // Close the menu if clicked outside
        setMenuOpen(false);
      }
    };

    const handleResize = () => {
      if (window.innerWidth > 630) {
        document.addEventListener('mousedown', handleClickOutside);
      } else {
        document.removeEventListener('mousedown', handleClickOutside);
      }
    };

    handleResize(); // Initial check on component mount

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuRef, setIsOpen]);

  useEffect(() => {
    if (searchInput.length < 1) {
      setIsOpen(false);
    }
  }, [searchInput]);

  const handleLinkClick = () => {
    setMenuOpen(false);
    setShowMobileSearch(false);
    //setIsOpen(false);
  };

  return (
    <MenuContainer ref={menuRef}>
      {isNumberInput && (
        <>
          <CategoryContainer>
            <CategoryHeader>Inscription</CategoryHeader>
            <CategoryOptions>
              <UnstyledLink to={'/search/' + searchInput.replace(/,/g, '')} onClick={handleLinkClick}>
                <Option>{searchInput}</Option> {/* Display original input with commas */}
              </UnstyledLink>
            </CategoryOptions>
          </CategoryContainer>
          <CategoryContainer>
            <CategoryHeader>Block</CategoryHeader>
            <CategoryOptions>
              <UnstyledLink to={'/block/' + searchInput} onClick={handleLinkClick}>
                <Option>{addCommas(searchInput)}</Option>
              </UnstyledLink>
            </CategoryOptions>
          </CategoryContainer>
          <CategoryContainer>
            <CategoryHeader>Sat</CategoryHeader>
            <CategoryOptions>
              <UnstyledLink to={'/sat/' + searchInput} onClick={handleLinkClick}>
                <Option>{addCommas(searchInput)}</Option>
              </UnstyledLink>
            </CategoryOptions>
          </CategoryContainer>
          <CategoryContainer>
            <CategoryHeader>Sat Creation Block</CategoryHeader>
            <CategoryOptions>
              <UnstyledLink to={'/sat_block/' + searchInput} onClick={handleLinkClick}>
                <Option>{addCommas(searchInput)}</Option>
              </UnstyledLink>
            </CategoryOptions>
          </CategoryContainer>
        </>
      )}
      {collectionData.length > 0 && (
        <CategoryContainer>
          <CategoryHeader>Collection</CategoryHeader>
          <CategoryOptions>
            {searchResults['collections'].map((result) => (
              <UnstyledLink to={'/collection/' + result.collection_symbol} onClick={handleLinkClick}>
                <Option key={result.id}>{result.name}</Option>
              </UnstyledLink>
            ))}
          </CategoryOptions>
        </CategoryContainer>
      )}
      {addressData != null && (
        <CategoryContainer>
          <CategoryHeader>Address</CategoryHeader>
          <CategoryOptions>
            <UnstyledLink to={'/address/' + addressData} onClick={handleLinkClick}>
              <Option>{formatAddress(addressData)}</Option>
            </UnstyledLink>
          </CategoryOptions>
        </CategoryContainer>
      )}
      {inscriptionData != null && !isNumberInput && (
        <CategoryContainer>
          <CategoryHeader>Inscription</CategoryHeader>
          <CategoryOptions>
            <UnstyledLink to={'/inscription/' + inscriptionData?.number} onClick={handleLinkClick}>
              <Option>{addCommas(inscriptionData?.number)}</Option>
            </UnstyledLink>
          </CategoryOptions>
        </CategoryContainer>
      )}
      {searchInput.length > 0 && (
        <CategoryContainer>
          <CategoryHeader>Visual Search</CategoryHeader>
          <CategoryOptions>
            <UnstyledLink to={'/search/' + searchInput} onClick={handleLinkClick}>
              <Option>{searchInput}</Option>
            </UnstyledLink>
          </CategoryOptions>
        </CategoryContainer>
      )}
    </MenuContainer>
  );
};

const MenuContainer = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  margin-top: .5rem;
  background-color: #FFFFFF;
  width: 100%;
  border-radius: .5rem;
  border: 1px solid #F5F5F5;
  box-sizing: border-box;
  box-shadow: 0px 1px 6px 0px rgba(0, 0, 0, 0.09);
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  z-index: 1;
`;

const CategoryContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: .5rem;
`;

const CategoryHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-family: Relative Trial Bold;
  font-size: .875rem;
  color: #959595;
`;

const CategoryOptions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: .5rem;
`;

const Option = styled.button`
  display: flex;
  justify-content: flex-start;
  align-items: center;
  padding: .375rem .75rem;
  font-size: .875rem;
  color: ${props => (props.isSelected ? 'white' : 'black')};
  background-color: ${props => (props.isSelected ? '#000' : '#f5f5f5')};
  text-align: left;
  border: none;
  cursor: pointer;
  border-radius: .5rem;
  font-family: Relative Trial Medium;
  font-size: .875rem;
  transition: 
    transform 150ms ease;
  transform-origin: center center;

  &:active {
    transform: scale(0.96);
  }

  &:hover {
    background-color: ${props => (props.isSelected ? '#000' : '#E9E9E9')};
  }
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

const MenuText = styled.p`
  font-family: Relative Trial Bold;
  font-size: 1rem;
  color: #000000;
  margin: 0;
  padding: 0;
`;

const UnstyledLink = styled(Link)`
  color: unset;
  text-decoration: unset;
`;

export default SearchMenu;