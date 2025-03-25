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

  const [selectedSortOption, setSelectedSortOption] = useState('newest');
  const [selectedFilterOptions, setSelectedFilterOptions] = useState({"Content Type": ["image", "gif", "audio", "video", "html"], "Satributes": [], "Charms":[]});

  //1. Get links
  useEffect(() => {
    const fetchContent = async () => {
      setLoading(true);
      setInscriptionList([]);
      const response = await fetch("/api/inscriptions_in_address/" + address);
      let json = await response.json();
      console.log(json); // json object with address data for debugging
      setInscriptionList(json);
      setLoading(false);
    }
    fetchContent();
  },[address])

  //2. get endpoint
  useEffect(() => {
    let query_string = "/api/inscriptions_in_address/" + address + "?sort_by=" + selectedSortOption;
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
    // Perform any necessary actions with the selected option
    console.log('Selected inscription sort option:', option);
  };

  const handleFilterOptionsChange = (filterOptions) => {
    setSelectedFilterOptions(filterOptions);
    console.log('Selected filter option:', filterOptions);
  };

  return (
    <PageContainer>
      {/* <HeaderContainer>
        <MainContentStack>
          <InfoText>Address</InfoText>
          <InfoStack>
            <AddressProfileContainer>
              <WalletIcon svgSize={'2rem'} svgColor={'#E34234'}></WalletIcon>
            </AddressProfileContainer>
            <Stack gap={'.5rem'}>
              <MainText>{formatAddress(address)}</MainText>
              <InfoButton isButton={true} onClick={() => copyText(address)}>
                {formatAddress(address)}
                <CopyIcon svgSize={'1rem'} svgColor={'#959595'} />
              </InfoButton>
            </Stack>
          </InfoStack>
        </MainContentStack>
      </HeaderContainer> */}

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
                  {/* <InscriptionIcon endpoint={"/api/block_icon/"+number} useBlockIconDefault={true} size={'8rem'} /> */}
                </ProfileContainer>
                <Stack gap={'.5rem'}>
                  <MainText>{formatAddress(address)}</MainText>
                  {/* <InfoText>Created {formatTimestampMs(blockStats?.block_timestamp)}</InfoText> */}
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

export default Address;
