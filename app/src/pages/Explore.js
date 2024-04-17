import React, { useState, useEffect } from 'react';
import { useParams, Link } from "react-router-dom";
import styled from 'styled-components';
import Gallery from '../components/Gallery';
import TopSection from '../components/TopSection';
import Stack from '../components/Stack';
import EyeIcon from '../assets/icons/EyeIcon';
import BlockIcon from '../assets/icons/BlockIcon';
import { addCommas } from '../helpers/utils';
import FilterIcon from '../assets/icons/FilterIcon';
import ChevronDownIcon from '../assets/icons/ChevronDownIcon';
import Stat from '../components/Stat';
import BlockRow from '../components/BlockRow';

const Explore = () => {
  let number = 780346;
  const [inscriptionList, setInscriptionList] = useState([]); 
  const [numberVisibility, setNumberVisibility] = useState(true);
  const [activeTab, setActiveTab] = useState('Inscriptions');

  //1. Get links
  useEffect(() => {
    const fetchContent = async () => {
      //1. Get inscription numbers
      setInscriptionList([]);
      // const response = await fetch("/api/inscriptions_in_block/" + number);
      const response = await fetch("/api/inscriptions?content_types=image&page_size=20&page_number=1&sort_by=highest_fee");
      let json = await response.json();
      // json = json.sort((a,b)=>b.genesis_fee/b.content_size-a.genesis_fee/a.content_size);
      setInscriptionList(json);
    }
    fetchContent();
  },[number]);

  // function to toggle visibility of inscription numbers
  const toggleNumberVisibility = () => {
    setNumberVisibility(!numberVisibility);
  };

  // function to update active tab
  const handleTabClick = (tabName) => {
    setActiveTab(tabName);
  };

  return (
    <PageContainer>
      <TopSection />
      <MainContainer>
        {/* Stack placed within main container to allow for filter section */}
        <Stack horizontal={false} center={false} style={{gap: '1.5rem'}}>
          <RowContainer style={{justifyContent: 'flex-start'}}>
            <PageText>Explore</PageText>
          </RowContainer>
          <SectionContainer>
            {/* Update onClick to change active tab */}
            <TabButton 
              onClick={() => handleTabClick('Inscriptions')}
              isActive={activeTab === 'Inscriptions'}
              >
              Inscriptions
            </TabButton>
            <TabButton 
              onClick={() => handleTabClick('Blocks')}
              isActive={activeTab === 'Blocks'}
              >
              Blocks
            </TabButton>
            <TabButton 
              onClick={() => handleTabClick('Collections')}
              isActive={activeTab === 'Collections'}
              >
              Collections
            </TabButton>
          </SectionContainer>
            {/* 3. Conditional Rendering */}
            {activeTab === 'Inscriptions' && (
              <Stack horizontal={false} center={false} style={{gap: '1.5rem'}}>
                <RowContainer>
                  <Stack horizontal={true} center={false} style={{gap: '1rem'}}>
                    {/* <FilterButton>
                      <FilterIcon svgSize={'1rem'} svgColor={'#000000'}></FilterIcon>  
                      Filters
                    </FilterButton> */}
                    <VisibilityButton onClick={toggleNumberVisibility}>
                      <EyeIcon svgSize={'1rem'} svgColor={numberVisibility ? '#000000' : '#959595'}></EyeIcon>
                    </VisibilityButton>
                  </Stack>
                  <FilterButton>
                    Newest
                    <ChevronDownIcon svgSize={'1rem'} svgColor={'#000000'}></ChevronDownIcon>
                  </FilterButton>
                </RowContainer>
                <Gallery inscriptionList={inscriptionList} displayJsonToggle={false} numberVisibility={numberVisibility} />
              </Stack>
            )}
            {activeTab === 'Blocks' && (
              <Stack horizontal={false} center={false} style={{gap: '1.5rem'}}>
                <div>Blocks placeholder</div>
              </Stack>
            )}
            {activeTab === 'Collections' && (
              <Stack horizontal={false} center={false} style={{gap: '1.5rem'}}>
                <div>Collections placeholder</div> 
              </Stack>
            )}
        </Stack>
      </MainContainer>
    </PageContainer>
    
  )
}
  
