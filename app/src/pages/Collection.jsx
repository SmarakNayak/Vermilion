import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useParams, Link } from "react-router-dom";
import { theme } from '../styles/theme';

// import components
import PageContainer from '../components/layout/PageContainer';
import {
  HeaderContainer,
  MainContentStack,
  DetailsStack,
  SocialStack,
  RowContainer,
  GalleryContainer,
  ImageContainer,
  HorizontalDivider,
} from '../components/grid/Layout';
import GridControls from '../components/grid/GridControls';
import { GridHeaderSkeleton } from '../components/grid/GridHeaderSkeleton';
import MainText from '../components/common/text/MainText';
import InfoText from '../components/common/text/InfoText';
import Tooltip from '../components/common/Tooltip';
import UnstyledLink from '../components/common/UnstyledLink';
import IconButton from '../components/common/buttons/IconButton';
import Stack from '../components/Stack';
import FilterMenu from '../components/FilterMenu';
import GalleryInfiniteScroll from '../components/GalleryInfiniteScroll';
import InscriptionIcon from '../components/InscriptionIcon';
import Tag from '../components/Tag';

// import icons
import { TwitterIcon, DiscordIcon, WebIcon } from '../components/common/Icon';

// import utils
import { 
  addCommas, 
  shortenDate, 
  formatSatsString, 
  shortenBytesString 
} from '../utils/format';

const Collection = () => {
  const [baseApi, setBaseApi] = useState(null); 
  let { symbol } = useParams();
  const [collectionSummary, setCollectionSummary] = useState(null);
  const [inscriptionList, setInscriptionList] = useState([]); 
  const [numberVisibility, setNumberVisibility] = useState(true);
  const [filterVisibility, setFilterVisibility] = useState(false);
  const [zoomGrid, setZoomGrid] = useState(true);
  const [loading, setLoading] = useState(true);

  const [selectedSortOption, setSelectedSortOption] = useState('oldest');
  const [selectedFilterOptions, setSelectedFilterOptions] = useState({"Content Type": [], "Satributes": [], "Charms":[]});

  //1. Get links
  useEffect(() => {
    const fetchContent = async () => {
      //1. Get inscription numbers
      setInscriptionList([]);
      const response = await fetch("/api/inscriptions_in_collection/" + symbol);
      let json = await response.json();
      setInscriptionList(json);
    }
    fetchContent();
  },[symbol]);

  useEffect(() => {
    const fetchContent = async () => {
      setLoading(true);
      const response = await fetch("/api/collection_summary/" + symbol);
      let json = await response.json();
      console.log(json); // json object with collection data for debugging
      setCollectionSummary(json);
      setLoading(false);
    }
    fetchContent();
  },[symbol]);

  //2. get endpoint
  useEffect(() => {
    let query_string = "/api/inscriptions_in_collection/" + symbol + "?sort_by=" + selectedSortOption;
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
  },[symbol, selectedSortOption, selectedFilterOptions]);

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

  const hasSocialLinks = collectionSummary?.twitter || collectionSummary?.discord || collectionSummary?.website;

  return (
    <PageContainer>
      {loading ? (
        <GridHeaderSkeleton 
          pageType={'Collection'} 
          hasDescription={true} 
          numTags={5}
        />
      ) : (
        <>
          <HeaderContainer>
            <MainContentStack>
              <InfoText>Collection</InfoText>
              <DetailsStack>
                <ImageContainer>
                  {collectionSummary?.range_start && (
                    <InscriptionIcon endpoint={`/api/inscription_number/${collectionSummary?.range_start}`} useBlockIconDefault={false} size={'8rem'} />
                  )}
                </ImageContainer>
                <Stack gap={'.5rem'}>
                  <MainText>{collectionSummary?.name}</MainText>
                  <InfoText>Created {collectionSummary?.first_inscribed_date ? shortenDate(collectionSummary.first_inscribed_date) : ""}</InfoText>
                </Stack>
              </DetailsStack>
            </MainContentStack>
            {hasSocialLinks && (
              <SocialStack>
                {collectionSummary?.twitter && (
                  <Tooltip content={"Twitter"}>
                    <ButtonWrapper>
                      <UnstyledLink to={collectionSummary.twitter} target='_blank'>
                        <IconButton>
                          <TwitterIcon size={'1.25rem'} color={theme.colors.text.primary} />
                        </IconButton>
                      </UnstyledLink>
                    </ButtonWrapper>
                  </Tooltip>
                )}
                {collectionSummary?.discord && (
                  <Tooltip content={"Discord"}>
                    <ButtonWrapper>
                      <UnstyledLink to={collectionSummary.discord} target='_blank'>
                        <IconButton>
                          <DiscordIcon size={'1.25rem'} color={theme.colors.text.primary} />
                        </IconButton>
                      </UnstyledLink>
                    </ButtonWrapper>
                  </Tooltip>
                )}
                {collectionSummary?.website && (
                  <Tooltip content={"Website"}>
                    <ButtonWrapper>
                      <UnstyledLink to={collectionSummary.website} target='_blank'>
                        <IconButton>
                          <WebIcon size={'1.25rem'} color={theme.colors.text.primary} />
                        </IconButton>
                      </UnstyledLink>
                    </ButtonWrapper>
                  </Tooltip>
                )}
              </SocialStack>
            )}
          </HeaderContainer>
          {collectionSummary?.description && collectionSummary.description.trim() !== "" && (
            <RowContainer>
              <InfoText islarge={true}>{collectionSummary.description}</InfoText>
            </RowContainer>
          )}
          <RowContainer style={{gap: '.5rem', flexFlow: 'wrap'}}>
            <Tag isLarge={true} value={collectionSummary?.supply ? addCommas(collectionSummary?.supply) : 0} category={'Supply'} />
            <Tag isLarge={true} value={collectionSummary?.total_volume ? formatSatsString(collectionSummary.total_volume) : "0 BTC"} category={'Traded Volume'} />
            <Tag isLarge={true} value={collectionSummary?.range_start ? addCommas(collectionSummary?.range_start) + " to " + addCommas(collectionSummary?.range_end) : ""} category={'Range'} />
            <Tag isLarge={true} value={collectionSummary?.total_inscription_size ? shortenBytesString(collectionSummary.total_inscription_size) : 0} category={'Total Size'} />
            <Tag isLarge={true} value={collectionSummary?.total_inscription_fees ? formatSatsString(collectionSummary.total_inscription_fees) : "0 BTC"} category={'Total Fees'} />
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
        initialOption={'oldest'}
        includeRelevance={false}
      />
      <RowContainer>
        <FilterMenu isOpen={filterVisibility} onSelectionChange={handleFilterOptionsChange} onClose={toggleFilterVisibility} initialSelection={selectedFilterOptions} />
        <GalleryContainer>
          <GalleryInfiniteScroll baseApi={baseApi} isCollectionPage={true} numberVisibility={numberVisibility} zoomGrid={zoomGrid} />
        </GalleryContainer>
      </RowContainer>
    </PageContainer>
  )
}

const ButtonWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  margin: 0;
`;


export default Collection;
