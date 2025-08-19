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
  ProfileContainer,
  HorizontalDivider,
  HorizontalTabContainer,
  TabText
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
import { BlockIcon, CopyIcon, WalletIcon } from '../components/common/Icon';

// import utils
import { 
  addCommas, 
  formatAddress,
  formatSatsString, 
  formatTimestampMs, 
  shortenBytesString 
} from '../utils/format';

const Address = () => {
  const [baseApi, setBaseApi] = useState(null); 
  let { address } = useParams();
  const [inscriptionList, setInscriptionList] = useState([]); 
  const [numberVisibility, setNumberVisibility] = useState(true);
  const [filterVisibility, setFilterVisibility] = useState(false);
  const [zoomGrid, setZoomGrid] = useState(true);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('inscriptions');

  const [selectedSortOption, setSelectedSortOption] = useState('newest');
  const [selectedFilterOptions, setSelectedFilterOptions] = useState({"Content Type": ["text", "image", "gif", "audio", "video", "html"], "Satributes": [], "Charms":[]});

  //1. Get links
  useEffect(() => {
    const fetchContent = async () => {
      setLoading(true);
      setInscriptionList([]);
      const response = await fetch("/api/inscriptions_in_address/" + address);
      let json = await response.json();
      setInscriptionList(json);
      setLoading(false);
    }
    fetchContent();
  },[address])

  //2. get endpoint
  useEffect(() => {
    let query_string = "/api/inscriptions_in_address/" + address + "?sort_by=" + selectedSortOption;
    if (selectedFilterOptions["Content Type"] !== undefined && selectedFilterOptions["Content Type"].length > 0) {
      query_string += "&content_types=" + selectedFilterOptions["Content Type"].toString();
    }
    if (selectedFilterOptions["Satributes"] !== undefined && selectedFilterOptions["Satributes"].length > 0) {
      query_string += "&satributes=" + selectedFilterOptions["Satributes"].toString();
    }
    if (selectedFilterOptions["Charms"] !== undefined && selectedFilterOptions["Charms"].length > 0) {
      query_string += "&charms=" + selectedFilterOptions["Charms"].toString();
    }
    setBaseApi(query_string);
  },[address, selectedSortOption, selectedFilterOptions]);

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
  };

  const handleFilterOptionsChange = (filterOptions) => {
    setSelectedFilterOptions(filterOptions);
  };

  return (
    <PageContainer>
      {loading ? (
        <GridHeaderSkeleton 
          pageType={'Address'} 
          isProfile={true}
          removeInfoText={true}
          hasDescription={false} 
          numTags={0}
          removeTags={true}
        />
      ) : (
        <>
          <HeaderContainer>
            <MainContentStack>
              <InfoText>Address</InfoText>
              <DetailsStack>
                <ProfileContainer>
                  <WalletIcon size={'2rem'} color={theme.colors.background.verm}></WalletIcon>
                </ProfileContainer>
                <Stack gap={'.5rem'}>
                  <MainText>{formatAddress(address)}</MainText>
                </Stack>
              </DetailsStack>
            </MainContentStack>
          </HeaderContainer>
        </>
      )}
      <HorizontalTabContainer>
        <TabText 
          isActive={activeTab === 'inscriptions'}
          onClick={() => setActiveTab('inscriptions')}
        >
          Inscriptions
        </TabText>
        <TabText 
          isActive={activeTab === 'bookmarks'}
          onClick={() => setActiveTab('bookmarks')}
        >
          Bookmarks
        </TabText>
      </HorizontalTabContainer>
      {/* Display:contents is effectively a no-op in terms of layout,
          it's a truly empty div that does not effect the layout at all,
          it allows the children to be rendered without creating a new block formatting context.
          Altering display to none does not rerender (and thus trigger new network requests) on tab switch
          This is a much better than conditionally rendering the entire component
          i.e. { activeTab === 'inscriptions' ? <InscriptionsComponent /> : <BookmarksComponent />}
          Longer term we would want to refactor this to use effect-atom/react-query to cache the data fetching
       */}
      <div style={{ display: activeTab === 'inscriptions' ? 'contents' : 'none' }}>
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
          initialOption={'newest'}
          includeRelevance={false}
        />
        <RowContainer>
          <FilterMenu isOpen={filterVisibility} onSelectionChange ={handleFilterOptionsChange} onClose={toggleFilterVisibility} initialSelection={selectedFilterOptions}></FilterMenu>
          <GalleryContainer>
            <GalleryInfiniteScroll baseApi={baseApi} numberVisibility={numberVisibility} zoomGrid={zoomGrid} />
          </GalleryContainer>
        </RowContainer>
      </div>
      <div style={{ display: activeTab === 'bookmarks' ? 'contents' : 'none' }}>
        <Stack gap={'1rem'} padding={'1rem'}>
          <MainText>No bookmarks found for this address.</MainText>
        </Stack>
      </div>
    </PageContainer>
  )
}

export default Address;
