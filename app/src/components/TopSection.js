import React, { useState, useEffect, ChangeEvent } from 'react';
import { Link } from "react-router-dom";
import styled from 'styled-components';

const TopSection = (props) => {

  return (
    <HeaderContainer>
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
      </ButtonContainer>
    </HeaderContainer>
  )
}

const HeaderContainer = styled.div`
  display: flex;
  flex-direction: row;
  // flex: 1;
  align-items: center;
  justify-content: space-between;
  position: sticky;
  top: 0;
  width: calc(100% - 3rem);
  z-index: 1;
  padding: 0 1.5rem;
  margin: 0;
  height: 4.5rem;
  background-color: #FFFFFF;
`;

const ConnectButton = styled.button`
  height: 2.5rem;
  border-radius: 2rem;
  border: none;
  padding: 0 1rem;
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  gap: .5rem;
  font-family: ABC Camera Plain Unlicensed Trial Medium;
  font-size: .875rem;
  color: #FFFFFF;  
  background-color:#000000;
  transition: 
    transform 150ms ease;
  transform-origin: center center;

  &:active {
    transform: scale(0.96);
  }

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

  @media (max-width: 425px) {
    gap: 1rem;
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

  @media (max-width: 425px) {
    padding: 0;
    flex-direction: column;
    align-items: flex-start;

    &:hover {
      background-color: transparent;
    }
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

export default TopSection;