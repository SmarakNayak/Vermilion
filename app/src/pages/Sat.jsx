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
import Gallery from '../components/Gallery';
import InscriptionIcon from '../components/InscriptionIcon';
import Tag from '../components/Tag';
import LinkTag from '../components/LinkTag';

// import icons
import { CoinIcon } from '../components/common/Icon';

// import utils
import { 
  addCommas, 
  formatSatsString, 
  formatTimestampMs, 
  shortenBytesString, 
} from '../utils/format';

const Sat = () => {
  let { sat } = useParams();
  const [inscriptions, setInscriptions] = useState([]); 
  const [metadata, setMetadata] = useState(null);
  const [numberVisibility, setNumberVisibility] = useState(true);
  const [zoomGrid, setZoomGrid] = useState(true);
  const [loading, setLoading] = useState(true);

  //1. Get links
  useEffect(() => {
    const fetchInscriptions = async () => {
      setLoading(true);
      setInscriptions([]);
      //1. Get inscription numbers
      const response = await fetch("/api/inscriptions_on_sat/" + sat);
      let json = await response.json();
      setInscriptions(json);
    }
    const fetchSatMetadata = async () => {
      setMetadata(null);
      const response = await fetch("/api/sat_metadata/" + sat);
      let json = await response.json();
      setMetadata(json);
      setLoading(false);
    }
    fetchInscriptions();
    fetchSatMetadata();
  },[sat]);

  // function to toggle visibility of inscription numbers
  const toggleNumberVisibility = () => {
    setNumberVisibility(!numberVisibility);
  };

  const toggleGridType = () => {
    setZoomGrid(!zoomGrid);
  };

  const handleSortOptionChange = (option) => {
    let sortedInscriptions = [...inscriptions];    
    if (option==="newest") {
      sortedInscriptions = sortedInscriptions.sort((a,b)=>b.sequence_number-a.sequence_number);
    } else if (option==="oldest") {
      sortedInscriptions = sortedInscriptions.sort((a,b)=>a.sequence_number-b.sequence_number);
    } else if (option==="newest_sat") {
      sortedInscriptions = sortedInscriptions.sort((a,b)=>b.sat-a.sat);
    } else if (option==="oldest_sat") {
      sortedInscriptions = sortedInscriptions.sort((a,b)=>a.sat-b.sat);
    } else if (option==="biggest") {
      sortedInscriptions = sortedInscriptions.sort((a,b)=>b.content_length-a.content_length);
    } else if (option==="smallest") {
      sortedInscriptions = sortedInscriptions.sort((a,b)=>a.content_length-b.content_length);
    } else if (option==="highest_fee") {
      sortedInscriptions = sortedInscriptions.sort((a,b)=>b.genesis_fee-a.genesis_fee);
    } else if (option==="lowest_fee") {
      sortedInscriptions = sortedInscriptions.sort((a,b)=>a.genesis_fee-b.genesis_fee);
    }
    setInscriptions(sortedInscriptions);
  };

  return (
    <PageContainer>
      {loading ? (
        <GridHeaderSkeleton 
          pageType={'Sat'} 
          hasDescription={false} 
          numTags={4}
        />
      ) : (
        <>
          <HeaderContainer>
            <MainContentStack>
              <InfoText>Sat</InfoText>
              <DetailsStack>
                <ImageContainer>
                  <CoinIcon size={'2rem'} color={theme.colors.background.verm} />
                </ImageContainer>
                <Stack gap={'.5rem'}>
                  <MainText>{addCommas(sat)}</MainText>
                  <InfoText>Created {metadata?.timestamp ? new Date(metadata?.timestamp*1000).toLocaleString(undefined, {day:"numeric", month: "short", year:"numeric", hour: 'numeric', minute: 'numeric', hour12: true}) : ""}</InfoText>
                </Stack>
              </DetailsStack>
            </MainContentStack>
          </HeaderContainer>
          <RowContainer style={{gap: '.5rem', flexFlow: 'wrap'}}>
            <Tag isLarge={true} value={metadata?.rarity ? metadata?.rarity.charAt(0).toUpperCase() + metadata?.rarity.slice(1) : ""} category={'Rarity'} />
            <Tag isLarge={true} value={metadata?.name ? metadata?.name : ""} category={'Name'} />
            <LinkTag isLarge={true} link={"/sat_block/" + metadata?.block} value={metadata?.block ? addCommas(metadata?.block) : 0} category={'Creation Block'} />
            <Tag isLarge={true} value={metadata?.epoch} category={'Epoch'} />
          </RowContainer>
        </>
      )}
      <HorizontalDivider />
      <GridControls
        numberVisibility={numberVisibility} 
        toggleNumberVisibility={toggleNumberVisibility} 
        zoomGrid={zoomGrid} 
        toggleGridType={toggleGridType} 
        handleSortOptionChange={handleSortOptionChange} 
        filtersEnabled={false}
        initialOption={'newest'}
        includeRelevance={false}
      />
      <RowContainer>
        <GalleryContainer>
          <Gallery inscriptionList={inscriptions} displayJsonToggle={false} numberVisibility={numberVisibility} zoomGrid={zoomGrid} />
        </GalleryContainer>
      </RowContainer>
    </PageContainer>
  )
}
  
export default Sat;
