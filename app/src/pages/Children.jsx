import React, { useState, useEffect } from 'react';
import { useParams, Link } from "react-router-dom";
import { theme } from '../styles/theme';

// import components
import PageContainer from '../components/layout/PageContainer';
import {
  HeaderContainer,
  MainContentStack,
  DetailsStack,
  RowContainer,
  GalleryContainer,
  ImageContainer,
  HorizontalDivider,
} from '../components/grid/Layout';
import GridControls from '../components/grid/GridControls';
import { GridHeaderSkeleton } from '../components/grid/GridHeaderSkeleton';
import MainText from '../components/common/text/MainText';
import InfoText from '../components/common/text/InfoText';
import Stack from '../components/Stack';
import FilterMenu from '../components/FilterMenu';
import GalleryInfiniteScroll from '../components/GalleryInfiniteScroll';
import InscriptionIcon from '../components/InscriptionIcon';
import Tag from '../components/Tag';

// import icons
import { GalleryIcon } from '../components/common/Icon';

// import utils
import { 
  addCommas, 
  formatAddress,
  formatSatsString, 
  formatTimestampMs, 
  shortenBytesString,
  shortenDate 
} from '../utils/format';

const Children = ({ setParentNumbers }) => {
  const [baseApi, setBaseApi] = useState(null); 
  let { number } = useParams();
  const [metadata, setMetadata] = useState(null);
  const [numberVisibility, setNumberVisibility] = useState(true);
  const [filterVisibility, setFilterVisibility] = useState(false);
  const [zoomGrid, setZoomGrid] = useState(true);
  const [loading, setLoading] = useState(true);
  
  const [selectedSortOption, setSelectedSortOption] = useState('newest');
  const [selectedFilterOptions, setSelectedFilterOptions] = useState({"Content Type": [], "Satributes": [], "Charms":[]});

  useEffect(() => {
    const fetchInscriptionData = async () => {
      try {
        setLoading(true);
        const metadataResponse = await fetch(`/api/on_chain_collection_summary/${number}`);
        const metadataJson = await metadataResponse.json();
        setMetadata(metadataJson);
        setLoading(false);
        
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

  const toggleGridType = () => {
    setZoomGrid(!zoomGrid);
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
    <PageContainer>
      {loading ? (
        <GridHeaderSkeleton 
          pageType={'Children'} 
          hasDescription={false} 
          numTags={5}
        />
      ) : (
        <>
          <HeaderContainer>
            <MainContentStack>
              <InfoText>Children</InfoText>
              <DetailsStack>
                <ImageContainer>
                  {metadata?.parent_numbers?.length === 1 ? (
                    <InscriptionIcon endpoint={"/api/inscription_number/"+metadata.parent_numbers[0]} useBlockIconDefault={false} size={'8rem'} />
                  ) : (
                    <GalleryIcon size={'2rem'} color={theme.colors.background.verm} />
                  )}
                </ImageContainer>
                <Stack gap={'.5rem'}>
                  <MainText>Children of {metadata?.parent_numbers ? metadata.parent_numbers.map(num => addCommas(num)).join(' • ') : ''}</MainText>
                  <InfoText>First Inscribed {shortenDate(metadata?.first_inscribed_date)} • Last Inscribed {shortenDate(metadata?.last_inscribed_date)}</InfoText>
                </Stack>
              </DetailsStack>
            </MainContentStack>
          </HeaderContainer>
          <RowContainer style={{gap: '.5rem', flexFlow: 'wrap'}}>
            <Tag isLarge={true} value={metadata?.supply ? addCommas(metadata?.supply) : 0} category={'Supply'} />
            <Tag isLarge={true} value={metadata?.total_volume ? formatSatsString(metadata.total_volume) : "0 BTC"} category={'Traded Volume'} />
            <Tag isLarge={true} value={metadata?.range_start ? addCommas(metadata?.range_start) + " to " + addCommas(metadata?.range_end) : ""} category={'Range'} />
            <Tag isLarge={true} value={metadata?.total_inscription_size ? shortenBytesString(metadata.total_inscription_size) : 0} category={'Total Size'} />
            <Tag isLarge={true} value={metadata?.total_inscription_fees ? formatSatsString(metadata.total_inscription_fees) : "0 BTC"} category={'Total Fees'} />
          </RowContainer>
        </>
      )}
      <HorizontalDivider></HorizontalDivider>
      <GridControls 
        filterVisibility={filterVisibility} 
        toggleFilterVisibility={toggleFilterVisibility} 
        numberVisibility={numberVisibility} 
        toggleNumberVisibility={toggleNumberVisibility} 
        zoomGrid={zoomGrid} 
        toggleGridType={toggleGridType} 
        handleSortOptionChange={handleSortOptionChange} 
        handleFilterOptionsChange={handleFilterOptionsChange} 
        selectedFilterOptions={selectedFilterOptions}
        filtersEnabled={true}
      />
      <RowContainer>
        <FilterMenu isOpen={filterVisibility} onSelectionChange ={handleFilterOptionsChange} onClose={toggleFilterVisibility} initialSelection={selectedFilterOptions}></FilterMenu>
        <GalleryContainer>
          <GalleryInfiniteScroll baseApi={baseApi} numberVisibility={numberVisibility} zoomGrid={zoomGrid} />
        </GalleryContainer>
      </RowContainer>
    </PageContainer>
  );
};

export default Children;
