import React, { useState, useEffect } from 'react';
import { useParams, Link } from "react-router-dom";
import styled from 'styled-components';
import { renderToStaticMarkup } from 'react-dom/server';

import InscriptionContainer from '../components/InscriptionContainer';
import TopSection from '../components/TopSection';
import GalleryInfiniteScroll from '../components/GalleryInfiniteScroll';
import Stack from '../components/Stack';
import EyeIcon from '../assets/icons/EyeIcon';
import { addCommas, copyText, formatAddress } from '../helpers/utils';
import FilterIcon from '../assets/icons/FilterIcon';
import ChevronDownIcon from '../assets/icons/ChevronDownIcon';
import WalletIcon from '../assets/icons/WalletIcon';
import CopyIcon from '../assets/icons/CopyIcon';
import GridIcon from '../assets/icons/GridIcon';
import Stat from '../components/Stat';
import BlockRow from '../components/BlockRow';

import SortbyDropdown from '../components/Dropdown';
import FilterMenu from '../components/FilterMenu';

const Address = () => {
  let { address } = useParams();
  const [baseApi, setBaseApi] = useState(null); 
  const [inscriptionList, setInscriptionList] = useState([]); 
  const [numberVisibility, setNumberVisibility] = useState(true);
  const [filterVisibility, setFilterVisibility] = useState(false);
  const [zoomGrid, setZoomGrid] = useState(true);

  const [activeTab, setActiveTab] = useState('Inscriptions');
  const [selectedSortOption, setSelectedSortOption] = useState('newest');
  const [selectedFilterOptions, setSelectedFilterOptions] = useState({"Content Type": ["image", "gif", "audio", "video", "html"], "Satributes": [], "Charms":[]});

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

    //Get inscriptions endpoint
    useEffect(() => {
      let query_string = "/api/inscriptions_in_address/" + address + "?sort_by=" + selectedSortOption;
      if (selectedFilterOptions["Content Type"] !== undefined && selectedFilterOptions["Content Type"].length > 0) {
        console.log("hit");
        query_string += "&content_types=" + selectedFilterOptions["Content Type"].toString();
      }
      if (selectedFilterOptions["Satributes"] !== undefined && selectedFilterOptions["Satributes"].length > 0) {
        query_string += "&satributes=" + selectedFilterOptions["Satributes"].toString();
      }
      if (selectedFilterOptions["Charms"] !== undefined && selectedFilterOptions["Charms"].length > 0) {
        query_string += "&charms=" + selectedFilterOptions["Charms"].toString();
      }
      setBaseApi(query_string);
    },[address, selectedSortOption, selectedFilterOptions]);

  // function to toggle visibility of inscription numbers
  const toggleNumberVisibility = () => {
    setNumberVisibility(!numberVisibility);
  };

  const toggleFilterVisibility = () => {
    setFilterVisibility(!filterVisibility);
  };

  const toggleGridType = () => {
    setZoomGrid(!zoomGrid);
  };

  // function to update active tab
  const handleTabClick = (tabName) => {
    setActiveTab(tabName);
  };

  const handleSortOptionChange = (option) => {
    setSelectedSortOption(option);
    // Perform any necessary actions with the selected option
    console.log('Selected inscription sort option:', option);
  };

  const handleFilterOptionsChange = (filterOptions) => {
    setSelectedFilterOptions(filterOptions);
    console.log('Selected filter option:', filterOptions);
  };

  //TODO: Add pagination
  return (
    <MainContainer>
      <HeaderContainer>
        <MainContentStack>
          <InfoText>Address</InfoText>
          <InfoStack>
            <AddressImageContainer>
              <WalletIcon svgSize={'2rem'} svgColor={'#E34234'}></WalletIcon>
            </AddressImageContainer>
            <Stack gap={'.5rem'}>
              <MainText>{formatAddress(address)}</MainText>
              <InfoButton isButton={true} onClick={() => copyText(address)}>
                {formatAddress(address)}
                <CopyIcon svgSize={'1rem'} svgColor={'#959595'} />
              </InfoButton>
            </Stack>
          </InfoStack>
        </MainContentStack>
      </HeaderContainer>
      {/* <RowContainer>
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
      </RowContainer> */}
      <Divider></Divider>
      <RowContainer style={{justifyContent: 'flex-start'}}>
        <ButtonContainer>
          <TabButton 
            onClick={() => handleTabClick('Inscriptions')}
            isActive={activeTab === 'Inscriptions'}
            >
            Inscriptions
          </TabButton>
          <TabButton 
            onClick={() => handleTabClick('Bookmarks')}
            isActive={activeTab === 'Bookmarks'}
            >
            Bookmarks
          </TabButton>
        </ButtonContainer>
      </RowContainer>
      <RowContainer>
        <Stack horizontal={true} center={false} style={{gap: '1rem'}}>
          <FilterButton onClick={toggleFilterVisibility}>
            <FilterIcon svgSize={'1.25rem'} svgColor={'#000000'}></FilterIcon>
          </FilterButton>
          <VisibilityButton onClick={toggleNumberVisibility}>
            <EyeIcon svgSize={'1.25rem'} svgColor={numberVisibility ? '#000000' : '#959595'}></EyeIcon>
          </VisibilityButton>
          <GridTypeButton onClick={toggleGridType}>
            <GridIcon svgSize={'1.25rem'} svgColor={zoomGrid ? '#959595' : '#000000'}></GridIcon>
          </GridTypeButton>
        </Stack>
        <SortbyDropdown onOptionSelect={handleSortOptionChange} />
      </RowContainer>

      {activeTab === 'Inscriptions' && (
        <RowContainer>
          <FilterMenu isOpen={filterVisibility} onSelectionChange ={handleFilterOptionsChange} onClose={toggleFilterVisibility} initialSelection={selectedFilterOptions}></FilterMenu>
          <GalleryContainer>
            <GalleryInfiniteScroll baseApi={baseApi} numberVisibility={numberVisibility} zoomGrid={zoomGrid} />
          </GalleryContainer>
        </RowContainer>
      )}
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

const SocialStack = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: .75rem;
  flex-shrink: 0;
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

const AddressImageContainer = styled.div`
  width: 8rem;
  height: 8rem;
  background-color: #F5F5F5;
  border-radius: 4rem;
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

const ButtonContainer = styled.div`
  display: flex;
  flex-direction: row;
  gap: 1.5rem;
`;

const TabButton = styled.button`
  border: none;
  border-bottom: ${props => props.isActive ? '2px solid #E34234' : '2px solid transparent'};
  padding: .75rem .25rem;
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  gap: .5rem;
  font-family: Relative Trial Bold;
  font-size: 1rem;
  color: ${props => props.isActive ? '#E34234' : '#959595'}; 
  background-color: transparent; 
  transition: 
    background-color 350ms ease,
    transform 150ms ease;
  transform-origin: center center;

  &:hover {
    color: ${props => props.isActive ? '#E34234' : '#E34234'};
  }
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

const GridTypeButton = styled.button`
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

export default Address;