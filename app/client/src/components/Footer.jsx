import React, { useState, useEffect, ChangeEvent } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { BurgerMenuIcon } from './common/Icon';

const Footer = (props) => {


  return (
    <FooterContainer>
      <SiteText to ={'/explore'}>vermilion</SiteText>
      <ButtonContainer>
        <LinkContainer>
          <UnstyledLink to={'/explore/'}>
            <LinkButton>Explore</LinkButton>
          </UnstyledLink>
          <UnstyledLink to={'/discover'}>
            <LinkButton>Discover</LinkButton>
          </UnstyledLink>
          <UnstyledLink to={'/search'}>
            <LinkButton>Search</LinkButton>
          </UnstyledLink>
        </LinkContainer>
        <ConnectButton>Connect</ConnectButton>
        <MenuButton>
          <BurgerMenuIcon size='1rem' color='black'></BurgerMenuIcon>
        </MenuButton>
      </ButtonContainer>
    </FooterContainer>
  )
}

const FooterContainer = styled.div`
  display: flex;
  flex-direction: row;
  // flex: 1;
  align-items: center;
  justify-content: space-between;
  position: sticky;
  top: 0;
  width: calc(100% - 3rem);
  z-index: 1;
  padding: 1rem 1.5rem;
  margin: 0;
  background-color: #FFFFFF;
  
  @media (max-width: 630px) {
    width: calc(100% - 3rem);
    padding: 1rem 1.5rem 1rem 1.5rem;
  }
`

const ConnectButton = styled.div`
  border-radius: 2rem;
  border: none;
  padding: .5rem 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-family: 'ABC Camera Plain Unlicensed Trial Medium';
  font-size: .875rem;
  color: #E34234;
  background-color: #F9E8E7;

  @media (max-width: 630px) {
    display: none;
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 1rem;
`;

const LinkContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;

  @media (max-width: 630px) {
    display: none;
  }
`;

const LinkButton = styled.div`
  border-radius: 2rem;
  border: none;
  padding: .5rem 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-family: 'ABC Camera Plain Unlicensed Trial Medium';
  font-size: .875rem;
  color: #000000;
  background-color: #FFFFFF;
  transition: all 350ms ease;

  &:hover {
    background-color: #F5F5F5;
  }
`;

const MenuButton = styled.button`
  height: 40px;
  width: 40px;
  border-radius: .5rem;
  border: none;
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-family: 'ABC Camera Plain Unlicensed Trial Medium';
  font-size: .875rem;
  color: #000000;
  background-color: #FFFFFF;

  @media (min-width: 630px) {
    display: none;
  }
`;

const UnstyledLink = styled(Link)`
  color: unset;
  text-decoration: unset;
`;

const SiteText = styled(Link)`
  font-family: ABC Camera Unlicensed Trial Bold;
  font-size: 1.25rem;
  color: #E34234;
  padding: 0;
  margin: 0;
  cursor: pointer;
  text-decoration: none;
`;

export default Footer;
