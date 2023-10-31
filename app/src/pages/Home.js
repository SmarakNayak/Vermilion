import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import LogoImage from '../assets/logo-temp.png';
import { lightTheme } from '../styles/themes';

const Home = () => {

  return (
    <PageContainer>
      <TopContainer>
        <LinksContainer>
          <SiteText>vermilion</SiteText>
        </LinksContainer>
      </TopContainer>
      <a href='/discover'>
        <Logo src={"/api/inscription_number/0"} alt='Genesis Inscription'/>
      </a>
      <InfoText>Discover <span style={{fontFamily: 'ABC Camera Unlicensed Trial Bold', color: '#E34234'}}> Bitcoin </span> • Discover <span style={{fontFamily: 'ABC Camera Unlicensed Trial Bold', color: '#E34234'}}> Ordinals</span></InfoText>
      <FooterContainer>
        <LinksContainer>
          <PageLink href='/inscription/714502'>
            714502
          </PageLink>
          <PageLink href='https://github.com/SmarakNayak/Vermilion' target='_blank'>
            GitHub
          </PageLink>
          <PageLink href='https://twitter.com/PHNXX____' target='_blank'>
            X
          </PageLink>
          <PageLink href='https://discord.gg/9JMx3haGWf' target='_blank'>
            Discord
          </PageLink>
          <PageLink href='/inscription/102182'>
            102182
          </PageLink>
        </LinksContainer>
      </FooterContainer>
    </PageContainer>
  )
}

const PageContainer = styled.div`
  width: 100%;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  flex: 1;
  align-items: center;
  justify-content: center;
  position: relative;

  @media (max-width: 768px) {
    padding: 0 2rem;
  }
`;

const TopContainer = styled.div`
  width: 96%;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  position: absolute;
  top: 0;
  height: 4rem;
`;

const SiteText = styled.a`
  font-family: ABC Camera Unlicensed Trial Bold;
  font-size: 1.25rem;
  color: #E34234;
  padding: 0;
  margin: 0;
  cursor: pointer;
  text-decoration: none;
`;

const Logo = styled.img`
  width: 12rem;
  height: 12rem;
  image-rendering: pixelated;
`;

const InfoText = styled.p`
  font-family: ABC Camera Plain Unlicensed Trial Bold;
  font-size: 2rem;
  margin: 2.5rem 0 0 0;
  max-width: 50rem;
  text-align: center;
`;

const FooterContainer = styled.div`
  width: 96%;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  position: absolute;
  bottom: 0;
  height: 4rem;
`;

const LinksContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  column-gap: 1rem;
`;

const PageLink = styled.a`
  font-size: .75rem;
  color: #858585;
  padding: 0;
  margin: 0;
  cursor: pointer;
  text-decoration: none;
  transition: all 250ms ease;

  &:hover {
    color: #000;
  }
`;

export default Home;