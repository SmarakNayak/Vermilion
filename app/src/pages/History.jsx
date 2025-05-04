import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import CollectionsTable from '../components/CollectionsTable';
import OnChainCollectionsTable from '../components/OnChainCollectionsTable';
import { QuestionIcon } from '../components/common/Icon';
import theme from '../styles/theme';

const History = () => {

  return (
    <MainContainer>
      <LinkContainer>
        <PageText>Order History</PageText>
        <VerticalDivider />
        <ButtonContainer>
          <TabButton to="" isActive={false}>
            <QuestionIcon size={'1.25rem'} />
            Get Help
          </TabButton>
        </ButtonContainer>
      </LinkContainer>
      <Divider />
      <ExploreContainer>
        {/* <CollectionsTable/> */}
      </ExploreContainer>
    </MainContainer>    
  )
}

const MainContainer = styled.div`
  width: calc(100% - 6rem);
  padding: 1.5rem 3rem 2.5rem 3rem;
  margin: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  transition: all 200ms ease;

  @media (max-width: 864px) {
    width: calc(100% - 2rem);
    padding: 1.5rem 1rem 2.5rem 1rem;
  }
`;

const LinkContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  width: 100%;
  gap: .75rem;
`;

const VerticalDivider = styled.div`
  height: 2rem;
  border-right: 1px solid ${theme.colors.border};
`;

const PageText = styled.p`
  font-family: ${theme.typography.fontFamilies.bold};
  font-size: 1.5rem;
  line-height: 2rem;
  margin: 0;
`;

const Divider = styled.div`
  width: 100%;
  border-bottom: 1px solid ${theme.colors.border};
`;

const ButtonContainer = styled.div`
  display: flex;
  flex-direction: row;
  gap: .25rem;
`;

const TabButton = styled(Link)`
  border: none;
  padding: 0 .75rem;
  height: 2rem;
  border-radius: 1rem;
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: .25rem;
  cursor: pointer;
  font-family: ${theme.typography.fontFamilies.medium};
  font-size: 1rem;
  line-height: 1.25rem;
  color: ${theme.colors.text.tertiary}; 
  background-color: ${theme.colors.background.white}; 
  transition: all 200ms ease;
  transform-origin: center center;
  text-decoration: none;

  &:hover {
    color: ${theme.colors.text.primary};
    background-color: ${theme.colors.background.primary};

    svg {
      fill: ${theme.colors.text.primary};
    }
  }

  &:active {
    transform: scale(0.96);
  }

  svg {
    fill: ${theme.colors.text.tertiary};
    transition: fill 200ms ease;
  }
`;

const ExploreContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  flex; 1;
  gap: 1.5rem;
`;

export default History;
