import React, { useState, useEffect } from 'react';
import { useParams, Link } from "react-router-dom";
import styled from 'styled-components';

import TopSection from '../components/TopSection';
import Stack from '../components/Stack';
import { addCommas, copyText, formatTimestampMs } from '../helpers/utils';
import FilterIcon from '../assets/icons/FilterIcon';
import EyeIcon from '../assets/icons/EyeIcon';
import ChevronDownIcon from '../assets/icons/ChevronDownIcon';
import Stat from '../components/Stat';
import { formatSats } from '../helpers/utils';
import { shortenBytes } from '../helpers/utils';

import SortbyDropdown from '../components/Dropdown';
import FilterMenu from '../components/FilterMenu';
import GalleryInfiniteScroll from '../components/GalleryInfiniteScroll';
import InscriptionIcon from '../components/InscriptionIcon';
import CollectionIcon from '../components/CollectionIcon';

const References = () => {
  let { number } = useParams();
  const [baseApi, setBaseApi] = useState(null); 
  const [metadata, setMetadata] = useState(null);
  const [numberVisibility, setNumberVisibility] = useState(true);
  const [filterVisibility, setFilterVisibility] = useState(false);
  
  const [selectedSortOption, setSelectedSortOption] = useState('newest');
  const [selectedFilterOptions, setSelectedFilterOptions] = useState({"Content Type": [], "Satributes": [], "Charms":[]});

  useEffect(() => {
    const fetchInscriptionData = async () => {
      try {
        const metadataResponse = await fetch(`/api/inscription_metadata_number/${number}`);
        const metadataJson = await metadataResponse.json();
        setMetadata(metadataJson);
      } catch (error) {
        console.error("Error fetching inscription data:", error);
      }
    };

    fetchInscriptionData();
  }, [number]);

  useEffect(() => {
    let query_string = `/api/inscription_referenced_by_number/${number}?sort_by=${selectedSortOption}`;
    if (selectedFilterOptions["Content Type"].length > 0) {
      query_string += "&content_types=" + selectedFilterOptions["Content Type"].toString();
    }
    if (selectedFilterOptions["Satributes"].length > 0) {
      query_string += "&satributes=" + selectedFilterOptions["Satributes"].toString();
    }
    if (selectedFilterOptions["Charms"].length > 0) {
      query_string += "&charms=" + selectedFilterOptions["Charms"].toString();
    }
    setBaseApi(query_string);
  }, [number, selectedSortOption, selectedFilterOptions]);

  const toggleNumberVisibility = () => {
    setNumberVisibility(!numberVisibility);
  };

  const toggleFilterVisibility = () => {
    setFilterVisibility(!filterVisibility);
  };

  const handleSortOptionChange = (option) => {
    setSelectedSortOption(option);
    console.log('Selected reference sort option:', option);
  };

  const handleFilterOptionsChange = (filterOptions) => {
    setSelectedFilterOptions(filterOptions);
    console.log('Selected filter option:', filterOptions);
  };

  return (
    <MainContainer>
      <HeaderContainer>
        <MainContentStack>
          <BackButtonContainer>
            <UnstyledLink to={`/inscription/${number}`}>
              <LinkButton isLink={true}>Back to Inscription page</LinkButton>
            </UnstyledLink>
          </BackButtonContainer>
          <PageText>References of {addCommas(number)}</PageText>
        </MainContentStack>
      </HeaderContainer>
      <Divider></Divider>
      <RowContainer>
        <Stack horizontal={true} center={false} style={{gap: '.75rem'}}>
          <FilterButton onClick={toggleFilterVisibility}>
            <FilterIcon svgSize={'1.25rem'} svgColor={'#000000'}></FilterIcon>
          </FilterButton>
          <VisibilityButton onClick={toggleNumberVisibility}>
            <EyeIcon svgSize={'1.25rem'} svgColor={numberVisibility ? '#000000' : '#959595'}></EyeIcon>
          </VisibilityButton>
        </Stack>
        <SortbyDropdown onOptionSelect={handleSortOptionChange} />
      </RowContainer>
      <RowContainer>
        <FilterMenu 
          isOpen={filterVisibility} 
          onSelectionChange={handleFilterOptionsChange} 
          onClose={toggleFilterVisibility} 
          initialSelection={selectedFilterOptions}
        />
        <GalleryContainer>
          {baseApi ? (
            <GalleryInfiniteScroll baseApi={baseApi} numberVisibility={numberVisibility} />
          ) : (
            <LoadingText>Loading child inscriptions...</LoadingText>
          )}
        </GalleryContainer>
      </RowContainer>
    </MainContainer>
  );
};

const MainContainer = styled.div`
  width: calc(100% - 6rem);
  padding: 1.5rem 3rem 2.5rem 3rem;
  margin: 0;
  display: flex;
  flex-direction: column;
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
  max-width: calc(100% - 10.5rem);
  gap: .5rem;

  @media (max-width: 864px) {
    max-width: 100%;
  }
`;

const BackButtonContainer = styled.div`
  display: flex;
  align-items: center;
`;

const UnstyledLink = styled(Link)`
  color: unset;
  text-decoration: unset;
  display: flex;
  align-items: center;
  height: auto; // This allows the height to be determined by its content
`;

const LinkButton = styled.span` 
  font-family: Relative Trial Medium;
  font-size: .875rem;
  border: none;
  margin: 0;
  padding: 0;
  color: #959595;
  transition: 
    color 350ms ease,
    transform 150ms ease;
  transform-origin: center center;
  display: inline-block;
  white-space: nowrap; // Prevents wrapping

  &:hover {
    color: #000000;
  }
`;

const RowContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: flex-start;
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

const InfoText = styled.p`
  font-family: Relative Trial Medium;
  font-size: ${props => props.isLarge ? '1rem' : '.875rem'};
  color: ${props => props.isPrimary ? '#000000' : '#959595'};
  margin: 0;
`;

const Divider = styled.div`
  width: 100%;
  border-bottom: 1px solid #E9E9E9;
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

const VisibilityButton = styled(FilterButton)``;

const LoadingText = styled.p`
  font-family: Relative Trial Medium;
  font-size: 1rem;
  color: #959595;
  text-align: center;
`;

export default References;