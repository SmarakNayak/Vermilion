 import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import InfiniteScroll from 'react-infinite-scroll-component';
import { renderToStaticMarkup } from 'react-dom/server';
import { Link } from 'react-router-dom';
import { ArrowDownIcon, ArrowUpIcon, BlockIcon, ChevronVerticalIcon } from './common/Icon';
import { addCommas, formatSats, formatTimestampMs, shortenBytes } from '../utils/format'
import InscriptionIcon from './InscriptionIcon';
import Spinner from './Spinner';
import theme from '../styles/theme';

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
      return blockSortDescending ? <ArrowDownIcon size={'.875rem'} color={theme.colors.background.verm}></ArrowDownIcon> : <ArrowUpIcon size={'.875rem'} color={theme.colors.background.verm}></ArrowUpIcon>;
    }
    return null;
  };

  return (
    <TableContainer>
      <HeaderRow>
        <DivRow header>
          <SortableDivCell header first={true} isActive={blockSortColumn === 'block_number'}>
            <HeaderWrapper isSortable isActive={blockSortColumn === 'block_number'} onClick={() => handleBlockSort("block_number")}>
              Block {renderSortIcon("block_number")} {blockSortColumn != 'block_number' && (<ChevronVerticalIcon size={'.875rem'} color={theme.colors.text.secondary} />)}
            </HeaderWrapper>
          </SortableDivCell>
          <DivCell header>
            <HeaderWrapper>
              Creation Date
            </HeaderWrapper>
          </DivCell>
          <SortableDivCell header isActive={blockSortColumn === 'inscriptions'}>
            <HeaderWrapper isSortable isActive={blockSortColumn === 'inscriptions'} onClick={() => handleBlockSort("inscriptions")}>
              Inscriptions {renderSortIcon("inscriptions")} {blockSortColumn != 'inscriptions' && (<ChevronVerticalIcon size={'.875rem'} color={theme.colors.text.secondary} />)}
            </HeaderWrapper>
          </SortableDivCell>
          <SortableDivCell header isActive={blockSortColumn === 'txs'}>
            <HeaderWrapper isSortable isActive={blockSortColumn === 'txs'} onClick={() => handleBlockSort("txs")}>
              Transactions {renderSortIcon("txs")} {blockSortColumn != 'txs' && (<ChevronVerticalIcon size={'.875rem'} color={theme.colors.text.secondary} />)}
            </HeaderWrapper>
          </SortableDivCell>
          <SortableDivCell header isActive={blockSortColumn === 'size'}>
            <HeaderWrapper isSortable isActive={blockSortColumn === 'size'} onClick={() => handleBlockSort("size")}>
              Size {renderSortIcon("size")} {blockSortColumn != 'size' && (<ChevronVerticalIcon size={'.875rem'} color={theme.colors.text.secondary} />)}
            </HeaderWrapper>
          </SortableDivCell>
          <SortableDivCell header isActive={blockSortColumn === 'fees'}>
            <HeaderWrapper isSortable isActive={blockSortColumn === 'fees'} onClick={() => handleBlockSort("fees")}>
              Total Fees {renderSortIcon("fees")} {blockSortColumn != 'fees' && (<ChevronVerticalIcon size={'.875rem'} color={theme.colors.text.secondary} />)}
            </HeaderWrapper>
          </SortableDivCell>
          <SortableDivCell header isActive={blockSortColumn === 'volume'}>
            <HeaderWrapper isSortable isActive={blockSortColumn === 'volume'} onClick={() => handleBlockSort("volume")}>
              Traded Volume {renderSortIcon("volume")} {blockSortColumn != 'volume' && (<ChevronVerticalIcon size={'.875rem'} color={theme.colors.text.secondary} />)}
            </HeaderWrapper>
          </SortableDivCell>
        </DivRow>
      </HeaderRow>

      {/* <ScrollContainer> */}
      <InfiniteScroll
        dataLength={blockData?.length}
        next={fetchData}
        hasMore={hasMore}
        loader={
          <LoaderContainer>
            <Spinner />
          </LoaderContainer>
        }
        scrollThreshold="80%"
        style={{ overflow: 'visible' }}
      >
        {blockData.map((row, index) => (
          <DivRow key={index}>
            <DivCell first={true}>
              <DataWrapper first={true}>
                <CollectionLink to={"/block/" + row?.block_number}>
                  <IconWrapper>
                    {row?.block_inscription_count > 0 && <InscriptionIcon endpoint={"/bun/block_icon/"+row.block_number} useBlockIconDefault={true} size={'2.25rem'} /> }
                    <IconOverlay />
                  </IconWrapper>
                  <CollectionName>{addCommas(row.block_number)}</CollectionName>
                </CollectionLink>
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
                {row?.block_size ? (
                  <ValueWrapper>
                    <span>{shortenBytes(row?.block_size).value}</span>
                    <UnitText>{shortenBytes(row?.block_size).unit}</UnitText>
                  </ValueWrapper>
                ) : (
                  <ValueWrapper>
                    <span>0</span>
                    <UnitText>B</UnitText>
                  </ValueWrapper>
                )}
              </DataWrapper>
            </DivCell>
            <DivCell>
              <DataWrapper>
                {row?.block_fees ? (
                  <ValueWrapper>
                    <span>{formatSats(row?.block_fees).value}</span>
                    <UnitText>BTC</UnitText>
                  </ValueWrapper>
                ) : (
                  <ValueWrapper>
                    <span>0</span>
                    <UnitText>BTC</UnitText>
                  </ValueWrapper>
                )}
              </DataWrapper>
            </DivCell>
            <DivCell>
              <DataWrapper>
                {row?.block_volume ? (
                  <ValueWrapper>
                    <span>{formatSats(row?.block_volume).value}</span>
                    <UnitText>BTC</UnitText>
                  </ValueWrapper>
                ) : (
                  <ValueWrapper>
                    <span>0</span>
                    <UnitText>BTC</UnitText>
                  </ValueWrapper>
                )}
              </DataWrapper>
            </DivCell>
          </DivRow>
        ))}
      </InfiniteScroll>
      {/* </ScrollContainer> */}
    </TableContainer>
  )
}

const TableContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
`;

const HeaderRow = styled.div`
  position: sticky;
  top: 4.5rem; 
  background-color: ${theme.colors.background.white};
  z-index: 10;
  transition: all 200ms ease;

  @media (max-width: 630px) {
    top: 4rem;
  }
`;

const ScrollContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  // padding-top: 1rem;
`;

const LoaderContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  padding-top: 2rem;
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
  width: 100%;
  padding: ${props => props.header ? '.375rem 0' : '.75rem 0'};
  // border-bottom: ${props => props.header ? `1px ${theme.colors.background.primary} solid` : ''};
  background-color: transparent;
  transition: all 200ms ease;

  &:hover {
    background-color: ${props => props.header ? 'transparent' : theme.colors.background.primary};
  }

  &:not(:last-child) {
    border-bottom: 1px solid ${theme.colors.background.primary};  
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
  font-family: ${theme.typography.fontFamilies.medium};
  font-size: ${props => props.header ? '.875rem' : '.875rem'};;
  color: ${props => props.header ? theme.colors.text.secondary : theme.colors.text.primary};
  min-width: 0;

  &:nth-child(1) {
    justify-content: flex-start;
    padding-left: .5rem;
    // padding-left: ${props => props.header ? 'none' : '.5rem'};
    flex: 2;
  }

  &:not(:first-child) {
    /* Apply styles to all DivCell elements except the first one */
    // padding-right: .5rem;
    // padding-right: ${props => props.header ? 'none' : '.5rem'};
  }

  // Hide "Creation Date" column on screens smaller than 1400px
  @media (max-width: 1400px) {
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

  // Hide "Total Fees" column on screens smaller than 800px
  @media (max-width: 800px) {
    &:nth-child(6) {
      display: none;
    }
  }

  // Hide "Traded Volume" column on screens smaller than 630px
  @media (max-width: 630px) {
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
  font-family: ${theme.typography.fontFamilies.medium};
  font-size: .875rem;
  color: ${props => props.isActive ? theme.colors.background.verm : theme.colors.text.secondary};
  
  &:nth-child(1) {
    justify-content: flex-start;
    padding-left: .5rem;
    flex: 2;
  }

  // Hide "Creation Date" column on screens smaller than 1400px
  @media (max-width: 1400px) {
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

  // Hide "Total Fees" column on screens smaller than 800px
  @media (max-width: 800px) {
    &:nth-child(6) {
      display: none;
    }
  }

  // Hide "Traded Volume" column on screens smaller than 630px
  @media (max-width: 630px) {
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
  padding: ${props => props.first ? '0.25rem 0' : '0.25rem .5rem'};
  background-color: ${props => props.isActive ? theme.colors.background.primary : 'transparent'};
  border-radius: .5rem;
  cursor: ${props => props.isSortable ? 'pointer' : ''};
`;

const DataWrapper = styled.span`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: ${props => props.first ? 'flex-start' : 'flex-end'};
  padding: ${props => props.first ? '0' : '0 .5rem 0 0'};
  gap: 1rem;
  white-space: nowrap; // Prevent text from wrapping
  overflow: hidden; // Hide overflow text
  text-overflow: ellipsis; // Show ellipsis for overflow text
  min-width: 0;
  flex: 1;
`;

const CollectionLink = styled(Link)`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: .75rem;
  text-decoration: none;
  color: inherit;
  width: auto;
  min-width: 0;
`;

const IconWrapper = styled.div`
  background-color: ${theme.colors.background.primary};
  position: relative;
  width: 2.25rem;
  height: 2.25rem;
  flex-shrink: 0;
  border-radius: .25rem;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const CollectionName = styled.span`
  position: relative;
  display: inline-block;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  text-decoration-line: underline;
  text-decoration-color: transparent;
  text-decoration-thickness: 2px;
  text-underline-offset: 2px;
  transition: all 200ms ease;

  ${CollectionLink}:hover & {
    text-decoration-color: ${theme.colors.text.primary};
  }
`;

const UnitText = styled.span`
  color: #C2C2C2;
  font-family: ${theme.typography.fontFamilies.medium};
`;

const ValueWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 0.25rem;
`;

const IconOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  height: 100%;
  width: 100%;
  cursor: pointer;
  z-index: 2;
`;

export default BlockTable;
