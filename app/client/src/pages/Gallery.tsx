import React, { useState } from 'react';
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
  LoadingContainer,
} from '../components/grid/Layout';
import GridControls from '../components/grid/GridControls';
import { GridHeaderSkeleton } from '../components/grid/GridHeaderSkeleton';
import MainText from '../components/common/text/MainText';
import InfoText from '../components/common/text/InfoText';
import Stack from '../components/Stack';
import FilterMenu from '../components/FilterMenu';
import { GridContainer } from '../components/GalleryInfiniteScroll';
import GridItemContainer from '../components/GridItemContainer';
import InscriptionIcon from '../components/InscriptionIcon';
import Tag from '../components/Tag';
import Spinner from '../components/Spinner';

// import icons
import { ChevronDownSmallIcon, GalleryIcon } from '../components/common/Icon';
import { ChevronRightSmallIcon } from '../components/common/Icon/icons/ChevronRightSmallIcon';

// import utils
import {
  addCommas,
  formatAddress,
  formatSatsString,
  formatTimestampMs,
  shortenBytesString,
  shortenDate
} from '../utils/format';

// Effect and atoms imports
import { Effect, Stream, Option, Data } from 'effect';
import { Atom, useAtom, Result, useAtomValue } from '@effect-atom/atom-react';
import { rustClientRuntime, RustClientService } from '../atoms/rustAtoms';
import type { ContentType, SatributeType, CharmType } from '../api/rustClient/RustClient';
import { InscriptionSortBy } from '../api/rustClient/RustClient';
import { useScrollBottom } from '../hooks/useScrollBottom';
import { extractArtistFromMetadata, extractTitleFromMetadata } from '../utils/metadata';
import { gallerySummaryAtomFamily, inscriptionMetadataAtomFamily } from '../atoms/rustFamilyAtomics';

class GalleryInscriptionsParams extends Data.Class<{
  readonly galleryId: string | undefined;
  readonly sortBy: typeof InscriptionSortBy.Type;
  readonly filters: {
    readonly "ContentType": ReadonlyArray<typeof ContentType.Type>;
    readonly "Satributes": ReadonlyArray<typeof SatributeType.Type>;
    readonly "Charms": ReadonlyArray<typeof CharmType.Type>;
  };
}> {}

// Pull-based Atom family for infinite scroll gallery inscriptions
const galleryInscriptionsPullAtomFamily = Atom.family((params: GalleryInscriptionsParams) =>
  rustClientRuntime.pull((get) => {
    // Create a stream that yields paginated results
    return Stream.unfoldEffect(0, (page_number) =>
      Effect.gen(function* () {
        if (!params.galleryId) return Option.none();
        const rustClient = yield* RustClientService;
        const result = yield* rustClient["GET/inscriptions_in_gallery/{gallery_id}"](params.galleryId, {
          sort_by: params.sortBy,
          page_number,
          page_size: 20,
          content_types: params.filters["ContentType"],
          satributes: params.filters["Satributes"],
          charms: params.filters["Charms"],
        });
        if (result.length === 0) return Option.none();
        return Option.some([result, page_number + 1] as const);
      }).pipe(
        Effect.catchAll((error) => Effect.die(error))
      )
    ).pipe(
      Stream.takeUntil((chunk) => chunk.length < 20), // Stop after emitting partial chunk
      Stream.flatMap(Stream.fromIterable), // Return array instead of array of arrays
    );
  })
);

