import React, { useState, useEffect } from 'react';
import { useParams, Link } from "react-router-dom";
import styled from 'styled-components';
import Gallery from '../components/Gallery';
import GalleryInfiniteScroll from '../components/GalleryInfiniteScroll';
import TopSection from '../components/TopSection';
import Stack from '../components/Stack';
import EyeIcon from '../assets/icons/EyeIcon';
import GridIcon from '../assets/icons/GridIcon';
import BlockIcon from '../assets/icons/BlockIcon';
import { addCommas } from '../helpers/utils';
import FilterIcon from '../assets/icons/FilterIcon';
import ChevronDownIcon from '../assets/icons/ChevronDownIcon';
import ChevronDownSmallIcon from '../assets/icons/ChevronDownSmallIcon';
import ChevronUpSmallIcon from '../assets/icons/ChevronUpSmallIcon';
import Stat from '../components/Stat';
import BlockRow from '../components/BlockRow';
import SortbyDropdown from '../components/Dropdown';
import FilterMenu from '../components/FilterMenu';
import { formatTimestampMs } from '../helpers/utils';
import { shortenBytes } from '../helpers/utils';
import { formatSats } from '../helpers/utils';
import BlockTable from '../components/BlockTable';
import CollectionsTable from '../components/CollectionsTable';
import ReactGA from 'react-ga';

const ExploreInscriptions = () => {
  const [baseApi, setBaseApi] = useState(null); 
  const [numberVisibility, setNumberVisibility] = useState(true);
  const [filterVisibility, setFilterVisibility] = useState(false);
  const [selectedSortOption, setSelectedSortOption] = useState('newest');
  const [selectedFilterOptions, setSelectedFilterOptions] = useState({"Content Type": ["image"], "Satributes": [], "Charms":[]});
  const [zoomGrid, setZoomGrid] = useState(true);

  // record event in GA
  useEffect(() => {
    ReactGA.pageview(window.location.pathname)
  }, [])

  //Get inscriptions endpoint
  useEffect(() => {
    let query_string = "/api/inscriptions?sort_by=" + selectedSortOption;
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
  },[selectedSortOption, selectedFilterOptions]);

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
  
  //inscription handlers
  const handleSortOptionChange = (option) => {
    setSelectedSortOption(option);
    // Perform any necessary actions with the selected option
    console.log('Selected inscription sort option:', option);
  };

  const handleFilterOptionsChange = (filterOptions) => {
    setSelectedFilterOptions(filterOptions);
    console.log('Selected filter option:', filterOptions);
  };

  return (
    <MainContainer>
      <RowContainer style={{justifyContent: 'flex-start'}}>
        <PageText>Inscriptions</PageText>
      </RowContainer>
      <Divider />
      <Stack horizontal={false} center={false} style={{gap: '1.5rem', width: '100%'}}>
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
        <RowContainer>
          <FilterMenu isOpen={filterVisibility} onSelectionChange ={handleFilterOptionsChange} onClose={toggleFilterVisibility} initialSelection={selectedFilterOptions}></FilterMenu>
          <GalleryContainer>
            <GalleryInfiniteScroll baseApi={baseApi} numberVisibility={numberVisibility} zoomGrid={zoomGrid} />
          </GalleryContainer>
        </RowContainer>
      </Stack>
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

  @media (max-width: 864px) {
    width: calc(100% - 3rem);
    padding: 1.5rem 1.5rem 2.5rem 1.5rem;
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

const PageText = styled.p`
  font-family: Relative Trial Bold;
  font-size: 1.5rem;
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

const Divider = styled.div`
  width: 100%;
  border-bottom: 1px solid #E9E9E9;
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

const ExploreContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  flex; 1;
  gap: 1.5rem;
`;

export default ExploreInscriptions;