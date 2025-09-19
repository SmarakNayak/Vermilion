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
import { gallerySummaryAtomFamily } from '../atoms/rustFamilyAtomics';

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

  const gallerySummaryResult = useAtomValue(gallerySummaryAtomFamily(gallery_id || ''));

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

  const handleFilterOptionChange = (filterOptions: {
    "ContentType": ReadonlyArray<typeof ContentType.Type>;
    "Satributes": ReadonlyArray<typeof SatributeType.Type>;
    "Charms": ReadonlyArray<typeof CharmType.Type>;
  }) => {
    setSelectedFilterOptions(filterOptions);
  };

  return (
    <PageContainer>
      <MainContentStack>
        <HeaderContainer>
          <DetailsStack>
            <RowContainer style={{justifyContent: 'flex-start'}}>
              <Link to="/galleries" style={{textDecoration: 'none', color: 'inherit'}}>
                <MainText style={{color: theme.colors.text.tertiary}}>Galleries</MainText>
              </Link>
              <ChevronRightSmallIcon size={'1rem'} color={theme.colors.text.tertiary} className="" />
              <MainText>{gallery_id || 'Loading...'}</MainText>
            </RowContainer>

            {Result.builder(gallerySummaryResult)
              .onInitial(() =>
                <GridHeaderSkeleton
                  pageType={'Gallery'}
                  isProfile={false}
                  removeInfoText={false}
                  hasDescription={true}
                  numTags={1}
                  removeTags={false}
                />
              )
              .onSuccess((summary: any) => summary ? (
                <Stack horizontal={false} center={false} style={{gap: '1rem', width: '100%'}}>
                  <RowContainer style={{justifyContent: 'flex-start'}}>
                    <ImageContainer>
                      <InscriptionIcon
                        endpoint={`/bun/rendered_content_id/${gallery_id}`}
                        useBlockIconDefault={true}
                        size={'4rem'}
                      />
                    </ImageContainer>
                    <DetailsStack>
                      <RowContainer style={{justifyContent: 'flex-start'}}>
                        <Tag
                          category=""
                          isLarge={false}
                          value="Gallery"
                        />
                      </RowContainer>
                      <InfoText>
                        {summary?.supply ? addCommas(summary.supply) : 0} inscriptions
                        {summary?.gallery_inscribed_date && ` • Inscribed ${shortenDate(summary.gallery_inscribed_date * 1000)}`}
                        {summary?.boost_count && ` • ${addCommas(summary.boost_count)} boosts`}
                      </InfoText>
                    </DetailsStack>
                  </RowContainer>

                  {summary && (
                    <RowContainer style={{justifyContent: 'flex-start'}}>
                      <CollapsibleButton
                        onClick={toggleMetadataVisibility}
                        style={{
                          transform: metadataVisibility ? 'rotate(180deg)' : 'rotate(0deg)',
                        }}
                      >
                        <InfoText style={{margin: 0}}>Details</InfoText>
                        <ChevronDownSmallIcon size={'1rem'} color={theme.colors.text.secondary} className="" />
                      </CollapsibleButton>
                    </RowContainer>
                  )}

                  <MetadataContainer visible={metadataVisibility}>
                    {summary && (
                      <MetadataGrid>
                        <MetadataItem>
                          <InfoText style={{color: theme.colors.text.secondary}}>Gallery ID</InfoText>
                          <InfoText>{gallery_id}</InfoText>
                        </MetadataItem>

                        {summary.range_start && summary.range_end && (
                          <MetadataItem>
                            <InfoText style={{color: theme.colors.text.secondary}}>Range</InfoText>
                            <InfoText>{addCommas(summary.range_start)} - {addCommas(summary.range_end)}</InfoText>
                          </MetadataItem>
                        )}

                        {summary.first_inscribed_date && (
                          <MetadataItem>
                            <InfoText style={{color: theme.colors.text.secondary}}>First Inscribed</InfoText>
                            <InfoText>{formatTimestampMs(summary.first_inscribed_date * 1000)}</InfoText>
                          </MetadataItem>
                        )}

                        {summary.last_inscribed_date && (
                          <MetadataItem>
                            <InfoText style={{color: theme.colors.text.secondary}}>Last Inscribed</InfoText>
                            <InfoText>{formatTimestampMs(summary.last_inscribed_date * 1000)}</InfoText>
                          </MetadataItem>
                        )}

                        {summary.total_inscription_fees && (
                          <MetadataItem>
                            <InfoText style={{color: theme.colors.text.secondary}}>Total Fees</InfoText>
                            <InfoText>{formatSatsString(summary.total_inscription_fees)} BTC</InfoText>
                          </MetadataItem>
                        )}

                        {summary.total_volume && (
                          <MetadataItem>
                            <InfoText style={{color: theme.colors.text.secondary}}>Volume</InfoText>
                            <InfoText>{formatSatsString(summary.total_volume)} BTC</InfoText>
                          </MetadataItem>
                        )}
                      </MetadataGrid>
                    )}
                  </MetadataContainer>
                </Stack>
              ) : <InfoText>Gallery not found</InfoText>)
              .render()
            }
          </DetailsStack>
        </HeaderContainer>

        <HorizontalDivider />

        <GridControls
          numberVisibility={numberVisibility}
          toggleNumberVisibility={toggleNumberVisibility}
          filterVisibility={filterVisibility}
          toggleFilterVisibility={toggleFilterVisibility}
          zoomGrid={zoomGrid}
          toggleGridType={toggleGridType}
          handleSortOptionChange={handleSortOptionChange}
          selectedFilterOptions={selectedFilterOptions}
          handleFilterOptionsChange={handleFilterOptionChange}
          filtersEnabled={true}
          initialOption={selectedSortOption}
          includeRelevance={false}
          sortByEnabled={true}
        />

        <GalleryContainer>
          {Result.builder(galleryInscriptionsResult)
            .onInitial(() => <LoadingContainer><Spinner /></LoadingContainer>)
            .onSuccess((galleryInscriptions) =>
              <>
                <GridContainer zoomGrid={zoomGrid}>
                  {galleryInscriptions.items.map(
                    entry => {
                      const onChainArtist = extractArtistFromMetadata(entry.on_chain_metadata);
                      const onChainTitle = extractTitleFromMetadata(entry.on_chain_metadata);

                      return (
                        <GridItemContainer
                          collection={entry.collection_name}
                          collection_symbol={entry.collection_symbol}
                          content_length={entry.content_length}
                          id={entry.id}
                          is_boost={entry.delegate}
                          is_child={entry.parents?.length > 0}
                          is_recursive={entry.is_recursive}
                          item_name={onChainTitle}
                          key={entry.number}
                          number={entry.number}
                          numberVisibility={numberVisibility}
                          onChainTitle={onChainTitle}
                          onChainArtist={onChainArtist}
                          rune={entry.spaced_rune}
                          isGalleryPage={true} // to show title instead of number if available
                        />
                      );
                    }
                  )}
                </GridContainer>
                {galleryInscriptionsResult.waiting && (
                  <LoadingContainer><Spinner /></LoadingContainer>
                )}
              </>
            )
            .render()
          }
        </GalleryContainer>
      </MainContentStack>
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