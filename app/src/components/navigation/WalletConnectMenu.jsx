import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { ArrowLeftIcon, ChevronRightIcon, CrossIcon, WalletIcon } from '../common/Icon';
import { theme } from '../../styles/theme';
import { connectWallet, detectWallets } from '../../wallet/wallets';
import useStore from '../../store/zustand';

// Import wallet logos
import unisatLogo from '../../assets/wallets/unisat.png';
import xverseLogo from '../../assets/wallets/xverse.png';
import oylLogo from '../../assets/wallets/oyl.png';
import magicedenLogo from '../../assets/wallets/magiceden.png';
import okxLogo from '../../assets/wallets/okx.png';
import leatherLogo from '../../assets/wallets/leather.png';
import phantomLogo from '../../assets/wallets/phantom.png';

const WALLET_PRIORITY = [
  'unisat',
  'xverse',
  'oyl',
  'magiceden',
  'okx',
  'leather',
  'phantom'
];

const WALLET_DISPLAY_NAMES = {
  'unisat': 'Unisat',
  'xverse': 'Xverse',
  'oyl': 'Oyl',
  'magiceden': 'Magic Eden',
  'okx': 'OKX',
  'leather': 'Leather',
  'phantom': 'Phantom'
};

const WALLET_LOGOS = {
  'unisat': unisatLogo,
  'xverse': xverseLogo,
  'oyl': oylLogo,
  'magiceden': magicedenLogo,
  'okx': okxLogo,
  'leather': leatherLogo,
  'phantom': phantomLogo
};

const WALLET_LINKS = {
  'unisat': 'https://unisat.io/download',
  'xverse': 'https://xverse.app',
  'oyl': 'https://oyl.io',
  'magiceden': 'https://wallet.magiceden.io',
  'okx': 'https://web3.okx.com',
  'leather': 'https://leather.io',
  'phantom': 'https://phantom.com'
}

const WalletConnectMenu = ({ isOpen, onClose }) => {
  const [showOtherWallets, setShowOtherWallets] = useState(false);
  const [detectedWallets, setDetectedWallets] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const menuRef = useRef(null);
  // Use Zustand store to manage wallet state - has to be top-level
  const setWallet = useStore(state => state.setWallet);

  useEffect(() => {
    if (isOpen) {
      const checkWallets = async () => {
        setIsLoading(true);
        try {
          const detected = await detectWallets();
          setDetectedWallets(detected);
          console.log("Detected wallets:", detected);
        } catch (error) {
          console.error("Error detecting wallets:", error);
          setDetectedWallets([]);
        } finally {
          setIsLoading(false);
        }
      };
      
      checkWallets();
    }
  }, [isOpen]);

  const getFirstScreenWallets = () => {
    // Filter wallets that are detected, maintain priority order
    const detected = WALLET_PRIORITY.filter(wallet => detectedWallets.includes(wallet));
    
    // If we have 3 or more detected wallets, show top 3
    if (detected.length >= 3) {
      return detected.slice(0, 3);
    }
    
    // Otherwise, fill with highest priority undetected wallets
    const undetected = WALLET_PRIORITY.filter(wallet => !detectedWallets.includes(wallet));
    return [
      ...detected,
      ...undetected.slice(0, 3 - detected.length)
    ].slice(0, 3);
  };

  const walletsToShow = showOtherWallets ? WALLET_PRIORITY : getFirstScreenWallets();
  
  // Reset showOtherWallets when menu closes
  useEffect(() => {
    if (!isOpen) {
      setShowOtherWallets(false);
    }
  }, [isOpen]);
  
  const handleMenuClick = (e) => {
    e.stopPropagation();
  };
  
  const toggleOtherWallets = () => {
    setShowOtherWallets(!showOtherWallets);
  };
  
  const goBack = () => {
    setShowOtherWallets(false);
  };
  
  const handleClose = () => {
    onClose();
    // Reset state when menu closes
    setShowOtherWallets(false);
    setError(null);
  };

  const handleWalletConnect = async (walletType) => {
    setError(null);
    try {
      console.log("Connecting to wallet:", walletType);
      let wallet = await connectWallet(walletType, "signet");
      console.log("Connected wallet:", wallet);
      setWallet(wallet);
    } catch (err) {
      console.warn("Error connecting to wallet:", err);
      setError("Error: " + err.message);
    }
  }
  
  const primaryWallets = ['unisat', 'xverse', 'oyl'];
  const allWallets = [...primaryWallets, 'magiceden', 'okx', 'leather', 'phantom'];
  
  const wallets = showOtherWallets ? allWallets : primaryWallets;
  
  return (
    <MenuContainer ref={menuRef} onClick={handleMenuClick}>
      <HeaderSection>
        {showOtherWallets ? (
          <BackButton onClick={goBack}>
            <ArrowLeftIcon size="1rem" color={theme.colors.text.secondary} />
          </BackButton>
        ) : (
          <HeaderTitle>Connect your wallet</HeaderTitle>
        )}
        <CloseButton onClick={handleClose}>
          <CrossIcon size="1rem" color={theme.colors.text.secondary} />
        </CloseButton>
      </HeaderSection>
      
      <MenuContent>
        <WalletOptions>
          {walletsToShow.map(wallet => {
            const isDetected = detectedWallets.includes(wallet);
            return (
              <WalletOption key={wallet} onClick={isDetected 
                ? () => handleWalletConnect(wallet)
                : () => window.open(WALLET_LINKS[wallet], '_blank')
              }>
                <WalletLogoWrapper>
                  <WalletLogo src={WALLET_LOGOS[wallet]} alt={`${WALLET_DISPLAY_NAMES[wallet]} logo`} />
                </WalletLogoWrapper>
                <WalletName>{WALLET_DISPLAY_NAMES[wallet]}</WalletName>
                <StatusLabel>
                  <StatusText>{isDetected ? 'Detected' : ''}</StatusText>
                  <ConnectText>{isDetected ? 'Connect' : 'Install'}</ConnectText>
                </StatusLabel>
              </WalletOption>
            );
          })}
        </WalletOptions>
        
        {!showOtherWallets && (
          <>
            <Divider />
            <OtherWalletsOption onClick={toggleOtherWallets}>
              <WalletIconWrapper>
                <WalletIcon size="1.25rem" color={theme.colors.text.secondary} />
              </WalletIconWrapper>
              <WalletName>Other wallets</WalletName>
              <ChevronRightIcon 
                size="1.25rem" 
                color={theme.colors.text.secondary} 
              />
            </OtherWalletsOption>
          </>
        )}

        {error && (
          <StatusLabel style={{ backgroundColor: theme.colors.background.error }}>
            <StatusText style={{ color: theme.colors.text.error }}>{error}</StatusText>
          </StatusLabel>
        )}

      </MenuContent>
    </MenuContainer>
  );
};

