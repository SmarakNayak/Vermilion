import React, { useEffect } from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { 
  BlockIcon, 
  BoostIcon, 
  CrossIcon, 
  DiscoverIcon, 
  GridIcon, 
  GalleryIcon, 
  LoginIcon,
  SparklesIcon, 
} from '../common/Icon';
import { theme } from '../../styles/theme';
import Brand from './Brand';
import MenuListItem from './MenuListItem';

const MobileMenu = ({ isOpen, onClose }) => {
  // Close menu when window resizes above mobile breakpoint
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 864 && isOpen) {
        onClose();
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <MenuContainer>
      <MenuHeader>
        <Brand />
        
        <CloseButton onClick={onClose}>
          <CrossIcon size="1.25rem" color={theme.colors.text.secondary} />
        </CloseButton>
      </MenuHeader>

      <MenuContent>
        <LinkSection>
          <MenuListItem 
            link="/trending" 
            action={onClose} 
            icon={BoostIcon} 
            isStandard={true}
            title="Trending"
          />
          <MenuListItem 
            link="/discover" 
            action={onClose} 
            icon={DiscoverIcon} 
            isStandard={true}
            title="Discover"
          />
        </LinkSection>

        <Divider />

        <LinkSection>
          <MenuListItem 
            link="/explore/inscriptions" 
            action={onClose} 
            icon={GridIcon} 
            isStandard={true}
            title="Inscriptions"
          />
          <MenuListItem 
            link="/explore/blocks" 
            action={onClose} 
            icon={BlockIcon} 
            isStandard={true}
            title="Blocks"
          />
          <MenuListItem 
            link="/explore/collections" 
            action={onClose} 
            icon={GalleryIcon} 
            isStandard={true}
            title="Collections"
          />
          <MenuListItem 
            link="/search" 
            action={onClose} 
            icon={SparklesIcon} 
            isStandard={true}
            title="Visual Search"
          />
        </LinkSection>

        <Divider />

        <LinkSection>
          <MenuListItem 
            link="/" 
            action={onClose} 
            icon={LoginIcon} 
            isStandard={true}
            title="Connect Wallet"
          />
        </LinkSection>
      </MenuContent>
    </MenuContainer>
  );
};

const MenuContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: ${theme.colors.background.white};
  z-index: 1000;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
`;

const MenuHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  transition: all 200ms ease;

  @media (max-width: 630px) {
    padding: 0.75rem 1rem;
  }
`;

const CloseButton = styled.button`
  display: flex;
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
`;

const MenuContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 0 0.5rem;
  box-sizing: border-box;
  width: 100%;
`;

const LinkSection = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  box-sizing: border-box;
`;

const MenuItem = styled(Link)`
  display: flex;
  align-items: center;
  width: 100%;
  box-sizing: border-box;
  padding: 0.375rem 0.5rem;
  border-radius: 0.75rem;
  background-color: ${theme.colors.background.white};
  color: ${theme.colors.text.primary};
  font-family: ${theme.typography.fontFamilies.bold};
  font-size: 1rem;
  text-decoration: none;
  transition: all 200ms ease;
  gap: 0.75rem;

  &:hover {
    background-color: ${theme.colors.background.primary};
  }
`;

const IconContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0; 
  width: 2.5rem;
  height: 2.5rem;
  padding: 0.625rem;
  background-color: ${theme.colors.background.primary};
  border: 1px solid ${theme.colors.border};
  border-radius: 0.75rem;
  box-sizing: border-box;
`;

const MenuText = styled.div`
  display: flex;
  align-items: center;
  height: 2.75rem;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
`;

const Divider = styled.div`
  width: calc(100% - 1rem);
  height: 1px;
  background-color: ${theme.colors.border};
  margin: .25rem 0.5rem;
`;

const ConnectButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: 0.75rem 1rem;
  border: none;
  border-radius: 0.75rem;
  background-color: ${theme.colors.background.dark};
  color: ${theme.colors.text.white};
  font-family: ${theme.typography.fontFamilies.bold};
  font-size: 1rem;
  cursor: pointer;
  transition: all 200ms ease;

  &:hover {
    opacity: 0.9;
  }

  &:active {
    transform: scale(0.98);
  }
`;

export default MobileMenu;
