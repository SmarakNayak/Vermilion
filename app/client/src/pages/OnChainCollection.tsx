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
  RowContainer,
  GalleryContainer,
  ImageContainer,
  HorizontalDivider,
  SocialStack,
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
import { ArrowSquareIcon, ChevronDownSmallIcon, GalleryIcon } from '../components/common/Icon';

// import utils
import {
  addCommas,
  formatAddress,
  formatSatsString,
  formatTimestampMs,
  shortenBytesString,
  shortenDate
} from '../utils/format';
import { extractArtistFromMetadata, extractCollectionTitleFromMetadata } from '../utils/metadata';
import { ChevronRightSmallIcon } from '../components/common/Icon/icons/ChevronRightSmallIcon';
import Tooltip from '../components/common/Tooltip';
import { ButtonWrapper } from '../components/common/buttons/ButtonWrapper';
import IconButton from '../components/common/buttons/IconButton';

const OnChainCollection = ({ 
  setParentNumbers 
}: {
  setParentNumbers: any;
}) => {
  const [baseApi, setBaseApi] = useState<null|string>(null); 
  let { number } = useParams();
  const [metadata, setMetadata] = useState<any>(null);
  const [inscriptionMetadata, setInscriptionMetadata] = useState<any>(null);
  const [metadataVisibility, setMetadataVisibility] = useState(false);
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

        // Fetch inscription metadata if there is only one parent
        if (metadataJson?.parent_numbers.length === 1) {
          const parentId = metadataJson.parent_numbers[0];
          const inscriptionMetadataResponse = await fetch(`/api/inscription_metadata/${number}`);
          const inscriptionMetadataJson = await inscriptionMetadataResponse.json();
          setInscriptionMetadata(inscriptionMetadataJson);
        }
        
      } catch (error) {
        console.error("Error fetching inscription data:", error);
      }
    };

    fetchInscriptionData();
  }, [number, setParentNumbers]);

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

  const handleSortOptionChange = (option: any) => {
    setSelectedSortOption(option);
  };

  const handleFilterOptionsChange = (filterOptions: any) => {
    setSelectedFilterOptions(filterOptions);
  };

  const artistText = (onChainMetadata: any) => {
    const artist = extractArtistFromMetadata(onChainMetadata);
    return artist ? `Created by ${artist} • ` : '';
  };

  return (
    <PageContainer>
      {loading ? (
        <GridHeaderSkeleton 
          pageType={'Onchain Collection'} 
          hasDescription={false} 
          numTags={5}
        />
      ) : (
        <>
          <HeaderContainer>
            <MainContentStack>
              <InfoText>Onchain Collection</InfoText>
              <DetailsStack>
                <ImageContainer>
                  {metadata?.parent_numbers?.length === 1 ? (
                    <InscriptionIcon endpoint={"/bun/rendered_content_number/"+metadata.parent_numbers[0]} useBlockIconDefault={false} size={'8rem'} />
                  ) : (
                    <GalleryIcon size={'2rem'} color={theme.colors.background.verm} />
                  )}
                </ImageContainer>
                <Stack gap={'.5rem'}>
                  <MainText>
                    {extractCollectionTitleFromMetadata(inscriptionMetadata?.on_chain_metadata) || `Collection of ${metadata?.parent_numbers ? metadata.parent_numbers.map((num: number) => addCommas(num)).join(' • ') : ''}`}
                  </MainText>
                  <InfoText>{artistText(inscriptionMetadata?.on_chain_metadata)}First Inscribed {shortenDate(metadata?.first_inscribed_date)} • Last Inscribed {shortenDate(metadata?.last_inscribed_date)}</InfoText>
                </Stack>
              </DetailsStack>
            </MainContentStack>
            {inscriptionMetadata && <SocialStack>
              <Tooltip content={"View parent inscription"}>
                <ButtonWrapper>
                  <IconButton onClick={() => window.open('/inscription/' + inscriptionMetadata.number, '_blank')}>
                    <ArrowSquareIcon size={'1.25rem'} />
                  </IconButton>
                </ButtonWrapper>
              </Tooltip>
            </SocialStack>}
          </HeaderContainer>
          <RowContainer style={{gap: '.5rem', flexFlow: 'wrap'}}>
            <Tag isLarge={true} value={metadata?.supply ? addCommas(metadata?.supply) : 0} category={'Supply'} />
            <Tag isLarge={true} value={metadata?.total_volume ? formatSatsString(metadata.total_volume) : "0 BTC"} category={'Traded Volume'} />
            <Tag isLarge={true} value={metadata?.range_start ? addCommas(metadata?.range_start) + " to " + addCommas(metadata?.range_end) : ""} category={'Range'} />
            <Tag isLarge={true} value={metadata?.total_inscription_size ? shortenBytesString(metadata.total_inscription_size) : 0} category={'Total Size'} />
            <Tag isLarge={true} value={metadata?.total_inscription_fees ? formatSatsString(metadata.total_inscription_fees) : "0 BTC"} category={'Total Fees'} />
          </RowContainer>
          {(inscriptionMetadata?.on_chain_metadata && Object.keys(inscriptionMetadata.on_chain_metadata).length > 0) && (
            <RowContainer style={{gap: '.5rem', flexFlow: 'wrap'}}>
              <MetadataButton onClick={() => setMetadataVisibility(!metadataVisibility)}>
                {metadataVisibility ? <ChevronDownSmallIcon size={'1.25rem'} /> : <ChevronRightSmallIcon size={'1.25rem'} />}
                Onchain Metadata
              </MetadataButton>
              {metadataVisibility && (
                <MetadataContainer>
                  <BorderedTagSection />
                  <TextContainer>
                    {typeof inscriptionMetadata?.on_chain_metadata === 'string' ? (
                      <MetadataValue>{inscriptionMetadata.on_chain_metadata}</MetadataValue>
                    ) : (
                      Object.entries(inscriptionMetadata?.on_chain_metadata || {}).map(([key, value]: [string, any]) => {
                        // Skip entries that are arrays or objects
                        if (Array.isArray(value) || (typeof value === 'object' && value !== null)) {
                          return null;
                        }
                        
                        return (
                          <MetadataText key={key}>
                            {key}
                            <MetadataValue> {value}</MetadataValue>
                          </MetadataText>
                        );
                      }).filter(Boolean)
                    )}
                  </TextContainer>
                </MetadataContainer>
              )}
            </RowContainer>
          )}
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
        initialOption={'newest'}
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

export const MetadataContainer = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
  padding: 0.75rem;
  background-color: ${theme.colors.background.primary};
  border-radius: 0.25rem;
`;

export const MetadataButton = styled.button`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 0.5rem;
  background-color: transparent;
  border: none;
  cursor: pointer;
  padding: 0;
  margin: 0;
  font-family: ${theme.typography.fontFamilies.medium};
  font-size: 1rem;
  line-height: 1.5rem;
  color: ${theme.colors.text.secondary};
  text-decoration: none;
  transition: all 200ms ease;

  svg {
    fill: ${theme.colors.text.secondary};
    transition: all 200ms ease;
  }

  &:hover {
    color: ${theme.colors.text.primary};
    svg {
      fill: ${theme.colors.text.primary};
    }
  }

  &:active {
    transform: scale(0.98);
  }
`;

export const BorderedTagSection = styled.div`
  display: flex;
  position: relative;
  padding-left: calc(2px + 0.75rem);

  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 2px;
    background-color: ${theme.colors.border};
    border-radius: 1px;
  }
`;

export const TextContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 0;
  margin: 0;
`;

export const MetadataText = styled.p`
  font-family: ${theme.typography.fontFamilies.medium};
  font-size: 1rem;
  line-height: 1.5rem;
  color: ${theme.colors.text.secondary};
  margin: 0;
  padding: 0;
`;

export const MetadataValue = styled.span`
  font-family: ${theme.typography.fontFamilies.medium};
  font-size: 1rem;
  line-height: 1.5rem;
  color: ${theme.colors.text.primary};
  margin: 0;
  padding: 0;
`;

export default OnChainCollection;
