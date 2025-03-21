import PropTypes from 'prop-types'
import styled from 'styled-components'
import { BlockIcon, ChevronDownSmallIcon, DiscoverIcon, ExploreIcon, GalleryIcon, GridIcon, SparklesIcon } from '../common/Icon'
import { useState } from 'react'
import theme from '../../styles/theme';
import { Link } from 'react-router-dom';

const NavContainer = styled.nav`
  display: flex;
  align-items: center;
  gap: .25rem;

  @media (max-width: 864px) {
    display: none;
  }
`;

const NavLinkWrapper = styled.div`
  position: relative;
  
  &:hover {
    .dropdown {
      opacity: 1;
      visibility: visible;
    }
  }
`;

const NavLink = styled(Link)`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: .375rem;
  font-family: ${theme.typography.fontFamilies.medium};
  line-height: 1.25rem;
  height: 2.5rem;
  padding: 0 1rem;
  border-radius: 1.25rem;
  color: ${theme.colors.text.secondary};
  background-color: ${theme.colors.background.white};
  cursor: pointer;
  transition: all 200ms ease;
  text-decoration: none;
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

const DropdownContainer = styled.div`
  position: absolute;
  top: calc(100% + .5rem);
  left: 0;
  background-color: ${theme.colors.background.white};
  // border: 1px solid ${theme.colors.background.primary};
  border-radius: ${theme.borderRadius.large};
  box-shadow: ${theme.shadows.soft};
  min-width: 12rem;
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

const NavigationLinks = () => {
  return (
    <NavContainer>
      <NavLinkWrapper>
        <NavLink to={'/explore/inscriptions'}>
          <ExploreIcon size={'1.25rem'} />
          Explore
        </NavLink>
        <DropdownContainer className="dropdown">
          <DropdownItem href="/explore/inscriptions">
            <GridIcon size={'1.25rem'} />
            Inscriptions
          </DropdownItem>
          <DropdownItem href="/explore/blocks">
            <BlockIcon size={'1.25rem'} />
            Blocks
          </DropdownItem>
          <DropdownItem href="/explore/collections">
            <GalleryIcon size={'1.25rem'} />  
            Collections
          </DropdownItem>
        </DropdownContainer>
      </NavLinkWrapper>
      <NavLink to="/discover">
        <DiscoverIcon size={'1.25rem'} />
        Discover
      </NavLink>
      {/* <NavLink>Search</NavLink> */}
    </NavContainer>
  );
}

export default NavigationLinks
