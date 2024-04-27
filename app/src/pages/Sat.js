import React, { useState, useEffect } from 'react';
import { useParams, Link } from "react-router-dom";
import styled from 'styled-components';
import InscriptionContainer from '../components/InscriptionContainer';
import TopSection from '../components/TopSection';
import Gallery from '../components/Gallery';
import Stack from '../components/Stack';
import EyeIcon from '../assets/icons/EyeIcon';
import BlockIcon from '../assets/icons/BlockIcon';
import { addCommas, copyText } from '../helpers/utils';
import FilterIcon from '../assets/icons/FilterIcon';
import ChevronDownIcon from '../assets/icons/ChevronDownIcon';
import ClockIcon from '../assets/icons/ClockIcon';
import CopyIcon from '../assets/icons/CopyIcon';
import Stat from '../components/Stat';
import BlockRow from '../components/BlockRow';
import SortbyDropdown from '../components/Dropdown';

const Sat = () => {
  let { sat } = useParams();
  const [inscriptions, setInscriptions] = useState([]); 
  const [metadata, setMetadata] = useState(null);
  const [numberVisibility, setNumberVisibility] = useState(true);
  const [activeTab, setActiveTab] = useState('Inscriptions');

  //1. Get links
  useEffect(() => {
    const fetchInscriptions = async () => {
      setInscriptions([]);
      //1. Get inscription numbers
      const response = await fetch("/api/inscriptions_on_sat/" + sat);
      let json = await response.json();
      console.log(json);
      setInscriptions(json);
    }
    const fetchSatMetadata = async () => {
      setMetadata(null);
      const response = await fetch("/api/sat_metadata/" + sat);
      let json = await response.json();
      console.log(json);
      setMetadata(json);
    }
    fetchInscriptions();
    fetchSatMetadata();
  },[sat]);

  // function to toggle visibility of inscription numbers
  const toggleNumberVisibility = () => {
    setNumberVisibility(!numberVisibility);
  };

  // function to update active tab
  const handleTabClick = (tabName) => {
    setActiveTab(tabName);
  };

  const handleSortOptionChange = (option) => {
    let sortedInscriptions = [...inscriptions];    
    if (option==="newest") {
      sortedInscriptions = sortedInscriptions.sort((a,b)=>b.sequence_number-a.sequence_number);
    } else if (option==="oldest") {
      sortedInscriptions = sortedInscriptions.sort((a,b)=>a.sequence_number-b.sequence_number);
    } else if (option==="newest_sat") {
      sortedInscriptions = sortedInscriptions.sort((a,b)=>b.sat-a.sat);
    } else if (option==="oldest_sat") {
      sortedInscriptions = sortedInscriptions.sort((a,b)=>a.sat-b.sat);
    } else if (option==="biggest") {
      sortedInscriptions = sortedInscriptions.sort((a,b)=>b.content_length-a.content_length);
    } else if (option==="smallest") {
      sortedInscriptions = sortedInscriptions.sort((a,b)=>a.content_length-b.content_length);
    } else if (option==="highest_fee") {
      sortedInscriptions = sortedInscriptions.sort((a,b)=>b.genesis_fee-a.genesis_fee);
    } else if (option==="lowest_fee") {
      sortedInscriptions = sortedInscriptions.sort((a,b)=>a.genesis_fee-b.genesis_fee);
    }
    setInscriptions(sortedInscriptions);
    console.log('Selected inscription sort option:', option);
  };

  //TODO: Add pagination
  return (
    <MainContainer>
      <RowContainer>
        <Container style={{gap: '1rem'}}>
          <BlockImgContainer>
            <BlockIcon svgSize={'2.25rem'} svgColor={'#E34234'}></BlockIcon>
          </BlockImgContainer>
          <BlockText>Sat {addCommas(sat)}</BlockText>
        </Container>
      </RowContainer>
      <RowContainer style={{gap: '1rem'}}>
        <InfoButton>
          <ClockIcon svgSize={'1rem'} svgColor={'#000000'} />
          {metadata?.timestamp ? new Date(metadata?.timestamp*1000).toLocaleString(undefined, {day:"numeric", month: "short", year:"numeric", hour: 'numeric', minute: 'numeric', hour12: true}) : ""}
        </InfoButton>
        <InfoButton isButton={true} onClick={() => copyText(sat)}>
          {'Sat Number: ' + sat}
          <CopyIcon svgSize={'1rem'} svgColor={'#959595'} />
        </InfoButton>
      </RowContainer>
      {metadata?.satributes.length > 0 && (
        <RowContainer style={{gap: '1rem'}}>
          {metadata?.satributes.map(
              entry => 
              <InfoButton> 
                {entry}
              </InfoButton>
            )}
        </RowContainer>
      )}
      <RowContainer>
        <Container style={{gap: '2rem', flexFlow: 'wrap', justifyContent: 'center'}}>
          <Stat value={metadata?.rarity ? metadata?.rarity.charAt(0).toUpperCase() + metadata?.rarity.slice(1) : ""} category={'Rarity'} />
          {/* <Divider /> */}
          <Stat value={metadata?.name ? metadata?.name : ""} category={'Name'} />
          {/* <Divider /> */}
          <UnstyledLink to={"/sat_block/" + metadata?.block}>
            <Stat value={metadata?.block ? addCommas(metadata?.block) : 0} category={'Creation Block'} />
          </UnstyledLink>
          {/* <Divider /> */}
          <Stat value={metadata?.epoch} category={'Epoch'} />
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
          <SortbyDropdown onOptionSelect={handleSortOptionChange} />
      </RowContainer>
      <RowContainer>
        <GalleryContainer>
          <Gallery inscriptionList={inscriptions} displayJsonToggle={false} numberVisibility={numberVisibility} />
        </GalleryContainer>
      </RowContainer>
    </MainContainer>
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
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;

  @media (max-width: 630px) {
    width: calc(100% - 3rem);
    padding: 1rem 1.5rem 2.5rem 1.5rem;
  }
`;

const RowContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  justify-content: center;
  width: 100%;
`;

const GalleryContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const UnstyledLink = styled(Link)`
  color: unset;
  text-decoration: unset;
`;

const BlockImgContainer = styled.div`
  width: 3.75rem;
  height: 3.75rem;
  background-color: #F5F5F5;
  border-radius: .5rem;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const BlockText = styled.p`
  font-family: Relative Trial Bold;
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
  padding-bottom: 1.5rem;
  border-bottom: 1px #E9E9E9 solid;
  // overflow: scroll;
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
  font-family: Relative Trial Bold;
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
  font-family: Relative Trial Medium;
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
  font-family: Relative Trial Medium;
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
  font-family: Relative Trial Medium;
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

export default Sat;