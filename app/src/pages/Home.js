import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import LogoImage from '../assets/logo-temp.png';
import { lightTheme } from '../styles/themes';

const Home = () => {

  return (
    <PageContainer>
      <a href='/inscription/0'>
        <Logo src={"/api/inscription_number/0"} alt='Genesis Inscription'/>
      </a>
      <InfoText>A new mythology for Bitcoin</InfoText>
      <FooterContainer>
        <LinksContainer>
          <PageLink href='' target='_blank'>
            Learn more
          </PageLink>
        </LinksContainer>
        <LinksContainer>
          <PageLink href='https://twitter.com/burn2redeem' target='_blank'>
            Twitter
          </PageLink>
          <PageLink href='https://discord.gg/9JMx3haGWf' target='_blank'>
            Discord
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

const Logo = styled.img`
  width: 16rem;
  height: 16rem;
  image-rendering: pixelated;
`;

const InfoText = styled.p`
  font-family: OptimaRoman;
  font-size: 1.25rem;
  margin: 2.5rem 0 0 0;
  max-width: 50rem;
  text-align: center;
  text-transform: uppercase;
`;

const FooterContainer = styled.div`
  width: 96%;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  position: absolute;
  bottom: 0;
  height: 3rem;
`;

const LinksContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  column-gap: 1.5rem;
`;

const PageLink = styled.a`
  font-family: 'Inter';
  font-weight: 400;
  font-size: .75rem;
  color: ${lightTheme.textTwo};
  padding: 0;
  margin: 0;
  cursor: pointer;
  text-transform: uppercase;
  // transition: all 250ms ease;

  :hover {
    color: ${lightTheme.text};
  }
`;

const MessageText = styled.p`
  font-family: 'Inter';
  font-weight: 400;
  font-size: .75rem;
  color: #05ae66;
  padding: 0;
  margin: 0;
  text-transform: uppercase;
`;

const EmailInput = styled.input`
  margin: 0;
  padding: 0;
  border: none;
  width: 151.52px;
  height: 14.5px;

  font-family: Inter;
  font-weight: 400;
  font-size: .75rem;
  text-transform: uppercase;
  // transition: all 250ms ease;

  ::placeholder {
    color: ${lightTheme.textTwo};
  }

  :hover::placeholder {
    color: ${lightTheme.text};
  }
  
`

export default Home;