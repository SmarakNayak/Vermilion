import React, { useState, useEffect, ChangeEvent } from 'react';
import styled from 'styled-components';
import GridItemContainer from './GridItemContainer';
import InfiniteScroll from 'react-infinite-scroll-component';

const GalleryInfiniteScroll = (props) => {
  const [inscriptions, setInscriptions] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [baseApi, setBaseApi] = useState(null)
  const [pageSize, setPageSize] = useState(20);
  const [nextPageNo, setNextPageNo] = useState(0);

  //Update inscriptionList
  useEffect(() => {
    console.log("prop change triggerred");
    console.log(props.baseApi);
    setInscriptions([]);
    setBaseApi(props.baseApi);
    setNextPageNo(0);
    fetchInital();
  },[props.baseApi])

  const fetchInital = async () => {
    console.log("fetch initial data")
    const query_string = props.baseApi + "&page_size=" + pageSize + "&page_number=0";
    console.log(query_string);
    const response = await fetch(query_string);
    const newInscriptions = await response.json();

    setInscriptions(newInscriptions);
    setHasMore(newInscriptions?.length === pageSize);
    setNextPageNo(1);
  }

  const fetchData = async () => {
    console.log("fetch data")
    const query_string = props.baseApi + "&page_size=" + pageSize + "&page_number=" + nextPageNo;
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
      <GridContainer>
        {inscriptions.map(
            entry => 
            <GridItemContainer key={entry.number} number={entry.number} numberVisibility={props.numberVisibility}></GridItemContainer>
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

  // @media (max-width: 1984px) {
  //   // grid-template-columns: repeat(5, 1fr);
  //   grid-template-columns: repeat(5, minmax(0, 1fr));
  // }

  // @media (max-width: 1346px) {
  //   grid-template-columns: repeat(4, minmax(0, 1fr));
  // }

  // @media (max-width: 960px) {
  //   grid-template-columns: repeat(3, minmax(0, 1fr));
  // }

  // @media (max-width: 630px) {
  //   grid-template-columns: repeat(2, minmax(0, 1fr));
  // }

  // @media (max-width: 320px) {
  //   grid-template-columns: repeat(1, minmax(0, 1fr));
  // }

  @media (min-width: 1984px) {
    grid-template-columns: repeat(5, minmax(0, 1fr));
  }

  @media (max-width: 1984px) {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }

  @media (max-width: 1346px) {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  @media (max-width: 960px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: 630px) {
    grid-template-columns: repeat(1, minmax(0, 1fr));
  }

  // @media (max-width: 320px) {
  //   grid-template-columns: repeat(1, minmax(0, 1fr));
  // }
`;

export default GalleryInfiniteScroll;