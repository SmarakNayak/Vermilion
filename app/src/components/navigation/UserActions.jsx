import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; 
import styled from 'styled-components';
import { BurgerMenuIcon, LogoutIcon, SwitchIcon } from '../common/Icon';
import theme from '../../styles/theme';
import MobileMenu from './MobileMenu';
import WalletConnectMenu from './WalletConnectMenu';
import useStore from '../../store/zustand';
import { formatAddress } from '../../utils';
import { AvatarCircleIcon } from '../common/Icon/icons/AvatarCircleIcon';

const UserActions = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isWalletMenuOpen, setIsWalletMenuOpen] = useState(false);

  const navigate = useNavigate(); 

  const wallet = useStore(state => state.wallet);
  const setWallet = useStore(state => state.setWallet);
  
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };
  
  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const openWalletMenu = () => {
    setIsWalletMenuOpen(true);
  };
  
  const closeWalletMenu = () => {
    setIsWalletMenuOpen(false);
  };

  const disconnectWallet = async () => {
    console.log("Disconnecting wallet...");
    console.log(wallet);
    if (typeof wallet.removeAccountChangeListener === 'function') {
      await wallet.removeAccountChangeListener();
    } else {
      console.log("no account change listener to remove");
    }
    setWallet(null);
  }

  const handleAddressButtonClick = () => {
    if (wallet && wallet.ordinalsAddress) {
      navigate(`/address/${wallet.ordinalsAddress}`); 
    }
  };
  
  return (
    <>
      <ActionsContainer>
        {!wallet ? (
          <ConnectButton onClick={openWalletMenu}>Connect</ConnectButton>
        ) : (
          <ConnectButtonWrapper>
            <AddressButton onClick={handleAddressButtonClick}>
              <AvatarCircleIcon size={"1.25rem"} />
              {formatAddress(wallet.ordinalsAddress)}
            </AddressButton>
            <DropdownContainer className="wallet-dropdown">
              {/* <DropdownItem href={"/address/" + wallet.ordinalsAddress}>
                View Profile
              </DropdownItem> */}
              <DropdownItem onClick={openWalletMenu}>
                <SwitchIcon size={"1.25rem"} />
                Switch Wallet
              </DropdownItem>
              <DropdownItem onClick={disconnectWallet}>
                <LogoutIcon size={"1.25rem"} />
                Disconnect
              </DropdownItem>
            </DropdownContainer>
          </ConnectButtonWrapper>
        )}

        <MobileMenuButton onClick={toggleMenu}>
          <BurgerMenuIcon size={"1.25rem"} color={theme.colors.text.secondary} />
        </MobileMenuButton>
      </ActionsContainer>
      
      <MobileMenu
        isOpen={isMenuOpen}
        onClose={closeMenu}
        onConnectWallet={openWalletMenu}
        wallet={wallet} // Pass wallet state
        onViewProfile={handleAddressButtonClick} // Pass view profile function
        onSwitchWallet={openWalletMenu} // Pass switch wallet function
        onDisconnectWallet={disconnectWallet} // Pass disconnect wallet function
      />
      
      <Overlay isOpen={isWalletMenuOpen} onClick={closeWalletMenu}>
        <WalletConnectMenu isOpen={isWalletMenuOpen} onClose={closeWalletMenu} />
      </Overlay>
    </>
  );
};

const ActionsContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;

  @media (max-width: 864px) {
    gap: 0;
  }
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

  &:hover {
    opacity: 0.75;
  }

  &:active {
    transform: scale(0.96);
  }

  @media (max-width: 864px) {
    display: none;
  }
`;

const AddressButton = styled.button`
  display: flex;
  align-items: center;
  gap: .375rem;
  height: 2.5rem;
  padding: 0 1rem;
  border: none;
  border-radius: 1.5rem;
  background-color: ${theme.colors.background.white};
  color: ${theme.colors.text.primary};
  font-family: ${theme.typography.fontFamilies.medium};
  font-size: 1rem;
  cursor: pointer;
  transition: all 200ms ease;

  &:hover {
    background-color: ${theme.colors.background.primary};
    color: ${theme.colors.text.primary};

    svg {
      fill: ${theme.colors.text.primary};
    }
  }

  &:active {
    transform: scale(0.96);
  }

  svg {
    fill: ${theme.colors.text.primary};
    transition: fill 200ms ease;
  }

  @media (max-width: 864px) {
    display: none;
  }
`;

const ConnectButtonWrapper = styled.div`
  position: relative;
  
  &:hover {
    .wallet-dropdown {
      opacity: 1;
      visibility: visible;
    }
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

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  backdrop-filter: blur(.125rem);
  z-index: 100;
  opacity: ${props => (props.isOpen ? 1 : 0)};
  visibility: ${props => (props.isOpen ? 'visible' : 'hidden')};
  transition: opacity 200ms ease, visibility 200ms ease, backdrop-filter 200ms ease;
`;

const DropdownContainer = styled.div`
  position: absolute;
  top: calc(100% + .5rem);
  right: 0;
  background-color: ${theme.colors.background.white};
  // border: 1px solid ${theme.colors.background.primary};
  border-radius: ${theme.borderRadius.large};
  box-shadow: ${theme.shadows.soft};
  min-width: 10rem;
  padding: .25rem;
  display: flex;
  flex-direction: column;
  gap: .25rem;
  z-index: 1000;
  opacity: 0;
  visibility: hidden;
  transition: all 200ms ease-in-out;

  &::before {
    content: '';
    position: absolute;
    top: -0.5rem;
    left: 0;
    right: 0;
    height: 0.5rem;
  }
`;

const DropdownItem = styled.a`
  display: flex;
  align-items: center;
  gap: .375rem;
  font-family: ${theme.typography.fontFamilies.medium};
  padding: 0 .75rem;
  height: 2.5rem;
  border-radius: ${theme.borderRadius.medium};
  color: ${theme.colors.text.secondary};
  text-decoration: none;
  cursor: pointer;
  transition: all 200ms ease;
  svg {
    color: ${theme.colors.text.secondary};
    fill: ${theme.colors.text.secondary};
    transition: all 200ms ease;
  }

  &:hover {
    background-color: ${theme.colors.background.primary};
    color: ${theme.colors.text.primary};

    svg {
      color: ${theme.colors.text.primary};
      fill: ${theme.colors.text.primary};
    }
  }
`;

export default UserActions;
