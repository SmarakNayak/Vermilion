import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import InfiniteScroll from 'react-infinite-scroll-component';

import BlockIcon from '../assets/icons/BlockIcon';
import ChevronDownSmallIcon from '../assets/icons/ChevronDownSmallIcon';
import ChevronUpSmallIcon from '../assets/icons/ChevronUpSmallIcon';
import { formatTimestampSecs } from '../helpers/utils';
import { shortenBytes } from '../helpers/utils';
import { formatSats } from '../helpers/utils';

const CollectionsTable = () => {
  const [collectionSortColumn, setCollectionSortColumn] = useState('volume');
  const [collectionSortDescending, setCollectionSortDescending] = useState(true);
  const [selectedCollectionSortOption, setSelectedCollectionSortOption] = useState('most_volume');
  const [collectionData, setCollectionData] = useState([]);
  //infinite scroll
  const [hasMore, setHasMore] = useState(true);
  const [pageSize, setPageSize] = useState(20);
  const [nextPageNo, setNextPageNo] = useState(0);

  //Get blocks data
  useEffect(() => {
    setCollectionData([]);
    setNextPageNo(0);
    fetchInitial();
  },[selectedCollectionSortOption])

  const fetchInitial = async () => {
    console.log("fetch initial data")
    let query_string = "/api/collections?sort_by=" + selectedCollectionSortOption + "&page_size=" + pageSize + "&page_number=0";
    console.log(query_string);
    const response = await fetch(query_string);
    const newBlocks = await response.json();

    setCollectionData(newBlocks);
    setHasMore(newBlocks?.length > 0);
    setNextPageNo(1);
  }

  const fetchData = async () => {
    console.log("fetch data")
    let query_string = "/api/collections?sort_by=" + selectedCollectionSortOption + "&page_size=" + pageSize + "&page_number=" + nextPageNo;
    console.log(query_string);
    const response = await fetch(query_string);
    const newBlockData = await response.json();

    setCollectionData([...collectionData, ...newBlockData]);
    setHasMore(newBlockData?.length > 0);
    setNextPageNo(nextPageNo+1);
  };

  //block handlers
  const handleCollectionSort = (column) => {
    if (column === collectionSortColumn) {
      setCollectionSortDescending(!collectionSortDescending);
    } else {
      setCollectionSortColumn(column);
      setCollectionSortDescending(true);
    }
  }
  //Update block option
  useEffect(() => {
    // "biggest_on_chain_footprint", "smallest_on_chain_footprint",
    // "most_volume", "least_volume",
    // "biggest_file_size", "smallest_file_size",
    // "biggest_creation_fee", "smallest_creation_fee",
    // "earliest_first_inscribed_date", "latest_first_inscribed_date",
    // "earliest_last_inscribed_date", "latest_last_inscribed_date",
    // "biggest_supply", "smallest_supply",
    if (collectionSortColumn === "date" && collectionSortDescending) {
      setSelectedCollectionSortOption("latest_first_inscribed_date");
    } else if (collectionSortColumn === "date" && !collectionSortDescending) {
      setSelectedCollectionSortOption("earliest_first_inscribed_date");

    } else if (collectionSortColumn === "size" && collectionSortDescending) {
      setSelectedCollectionSortOption("biggest_file_size");
    } else if (collectionSortColumn === "size" && !collectionSortDescending) {
      setSelectedCollectionSortOption("smallest_file_size");

    } else if (collectionSortColumn === "volume" && collectionSortDescending) {
      setSelectedCollectionSortOption("most_volume");
    } else if (collectionSortColumn === "volume" && !collectionSortDescending) {
      setSelectedCollectionSortOption("least_volume");

    } else if (collectionSortColumn === "fees" && collectionSortDescending) {
      setSelectedCollectionSortOption("biggest_creation_fee");
    } else if (collectionSortColumn === "fees" && !collectionSortDescending) {
      setSelectedCollectionSortOption("smallest_creation_fee");

    }
  },[collectionSortColumn, collectionSortDescending])

  const renderSortIcon = (column) => {
    if (collectionSortColumn === column) {
      return collectionSortDescending ? <ChevronDownSmallIcon svgSize={'1rem'} svgColor={'#000000'}></ChevronDownSmallIcon> : <ChevronUpSmallIcon svgSize={'1rem'} svgColor={'#000000'}></ChevronUpSmallIcon>;
    }
    return null;
  };

  return (
    <DivTable>
      <DivRow header>
        <DivCell header>Collection</DivCell>
        <DivCell header>Range</DivCell>
        <SortableDivCell header onClick={() => handleCollectionSort("date")} isActive={collectionSortColumn === 'date'}>
          Creation Date {renderSortIcon("date")}
        </SortableDivCell>
        <DivCell header>Supply</DivCell>
        <SortableDivCell header onClick={() => handleCollectionSort("size")} isActive={collectionSortColumn === 'size'}>
          Size {renderSortIcon("size")}
        </SortableDivCell>
        <SortableDivCell header onClick={() => handleCollectionSort("volume")} isActive={collectionSortColumn === 'volume'}>
          Traded Volume {renderSortIcon("volume")}
        </SortableDivCell>
        <SortableDivCell header onClick={() => handleCollectionSort("fees")} isActive={collectionSortColumn === 'fees'}>
          Total Fees {renderSortIcon("fees")}
        </SortableDivCell>
      </DivRow>
      <InfiniteScroll
        dataLength={collectionData?.length}
        next={fetchData}
        hasMore={hasMore}
        loader={<h4>Loading...</h4>}
      >
        {collectionData.map((row, index) => (
          <DivRow key={index}>
            <DivCell>
              <BlockImgContainer>
                <BlockIcon svgSize={'2rem'} svgColor={'#E34234'}></BlockIcon>
              </BlockImgContainer>
              {row?.name}
            </DivCell>
            <DivCell>{row?.range_start ? row?.range_start + " - " + row?.range_end : ""}</DivCell>
            <DivCell>{row?.first_inscribed_date ? formatTimestampSecs(row.first_inscribed_date) : ""}</DivCell>
            <DivCell>{row?.supply}</DivCell>
            <DivCell>{row?.total_inscription_size ? shortenBytes(row.total_inscription_size) : 0}</DivCell>
            <DivCell>{row?.total_volume ? formatSats(row.total_volume) : "0 BTC"}</DivCell>
            <DivCell>{row?.total_inscription_fees ? formatSats(row.total_inscription_fees) : "0 BTC"}</DivCell>
          </DivRow>
        ))}
      </InfiniteScroll>
    </DivTable>
  )
}

