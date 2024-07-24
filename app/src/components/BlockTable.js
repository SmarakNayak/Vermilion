import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import InfiniteScroll from 'react-infinite-scroll-component';
import { renderToStaticMarkup } from 'react-dom/server';
import { Link } from 'react-router-dom';

import BlockIcon from '../assets/icons/BlockIcon';
import ArrowDownIcon from '../assets/icons/ArrowDownIcon';
import ArrowUpIcon from '../assets/icons/ArrowUpIcon';
import ChevronVerticalIcon from '../assets/icons/ChevronVerticalIcon';
import { addCommas, formatTimestampMs } from '../helpers/utils';
import { shortenBytes, shortenDate } from '../helpers/utils';
import { formatSats } from '../helpers/utils';
import InscriptionIcon from './InscriptionIcon';

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
      return blockSortDescending ? <ArrowDownIcon svgSize={'.875rem'} svgColor={'#E34234'}></ArrowDownIcon> : <ArrowUpIcon svgSize={'.875rem'} svgColor={'#E34234'}></ArrowUpIcon>;
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
        <SortableDivCell header first={true} onClick={() => handleBlockSort("block_number")} isActive={blockSortColumn === 'block_number'}>
          <HeaderWrapper isActive={blockSortColumn === 'block_number'}>
            Block {renderSortIcon("block_number")} {blockSortColumn != 'block_number' && (<ChevronVerticalIcon svgSize={'.875rem'} svgColor={'#959595'} />)}
          </HeaderWrapper>
        </SortableDivCell>
        <DivCell header>
          <HeaderWrapper>
            Creation Date
          </HeaderWrapper>
        </DivCell>
        <SortableDivCell header onClick={() => handleBlockSort("inscriptions")} isActive={blockSortColumn === 'inscriptions'}>
          <HeaderWrapper isActive={blockSortColumn === 'inscriptions'}>
            Inscriptions {renderSortIcon("inscriptions")} {blockSortColumn != 'inscriptions' && (<ChevronVerticalIcon svgSize={'.875rem'} svgColor={'#959595'} />)}
          </HeaderWrapper>
        </SortableDivCell>
        <SortableDivCell header onClick={() => handleBlockSort("txs")} isActive={blockSortColumn === 'txs'}>
          <HeaderWrapper isActive={blockSortColumn === 'txs'}>
            Transactions {renderSortIcon("txs")} {blockSortColumn != 'txs' && (<ChevronVerticalIcon svgSize={'.875rem'} svgColor={'#959595'} />)}
          </HeaderWrapper>
        </SortableDivCell>
        <SortableDivCell header onClick={() => handleBlockSort("size")} isActive={blockSortColumn === 'size'}>
          <HeaderWrapper isActive={blockSortColumn === 'size'}>
            Size {renderSortIcon("size")} {blockSortColumn != 'size' && (<ChevronVerticalIcon svgSize={'.875rem'} svgColor={'#959595'} />)}
          </HeaderWrapper>
        </SortableDivCell>
        <SortableDivCell header onClick={() => handleBlockSort("volume")} isActive={blockSortColumn === 'volume'}>
          <HeaderWrapper isActive={blockSortColumn === 'volume'}>
            Traded Volume {renderSortIcon("volume")} {blockSortColumn != 'volume' && (<ChevronVerticalIcon svgSize={'.875rem'} svgColor={'#959595'} />)}
          </HeaderWrapper>
        </SortableDivCell>
        <SortableDivCell header onClick={() => handleBlockSort("fees")} isActive={blockSortColumn === 'fees'}>
          <HeaderWrapper isActive={blockSortColumn === 'fees'}>
            Total Fees {renderSortIcon("fees")} {blockSortColumn != 'fees' && (<ChevronVerticalIcon svgSize={'.875rem'} svgColor={'#959595'} />)}
          </HeaderWrapper>
        </SortableDivCell>
      </DivRow>
      <InfiniteScroll
        dataLength={blockData?.length}
        next={fetchData}
        hasMore={hasMore}
        loader={
          <LoaderContainer>
            <p style={{color: '#959595'}}>Loading...</p>
          </LoaderContainer>
        }
      >
        {blockData.map((row, index) => (
          <UnstyledLink to={"/block/" + row?.block_number}>
            <DivRow key={index}>
              <DivCell first={true}>
                <DataWrapper first={true}>
                  <BlockImgContainer>
                    {row?.block_inscription_count > 0 ?
                      <InscriptionIcon endpoint = {"/api/block_icon/"+row.block_number} useBlockIconDefault = {true}></InscriptionIcon> :
                      <BlockIcon svgSize={'2rem'} svgColor={'#E34234'}></BlockIcon> 
                    }
                  </BlockImgContainer>
                  <span style={{ minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {addCommas(row.block_number)}
                  </span>
                </DataWrapper>
              </DivCell>
              <DivCell>
                <DataWrapper>
                  {row?.block_timestamp ? formatTimestampMs(row.block_timestamp) : ""}
                </DataWrapper>
              </DivCell>
              <DivCell>
                <DataWrapper>
                  {row?.block_inscription_count ? addCommas(row.block_inscription_count) : 0}
                </DataWrapper>
              </DivCell>
              <DivCell>
                <DataWrapper>
                  {addCommas(row?.block_tx_count)}
                </DataWrapper>
              </DivCell>
              <DivCell>
                <DataWrapper>
                  {row?.block_size ? shortenBytes(row.block_size) : 0}
                </DataWrapper>
              </DivCell>
              <DivCell>
                <DataWrapper>
                  {row?.block_volume ? formatSats(row.block_volume) : "0 BTC"}
                </DataWrapper>
              </DivCell>
              <DivCell>
                <DataWrapper>
                  {row?.block_fees ? formatSats(row.block_fees) : "0 BTC"}
                </DataWrapper>
              </DivCell>
            </DivRow>
          </UnstyledLink>
        ))}
      </InfiniteScroll>
    </DivTable>
  )
}

const LoaderContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  padding-top: 1.5rem;
`;

const BlockImg = styled.img`
  width: 3.75rem;
  height: 3.75rem;
  border-radius: .5rem;
`

const BlockImgContainer = styled.div`
  width: 3rem;
  height: 3rem;
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
  width: calc(100% - 3rem);
  // width: 100%;
  border-radius: 1rem;
  padding: ${props => props.header ? '0 1.5rem' : '1rem 1.5rem'};
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
  margin: ${props => props.first ? '0 1rem 0 0' : '0'};
  font-family: Relative Trial Medium;
  font-size: ${props => props.header ? '.875rem' : '1rem'};;
  color: ${props => props.header ? '#959595' : '#000000'};
  min-width: 0;

  &:nth-child(1) {
    justify-content: flex-start;
    // padding-left: .5rem;
    // padding-left: ${props => props.header ? 'none' : '.5rem'};
    flex: 2;
  }

  &:not(:first-child) {
    /* Apply styles to all DivCell elements except the first one */
    // padding-right: .5rem;
    // padding-right: ${props => props.header ? 'none' : '.5rem'};
  }

  // Hide "Creation Date" column on screens smaller than 1600px
  @media (max-width: 1600px) {
    &:nth-child(2) {
      display: none;
    }
  }

  // Hide "Transactions" column on screens smaller than 1200px
  @media (max-width: 1200px) {
    &:nth-child(4) {
      display: none;
    }
  }

  // Hide "Size" column on screens smaller than 1000px
  @media (max-width: 1000px) {
    &:nth-child(5) {
      display: none;
    }
  }

  // Hide "Traded Volume" column on screens smaller than 800px
  @media (max-width: 800px) {
    &:nth-child(6) {
      display: none;
    }
  }

  // Hide "Total Fees" column on screens smaller than 600px
  @media (max-width: 600px) {
    &:nth-child(7) {
      display: none;
    }
  }

  // Hide "Inscriptions" column on screens smaller than 400px
  @media (max-width: 400px) {
    &:nth-child(3) {
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
  margin: ${props => props.first ? '0 1rem 0 0' : '0'};
  font-family: Relative Trial Medium;
  font-size: .875rem;
  cursor: pointer;
  color: ${props => props.isActive ? '#E34234' : '#959595'};
  &:nth-child(1) {
    justify-content: flex-start;
    flex: 2;
  }

  // Hide "Creation Date" column on screens smaller than 1600px
  @media (max-width: 1600px) {
    &:nth-child(2) {
      display: none;
    }
  }

  // Hide "Transactions" column on screens smaller than 1200px
  @media (max-width: 1200px) {
    &:nth-child(4) {
      display: none;
    }
  }

  // Hide "Size" column on screens smaller than 1000px
  @media (max-width: 1000px) {
    &:nth-child(5) {
      display: none;
    }
  }

  // Hide "Traded Volume" column on screens smaller than 800px
  @media (max-width: 800px) {
    &:nth-child(6) {
      display: none;
    }
  }

  // Hide "Total Fees" column on screens smaller than 600px
  @media (max-width: 600px) {
    &:nth-child(7) {
      display: none;
    }
  }

  // Hide "Inscriptions" column on screens smaller than 400px
  @media (max-width: 400px) {
    &:nth-child(3) {
      display: none;
    }
  }
`;

const HeaderWrapper = styled.span`
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 0.25rem .5rem;
  background-color: ${props => props.isActive ? '#F5F5F5' : 'transparent'};
  border-radius: .5rem;
`;

const DataWrapper = styled.span`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: ${props => props.first ? 'flex-start' : 'flex-end'};
  padding: ${props => props.first ? '0 0 0 .5rem' : '0 .5rem 0 0'};
  gap: 1rem;
  white-space: nowrap; // Prevent text from wrapping
  overflow: hidden; // Hide overflow text
  text-overflow: ellipsis; // Show ellipsis for overflow text
  min-width: 0;
  flex: 1;
`;

const UnstyledLink = styled(Link)`
  color: unset;
  text-decoration: unset;
`;

export default BlockTable;