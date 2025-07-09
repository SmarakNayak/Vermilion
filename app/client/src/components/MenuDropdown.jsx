import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

const DropdownMenu = styled.ul`
  position: absolute;
  top: calc(100% - 1rem);
  right: 3rem;
  background-color: #FFFFFF;
  border: 1px solid #E9E9E9;
  box-shadow: 0px 1px 6px 0px rgba(0, 0, 0, 0.09);
  padding: .5rem;
  list-style-type: none;
  margin-top: .5rem;
  // min-width: 200px;
  border-radius: .5rem;
  z-index: 1;
`;

const DropdownItem = styled.li`
  padding: .5rem 1rem;
  cursor: pointer;
  font-family: Relative Trial Medium;
  font-size: 1rem;
  color: #000000;
  border-radius: .5rem;
  transition: 
    background-color 350ms ease,
    transform 150ms ease;
  transform-origin: center center;
  text-wrap: nowrap;

  &:hover {
    background-color: #F5F5F5;
  }
`;

const UnstyledLink = styled(Link)`
  color: unset;
  text-decoration: unset;
`

const MenuDropdown = ({ onWalletClick, optionsVisible, onDisconnect, addressInfo, onWalletMenuClose, walletButtonRef }) => {
  const [isOpen, setIsOpen] = useState(optionsVisible);
  const dropdownRef = useRef(null);

  // Add click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target) && !walletButtonRef.current.contains(event.target) && window.innerWidth > 630) {
        onWalletMenuClose(); // Close the menu if clicked outside
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
  }, [dropdownRef, optionsVisible]);

  return (
    <>
    {optionsVisible && (
      <DropdownMenu ref={dropdownRef}>
        <UnstyledLink to ={'/address/' + addressInfo?.[0].address} onClick={onWalletMenuClose}>
          <DropdownItem>
            View Wallet
          </DropdownItem>
        </UnstyledLink>
        <DropdownItem onClick={onDisconnect}>
          Disconnect
        </DropdownItem>
      </DropdownMenu>
    )}
    </>
  )
};

export default MenuDropdown;