const MenuContainer = styled.div`
  position: absolute;
  top: 5rem;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  width: 90%;
  max-width: 25rem;
  background-color: ${theme.colors.background.white};
  border-radius: 1.5rem;
  overflow: hidden;
  z-index: 110;
  box-shadow: ${theme.shadows.soft};
  transition: all 200ms ease;
`;

const HeaderSection = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.25rem 1.5rem;
  width: 100%;
  box-sizing: border-box;
  transition: all 200ms ease;
`;

const HeaderTitle = styled.p`
  font-family: ${theme.typography.fontFamilies.bold};
  font-size: 1.25rem;
  line-height: 1.75rem;
  color: ${theme.colors.text.primary};
  margin: 0;
`;

const BackButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.75rem;
  height: 1.75rem;
  border: none;
  border-radius: 0.875rem;
  background-color: ${theme.colors.background.primary};
  cursor: pointer;
  transition: all 200ms ease;

  &:hover {
    background-color: ${theme.colors.background.secondary};
  }

  &:active {
    transform: scale(0.96);
  }
`;

const CloseButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.75rem;
  height: 1.75rem;
  border: none;
  border-radius: 0.875rem;
  background-color: ${theme.colors.background.primary};
  cursor: pointer;
  transition: all 200ms ease;

  &:hover {
    background-color: ${theme.colors.background.secondary};
  }

  &:active {
    transform: scale(0.96);
  }
`;

const MenuContent = styled.div`
  display: flex;
  flex-direction: column;
  padding: 0.5rem 1.25rem 1.5rem;
  box-sizing: border-box;
  width: 100%;
  gap: 0.25rem;
`;

const WalletOptions = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  gap: 0.25rem;
`;

const WalletName = styled.span`
  font-family: ${theme.typography.fontFamilies.medium};
  font-size: 1rem;
  line-height: 1.5rem;
  color: ${theme.colors.text.secondary};
  flex: 1;
  transition: color 200ms ease;
`;

const WalletOption = styled.button`
  display: flex;
  align-items: center;
  width: 100%;
  padding: 0.375rem 0.5rem;
  border: none;
  border-radius: 0.75rem;
  background-color: ${theme.colors.background.white};
  cursor: pointer;
  transition: all 200ms ease;
  text-align: left;
  
  &:hover {
    background-color: ${theme.colors.background.primary};

    ${WalletName} {
      color: ${theme.colors.text.primary};
    }
  }
`;

const WalletIconWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 0.625rem;
  background-color: ${theme.colors.background.primary};
  margin-right: 0.75rem;
  flex-shrink: 0;
`;

const WalletLogoWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 0.75rem;
  background-color: ${theme.colors.background.primary};
  margin-right: 0.75rem;
  flex-shrink: 0;
  overflow: hidden;
`;

// Add a new styled component for the logo image
const WalletLogo = styled.img`
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 0.75rem;
  object-fit: contain;
  display: block;
`;

const StatusLabel = styled.div`
  border-radius: 0.75rem;
  background-color: ${theme.colors.background.primary};
  padding: 0.125rem 0.5rem;
`;

const StatusText = styled.span`
  font-family: ${theme.typography.fontFamilies.medium};
  font-size: 0.75rem;
  line-height: 1rem;
  color: ${theme.colors.text.secondary};
  display: block;
  transition: all 200ms ease;

  ${WalletOption}:hover & {
    display: none;
  }
`;

const ConnectText = styled.span`
  font-family: ${theme.typography.fontFamilies.medium};
  font-size: 0.75rem;
  line-height: 1rem;
  color: ${theme.colors.text.secondary};
  display: none;
  transition: all 200ms ease;
  
  ${WalletOption}:hover & {
    display: block;
  }
`;

const Divider = styled.div`
  width: 100%;
  height: 1px;
  border-top: 1px dashed ${theme.colors.border};
  margin: 0;
`;

const OtherWalletsOption = styled.button`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 0.375rem 0.5rem;
  border: none;
  border-radius: 0.75rem;
  background-color: ${theme.colors.background.white};
  cursor: pointer;
  transition: all 200ms ease;
  text-align: left;
  
  &:hover {
    background-color: ${theme.colors.background.primary};
    
    svg {
      color: ${theme.colors.text.primary};
    }
  }
`;

const OtherWalletsText = styled.span`
  font-family: ${theme.typography.fontFamilies.medium};
  font-size: 1rem;
  line-height: 1.5rem;
  color: ${theme.colors.text.secondary};
`;

export default WalletConnectMenu;
