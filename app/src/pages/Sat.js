import React, { useState, useEffect } from 'react';
import { useParams, Link } from "react-router-dom";
import styled from 'styled-components';
import InscriptionContainer from '../components/InscriptionContainer';
import TopSection from '../components/TopSection';
import Gallery from '../components/Gallery';
import Stack from '../components/Stack';
import EyeIcon from '../assets/icons/EyeIcon';
import BlockIcon from '../assets/icons/BlockIcon';
import { addCommas, copyText, formatAddress } from '../helpers/utils';
import FilterIcon from '../assets/icons/FilterIcon';
import ChevronDownIcon from '../assets/icons/ChevronDownIcon';
import ClockIcon from '../assets/icons/ClockIcon';
import CopyIcon from '../assets/icons/CopyIcon';
import Stat from '../components/Stat';
import BlockRow from '../components/BlockRow';
import SortbyDropdown from '../components/Dropdown';
import CollectionIcon from '../components/CollectionIcon';
import Tag from '../components/Tag';
import LinkTag from '../components/LinkTag';

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
      <HeaderContainer>
        <MainContentStack>
          <InfoText>Sat</InfoText>
          <InfoStack>
            <BlockImageContainer>
              <BlockIcon svgSize={'2rem'} svgColor={'#E34234'}></BlockIcon>
            </BlockImageContainer>
            <Stack gap={'.5rem'}>
              <MainText>{addCommas(sat)}</MainText>
              <Stack gap={'.75rem'} horizontal={true} center={true} style={{flexFlow: 'wrap'}}>
                <InfoButton isButton={true} onClick={() => copyText(sat)}>
                  {formatAddress(sat)}
                  <CopyIcon svgSize={'1rem'} svgColor={'#959595'} />
                </InfoButton>
                <InfoText>Created {metadata?.timestamp ? new Date(metadata?.timestamp*1000).toLocaleString(undefined, {day:"numeric", month: "short", year:"numeric", hour: 'numeric', minute: 'numeric', hour12: true}) : ""}</InfoText>
              </Stack>
            </Stack>
          </InfoStack>
        </MainContentStack>
      </HeaderContainer>
      {metadata?.satributes.length > 0 && (
        <RowContainer style={{alignItems: 'center', gap: '.5rem', flexFlow: 'wrap'}}>
          {metadata?.satributes.map(
              entry => 
              <Tag isLarge={true} value={entry}></Tag>
            )}
        </RowContainer>
      )}
      <RowContainer style={{gap: '.5rem', flexFlow: 'wrap'}}>
        <Tag isLarge={true} value={metadata?.rarity ? metadata?.rarity.charAt(0).toUpperCase() + metadata?.rarity.slice(1) : ""} category={'Rarity'} />
        <Tag isLarge={true} value={metadata?.name ? metadata?.name : ""} category={'Name'} />
        <LinkTag isLarge={true} link={"/sat_block/" + metadata?.block} value={metadata?.block ? addCommas(metadata?.block) : 0} category={'Creation Block'} />
        <Tag isLarge={true} value={metadata?.epoch} category={'Epoch'} />
      </RowContainer>
      {/* <RowContainer>
        <Container style={{gap: '2rem', flexFlow: 'wrap', justifyContent: 'center'}}>
          <Stat value={metadata?.rarity ? metadata?.rarity.charAt(0).toUpperCase() + metadata?.rarity.slice(1) : ""} category={'Rarity'} />
          <Stat value={metadata?.name ? metadata?.name : ""} category={'Name'} />
          <UnstyledLink to={"/sat_block/" + metadata?.block}>
            <Stat value={metadata?.block ? addCommas(metadata?.block) : 0} category={'Creation Block'} />
          </UnstyledLink>
          <Stat value={metadata?.epoch} category={'Epoch'} />
        </Container>
      </RowContainer> */}
      <Divider></Divider>
      <RowContainer>
        <Stack horizontal={true} center={false} style={{gap: '.75rem'}}>
          <VisibilityButton onClick={toggleNumberVisibility}>
            <EyeIcon svgSize={'1.25rem'} svgColor={numberVisibility ? '#000000' : '#959595'}></EyeIcon>
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
  width: calc(100% - 6rem);
  padding: 1.5rem 3rem 2.5rem 3rem;
  margin: 0;
  display: flex;
  flex-direction: column;
  // align-items: flex-start;
  gap: 1.5rem;

  @media (max-width: 630px) {
    width: calc(100% - 3rem);
    padding: 1.5rem 1.5rem 2.5rem 1.5rem;
  }
`;

const HeaderContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  width: 100%;

  @media (max-width: 864px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 1.5rem;
  }
`;

const MainContentStack = styled.div`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  max-width: calc(100% - 10.5rem); // Adjust this value based on the maximum width of your social icons stack
  gap: .5rem;

  @media (max-width: 864px) {
    max-width: 100%;
  }
`;

const InfoStack = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 1rem;

  @media (max-width: 480px) {
    flex-direction: column;
    align-items: flex-start;
  }
`;

const RowContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  // justify-content: center;
  width: 100%;
`;

const GalleryContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const BlockImageContainer = styled.div`
  width: 8rem;
  height: 8rem;
  background-color: #F5F5F5;
  border-radius: .25rem;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const MainText = styled.p`
  font-family: Relative Trial Bold;
  font-size: 2rem;
  margin: 0;
`;

const InfoText = styled.p`
  font-family: Relative Trial Medium;
  font-size: ${props => props.isLarge ? '1rem' : '.875rem'};
  color: ${props => props.isPrimary ? '#000000' : '#959595'};
  margin: 0;
`;

const VisibilityButton = styled.button`
  height: 3rem;
  width: 3rem;
  border-radius: 1.5rem;
  border: none;
  padding: .5rem;
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
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
  height: 3rem;
  width: 3rem;
  border-radius: 1.5rem;
  border: none;
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  gap: .5rem;
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
  width: 100%;
  border-bottom: 1px solid #E9E9E9;
`;

const InfoButton = styled.button`
  border-radius: 1.5rem;
  border: none;
  padding: .25rem .75rem;
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: ${props => props.isButton ? 'pointer' : 'default'};
  gap: .5rem;
  font-family: Relative Trial Medium;
  font-size: .875rem;
  color: #959595;  
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