const Gallery = () => {
  let { gallery_id } = useParams<{ gallery_id: string }>();
  const [metadataVisibility, setMetadataVisibility] = useState(false);
  const [numberVisibility, setNumberVisibility] = useState(true);
  const [filterVisibility, setFilterVisibility] = useState(false);
  const [zoomGrid, setZoomGrid] = useState(true);

  const [selectedSortOption, setSelectedSortOption] = useState<typeof InscriptionSortBy.Type>('newest');
  const [selectedFilterOptions, setSelectedFilterOptions] = useState({
    "ContentType": [] as ReadonlyArray<typeof ContentType.Type>,
    "Satributes": [] as ReadonlyArray<typeof SatributeType.Type>,
    "Charms": [] as ReadonlyArray<typeof CharmType.Type>
  });

  const gallerySummaryResult = useAtomValue(gallerySummaryAtomFamily(gallery_id));
  const galleryInscriptionMetadataResult = useAtomValue(inscriptionMetadataAtomFamily(gallery_id));


  // Create the pull atom for the current gallery and filters
  const galleryInscriptionsPullAtom = galleryInscriptionsPullAtomFamily(new GalleryInscriptionsParams({
    galleryId: gallery_id,
    sortBy: selectedSortOption,
    filters: selectedFilterOptions
  }));

  const [galleryInscriptionsResult, pullMoreInscriptions] = useAtom(galleryInscriptionsPullAtom);

  useScrollBottom(pullMoreInscriptions);

  const toggleNumberVisibility = () => {
    setNumberVisibility(!numberVisibility);
  };

  const toggleMetadataVisibility = () => {
    setMetadataVisibility(!metadataVisibility);
  };

  const toggleFilterVisibility = () => {
    setFilterVisibility(!filterVisibility);
  };

  const toggleGridType = () => {
    setZoomGrid(!zoomGrid);
  };

  const handleSortOptionChange = (option: typeof InscriptionSortBy.Type) => {
    setSelectedSortOption(option);
  };

  const handleFilterOptionsChange = (filterOptions: {
    "ContentType": ReadonlyArray<typeof ContentType.Type>;
    "Satributes": ReadonlyArray<typeof SatributeType.Type>;
    "Charms": ReadonlyArray<typeof CharmType.Type>;
  }) => {
    setSelectedFilterOptions(filterOptions);
  };

  return (
    <PageContainer>
      {Result.builder(gallerySummaryResult)
        .onInitial(
          () => <GridHeaderSkeleton 
            pageType={'Onchain Collection'} 
            hasDescription={false} 
            numTags={5}
            isProfile={undefined}
            removeInfoText={undefined}
            removeTags={undefined}
          />
        )
        .onSuccess((gallerySummary) => 
          <>
            <HeaderContainer>
              <MainContentStack>
                <InfoText>Onchain Collection</InfoText>
                <DetailsStack>
                  <ImageContainer>
                    <InscriptionIcon endpoint={"/api/inscription/"+gallery_id} useBlockIconDefault={false} size={'8rem'} />
                  </ImageContainer>
                  <Stack gap={'.5rem'}>
                    <MainText>Unnamed Gallery</MainText>
                    <InfoText>Inscribed {shortenDate(gallerySummary.gallery_inscribed_date)}</InfoText>
                  </Stack>
                </DetailsStack>
              </MainContentStack>
            </HeaderContainer>
            <RowContainer style={{gap: '.5rem', flexFlow: 'wrap'}}>
              <Tag isLarge={true} value={gallerySummary.supply ? addCommas(gallerySummary.supply) : 0} category={'Supply'} />
              <Tag isLarge={true} value={gallerySummary.total_volume ? formatSatsString(gallerySummary.total_volume) : "0 BTC"} category={'Traded Volume'} />
              <Tag isLarge={true} value={gallerySummary.range_start ? addCommas(gallerySummary.range_start) + " to " + addCommas(gallerySummary.range_end) : ""} category={'Range'} />
              <Tag isLarge={true} value={gallerySummary.total_inscription_size ? shortenBytesString(gallerySummary.total_inscription_size) : 0} category={'Total Size'} />
              <Tag isLarge={true} value={gallerySummary.total_inscription_fees ? formatSatsString(gallerySummary.total_inscription_fees) : "0 BTC"} category={'Total Fees'} />
            </RowContainer>
            {(galleryInscriptionMetadataResult._tag === 'Success' && Object.keys(galleryInscriptionMetadataResult.value.on_chain_metadata as any).length > 0) && (
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
                        Object.entries(inscriptionMetadata?.on_chain_metadata || {}).map(([key, value]) => {
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
        )
        .render()
      }
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

const CollapsibleButton = styled.button`
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: transform 0.2s ease;

  &:hover {
    opacity: 0.8;
  }
`;

const MetadataContainer = styled.div<{visible: boolean}>`
  width: 100%;
  max-height: ${props => props.visible ? '500px' : '0px'};
  overflow: hidden;
  transition: max-height 0.3s ease;
`;

const MetadataGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  padding: 1rem 0;
`;

const MetadataItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

export default Gallery;