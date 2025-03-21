import React, { useState } from 'react';
import styled from 'styled-components';
import { BurgerMenuIcon } from '../common/Icon';
import theme from '../../styles/theme';
import MobileMenu from './MobileMenu';

const UserActions = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };
  
  const closeMenu = () => {
    setIsMenuOpen(false);
  };
  
  return (
    <>
      <ActionsContainer>
        <ConnectButton>Connect</ConnectButton>

        <MobileMenuButton onClick={toggleMenu}>
          <BurgerMenuIcon size={"1.25rem"} color={theme.colors.text.secondary} />
        </MobileMenuButton>
      </ActionsContainer>
      
      <MobileMenu isOpen={isMenuOpen} onClose={closeMenu} />
    </>
  );
};

const ActionsContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const ConnectButton = styled.button`
  height: 2.5rem;
  padding: 0 1rem;
  border: none;
  border-radius: 1.5rem;
  background-color: ${theme.colors.background.dark};
  color: ${theme.colors.text.white};
  font-family: ${theme.typography.fontFamilies.bold};
  font-size: 1rem;
  cursor: pointer;
  transition: all 200ms ease;

  @media (max-width: 864px) {
    display: none;
  }
`;

const MobileMenuButton = styled.button`
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

  &:hover {
    background-color: ${theme.colors.background.primary}; 
  }

  &:active {
    transform: scale(0.96);
  }

  @media (max-width: 864px) {
    display: flex;
  }
`;

export default UserActions;
