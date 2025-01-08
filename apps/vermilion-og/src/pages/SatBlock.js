import React, { useState, useEffect } from 'react';
import { useParams, Link } from "react-router-dom";
import styled from 'styled-components';
import { renderToStaticMarkup } from 'react-dom/server';

import Gallery from '../components/Gallery';
import TopSection from '../components/TopSection';
import Stack from '../components/Stack';
import EyeIcon from '../assets/icons/EyeIcon';
import BlockIcon from '../assets/icons/BlockIcon';
import GridIcon from '../assets/icons/GridIcon';
import { addCommas, copyText, formatTimestampMs } from '../helpers/utils';
import FilterIcon from '../assets/icons/FilterIcon';
import ChevronDownIcon from '../assets/icons/ChevronDownIcon';
import CopyIcon from '../assets/icons/CopyIcon';
import CheckIcon from '../assets/icons/CheckIcon';
import Stat from '../components/Stat';
import { formatSats } from '../helpers/utils';
import { shortenBytes } from '../helpers/utils';

import SortbyDropdown from '../components/Dropdown';
import FilterMenu from '../components/FilterMenu';
import GalleryInfiniteScroll from '../components/GalleryInfiniteScroll';
import InscriptionIcon from '../components/InscriptionIcon';
import CollectionIcon from '../components/CollectionIcon';
import Tag from '../components/Tag';
import LinkTag from '../components/LinkTag';

const SatBlock = () => {
  const [baseApi, setBaseApi] = useState(null); 
  let { number } = useParams();
  const [numberVisibility, setNumberVisibility] = useState(true);
  const [filterVisibility, setFilterVisibility] = useState(false);
  const [satBlockStats, setSatBlockStats]  = useState(null); 
  const [zoomGrid, setZoomGrid] = useState(true);
  
  const [selectedSortOption, setSelectedSortOption] = useState('newest');
  const [selectedFilterOptions, setSelectedFilterOptions] = useState({"Content Type": ["image"], "Satributes": [], "Charms":[]});

  //1. Get block statistics
  useEffect(() => {
    const fetchContent = async () => {
      const response = await fetch("/api/sat_block_statistics/" + number);
      let json = await response.json();
      console.log(json);
      setSatBlockStats(json);
    }
    fetchContent();
  },[number]);

  //2. get endpoint
  useEffect(() => {
    let query_string = "/api/inscriptions_in_sat_block/" + number + "?sort_by=" + selectedSortOption;
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
  },[number, selectedSortOption, selectedFilterOptions]);

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

  const handleSortOptionChange = (option) => {
    setSelectedSortOption(option);
    // Perform any necessary actions with the selected option
    console.log('Selected inscription sort option:', option);
  };

  const handleFilterOptionsChange = (filterOptions) => {
    setSelectedFilterOptions(filterOptions);
    console.log('Selected filter option:', filterOptions);
  };

  const BlockIconDefault = encodeURIComponent(
    renderToStaticMarkup(<BlockIcon svgSize={'2rem'} svgColor={'#E34234'} />)
  );

  const handleImageError = (event) => {
    console.log("error image triggered")
    event.target.onError = null;
    event.target.src = `data:image/svg+xml,${BlockIconDefault}`;
    //have to override default size of CollectionIcon
    event.target.style.width = "2.25rem"
    event.target.style.height = "2.25rem"
  };

  return (
    <MainContainer>
      <HeaderContainer>
        <MainContentStack>
          <InfoText>Sat Creation Block</InfoText>
          <InfoStack>
            <BlockImageContainer>
              <CollectionIcon endpoint = {"/api/block_icon/"+number} useBlockIconDefault = {true}></CollectionIcon>
            </BlockImageContainer>
            <Stack gap={'.5rem'}>
              <MainText>{addCommas(number)}</MainText>
              <InfoText>Created {satBlockStats?.sat_block_timestamp ? formatTimestampMs(satBlockStats?.sat_block_timestamp) : ""}</InfoText>
            </Stack>
          </InfoStack>
        </MainContentStack>
      </HeaderContainer>

      <RowContainer style={{gap: '.5rem', flexFlow: 'wrap'}}>
        <Tag isLarge={true} value={satBlockStats?.sat_block_inscription_count ? addCommas(satBlockStats?.sat_block_inscription_count) : 0} category={'Inscriptions'} />
        <Tag isLarge={true} value={satBlockStats?.sat_block_inscription_size ? shortenBytes(satBlockStats.sat_block_inscription_size) : 0} category={'Total Inscription Size'} />
        <Tag isLarge={true} value={satBlockStats?.sat_block_inscription_fees ? formatSats(satBlockStats.sat_block_inscription_fees) : "0 BTC"} category={'Total Inscription Fees'} />
      </RowContainer>
      <Divider></Divider>
      <RowContainer>
        <Stack horizontal={true} center={false} style={{gap: '.75rem'}}>
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
      <RowContainer>
        <FilterMenu isOpen={filterVisibility} onSelectionChange ={handleFilterOptionsChange} onClose={toggleFilterVisibility} initialSelection={selectedFilterOptions}></FilterMenu>
        <GalleryContainer>
          <GalleryInfiniteScroll baseApi={baseApi} numberVisibility={numberVisibility} zoomGrid={zoomGrid} />
        </GalleryContainer>
      </RowContainer>
    </MainContainer>    
  )
}

const BlockImg = styled.img`
  width: 3.75rem;
  height: 3.75rem;
  border-radius: 2rem;
`
  
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

export default SatBlock;