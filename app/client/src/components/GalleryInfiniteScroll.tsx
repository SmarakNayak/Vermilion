import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import GridItemContainer from './GridItemContainer';
import InfiniteScroll from 'react-infinite-scroll-component';
import Spinner from './Spinner';
import theme from '../styles/theme';
import { ImageBadgeIcon } from './common/Icon';

interface GalleryInfiniteScrollProps {
  baseApi: string;
  isCollectionPage?: boolean;
  numberVisibility: boolean;
  zoomGrid: boolean;
}

const GalleryInfiniteScroll = ({ baseApi, isCollectionPage, numberVisibility, zoomGrid }: GalleryInfiniteScrollProps) => {
  const [inscriptions, setInscriptions] = useState<any>([]);
  const [hasMore, setHasMore] = useState(true);
  const [pageSize, setPageSize] = useState(24);
  const [nextPageNo, setNextPageNo] = useState(0);

  //Update inscriptionList
  useEffect(() => {
    setInscriptions([]);
    setNextPageNo(0);
    fetchInital();
  },[baseApi])

  const fetchInital = async () => {
    const query_string = baseApi + "&page_size=" + pageSize + "&page_number=0";
    // console.log(query_string); // Query string for debugging - not visible in console
    const response = await fetch(query_string);
    const newInscriptions = await response.json();

    setInscriptions(newInscriptions);
    setHasMore(newInscriptions?.length === pageSize);
    setNextPageNo(1);
  }

  const fetchData = async () => {
    const query_string = baseApi + "&page_size=" + pageSize + "&page_number=" + nextPageNo;
    // console.log(query_string); // Query string for debugging - not visible in console
    const response = await fetch(query_string);
    const newInscriptions = await response.json();

    setInscriptions([...inscriptions, ...newInscriptions]);
    setHasMore(newInscriptions?.length === pageSize);
    setNextPageNo(nextPageNo+1);
  };

  return(
    <>
      {inscriptions.length === 0 && !hasMore && (
        <EmptyStateContainer>
          <ImageBadgeIcon size={'1.5rem'} color={theme.colors.text.secondary} />
          <h2>No inscriptions found</h2>
          <p>We could not find any inscriptions that match your search criteria</p>
        </EmptyStateContainer>
      )}
      <InfiniteScroll
        dataLength={inscriptions?.length}
        next={fetchData}
        hasMore={hasMore}
        loader={
          <LoaderContainer numberVisibility={numberVisibility}>
            <Spinner />
          </LoaderContainer>
        }
        scrollThreshold="80%"
        style={{ overflow: 'visible' }}
      >
        <GridContainer zoomGrid={zoomGrid}>
          {inscriptions.map(
              (entry: any) => 
                <GridItemContainer 
                  collection={entry.collection_name} 
                  collection_symbol={entry.collection_symbol}
                  content_length={entry.content_length}
                  id={entry.id} 
                  is_boost={entry.delegate}
                  is_child={entry.parents.length > 0}
                  is_recursive={entry.is_recursive}
                  isCollectionPage={isCollectionPage}
                  item_name={entry.off_chain_metadata?.name}
                  key={entry.number} 
                  number={entry.number} 
                  numberVisibility={numberVisibility} 
                  rune={entry.spaced_rune}
                />
          )}
        </GridContainer>
      </InfiniteScroll>
    </>
  )
}

export const EmptyStateContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1rem;
  font-family: ${theme.typography.fontFamilies.medium};
  color: ${theme.colors.text.secondary};
  text-align: center;

  h2 {
    margin: 1rem 0;
    font-family: ${theme.typography.fontFamilies.medium};
    font-size: 1.25rem;
    line-height: 1.75rem;
  }

  p {
    font-size: 1rem;
    line-height: 1.5rem;
    max-width: 16rem;
    margin: 0;
  }
`;

const LoaderContainer = styled.div<{ numberVisibility: boolean }>`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  padding-top: ${props => props.numberVisibility ? '.5rem' : '2.125rem'};
`;

export const GridContainer = styled.div<{ zoomGrid: boolean }>`
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: .25rem;
  width: 100%;
  min-width: 100%;

  @media (min-width: 1346px) {
    grid-template-columns: ${props => props.zoomGrid ? 'repeat(4, minmax(0, 1fr))' : 'repeat(8, minmax(0, 1fr))'};
  }

  @media (max-width: 1346px) {
    grid-template-columns: ${props => props.zoomGrid ? 'repeat(3, minmax(0, 1fr))' : 'repeat(7, minmax(0, 1fr))'};
  }

  @media (max-width: 1080px) {
    grid-template-columns: ${props => props.zoomGrid ? 'repeat(3, minmax(0, 1fr))' : 'repeat(6, minmax(0, 1fr))'};
  }

  @media (max-width: 960px) {
    grid-template-columns: ${props => props.zoomGrid ? 'repeat(2, minmax(0, 1fr))' : 'repeat(5, minmax(0, 1fr))'};
  }

  @media (max-width: 812px) {
    grid-template-columns: ${props => props.zoomGrid ? 'repeat(2, minmax(0, 1fr))' : 'repeat(4, minmax(0, 1fr))'};
  }

  @media (max-width: 630px) {
    grid-template-columns: ${props => props.zoomGrid ? 'repeat(2, minmax(0, 1fr))' : 'repeat(3, minmax(0, 1fr))'};
  }

  @media (max-width: 480px) {
    grid-template-columns: ${props => props.zoomGrid ? 'repeat(1, minmax(0, 1fr))' : 'repeat(2, minmax(0, 1fr))'};
  }
`;

export default GalleryInfiniteScroll;
