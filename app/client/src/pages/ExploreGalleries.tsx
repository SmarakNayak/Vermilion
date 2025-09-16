import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
const ReactGA = require('react-ga4').default;
import theme from '../styles/theme';
import { InfoCircleIcon } from '../components/common/Icon';
import Gallery from '../components/Gallery';
import { HorizontalDivider, RowContainer, GalleryContainer } from '../components/grid/Layout';
import Stack from '../components/Stack';
import GridToggle from '../components/grid/GridToggle';
import GridControls, { NumberToggleContainer, Switch, SwitchCircle, SwitchLabel } from '../components/grid/GridControls';
import DropdownCustom from '../components/DropdownCustom';

const ExploreGalleries = () => {
  const [galleryInscriptions, setGalleryInscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [numberVisibility, setNumberVisibility] = useState(true);
  const [zoomGrid, setZoomGrid] = useState(true);
  const [selectedSortOption, setSelectedSortOption] = useState('latest_first_inscribed_date');

  // record event in GA
  useEffect(() => {
    ReactGA.send({
      hitType: "pageview",
      page: location.pathname + location.search
    });
  }, [])

  // Fetch gallery inscriptions with sort option
  useEffect(() => {
    const fetchGalleryInscriptions = async () => {
      try {
        setLoading(true);
        const queryParams = new URLSearchParams();
        if (selectedSortOption) {
          queryParams.append('sort_by', selectedSortOption);
        }

        const queryString = queryParams.toString();
        const url = queryString ? `/api/gallery_inscriptions?${queryString}` : '/api/gallery_inscriptions';
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error('Failed to fetch gallery inscriptions');
        }
        const data = await response.json();
        setGalleryInscriptions(data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchGalleryInscriptions();
  }, [selectedSortOption]);

  // function to toggle visibility of inscription numbers
  const toggleNumberVisibility = () => {
    setNumberVisibility(!numberVisibility);
  };

  const toggleGridType = () => {
    setZoomGrid(!zoomGrid);
  };

  const handleSortOptionChange = (option: string) => {
    setSelectedSortOption(option);
  };

  // Gallery sort options and labels
  const gallerySortOptions = [
    'latest_first_inscribed_date',
    'earliest_first_inscribed_date',
    'latest_last_inscribed_date',
    'earliest_last_inscribed_date',
    'biggest_file_size',
    'smallest_file_size',
    'biggest_creation_fee',
    'smallest_creation_fee',
    'biggest_supply',
    'smallest_supply',
    'most_boosts',
    'least_boosts',
  ];

  const gallerySortLabels: Record<string, string> = {
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
  };

  if (loading) {
    return (
      <MainContainer>
        <PageText>Galleries</PageText>
        <HorizontalDivider />
        <LoadingText>Loading gallery inscriptions...</LoadingText>
      </MainContainer>
    );
  }

  if (error) {
    return (
      <MainContainer>
        <PageText>Galleries</PageText>
        <HorizontalDivider />
        <ErrorText>Error: {error}</ErrorText>
      </MainContainer>
    );
  }

  return (
    <MainContainer>
      <RowContainer style={{justifyContent: 'flex-start'}}>
        <PageText>Galleries</PageText>
      </RowContainer>
      <HorizontalDivider />
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
          <DropdownCustom
            onOptionSelect={handleSortOptionChange}
            initialOption={selectedSortOption}
            options={gallerySortOptions}
            labels={gallerySortLabels}
            placeholder="Sort by:"
          />
        </RowContainer>
        <GalleryContainer>
          <Gallery
            inscriptionList={galleryInscriptions}
            numberVisibility={numberVisibility}
            zoomGrid={zoomGrid}
          />
          {galleryInscriptions.length === 0 && !loading && (
            <EmptyState>
              <EmptyText>No gallery inscriptions found</EmptyText>
            </EmptyState>
          )}
        </GalleryContainer>
      </Stack>
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