const BlockImgContainer = styled.div`
  width: 3.75rem;
  height: 3.75rem;
  background-color: #F5F5F5;
  border-radius: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const DivTable = styled.div`
  display: flex;
  flex-direction: column;
  width: calc(100% - 2rem);
`;

const DivRow = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
  border-radius: .5rem;
  padding: ${props => props.header ? '0 1rem' : '1rem'};
  background-color: ${props => props.header ? 'transparent' : 'transparent'};
  cursor: ${props => props.header ? 'default' : 'pointer'};
  transition: 
    background-color 350ms ease,
    transform 150ms ease;
  transform-origin: center center;

  &:hover {
    background-color: ${props => props.header ? '#transparent' : '#F5F5F5'};
  }
  &:not(:last-child) {
    margin-bottom: 0.5rem;
  }
`;

const DivCell = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-end;
  gap: 1rem;
  flex: 1;
  margin: 0;
  font-family: ABC Camera Plain Unlicensed Trial Regular;
  font-size: .875rem;
  color: ${props => props.header ? '#959595' : '#000000'};
  &:nth-child(1) {
    justify-content: flex-start;
  }
`;

const SortableDivCell = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-end;
  gap: 1rem;
  flex: 1;
  margin: 0;
  font-family: ABC Camera Plain Unlicensed Trial Regular;
  font-size: .875rem;
  cursor: pointer;
  font-weight: ${props => props.isActive ? 'bold' : 'normal'};
  color: ${props => props.header ? '#959595' : '#000000'};
  &:nth-child(1) {
    justify-content: flex-start;
  }
`;

export default CollectionsTable;