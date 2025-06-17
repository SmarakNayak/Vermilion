import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; 
import { usePostHog } from 'posthog-js/react';
import styled from 'styled-components';
import { ArchiveIcon, BurgerMenuIcon, DiscordIcon, DotsHorizontalIcon, LogoutIcon, QuestionIcon, SettingsIcon, SwitchIcon, TwitterIcon } from '../common/Icon';
import theme from '../../styles/theme';
import MobileMenu from './MobileMenu';
import WalletConnectMenu from './WalletConnectMenu';
import useStore from '../../store/zustand';
import { formatAddress } from '../../utils';
import { AvatarCircleIcon } from '../common/Icon/icons/AvatarCircleIcon';
import Tooltip from '../common/Tooltip';
import UnstyledLink from '../common/UnstyledLink';

const UserActions = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isWalletMenuOpen, setIsWalletMenuOpen] = useState(false);

  const navigate = useNavigate(); 

  const posthog = usePostHog();

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
    console.log("Disconnecting wallet..."); // Disconnect function called - visible in console
    if (typeof wallet.removeAccountChangeListener === 'function') {
      await wallet.removeAccountChangeListener();
    } else {
      console.log("No account change listener to remove"); // No account change listener - visible in console
    }
    setWallet(null);
    posthog.reset(true);
  }

  const handleAddressButtonClick = () => {
    if (wallet && wallet.ordinalsAddress) {
      navigate(`/address/${wallet.ordinalsAddress}`); 
      posthog.capture('button_clicked', {
        button_name: 'Address Button',
      });
    }
  };
  
  return (
    <>
      <ActionsContainer>
        {!wallet ? (
          <>
            <ConnectButton onClick={openWalletMenu}>Connect</ConnectButton>
            <ConnectButtonWrapper>
              <OptionButton>
                <DotsHorizontalIcon size={"1.25rem"} />
              </OptionButton>
              <DropdownContainer className="wallet-dropdown">
                <DropdownItem href={"https://discord.gg/a5EN38CfjU"} target="_blank" rel="noopener noreferrer">
                  <QuestionIcon size={"1.25rem"} />
                  Get Help
                </DropdownItem>
                <DropdownItem href={"https://x.com/vrmlndotplace"} target="_blank" rel="noopener noreferrer">
                  <TwitterIcon size={"1.25rem"} />
                  X (Twitter)
                </DropdownItem>
              </DropdownContainer>
            </ConnectButtonWrapper>
          </>
        ) : (
          <>
          <AddressButton onClick={handleAddressButtonClick}>
            <AvatarCircleIcon size={"1.5rem"} color={theme.colors.text.primary} />
          </AddressButton>
          <ConnectButtonWrapper>
            <OptionButton>
              <DotsHorizontalIcon size={"1.25rem"} />
            </OptionButton>
            <DropdownContainer className="wallet-dropdown">
              <DropdownItem href={"/history/"}>
                <ArchiveIcon size={"1.25rem"} />
                Order History
              </DropdownItem>
              <DropdownItem href={"/settings/profile"}>
                <SettingsIcon size={"1.25rem"} />
                Settings
              </DropdownItem>
              <DropdownItem onClick={openWalletMenu}>
                <SwitchIcon size={"1.25rem"} />
                Switch Wallet
              </DropdownItem>
              <DropdownItem onClick={disconnectWallet}>
                <LogoutIcon size={"1.25rem"} />
                Disconnect
              </DropdownItem>
              <Divider />
              <DropdownItem href={"https://discord.gg/a5EN38CfjU"} target="_blank" rel="noopener noreferrer">
                <QuestionIcon size={"1.25rem"} />
                Get Help
              </DropdownItem>
              <DropdownItem href={"https://x.com/vrmlndotplace"} target="_blank" rel="noopener noreferrer">
                <TwitterIcon size={"1.25rem"} />
                X (Twitter)
              </DropdownItem>
            </DropdownContainer>

          </ConnectButtonWrapper>
          </>
        )}

        <MobileMenuButton onClick={toggleMenu}>
          <BurgerMenuIcon size={"1.25rem"} color={theme.colors.text.secondary} />
        </MobileMenuButton>
      </ActionsContainer>
      
      <MobileMenu
        isOpen={isMenuOpen}
        onClose={closeMenu}
        onConnectWallet={openWalletMenu}
        wallet={wallet} 
        onSwitchWallet={openWalletMenu} 
        onDisconnectWallet={disconnectWallet} 
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
    transform: scale(0.98);
  }

  @media (max-width: 864px) {
    display: none;
  }
`;

const AddressButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 2.5rem;
  min-height: 2.5rem;
  width: 2.5rem;
  min-width: 2.5rem;
  box-sizing: border-box;
  border: 2px solid transparent;
  border-radius: 1.25rem;
  background-color: ${theme.colors.background.primary};
  color: ${theme.colors.text.primary};
  font-family: ${theme.typography.fontFamilies.medium};
  font-size: 1rem;
  cursor: pointer;
  transition: all 200ms ease;

  &:hover {
    border: 2px solid ${theme.colors.border};
  }

  &:active {
    transform: scale(0.96);
  }

  @media (max-width: 864px) {
    display: none;
  }
`;

const OptionButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 2.5rem;
  min-height: 2.5rem;
  width: 2.5rem;
  min-width: 2.5rem;
  border: none;
  border-radius: 1.25rem;
  background-color: ${theme.colors.background.white};
  color: ${theme.colors.text.secondary};
  font-family: ${theme.typography.fontFamilies.medium};
  font-size: 1rem;
  cursor: pointer;
  transition: all 200ms ease;

  svg {
    fill: ${theme.colors.text.secondary};
    transition: all 200ms ease;
  }

  &:hover {
    background-color: ${theme.colors.background.primary};
    svg {
      fill: ${theme.colors.text.primary};
    }
  }

  &:active {
    transform: scale(0.96);
  }

  @media (max-width: 864px) {
    display: none;
  }
`;


const ButtonWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  margin: 0;

  svg {
    fill: ${theme.colors.text.secondary};
    transition: all 200ms ease;
  }

  &:hover {
    svg {
      fill: ${theme.colors.text.primary};
    }
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
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(0.125rem);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: ${props => (props?.zIndex ? props.zIndex : 1000)};
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

const Divider = styled.div`
  width: calc(100% - 0.25rem);
  height: 1px;
  background-color: ${theme.colors.border};
  margin: 0.0625rem 0.125rem;
`;

const SocialContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-end;
  box-sizing: border-box;
  gap: 1rem;
  padding: 0.75rem;
`;

export default UserActions;
