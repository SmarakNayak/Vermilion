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

  const [activeTab, setActiveTab] = useState('Inscriptions');
  const [selectedSortOption, setSelectedSortOption] = useState('newest');
  const [selectedFilterOptions, setSelectedFilterOptions] = useState({"Content Type": ["image"], "Satributes": [], "Charms":[]});

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
    <PageContainer>
      <TopSection />
      <MainContainer>
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
              <FilterButton onClick={toggleFilterVisibility}>
                <FilterIcon svgSize={'1rem'} svgColor={'#000000'}></FilterIcon>
                Filters
              </FilterButton>
              <VisibilityButton onClick={toggleNumberVisibility}>
                <EyeIcon svgSize={'1rem'} svgColor={numberVisibility ? '#000000' : '#959595'}></EyeIcon>
              </VisibilityButton>
            </Stack>
            <SortbyDropdown onOptionSelect={handleSortOptionChange} />
        </RowContainer>
        <RowContainer>
          <FilterMenu isOpen={filterVisibility} onSelectionChange ={handleFilterOptionsChange} onClose={toggleFilterVisibility} initialSelection={selectedFilterOptions}></FilterMenu>
          <GalleryContainer>
            <GalleryInfiniteScroll baseApi={baseApi} numberVisibility={numberVisibility} />
          </GalleryContainer>
        </RowContainer>
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
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;

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

export default Address;