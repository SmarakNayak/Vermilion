import React, { useState, useRef, useEffect, use } from 'react';
import styled from 'styled-components';
import { usePostHog } from 'posthog-js/react';
import { ArrowLeftIcon, ChevronRightIcon, CrossIcon, ErrorCircleIcon, WalletIcon } from '../common/Icon';
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
import Spinner from '../Spinner';

const WALLET_PRIORITY = [
  'xverse',
  'unisat',
  'oyl',
  'magiceden',
  'okx',
  'leather',
  'phantom'
];

const MOBILE_WALLETS = [
  'xverse',
  'okx',
  'magiceden',
  'phantom'
];

const WALLET_DISPLAY_NAMES = {
  'unisat': 'Unisat',
  'xverse': 'Xverse',
  'oyl': 'Oyl',
  'okx': 'OKX',
  'magiceden': 'Magic Eden',
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
  const [connectingWallet, setConnectingWallet] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const menuRef = useRef(null);
  const modalContentRef = useRef(); // Ref for the modal content

  const posthog = usePostHog();

  useEffect(() => {
    const mobileCheck = /iphone|ipad|ipod|ios|android|XiaoMi|MiuiBrowser/i.test(navigator.userAgent);
    setIsMobile(mobileCheck);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'; // Disable page scrolling
    } else {
      document.body.style.overflow = 'auto'; // Enable page scrolling

      // Reset scroll position when modal is closed
      if (modalContentRef.current) {
        modalContentRef.current.scrollTop = 0;
      }
    }

    return () => {
      document.body.style.overflow = 'auto'; // Cleanup on unmount
    };
  }, [isOpen]);

  // Use Zustand store to manage wallet state - has to be top-level
  const setWallet = useStore(state => state.setWallet);
  const setAuthToken = useStore(state => state.setAuthToken);
  const network = useStore(state => state.network);

  useEffect(() => {
    if (isOpen) {
      const checkWallets = async () => {
        setIsLoading(true);
        try {
          const detected = await detectWallets();
          setDetectedWallets(detected);
          // console.log("Detected wallets:", detected); // Detected wallets - not visible in console
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

  const walletsToShow = isMobile
    ? MOBILE_WALLETS
    : showOtherWallets ? WALLET_PRIORITY : getFirstScreenWallets();
  
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
    setConnectingWallet(null);
    setIsConnecting(false);
  };

  const handleWalletConnect = async (walletType) => {
    setError(null);
    setConnectingWallet(walletType); // Track the wallet being connected
    setIsConnecting(true);
    try {
      //1. Connect to the wallet
      let wallet = await connectWallet(walletType, network);
      //2. Fetch sign in message
      const messageResponse = await fetch(`/bun/social/generate_sign_in_message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          address: wallet.ordinalsAddress,
          walletType: wallet.walletType
        })
      });
      const messageJson = await messageResponse.json();
      const signInMessage = messageJson.signInMessage;
      //3. Sign the message
      const signature = await wallet.signMessage(signInMessage, 'bip322', wallet.ordinalsAddress);
      //4. Send the signature to the server
      const verificationResponse = await fetch(`/bun/social/verify_signature`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          address: wallet.ordinalsAddress,
          signInMessage,
          signature,
          signatureType: 'bip322',
        })
      });
      const verificationJson = await verificationResponse.json();
      // 5. Set the auth token in Zustand store
      if (verificationJson.isValid) {
        setAuthToken(verificationJson.authToken);
        setWallet(wallet);
        posthog.identify(
          wallet.ordinalsAddress, 
          { wallet_type: wallet.walletType }
        );
      } else {
        throw new Error('Signature verification failed');
      }
      wallet.setupAccountChangeListener(async (accounts) => {
        if (accounts?.disconnected === true) {
          console.log("Wallet disconnected"); // Wallet disconnected - visible in console
          setWallet(null);
          setAuthToken(null);
          setIsConnecting(false);
          setConnectingWallet(null); // Reset the connecting wallet
        } else {
          // disconnect even if new wallet is connected
          // firing a new signature request with no user interaction is bad UX
          // let newWallet = await connectWallet(walletType, network);
          // setWallet(newWallet);
          setWallet(null);
          setAuthToken(null);
          setIsConnecting(false);
          setConnectingWallet(null); // Reset the connecting wallet
        }
      });
      handleClose();
    } catch (err) {
      console.warn("Error connecting to wallet:", err);
      setError("Error: " + err.message);
      setIsConnecting(false);
      setConnectingWallet(null); // Reset the connecting wallet
    }
  };
  
  const primaryWallets = ['unisat', 'xverse', 'oyl'];
  const allWallets = [...primaryWallets, 'magiceden', 'okx', 'leather', 'phantom'];
  
  const wallets = showOtherWallets ? allWallets : primaryWallets;

  const openAppOrLink = (walletType, isMobileDevice) => {
    const encodedCurrentUrl = encodeURIComponent(window.location.href); // Encode the current URL for deep linking

    if (isMobileDevice) {
      let deepLink = "";
      let useIntermediaryLink = false;
      let intermediaryLink = "";

      // For mobile devices, open the app if installed, otherwise redirect to the wallet's website
      switch (walletType) {
        case 'xverse':
          deepLink = `xverse://browser?url=${encodedCurrentUrl}`;
          break;
        case 'okx':
          const okxUrl = `okx://wallet/dapp/url?dappUrl=${encodedCurrentUrl}`;
          intermediaryLink = `https://web3.okx.com/download?deeplink=${encodeURIComponent(okxUrl)}`;
          useIntermediaryLink = true;
          break;
        case 'phantom':
          deepLink = `https://phantom.app/ul/browse/${encodedCurrentUrl}?ref=${encodeURIComponent("https://vermilion.place")}`;
          break;
        case 'magiceden':
          deepLink = `magiceden://browser?url=${encodedCurrentUrl}`;
          break;
      } 

      if (useIntermediaryLink) {
        // Attempt to open the app via deep link
        window.location.href = intermediaryLink;
        return; 
      } else if (deepLink) {
        // Attempt to open the app via deep link
        window.location.href = deepLink;
        return;
      }
    }

    // Fallback for non-mobile, or if mobile but deep link did not work
    window.open(WALLET_LINKS[walletType], '_blank');
  }
  
  return (
    <MenuContainer ref={menuRef} isOpen={isOpen} onClick={handleMenuClick}>
      <HeaderSection>
        {showOtherWallets && !isMobile ? (
          <Button onClick={goBack}>
            <ArrowLeftIcon size="1.25rem" color={theme.colors.text.secondary} />
          </Button>
        ) : (
          <HeaderTitle>Connect your wallet</HeaderTitle>
        )}
        <Button onClick={handleClose}>
          <CrossIcon size="1.25rem" color={theme.colors.text.secondary} />
        </Button>
      </HeaderSection>
      
      <MenuContent ref={modalContentRef}>
        <WalletOptions>
          {walletsToShow.map(wallet => {
            const isDetected = detectedWallets.includes(wallet);
            const isThisWalletConnecting = connectingWallet === wallet; // Check if this wallet is being connected

            return (
              <WalletOption key={wallet} onClick={isDetected 
                ? () => handleWalletConnect(wallet)
                : () => openAppOrLink(wallet, isMobile)
              }>
                <WalletLogoWrapper>
                  <WalletLogo src={WALLET_LOGOS[wallet]} alt={`${WALLET_DISPLAY_NAMES[wallet]} logo`} />
                </WalletLogoWrapper>
                <WalletName>{WALLET_DISPLAY_NAMES[wallet]}</WalletName>
                {isThisWalletConnecting ? (
                  <Spinner isButton={true} />
                ) : (
                  <StatusLabel>
                    <StatusText>{isDetected ? 'Detected' : ''}</StatusText>
                    <ConnectText>{isDetected ? 'Connect' : 'Install'}</ConnectText>
                  </StatusLabel>
                )}
              </WalletOption>
            );
          })}
        </WalletOptions>
        
        {!isMobile && !showOtherWallets && (
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
          <ErrorContainer style={{ backgroundColor: theme.colors.background.white }}>
            <ErrorCircleIcon size="1rem" color={theme.colors.text.error} />
            <StatusText style={{ color: theme.colors.text.error }}>{error}</StatusText>
          </ErrorContainer>
        )}

      </MenuContent>
    </MenuContainer>
  );
};

const MenuContainer = styled.div`
  // position: absolute;
  // top: 5rem;
  // left: 50%;
  // transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  width: 90%;
  max-width: 25rem;
  background-color: ${theme.colors.background.white};
  border-radius: 1.5rem;
  overflow: hidden;
  z-index: 110;
  box-shadow: ${theme.shadows.soft};
  opacity: ${props => (props.isOpen ? 1 : 0)};
  visibility: ${props => (props.isOpen ? 'visible' : 'hidden')};
  transform: ${props => (props.isOpen ? 'scale(1)' : 'scale(0.92)')};
  transition: opacity 200ms ease, visibility 200ms ease, transform 200ms ease;
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
  line-height: 2rem;
  color: ${theme.colors.text.primary};
  margin: 0;
`;

const Button = styled.button`
  background-color: ${theme.colors.background.white};
  border: none;
  border-radius: 1rem;
  height: 2rem;
  width: 2rem;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0;
  font-size: 1.5rem;
  cursor: pointer;
  transition: all 200ms ease;

  &:hover {
    background-color: ${theme.colors.background.primary};
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
  transition: all 200ms ease;
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
  // border-radius: 0.75rem;
  background-color: transparent;
  // padding: 0.125rem 0.5rem;
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

const ErrorContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.375rem;
  background-color: ${theme.colors.background.white};
  padding: 0.5rem 0.5rem 0 0.5rem;
`;

export default WalletConnectMenu;
