import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import InfiniteScroll from 'react-infinite-scroll-component';
import { renderToStaticMarkup } from 'react-dom/server';
import { Link } from 'react-router-dom';

import BlockIcon from '../assets/icons/BlockIcon';
import ArrowDownIcon from '../assets/icons/ArrowDownIcon';
import ArrowUpIcon from '../assets/icons/ArrowUpIcon';
import ChevronDownSmallIcon from '../assets/icons/ChevronDownSmallIcon';
import ChevronUpSmallIcon from '../assets/icons/ChevronUpSmallIcon';
import { addCommas, formatTimestampMs } from '../helpers/utils';
import { shortenBytes } from '../helpers/utils';
import { formatSats } from '../helpers/utils';

const BlockTable = () => {
  const [blockSortColumn, setBlockSortColumn] = useState('block_number');
  const [blockSortDescending, setBlockSortDescending] = useState(true);
  const [selectedBlockSortOption, setSelectedBlockSortOption] = useState('newest');
  const [blockData, setBlockData] = useState([]);
  //infinite scroll
  const [hasMore, setHasMore] = useState(true);
  const [pageSize, setPageSize] = useState(20);
  const [nextPageNo, setNextPageNo] = useState(0);

  //Get blocks data
  useEffect(() => {
    setBlockData([]);
    setNextPageNo(0);
    fetchInitial();
  },[selectedBlockSortOption])

  const fetchInitial = async () => {
    console.log("fetch initial data")
    let query_string = "/api/blocks?sort_by=" + selectedBlockSortOption + "&page_size=" + pageSize + "&page_number=0";
    console.log(query_string);
    const response = await fetch(query_string);
    const newBlocks = await response.json();

    setBlockData(newBlocks);
    setHasMore(newBlocks?.length > 0);
    setNextPageNo(1);
  }

  const fetchData = async () => {
    console.log("fetch data")
    let query_string = "/api/blocks?sort_by=" + selectedBlockSortOption + "&page_size=" + pageSize + "&page_number=" + nextPageNo;
    console.log(query_string);
    const response = await fetch(query_string);
    const newBlockData = await response.json();

    setBlockData([...blockData, ...newBlockData]);
    setHasMore(newBlockData?.length > 0);
    setNextPageNo(nextPageNo+1);
  };

  //block handlers
  const handleBlockSort = (column) => {
    if (column === blockSortColumn) {
      setBlockSortDescending(!blockSortDescending);
    } else {
      setBlockSortColumn(column);
      setBlockSortDescending(true);
    }
  }
  //Update block option
  useEffect(() => {
    // "newest", "oldest", 
    // "most_txs", "least_txs", 
    // "most_inscriptions", "least_inscriptions",
    // "biggest_block", "smallest_block",
    // "highest_total_fees", "lowest_total_fees",
    // "most_volume", "least_volume"
    if (blockSortColumn === "block_number" && blockSortDescending) {
      setSelectedBlockSortOption("newest");
    } else if (blockSortColumn === "block_number" && !blockSortDescending) {
      setSelectedBlockSortOption("oldest");

    } else if (blockSortColumn === "txs" && blockSortDescending) {
      setSelectedBlockSortOption("most_txs");
    } else if (blockSortColumn === "txs" && !blockSortDescending) {
      setSelectedBlockSortOption("least_txs");

    } else if (blockSortColumn === "inscriptions" && blockSortDescending) {
      setSelectedBlockSortOption("most_inscriptions");
    } else if (blockSortColumn === "inscriptions" && !blockSortDescending) {
      setSelectedBlockSortOption("least_inscriptions");

    } else if (blockSortColumn === "size" && blockSortDescending) {
      setSelectedBlockSortOption("biggest_block");
    } else if (blockSortColumn === "size" && !blockSortDescending) {
      setSelectedBlockSortOption("smallest_block");

    } else if (blockSortColumn === "volume" && blockSortDescending) {
      setSelectedBlockSortOption("most_volume");
    } else if (blockSortColumn === "volume" && !blockSortDescending) {
      setSelectedBlockSortOption("least_volume");

    } else if (blockSortColumn === "fees" && blockSortDescending) {
      setSelectedBlockSortOption("highest_total_fees");
    } else if (blockSortColumn === "fees" && !blockSortDescending) {
      setSelectedBlockSortOption("lowest_total_fees");

    }
  },[blockSortColumn, blockSortDescending])

  const renderSortIcon = (column) => {
    if (blockSortColumn === column) {
      return blockSortDescending ? <ArrowDownIcon svgSize={'.875rem'} svgColor={'#000000'}></ArrowDownIcon> : <ArrowUpIcon svgSize={'.875rem'} svgColor={'#000000'}></ArrowUpIcon>;
    }
    return null;
  };

  const BlockIconDefault = encodeURIComponent(
    renderToStaticMarkup(<BlockIcon svgSize={'2rem'} svgColor={'#E34234'} />)
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
        <SortableDivCell header onClick={() => handleBlockSort("block_number")} isActive={blockSortColumn === 'block_number'}>
          <HeaderWrapper isActive={blockSortColumn === 'block_number'}>
            Block {renderSortIcon("block_number")}
          </HeaderWrapper>
        </SortableDivCell>
        <SortableDivCell header onClick={() => handleBlockSort("txs")} isActive={blockSortColumn === 'txs'}>
          <HeaderWrapper isActive={blockSortColumn === 'txs'}>
            Transactions {renderSortIcon("txs")}
          </HeaderWrapper>
        </SortableDivCell>
        <SortableDivCell header onClick={() => handleBlockSort("inscriptions")} isActive={blockSortColumn === 'inscriptions'}>
          <HeaderWrapper isActive={blockSortColumn === 'inscriptions'}>
            Inscriptions {renderSortIcon("inscriptions")}
          </HeaderWrapper>
        </SortableDivCell>
        <DivCell header>Creation Date</DivCell>
        <SortableDivCell header onClick={() => handleBlockSort("size")} isActive={blockSortColumn === 'size'}>
          <HeaderWrapper isActive={blockSortColumn === 'size'}>
            Size {renderSortIcon("size")}
          </HeaderWrapper>
        </SortableDivCell>
        <SortableDivCell header onClick={() => handleBlockSort("volume")} isActive={blockSortColumn === 'volume'}>
          <HeaderWrapper isActive={blockSortColumn === 'volume'}>
            Traded Volume {renderSortIcon("volume")}
          </HeaderWrapper>
        </SortableDivCell>
        <SortableDivCell header onClick={() => handleBlockSort("fees")} isActive={blockSortColumn === 'fees'}>
          <HeaderWrapper isActive={blockSortColumn === 'fees'}>
            Total Fees {renderSortIcon("fees")}
          </HeaderWrapper>
        </SortableDivCell>
      </DivRow>
      <InfiniteScroll
        dataLength={blockData?.length}
        next={fetchData}
        hasMore={hasMore}
        loader={<p style={{color: '#959595'}}>Loading...</p>}
      >
        {blockData.map((row, index) => (
          <UnstyledLink to={"/block/" + row?.block_number}>
            <DivRow key={index}>
              <DivCell>
                <BlockImgContainer>
                  {row?.block_inscription_count > 0 ?
                    <BlockImg src ={"/api/block_icon/"+row.block_number} onError={handleImageError}></BlockImg> :
                    <BlockIcon svgSize={'2rem'} svgColor={'#E34234'}></BlockIcon> 
                  }
                </BlockImgContainer>
                {addCommas(row.block_number)}
              </DivCell>
              <DivCell>{addCommas(row?.block_tx_count)}</DivCell>
              <DivCell>{row?.block_inscription_count ? addCommas(row.block_inscription_count) : 0}</DivCell>
              <DivCell>{row?.block_timestamp ? formatTimestampMs(row.block_timestamp) : ""}</DivCell>
              <DivCell>{row?.block_size ? shortenBytes(row.block_size) : 0}</DivCell>
              <DivCell>{row?.block_volume ? formatSats(row.block_volume) : "0 BTC"}</DivCell>
              <DivCell>{row?.block_fees ? formatSats(row.block_fees) : "0 BTC"}</DivCell>
            </DivRow>
          </UnstyledLink>
        ))}
      </InfiniteScroll>
    </DivTable>
  )
}

