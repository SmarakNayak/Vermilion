import React, { useState, useEffect, ChangeEvent } from 'react';
import styled from 'styled-components';
import CollectionItemContainer from './CollectionItemContainer';
import InfiniteScroll from 'react-infinite-scroll-component';

const CollectionGallery = ({ baseApi, numberVisibility, zoomGrid }) => {
  const [inscriptions, setInscriptions] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [pageSize, setPageSize] = useState(20);
  const [nextPageNo, setNextPageNo] = useState(0);

  //Update inscriptionList
  useEffect(() => {
    setInscriptions([]);
    setNextPageNo(0);
    fetchInital();
  },[baseApi])

  const fetchInital = async () => {
    console.log("fetch initial data")
    const query_string = baseApi + "&page_size=" + pageSize + "&page_number=0";
    console.log(query_string);
    const response = await fetch(query_string);
    const newInscriptions = await response.json();

    setInscriptions(newInscriptions);
    setHasMore(newInscriptions?.length === pageSize);
    setNextPageNo(1);
  }

  const fetchData = async () => {
    console.log("fetch data")
    const query_string = baseApi + "&page_size=" + pageSize + "&page_number=" + nextPageNo;
    console.log(query_string);
    const response = await fetch(query_string);
    const newInscriptions = await response.json();

    setInscriptions([...inscriptions, ...newInscriptions]);
    setHasMore(newInscriptions?.length === pageSize);
    setNextPageNo(nextPageNo+1);
  };

  return(
    <InfiniteScroll
      dataLength={inscriptions?.length}
      next={fetchData}
      hasMore={hasMore}
      loader={
        <LoaderContainer>
          <p style={{color: '#959595'}}>Loading...</p>
        </LoaderContainer>
      }
    >
      <GridContainer zoomGrid={zoomGrid}>
        {inscriptions.map(
            entry => 
            <CollectionItemContainer collection={entry.collection_name} itemName={entry?.off_chain_metadata?.name} key={entry.number} number={entry.number} id={entry.id} numberVisibility={numberVisibility} rune={entry.spaced_rune}></CollectionItemContainer>
        )}
      </GridContainer>
    </InfiniteScroll>
  )
}

const LoaderContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  padding-top: 1.5rem;
`;

const GridContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 1.5rem;
  width: 100%;
  min-width: 100%;

  @media (min-width: 1984px) {
    grid-template-columns: ${props => props.zoomGrid ? 'repeat(5, minmax(0, 1fr))' : 'repeat(12, minmax(0, 1fr))'};
  }

  @media (max-width: 1984px) {
    grid-template-columns: ${props => props.zoomGrid ? 'repeat(4, minmax(0, 1fr))' : 'repeat(10, minmax(0, 1fr))'};
  }

  @media (max-width: 1750px) {
    grid-template-columns: ${props => props.zoomGrid ? 'repeat(4, minmax(0, 1fr))' : 'repeat(9, minmax(0, 1fr))'};
  }

  @media (max-width: 1550px) {
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
    grid-template-columns: ${props => props.zoomGrid ? 'repeat(1, minmax(0, 1fr))' : 'repeat(3, minmax(0, 1fr))'};
  }

  @media (max-width: 480px) {
    grid-template-columns: ${props => props.zoomGrid ? 'repeat(1, minmax(0, 1fr))' : 'repeat(2, minmax(0, 1fr))'};
  }
`;

export default CollectionGallery;
