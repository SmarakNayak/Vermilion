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
import { BlockIcon } from '../components/common/Icon';

// import utils
import { 
  addCommas, 
  formatSatsString, 
  formatTimestampMs, 
  shortenBytesString, 
} from '../utils/format';

const SatBlock = () => {
  const [baseApi, setBaseApi] = useState(null); 
  let { number } = useParams();
  const [numberVisibility, setNumberVisibility] = useState(true);
  const [filterVisibility, setFilterVisibility] = useState(false);
  const [satBlockStats, setSatBlockStats]  = useState(null); 
  const [zoomGrid, setZoomGrid] = useState(true);
  const [loading, setLoading] = useState(true);
  
  const [selectedSortOption, setSelectedSortOption] = useState('newest');
  const [selectedFilterOptions, setSelectedFilterOptions] = useState({"Content Type": ["image"], "Satributes": [], "Charms":[]});

  //1. Get sat block statistics
  useEffect(() => {
    const fetchContent = async () => {
      setLoading(true);
      const response = await fetch("/api/sat_block_statistics/" + number);
      let json = await response.json();
      console.log(json); // json object with block data for debugging
      setSatBlockStats(json);
      setLoading(false);
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

  return (
    <PageContainer>
      {loading ? (
        <GridHeaderSkeleton 
          pageType={'Sat Creation Block'} 
          hasDescription={false} 
          numTags={3}
        />
      ) : (
        <>
          <HeaderContainer>
            <MainContentStack>
              <InfoText>Sat Creation Block</InfoText>
              <DetailsStack>
                <ImageContainer>
                  <InscriptionIcon endpoint={"/api/block_icon/"+number} useBlockIconDefault={true} size={'8rem'} />
                </ImageContainer>
                <Stack gap={'.5rem'}>
                  <MainText>{addCommas(number)}</MainText>
                  <InfoText>Created {satBlockStats?.sat_block_timestamp ? formatTimestampMs(satBlockStats?.sat_block_timestamp) : ""}</InfoText>
                </Stack>
              </DetailsStack>
            </MainContentStack>
          </HeaderContainer>
          <RowContainer style={{gap: '.5rem', flexFlow: 'wrap'}}>
            <Tag isLarge={true} value={satBlockStats?.sat_block_inscription_count ? addCommas(satBlockStats?.sat_block_inscription_count) : 0} category={'Inscriptions'} />
            <Tag isLarge={true} value={satBlockStats?.sat_block_inscription_size ? shortenBytesString(satBlockStats.sat_block_inscription_size) : 0} category={'Total Inscription Size'} />
            <Tag isLarge={true} value={satBlockStats?.sat_block_inscription_fees ? formatSatsString(satBlockStats.sat_block_inscription_fees) : "0 BTC"} category={'Total Inscription Fees'} />
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
  )
}

export default SatBlock;