const BlockImg = styled.img`
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

  // Hide "Transactions" column on screens smaller than 1200px
  @media (max-width: 1200px) {
    &:nth-child(2) {
      display: none;
    }
  }

  // Hide "Creation Date" column on screens smaller than 1000px
  @media (max-width: 1000px) {
    &:nth-child(4) {
      display: none;
    }
  }

  // Hide "Size" column on screens smaller than 800px
  @media (max-width: 800px) {
    &:nth-child(5) {
      display: none;
    }
  }

  // Hide "Traded Volume" column on screens smaller than 600px
  @media (max-width: 600px) {
    &:nth-child(6) {
      display: none;
    }
  }

  // Hide "Total Fees" column on screens smaller than 400px
  @media (max-width: 400px) {
    &:nth-child(7) {
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

  // Hide "Transactions" column on screens smaller than 1200px
  @media (max-width: 1200px) {
    &:nth-child(2) {
      display: none;
    }
  }

  // Hide "Creation Date" column on screens smaller than 1000px
  @media (max-width: 1000px) {
    &:nth-child(4) {
      display: none;
    }
  }

  // Hide "Size" column on screens smaller than 800px
  @media (max-width: 800px) {
    &:nth-child(5) {
      display: none;
    }
  }

  // Hide "Traded Volume" column on screens smaller than 600px
  @media (max-width: 600px) {
    &:nth-child(6) {
      display: none;
    }
  }

  // Hide "Total Fees" column on screens smaller than 400px
  @media (max-width: 400px) {
    &:nth-child(7) {
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

export default BlockTable;