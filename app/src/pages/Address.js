import React, { useState, useEffect } from 'react';
import { useParams, Link } from "react-router-dom";
import styled from 'styled-components';
import InscriptionContainer from '../components/InscriptionContainer';
import TopSection from '../components/TopSection';
import Gallery from '../components/Gallery';
import Stack from '../components/Stack';
import EyeIcon from '../assets/icons/EyeIcon';
import { addCommas, copyText, formatAddress } from '../helpers/utils';
import FilterIcon from '../assets/icons/FilterIcon';
import ChevronDownIcon from '../assets/icons/ChevronDownIcon';
import WalletIcon from '../assets/icons/WalletIcon';
import CopyIcon from '../assets/icons/CopyIcon';
import Stat from '../components/Stat';
import BlockRow from '../components/BlockRow';

const Address = () => {
  let { address } = useParams();
  const [inscriptionList, setInscriptionList] = useState([]); 
  const [numberVisibility, setNumberVisibility] = useState(true);
  const [activeTab, setActiveTab] = useState('Inscriptions');

  //1. Get links
  useEffect(() => {
    const fetchContent = async () => {
      setInscriptionList([]);
      //1. Get inscription numbers
      const response = await fetch("/api/inscriptions_in_address/" + address);
      let json = await response.json();
      console.log(json);
      setInscriptionList(json);
    }
    fetchContent();
  },[address])

  // function to toggle visibility of inscription numbers
  const toggleNumberVisibility = () => {
    setNumberVisibility(!numberVisibility);
  };

  // function to update active tab
  const handleTabClick = (tabName) => {
    setActiveTab(tabName);
  };

  //TODO: Add pagination
  return (
    <PageContainer>
      <TopSection />
      <MainContainer>
        {/* Stack placed within main container to allow for filter section */}
        <Stack horizontal={false} center={false} style={{gap: '1.5rem'}}>
          <RowContainer>
            <Container style={{gap: '1rem'}}>
              <BlockImgContainer>
                <WalletIcon svgSize={'2.25rem'} svgColor={'#E34234'}></WalletIcon>
              </BlockImgContainer>
              <BlockText>{formatAddress(address)}</BlockText>
            </Container>
          </RowContainer>
          <RowContainer style={{gap: '1rem'}}>
            <InfoButton isButton={true} onClick={() => copyText(address)}>
              Address: {formatAddress(address)}
              <CopyIcon svgSize={'1rem'} svgColor={'#959595'} />
            </InfoButton>
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

const UnstyledLink = styled(Link)`
  color: unset;
  text-decoration: unset;
`

const LinksContainer = styled.div`
  display: flex;
  flex-direction: row;
  flex: 1;
  align-items: center;
  justify-content: space-between;
  position: relative;
  width: 30%;
  margin-top: 25px;
  margin-bottom: 25px;
`;

const Heading = styled.h2`
  font-family: monospace;
  font-weight: normal;
  margin-top: 50px;
  margin-bottom: 50px;
`

const Masonry = styled.div`
  column-rule: 1px solid #eee;
  column-gap: 50px;
  column-count: 3;
  column-fill: initial;
  transition: all .5s ease-in-out;
`

const Brick = styled.div`
  padding-bottom: 25px;
  margin-bottom: 25px;
  border-bottom: 1px solid #eee;
  //display: inline-block;
  vertical-align: top;
  display: flex;
  justify-content: center;
`

const MetadataContainer = styled.div`
  align-items: baseline;
  display: flex;
  margin-block-start: 1em;
  margin-block-end: 1em;
`

const StyledP = styled.p`
  margin-block-start: 0em;
  margin-block-end: 0em;
  margin-inline-end: 5px;
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
  color: #E34234;  
  background-color:#F9E8E7;
  transition: 
    background-color 350ms ease,
    transform 150ms ease;
  transform-origin: center center;

  &:hover {
    background-color: #F9E8E7;
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

export default Address;