 import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import InfiniteScroll from 'react-infinite-scroll-component';
import { renderToStaticMarkup } from 'react-dom/server';
import { Link } from 'react-router-dom';
import { ArrowDownIcon, ArrowUpIcon, BlockIcon, ChevronVerticalIcon } from './common/Icon';
import { addCommas, formatSats, formatTimestampMs, shortenBytes } from '../utils/format'
import InscriptionIcon from './InscriptionIcon';
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
      return blockSortDescending ? <ArrowDownIcon size={'.875rem'} color={'#E34234'}></ArrowDownIcon> : <ArrowUpIcon size={'.875rem'} color={'#E34234'}></ArrowUpIcon>;
    }
    return null;
  };

  const BlockIconDefault = encodeURIComponent(
    renderToStaticMarkup(<BlockIcon size={'2rem'} color={'#E34234'} />)
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
    <TableContainer>
      <HeaderRow>
        <DivRow header>
          <SortableDivCell header first={true} isActive={blockSortColumn === 'block_number'}>
            <HeaderWrapper isSortable isActive={blockSortColumn === 'block_number'} onClick={() => handleBlockSort("block_number")}>
              Block {renderSortIcon("block_number")} {blockSortColumn != 'block_number' && (<ChevronVerticalIcon size={'.875rem'} color={'#959595'} />)}
            </HeaderWrapper>
          </SortableDivCell>
          <DivCell header>
            <HeaderWrapper>
              Creation Date
            </HeaderWrapper>
          </DivCell>
          <SortableDivCell header isActive={blockSortColumn === 'inscriptions'}>
            <HeaderWrapper isSortable isActive={blockSortColumn === 'inscriptions'} onClick={() => handleBlockSort("inscriptions")}>
              Inscriptions {renderSortIcon("inscriptions")} {blockSortColumn != 'inscriptions' && (<ChevronVerticalIcon size={'.875rem'} color={'#959595'} />)}
            </HeaderWrapper>
          </SortableDivCell>
          <SortableDivCell header isActive={blockSortColumn === 'txs'}>
            <HeaderWrapper isSortable isActive={blockSortColumn === 'txs'} onClick={() => handleBlockSort("txs")}>
              Transactions {renderSortIcon("txs")} {blockSortColumn != 'txs' && (<ChevronVerticalIcon size={'.875rem'} color={'#959595'} />)}
            </HeaderWrapper>
          </SortableDivCell>
          <SortableDivCell header isActive={blockSortColumn === 'size'}>
            <HeaderWrapper isSortable isActive={blockSortColumn === 'size'} onClick={() => handleBlockSort("size")}>
              Size {renderSortIcon("size")} {blockSortColumn != 'size' && (<ChevronVerticalIcon size={'.875rem'} color={'#959595'} />)}
            </HeaderWrapper>
          </SortableDivCell>
          <SortableDivCell header isActive={blockSortColumn === 'volume'}>
            <HeaderWrapper isSortable isActive={blockSortColumn === 'volume'} onClick={() => handleBlockSort("volume")}>
              Traded Volume {renderSortIcon("volume")} {blockSortColumn != 'volume' && (<ChevronVerticalIcon size={'.875rem'} color={'#959595'} />)}
            </HeaderWrapper>
          </SortableDivCell>
          <SortableDivCell header isActive={blockSortColumn === 'fees'}>
            <HeaderWrapper isSortable isActive={blockSortColumn === 'fees'} onClick={() => handleBlockSort("fees")}>
              Total Fees {renderSortIcon("fees")} {blockSortColumn != 'fees' && (<ChevronVerticalIcon size={'.875rem'} color={'#959595'} />)}
            </HeaderWrapper>
          </SortableDivCell>
        </DivRow>
      </HeaderRow>

      <ScrollContainer>
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
            <DivRow key={index}>
              <DivCell first={true}>
                <DataWrapper first={true}>
                  <CollectionLink to={"/block/" + row?.block_number}>
                    <IconWrapper>
                      {row?.block_inscription_count > 0 ?
                        <InscriptionIcon endpoint={"/bun/block_icon/"+row.block_number} useBlockIconDefault={false} />
                        : 
                        <BlockIcon size={'1rem'} color={'#E34234'} />
                      }
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
            </DivRow>
          ))}
        </InfiniteScroll>
      </ScrollContainer>
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
  background-color: white;
  z-index: 10;
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
  width: 100%;
  padding: ${props => props.header ? '.375rem 0' : '.75rem 0'};
  // border-bottom: ${props => props.header ? `1px ${theme.colors.background.primary} solid` : ''};
  background-color: transparent;
  transition: all 200ms ease;

  &:hover {
    background-color: ${props => props.header ? 'transparent' : theme.colors.background.primary};
  }

  &:not(:last-child) {
    border-bottom: 1px solid #F5F5F5;
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
  font-family: relative-medium-pro;
  font-size: ${props => props.header ? '.875rem' : '.875rem'};;
  color: ${props => props.header ? theme.colors.text.secondary : '#000000'};
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
  font-family: relative-medium-pro;
  font-size: .875rem;
  color: ${props => props.isActive ? '#E34234' : '#959595'};
  &:nth-child(1) {
    justify-content: flex-start;
    padding-left: .5rem;
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
  padding: ${props => props.first ? '0.25rem 0' : '0.25rem .5rem'};
  background-color: ${props => props.isActive ? '#F5F5F5' : 'transparent'};
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
  padding-bottom: 4px;

  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 2px;
    background-color: ${theme.colors.text.tertiary};
    border-radius: 2px;
    opacity: 0;
    transition: opacity 200ms ease;
  }

  ${CollectionLink}:hover & {
    &::after {
      opacity: 1;
    }
  }
`;

const UnitText = styled.span`
  color: #C2C2C2;
  font-family: Relative Trial Medium;
`;

const ValueWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 0.25rem;
`;

const UnstyledLink = styled(Link)`
  color: unset;
  text-decoration: unset;
`;

export default BlockTable;
