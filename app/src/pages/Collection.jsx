import React, { useState, useEffect } from 'react';
import { useParams, Link } from "react-router-dom";
import { renderToStaticMarkup } from 'react-dom/server';
import styled from 'styled-components';

import PageContainer from '../components/layout/PageContainer';
import {
  HeaderContainer,
  MainContentStack,
  CollectionStack,
  SocialStack,
  RowContainer,
  GalleryContainer,
  CollectionImageContainer,
  HorizontalDivider,
} from '../components/grid/Layout';
import MainText from '../components/common/text/MainText';
import InfoText from '../components/common/text/InfoText';
import UnstyledLink from '../components/common/UnstyledLink';
import IconButton from '../components/common/buttons/IconButton';
import Stack from '../components/Stack';
import { addCommas, shortenDate, formatSatsString, shortenBytesString } from '../utils/format';
import SortbyDropdown from '../components/Dropdown';
import FilterMenu from '../components/FilterMenu';
import GalleryInfiniteScroll from '../components/GalleryInfiniteScroll';
import InscriptionIcon from '../components/InscriptionIcon';
import Tag from '../components/Tag';
import { BlockIcon, DotGridIcon, EyeIcon, FilterIcon, GridIcon, TwitterIcon, DiscordIcon, WebIcon } from '../components/common/Icon';
import { theme } from '../styles/theme';
import GridPageHeader from '../components/grid/GridPageHeader';
import GridControls from '../components/grid/GridControls';
import { GridHeaderSkeleton } from '../components/grid/GridHeaderSkeleton';

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

  const BlockIconDefault = encodeURIComponent(
    renderToStaticMarkup(<BlockIcon size={'2rem'} color={'#E34234'} />)
  );

  const handleImageError = (event) => {
    console.log("error image triggered")
    event.target.onError = null;
    event.target.src = `data:image/svg+xml,${BlockIconDefault}`;
    //have to override default size of InscriptionIcon
    event.target.style.width = "2.25rem"
    event.target.style.height = "2.25rem"
  };

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
          <GridPageHeader
            collectionSummary={collectionSummary}
          />
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

export default Collection;
