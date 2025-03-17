import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import ReactGA from 'react-ga';
import SortbyDropdown from '../components/Dropdown';
import FilterMenu from '../components/FilterMenu';
import GalleryInfiniteScroll from '../components/GalleryInfiniteScroll';
import Stack from '../components/Stack';
import { EyeIcon, FilterIcon, GridIcon, DotGridIcon } from '../components/common/Icon';
import theme from '../styles/theme';

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
          <Stack horizontal={true} center={false} style={{gap: '.75rem'}}>
            <FilterButton onClick={toggleFilterVisibility}>
              <FilterIcon size={'1.25rem'} color={theme.colors.text.primary}></FilterIcon>
            </FilterButton>
            <VisibilityButton onClick={toggleNumberVisibility}>
              <EyeIcon size={'1.25rem'} color={numberVisibility ? theme.colors.text.primary : theme.colors.text.tertiary}></EyeIcon>
            </VisibilityButton>
            <GridTypeButton onClick={toggleGridType}>
              {zoomGrid ? (
                <GridIcon size={'1.25rem'} color={theme.colors.text.primary} />
              ) : (
                <DotGridIcon size={'1.25rem'} color={theme.colors.text.primary} />
              )}
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
  font-family: ${theme.typography.fontFamilies.bold};
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
  border-bottom: 1px ${theme.colors.border}; solid;
  // overflow: scroll;
`;

const Divider = styled.div`
  width: 100%;
  border-bottom: 1px solid ${theme.colors.border};};
`;

const VisibilityButton = styled.button`
  height: 2.75rem;
  width: 2.75rem;
  border-radius: 1.5rem;
  border: none;
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  background-color: ${theme.colors.background.primary};
  transition: all 200ms ease;
  transform-origin: center center;

  &:hover {
    background-color: ${theme.colors.border};
  }

  &:active {
    transform: scale(0.96);
  }
`;

const GridTypeButton = styled.button`
  height: 2.75rem;
  width: 2.75rem;
  border-radius: 1.5rem;
  border: none;
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  background-color: ${theme.colors.background.primary};
  transition: 
    background-color 350ms ease,
    transform 150ms ease;
  transform-origin: center center;

  &:hover {
    background-color: ${theme.colors.border};
  }

  &:active {
    transform: scale(0.96);
  }
`;

const FilterButton = styled.button`
  height: 2.75rem;
  width: 2.75rem;
  border-radius: 1.5rem;
  border: none;
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  gap: .5rem;
  background-color: ${theme.colors.background.primary};
  transition: 
    background-color 350ms ease,
    transform 150ms ease;
  transform-origin: center center;

  &:hover {
    background-color: ${theme.colors.border};
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