const PageContainer = styled.div`
  width: 100%;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  // flex: 1;
  align-items: start;
  // justify-content: center;
  margin: 0;

  @media (max-width: 768px) {
    
  }
`;

const MainContainer = styled.div`
  width: calc(100% - 3rem);
  padding: .5rem 1.5rem 2.5rem 1.5rem;
  margin: 0;
  display: flex;
  flex-direction: row;
  align-items: flex-start;

  @media (max-width: 630px) {
    width: calc(100% - 3rem);
    padding: 1rem 1.5rem 2.5rem 1.5rem;
  }
`;

const RowContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  width: 100%;
`;

const PageText = styled.p`
    font-family: ABC Camera Plain Unlicensed Trial Medium;
    font-size: 1.25rem;
    margin: 0;
`;

const BlockImgContainer = styled.div`
  width: 3.75rem;
  height: 3.75rem;
  background-color: #F5F5F5;
  border-radius: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const BlockText = styled.p`
  font-family: ABC Camera Plain Unlicensed Trial Medium;
  font-size: 1.5rem;
  margin: 0;
`;

const Container = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
`;

const StatusWrapper = styled.div`
  display: flex;
  padding: .5rem 1rem;
  border-radius: .5rem;
  background-color: #EBFCF4;
`;

const StatusText = styled.p`
  font-family: ABC Camera Plain Unlicensed Trial Medium;
  font-size: .875rem;
  color: #009859;
  margin: 0;
`;

const StatsText = styled.p`
  font-size: .875rem;
  margin: 0;
`;

const SectionContainer = styled.div`
  display: flex;
  flex-direction: row;
  flex: 1;
  gap: 1rem;
  width: 100%;
  padding-bottom: 1rem;
  border-bottom: 1px #E9E9E9 solid;
`;

const ShareButton = styled.button`
  height: 36px;
  border-radius: .5rem;
  border: none;
  padding: .5rem 1rem;
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-family: 'ABC Camera Plain Unlicensed Trial Medium';
  font-size: .875rem;
  color: #FFFFFF;
  background-color: #000000;
`;

const TabButton = styled.button`
  border-radius: .5rem;
  border: none;
  padding: .5rem 1rem;
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  gap: .5rem;
  font-family: 'ABC Camera Plain Unlicensed Trial Medium';
  font-size: .875rem;
  color: ${props => props.isActive ? '#E34234' : '#959595'}; // Change text color based on isActive
  background-color: ${props => props.isActive ? '#F9E8E7' : '#FFFFFF'}; // Change background based on isActive
  transition: 
    background-color 350ms ease,
    transform 150ms ease;
  transform-origin: center center;

  &:hover {
    background-color: ${props => props.isActive ? '#F9E8E7' : '#F5F5F5'};
  }

  &:active {
    transform: scale(0.96);
  }
`;

const VisibilityButton = styled.button`
  height: 40px;
  width: 40px;
  border-radius: .5rem;
  border: none;
  padding: .5rem;
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-family: 'ABC Camera Plain Unlicensed Trial Medium';
  font-size: .875rem;
  color: #959595;
  background-color: #F5F5F5;
  transition: 
    background-color 350ms ease,
    transform 150ms ease;
  transform-origin: center center;

  &:hover {
    background-color: #E9E9E9;
  }

  &:active {
    transform: scale(0.96);
  }
`;

const FilterButton = styled.button`
  height: 40px;
  border-radius: .5rem;
  border: none;
  padding: .5rem 1rem;
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  gap: .5rem;
  font-family: 'ABC Camera Plain Unlicensed Trial Medium';
  font-size: .875rem;
  color: #000000;
  background-color: #F5F5F5;
  transition: 
    background-color 350ms ease,
    transform 150ms ease;
  transform-origin: center center;

  &:hover {
    background-color: #E9E9E9;
  }

  &:active {
    transform: scale(0.96);
  }
`;

export default Explore;