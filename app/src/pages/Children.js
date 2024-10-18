import React, { useState, useEffect } from 'react';
import { useParams, Link } from "react-router-dom";
import styled from 'styled-components';

import TopSection from '../components/TopSection';
import Stack from '../components/Stack';
import { addCommas, copyText, formatTimestampMs, shortenDate } from '../helpers/utils';
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
import Tag from '../components/Tag';

const Children = ({ setParentNumbers }) => {
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
        const metadataResponse = await fetch(`/api/on_chain_collection_summary/${number}`);
        const metadataJson = await metadataResponse.json();
        setMetadata(metadataJson);
        
        // Pass parent numbers up to the parent component
        if (metadataJson?.parent_numbers) {
          setParentNumbers(metadataJson.parent_numbers);
        }
        
      } catch (error) {
        console.error("Error fetching inscription data:", error);
      }
    };

    fetchInscriptionData();
  }, [number, setParentNumbers]);

  useEffect(() => {
    let query_string = `/api/inscription_children_number/${number}?sort_by=${selectedSortOption}`;
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

  useEffect(() => {
    let query_string = `/api/inscriptions_in_on_chain_collection/${number}?sort_by=${selectedSortOption}`;
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
    console.log('Selected child sort option:', option);
  };

  const handleFilterOptionsChange = (filterOptions) => {
    setSelectedFilterOptions(filterOptions);
    console.log('Selected filter option:', filterOptions);
  };

  return (
    <MainContainer>
      <HeaderContainer>
        <MainContentStack>
          <InfoText>Children</InfoText>
          <PageText>Children of {metadata?.parent_numbers ? metadata.parent_numbers.map(num => addCommas(num)).join(' • ') : ''}</PageText>
          <InfoText>First Inscribed {shortenDate(metadata?.first_inscribed_date)} • Last Inscribed {shortenDate(metadata?.last_inscribed_date)}</InfoText>
          {/* <BackButtonContainer>
            <UnstyledLink to={`/inscription/${number}`}>
              <LinkButton isLink={true}>Back to Inscription page</LinkButton>
            </UnstyledLink>
          </BackButtonContainer> */}
          {/* <PageText>Children of {addCommas(number)}</PageText> */}
        </MainContentStack>
      </HeaderContainer>
      <RowContainer style={{gap: '.5rem', flexFlow: 'wrap'}}>
        <Tag isLarge={true} value={metadata?.supply ? addCommas(metadata?.supply) : 0} category={'Supply'} />
        <Tag isLarge={true} value={metadata?.total_volume ? formatSats(metadata.total_volume) : "0 BTC"} category={'Traded Volume'} />
        <Tag isLarge={true} value={metadata?.range_start ? addCommas(metadata?.range_start) + " to " + addCommas(metadata?.range_end) : ""} category={'Range'} />
        <Tag isLarge={true} value={metadata?.total_inscription_size ? shortenBytes(metadata.total_inscription_size) : 0} category={'Total Size'} />
        <Tag isLarge={true} value={metadata?.total_inscription_fees ? formatSats(metadata.total_inscription_fees) : "0 BTC"} category={'Total Fees'} />
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

export default Children;