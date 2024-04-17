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
import CheckIcon from '../assets/icons/CheckIcon';
import Stat from '../components/Stat';

const Collection = () => {
  let number = 780346;
  const [inscriptionList, setInscriptionList] = useState([]); 
  const [numberVisibility, setNumberVisibility] = useState(true);

  //1. Get links

  useEffect(() => {
    const fetchContent = async () => {
      //1. Get inscription numbers
      setInscriptionList([]);
      const response = await fetch("/api/inscriptions_in_block/" + number);
      let json = await response.json();
      json = json.sort((a,b)=>b.genesis_fee/b.content_size-a.genesis_fee/a.content_size);
      setInscriptionList(json);
    }
    fetchContent();
  },[number]);

  // function to toggle visibility of inscription numbers
  const toggleNumberVisibility = () => {
    setNumberVisibility(!numberVisibility);
  };

  return (
    <PageContainer>
      <TopSection />
      <MainContainer>
        {/* Stack placed within main container to allow for filter section */}
        <Stack horizontal={false} center={false} style={{gap: '1.5rem'}}>
          <RowContainer>
            <Container style={{gap: '1rem'}}>
              <BlockImgContainer></BlockImgContainer>
              <BlockText>Collection Name</BlockText>
            </Container>
          </RowContainer>
          <RowContainer style={{gap: '1rem'}}>
            <InfoButton>
              <CheckIcon svgSize={'1rem'} svgColor={'#009859'} />
              Mar 20, 2024 @ 15:59
            </InfoButton>
          </RowContainer>
          <RowContainer>
            <Container style={{gap: '1.5rem', flexFlow: 'wrap', justifyContent: 'center'}}>
              <Stat value={addCommas(10001)} category={'Supply'} />
              <Divider />
              <Stat value={'5,988 (59.9%)'} category={'Owners'} />
              <Divider />
              <Stat value={'53,105,612 to 55,543,825'} category={'Range'} />
            </Container>
          </RowContainer>
          <SectionContainer>
            <TabButton>Inscriptions</TabButton>
          </SectionContainer>
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
          <RowContainer>
            <Gallery inscriptionList={inscriptionList} displayJsonToggle={false} numberVisibility={numberVisibility} />
          </RowContainer>
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
  width: 100%;
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
  border: none;
  border-bottom: 2px #E34234 solid;
  padding: .5rem 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-family: 'ABC Camera Plain Unlicensed Trial Medium';
  font-size: .875rem;
  color: #E34234;
  background-color: #FFFFFF;
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

const Divider = styled.div`
  height: 1.5rem;
  border: 1px solid #E9E9E9;
`;

const InfoButton = styled.button`
  border-radius: 1.5rem;
  border: none;
  padding: .5rem 1rem;
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: ${props => props.isButton ? 'pointer' : 'default'};
  gap: .5rem;
  font-family: 'ABC Camera Plain Unlicensed Trial Regular';
  font-size: .875rem;
  color: #000000;  
  background-color:#F5F5F5;
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

export default Collection;