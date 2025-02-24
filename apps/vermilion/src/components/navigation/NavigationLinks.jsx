import PropTypes from 'prop-types'
import styled from 'styled-components'
import { ChevronDownSmallIcon } from '../common/Icon'
import { useState } from 'react'
import theme from '../../styles/theme';

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

const NavLink = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: .25rem;
  font-family: relative-medium-pro;
  height: 2.5rem;
  padding: 0 1rem;
  border-radius: 1.25rem;
  color: ${({theme}) => theme.colors.text.secondary};
  background-color: ${props => props.active ? '#000000' : 'transparent'};
  cursor: pointer;
  transition: all 200ms ease;

  &:hover {
    background-color: ${props => props.active ? '#000000' : theme.colors.background.primary};
    color: ${({theme}) => theme.colors.text.primary};
  }
`;

const DropdownContainer = styled.div`
  position: absolute;
  top: calc(100% + .5rem);
  left: 0;
  background-color: ${({theme}) => theme.colors.background.white};
  // border: 1px solid ${({theme}) => theme.colors.background.primary};
  border-radius: ${({theme}) => theme.borderRadius.large};
  box-shadow: ${({theme}) => theme.shadows.soft};
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
  font-family: relative-medium-pro;
  padding: 0 .75rem;
  height: 2.5rem;
  border-radius: ${({theme}) => theme.borderRadius.medium};
  color: ${({theme}) => theme.colors.text.secondary};
  text-decoration: none;
  transition: all 200ms ease;

  &:hover {
    background-color: ${({theme}) => theme.colors.background.primary};
    color: ${({theme}) => theme.colors.text.primary};
  }
`;

const NavigationLinks = () => {
  return (
    <NavContainer>
      <NavLinkWrapper>
        <NavLink>
          Explore
        </NavLink>
        <DropdownContainer className="dropdown">
          <DropdownItem href="/explore/inscriptions">Inscriptions</DropdownItem>
          <DropdownItem href="/explore/blocks">Blocks</DropdownItem>
          <DropdownItem href="/explore/collections">Collections</DropdownItem>
        </DropdownContainer>
      </NavLinkWrapper>
      <NavLink>Discover</NavLink>
      <NavLink>Search</NavLink>
    </NavContainer>
  );
}

export default NavigationLinks
