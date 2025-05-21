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

const Attributions = () => {
  const [baseApi, setBaseApi] = useState(null); 
  let { number } = useParams();
  const [metadata, setMetadata] = useState(null);
  const [numberVisibility, setNumberVisibility] = useState(true);
  const [filterVisibility, setFilterVisibility] = useState(false);
  const [zoomGrid, setZoomGrid] = useState(true);
  const [loading, setLoading] = useState(true);
  
  const [selectedSortOption, setSelectedSortOption] = useState('oldest');
  const [selectedFilterOptions, setSelectedFilterOptions] = useState({"Content Type": [], "Satributes": [], "Charms":[]});

  useEffect(() => {
    const fetchInscriptionData = async () => {
      try {
        setLoading(true);
        const metadataResponse = await fetch(`/api/inscription_metadata_number/${number}`);
        const metadataJson = await metadataResponse.json();
        setMetadata(metadataJson);
        setLoading(false);
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

  const toggleGridType = () => {
    setZoomGrid(!zoomGrid);
  };

  const handleSortOptionChange = (option) => {
    setSelectedSortOption(option);
  };

  const handleFilterOptionsChange = (filterOptions) => {
    setSelectedFilterOptions(filterOptions);
  };

  return (
    <PageContainer>
      {loading ? (
        <GridHeaderSkeleton 
          pageType={'Attributions'}
          removeInfoText={true} 
          hasDescription={false} 
          numTags={0}
          removeTags={true}
        />
      ) : (
        <>
          <HeaderContainer>
            <MainContentStack>
              <InfoText>Attributions</InfoText>
              <DetailsStack>
                <ImageContainer>
                  <InscriptionIcon endpoint={"/api/inscription_number/"+number} useBlockIconDefault={false} size={'8rem'} />
                </ImageContainer>
                <Stack gap={'.5rem'}>
                  <MainText>{addCommas(number)}</MainText>
                </Stack>
              </DetailsStack>
            </MainContentStack>
          </HeaderContainer>
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
        initialOption={selectedSortOption}
        includeRelevance={false}
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

export default Attributions;
