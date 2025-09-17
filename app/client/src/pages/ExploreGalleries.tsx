import { useState } from 'react';
import styled from 'styled-components';
import theme from '../styles/theme';
import { InfoCircleIcon } from '../components/common/Icon';
import Gallery from '../components/Gallery';
import { HorizontalDivider, RowContainer, GalleryContainer } from '../components/grid/Layout';
import Stack from '../components/Stack';
import GridToggle from '../components/grid/GridToggle';
import { NumberToggleContainer, Switch, SwitchCircle, SwitchLabel } from '../components/grid/GridControls';
import DropdownCustom from '../components/DropdownCustom';
import { Effect, Stream, Option } from 'effect';
import { Atom, useAtom, Result, useAtomRefresh } from '@effect-atom/atom-react';
import { rustClientRuntime, RustClientService } from '../atoms/rustAtoms';
import type { GallerySortBy } from '../api/rustClient/RustClient';
import { useScrollBottom } from '../hooks/useScrollBottom';

const sortAtom = Atom.make<typeof GallerySortBy.Type>('latest_first_inscribed_date');
// Single fetch Atom (not-used, here as a reference)
const galleryInscriptionsAtom = rustClientRuntime.atom((get) => {
  const sortBy = get(sortAtom);
  return Effect.gen(function* () {
    const rustClient = yield* RustClientService;
    return yield* rustClient["GET/gallery_inscriptions"]({ sort_by: sortBy });
  }).pipe(
    //all errors are unexpected here, so model them as defects
    Effect.catchAll((error) => {
      return Effect.die(error);
    }),
  );
});
// Pull-based Atom family for infinite scroll
const galleryInscriptionsPullAtomFamily = Atom.family((sortBy: typeof GallerySortBy.Type) =>
  rustClientRuntime.pull((get) => {
    //const sortBy = get(sortAtom);
    // Create a stream that yields paginated results
    return Stream.unfoldEffect(0, (page_number) =>
      Effect.gen(function* () {
        const rustClient = yield* RustClientService;
        const result = yield* rustClient["GET/gallery_inscriptions"]({
          sort_by: sortBy,
          page_number,
          page_size: 20
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

const ExploreGalleries = () => {
  const [numberVisibility, setNumberVisibility] = useState(true);
  const [zoomGrid, setZoomGrid] = useState(true);

  const [selectedSortOption, setSelectedSortOption] = useAtom(sortAtom);
  const galleryInscriptionsPullAtom = galleryInscriptionsPullAtomFamily(selectedSortOption);
  const [galleryInscriptionsResult, pullMoreGalleryInscriptions] = useAtom(galleryInscriptionsPullAtom);

  useScrollBottom(pullMoreGalleryInscriptions);

  const toggleNumberVisibility = () => {
    setNumberVisibility(!numberVisibility);
  };

  const toggleGridType = () => {
    setZoomGrid(!zoomGrid);
  };

  const handleSortOptionChange = (option: typeof GallerySortBy.Type) => {
    setSelectedSortOption(option);
  };

  // Gallery sort options and labels
  const gallerySortOptions: (typeof GallerySortBy.Type)[] = [
    //'latest_first_inscribed_date',
    //'earliest_first_inscribed_date',
    //'latest_last_inscribed_date',
    //'earliest_last_inscribed_date',
    'biggest_file_size',
    'smallest_file_size',
    'biggest_creation_fee',
    'smallest_creation_fee',
    'biggest_supply',
    'smallest_supply',
    'most_boosts',
    'least_boosts',
    //'biggest_on_chain_footprint',
    //'smallest_on_chain_footprint',
    //'most_volume',
    //'least_volume',
  ];

  const gallerySortLabels: Record<typeof GallerySortBy.Type, string> = {
    latest_first_inscribed_date: 'Newest',
    earliest_first_inscribed_date: 'Oldest',
    latest_last_inscribed_date: 'Latest Activity',
    earliest_last_inscribed_date: 'Earliest Activity',
    biggest_file_size: 'Largest File',
    smallest_file_size: 'Smallest File',
    biggest_creation_fee: 'Highest Fee',
    smallest_creation_fee: 'Lowest Fee',
    biggest_supply: 'Largest Supply',
    smallest_supply: 'Smallest Supply',
    most_boosts: 'Most Boosts',
    least_boosts: 'Least Boosts',
    biggest_on_chain_footprint: 'Largest Footprint',
    smallest_on_chain_footprint: 'Smallest Footprint',
    most_volume: 'Most Volume',
    least_volume: 'Least Volume',
  };

  return (
    <MainContainer>
      <RowContainer style={{justifyContent: 'flex-start'}}>
        <PageText>Galleries</PageText>
      </RowContainer>
      <HorizontalDivider />
      {Result.builder(galleryInscriptionsResult)
        .onInitial(() => (
          <LoadingText>Loading gallery inscriptions...</LoadingText>
        ))
        .onDefect((cause) => {
          console.error('Error fetching gallery inscriptions:', cause);
          return (
            <ErrorText>Error loading gallery inscriptions. Please try again.</ErrorText>
          );
        })
        .onSuccess((galleryInscriptions) => (
          <Stack horizontal={false} center={false} style={{gap: '1.5rem', width: '100%'}}>
            <NoteContainer>
              <IconWrapper>
                <InfoCircleIcon size={'1.25rem'} color={theme.colors.text.secondary} />
              </IconWrapper>
              <NoteText>
                Explore inscriptions from curated onchain galleries. Note that galleries do not imply provenance and can be inscribed by anyone.
              </NoteText>
            </NoteContainer>
            <RowContainer>
              <Stack horizontal={true} center={true} style={{gap: '.75rem'}}>
                <GridToggle value={zoomGrid} onToggle={toggleGridType} />
                <NumberToggleContainer>
                  <Switch
                    checked={numberVisibility}
                    onClick={toggleNumberVisibility}
                    aria-label="Toggle number visibility"
                  >
                    <SwitchCircle checked={numberVisibility} />
                  </Switch>
                  <SwitchLabel>Hide info</SwitchLabel>
                </NumberToggleContainer>
              </Stack>
              <DropdownCustom<typeof GallerySortBy.Type>
                onOptionSelect={handleSortOptionChange}
                initialOption={selectedSortOption}
                options={gallerySortOptions}
                labels={gallerySortLabels}
                placeholder="Sort by:"
              />
            </RowContainer>
            <GalleryContainer>
              <Gallery
                inscriptionList={galleryInscriptions.items}
                numberVisibility={numberVisibility}
                zoomGrid={zoomGrid}
              />
              {galleryInscriptions.items.length === 0 && (
                <EmptyState>
                  <EmptyText>No gallery inscriptions found</EmptyText>
                </EmptyState>
              )}
            </GalleryContainer>
            {galleryInscriptionsResult.waiting && (
              <LoadingText>Loading more gallery inscriptions...</LoadingText>
            )}
          </Stack>
        ))
        .render()}
    </MainContainer>
  )
}

const MainContainer = styled.div`
  width: calc(100% - 6rem);
  padding: 1.5rem 3rem 2.5rem 3rem;
  margin: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  transition: all 200ms ease;

  @media (max-width: 864px) {
    width: calc(100% - 2rem);
    padding: 1.5rem 1rem 2.5rem 1rem;
  }
`;

const PageText = styled.p`
  font-family: ${theme.typography.fontFamilies.bold};
  font-size: 1.5rem;
  line-height: 2rem;
  margin: 0;
  width: 100%;
`;


const NoteContainer = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
  gap: .5rem;
  align-items: flex-start;
`;

const IconWrapper = styled.div`
  flex-shrink: 0;
  width: 1.25rem;
  height: 1.25rem;
`;

const NoteText = styled.p`
  font-family: ${theme.typography.fontFamilies.medium};
  font-size: .875rem;
  line-height: 1.25rem;
  color: ${theme.colors.text.secondary};
  margin: 0;
  padding: 0;
  flex: 1;
`;

const LoadingText = styled.p`
  font-family: ${theme.typography.fontFamilies.medium};
  font-size: 1rem;
  color: ${theme.colors.text.secondary};
  text-align: center;
  margin: 2rem 0;
`;

const ErrorText = styled.p`
  font-family: ${theme.typography.fontFamilies.medium};
  font-size: 1rem;
  color: ${theme.colors.background.verm};
  text-align: center;
  margin: 2rem 0;
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 3rem 1rem;
`;

const EmptyText = styled.p`
  font-family: ${theme.typography.fontFamilies.medium};
  font-size: 1rem;
  color: ${theme.colors.text.tertiary};
  margin: 0;
`;


export default ExploreGalleries;