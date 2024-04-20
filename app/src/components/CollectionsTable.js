import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import InfiniteScroll from 'react-infinite-scroll-component';
import { renderToStaticMarkup } from 'react-dom/server';

import ImageIcon from '../assets/icons/ImageIcon';
import ArrowDownIcon from '../assets/icons/ArrowDownIcon';
import ArrowUpIcon from '../assets/icons/ArrowUpIcon';
import ChevronDownSmallIcon from '../assets/icons/ChevronDownSmallIcon';
import ChevronUpSmallIcon from '../assets/icons/ChevronUpSmallIcon';
import { addCommas, formatSats, formatTimestampSecs, shortenBytes } from '../helpers/utils';
import { Link } from 'react-router-dom';

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
      return collectionSortDescending ? <ArrowDownIcon svgSize={'.875rem'} svgColor={'#000000'}></ArrowDownIcon> : <ArrowUpIcon svgSize={'.875rem'} svgColor={'#000000'}></ArrowUpIcon>;
    }
    return null;
  };

  const BlockIconDefault = encodeURIComponent(
    renderToStaticMarkup(<ImageIcon svgSize={'2rem'} svgColor={'#E34234'} />)
  );

  const handleImageError = (event) => {
    console.log("error image triggered")
    event.target.onError = null;
    event.target.src = `data:image/svg+xml,${BlockIconDefault}`;
    //have to override default size of CollectionIcon
    event.target.style.width = "2rem"
    event.target.style.height = "2rem"
  };

  return (
    <DivTable>
      <DivRow header>
        <DivCell header>Collection</DivCell>
        <DivCell header>Range</DivCell>
        <SortableDivCell header onClick={() => handleCollectionSort("date")} isActive={collectionSortColumn === 'date'}>
          <HeaderWrapper isActive={collectionSortColumn === 'date'}>
            Creation Date {renderSortIcon("date")}
          </HeaderWrapper>
        </SortableDivCell>
        <DivCell header>Supply</DivCell>
        <SortableDivCell header onClick={() => handleCollectionSort("size")} isActive={collectionSortColumn === 'size'}>
          <HeaderWrapper isActive={collectionSortColumn === 'size'}>
            Size {renderSortIcon("size")}
          </HeaderWrapper>
        </SortableDivCell>
        <SortableDivCell header onClick={() => handleCollectionSort("volume")} isActive={collectionSortColumn === 'volume'}>
          <HeaderWrapper isActive={collectionSortColumn === 'volume'}>
            Traded Volume {renderSortIcon("volume")}
          </HeaderWrapper>
        </SortableDivCell>
        <SortableDivCell header onClick={() => handleCollectionSort("fees")} isActive={collectionSortColumn === 'fees'}>
          <HeaderWrapper isActive={collectionSortColumn === 'fees'}>
            Total Fees {renderSortIcon("fees")}
          </HeaderWrapper>
        </SortableDivCell>
      </DivRow>
      <InfiniteScroll
        dataLength={collectionData?.length}
        next={fetchData}
        hasMore={hasMore}
        loader={<p style={{color: '#959595'}}>Loading...</p>}
      >
        {collectionData.map((row, index) => (
          <UnstyledLink to={"/collection/" + row?.collection_symbol}>
            <DivRow key={index}>
              <DivCell>
                <BlockImgContainer>
                  {row?.range_start ? 
                    <CollectionIcon src ={"/api/inscription_number/"+row.range_start} onError={handleImageError}></CollectionIcon> :
                    <ImageIcon svgSize={'2rem'} svgColor={'#E34234'}></ImageIcon>
                  }
                </BlockImgContainer>
                {row?.name}
              </DivCell>
              <DivCell>{row?.range_start ? addCommas(row?.range_start) + " - " + addCommas(row?.range_end) : ""}</DivCell>
              <DivCell>{row?.first_inscribed_date ? formatTimestampSecs(row.first_inscribed_date) : ""}</DivCell>
              <DivCell>{addCommas(row?.supply)}</DivCell>
              <DivCell>{row?.total_inscription_size ? shortenBytes(row.total_inscription_size) : 0}</DivCell>
              <DivCell>{row?.total_volume ? addCommas(formatSats(row.total_volume)) : "0 BTC"}</DivCell>
              <DivCell>{row?.total_inscription_fees ? formatSats(row.total_inscription_fees) : "0 BTC"}</DivCell>
            </DivRow>
          </UnstyledLink>
        ))}
      </InfiniteScroll>
    </DivTable>
  )
}

const CollectionIcon = styled.img`
  width: 3.75rem;
  height: 3.75rem;
  border-radius: .5rem;
`

const BlockImgContainer = styled.div`
  width: 3.75rem;
  height: 3.75rem;
  background-color: transparent;
  border-radius: .5rem;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const DivTable = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const DivRow = styled.div`
  display: flex;
  flex-direction: row;
  width: calc(100% - 2rem);
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
  font-family: Relative Trial Medium;
  font-size: .875rem;
  color: ${props => props.header ? '#959595' : '#000000'};;
  &:nth-child(1) {
    justify-content: flex-start;
  }

  // Hide "Creation Date" column on screens smaller than 1200px
  @media (max-width: 1200px) {
    &:nth-child(3) {
      display: none;
    }
  }

  // Hide "Size" column on screens smaller than 1000px
  @media (max-width: 1000px) {
    &:nth-child(5) {
      display: none;
    }
  }

  // Hide "Total Fees" column on screens smaller than 800px
  @media (max-width: 800px) {
    &:nth-child(7) {
      display: none;
    }
  }

  // Hide "Traded Volume" column on screens smaller than 600px
  @media (max-width: 600px) {
    &:nth-child(6) {
      display: none;
    }
  }

  // Hide "Range" column on screens smaller than 400px
  @media (max-width: 400px) {
    &:nth-child(2) {
      display: none;
    }
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
  font-family: Relative Trial Medium;
  font-size: .875rem;
  cursor: pointer;
  color: ${props => props.isActive ? '#000000' : '#959595'};
  &:nth-child(1) {
    justify-content: flex-start;
  }

  // Hide "Creation Date" column on screens smaller than 1200px
  @media (max-width: 1200px) {
    &:nth-child(3) {
      display: none;
    }
  }

  // Hide "Size" column on screens smaller than 1000px
  @media (max-width: 1000px) {
    &:nth-child(5) {
      display: none;
    }
  }

  // Hide "Total Fees" column on screens smaller than 800px
  @media (max-width: 800px) {
    &:nth-child(7) {
      display: none;
    }
  }

  // Hide "Traded Volume" column on screens smaller than 600px
  @media (max-width: 600px) {
    &:nth-child(6) {
      display: none;
    }
  }

  // Hide "Range" column on screens smaller than 400px
  @media (max-width: 400px) {
    &:nth-child(2) {
      display: none;
    }
  }
`;

const HeaderWrapper = styled.span`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: .25rem;
  padding: ${props => props.isActive ? '0.25rem .5rem' : '0.25rem 0'};
  background-color: ${props => props.isActive ? '#F5F5F5' : 'transparent'};
  border-radius: .5rem;
`;

const UnstyledLink = styled(Link)`
  color: unset;
  text-decoration: unset;
`;

export default CollectionsTable;