import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import InfiniteScroll from 'react-infinite-scroll-component';
import { renderToStaticMarkup } from 'react-dom/server';
import { ArrowDownIcon, ArrowUpIcon, ChevronVerticalIcon, ImageIcon } from './common/Icon';
import { addCommas, formatSats, shortenDate, shortenRange } from '../utils/format';
import { Link } from 'react-router-dom';
import InscriptionIcon from './InscriptionIcon';
import Spinner from './Spinner';
import theme from '../styles/theme';

const OnChainCollectionsTable = () => {
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

  // https://vermilion.place/api/on_chain_collections?sort_by=most_volume&page_number=0

  const fetchInitial = async () => {
    let query_string = "/api/on_chain_collections?sort_by=" + selectedCollectionSortOption + "&page_size=" + pageSize + "&page_number=0";
    // console.log(query_string); // Query string for debugging - not visible in console
    const response = await fetch(query_string);
    const newBlocks = await response.json();

    setCollectionData(newBlocks);
    setHasMore(newBlocks?.length > 0);
    setNextPageNo(1);
  }

  const fetchData = async () => {
    let query_string = "/api/on_chain_collections?sort_by=" + selectedCollectionSortOption + "&page_size=" + pageSize + "&page_number=" + nextPageNo;
    // console.log(query_string); // Query string for debugging - not visible in console
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
  };

  //Update block option
  useEffect(() => {
    // "biggest_on_chain_footprint", "smallest_on_chain_footprint",
    // "most_volume", "least_volume",
    // "biggest_file_size", "smallest_file_size",
    // "biggest_creation_fee", "smallest_creation_fee",
    // "earliest_first_inscribed_date", "latest_first_inscribed_date",
    // "earliest_last_inscribed_date", "latest_last_inscribed_date",
    // "biggest_supply", "smallest_supply",
    if (collectionSortColumn === "firstDate" && collectionSortDescending) {
      setSelectedCollectionSortOption("latest_first_inscribed_date");
    } else if (collectionSortColumn === "firstDate" && !collectionSortDescending) {
      setSelectedCollectionSortOption("earliest_first_inscribed_date");
    } else if (collectionSortColumn === "lastDate" && collectionSortDescending) {
      setSelectedCollectionSortOption("latest_last_inscribed_date");
    } else if (collectionSortColumn === "lastDate" && !collectionSortDescending) {
      setSelectedCollectionSortOption("earliest_last_inscribed_date");
    } else if (collectionSortColumn === "volume" && collectionSortDescending) {
      setSelectedCollectionSortOption("most_volume");
    } else if (collectionSortColumn === "volume" && !collectionSortDescending) {
      setSelectedCollectionSortOption("least_volume");
    } else if (collectionSortColumn === "fees" && collectionSortDescending) {
      setSelectedCollectionSortOption("biggest_creation_fee");
    } else if (collectionSortColumn === "fees" && !collectionSortDescending) {
      setSelectedCollectionSortOption("smallest_creation_fee");
    } else if (collectionSortColumn === "supply" && collectionSortDescending) {
      setSelectedCollectionSortOption("biggest_supply");
    } else if (collectionSortColumn === "supply" && !collectionSortDescending) {
      setSelectedCollectionSortOption("smallest_supply");
    }
  },[collectionSortColumn, collectionSortDescending])

  const renderSortIcon = (column) => {
    if (collectionSortColumn === column) {
      return collectionSortDescending ? <ArrowDownIcon size={'.875rem'} color={theme.colors.background.verm}></ArrowDownIcon> : <ArrowUpIcon size={'.875rem'} color={theme.colors.background.verm}></ArrowUpIcon>;
    }
    return null;
  };

  const BlockIconDefault = encodeURIComponent(
    renderToStaticMarkup(<ImageIcon size={'2rem'} color={theme.colors.background.verm} />)
  );

  const handleImageError = (event) => {
    event.target.onError = null;
    event.target.src = `data:image/svg+xml,${BlockIconDefault}`;
    //have to override default size of CollectionIcon
    event.target.style.width = "2rem"
    event.target.style.height = "2rem"
  };

  const formatParents = (parents) => {
    if (!parents) return '';
    return Array.isArray(parents) ? parents.join(',') : parents;
  };

  return (
    
    <TableContainer>
      <HeaderRow>
        <DivRow header>
          <IndexCell header first={true}>
            <HeaderWrapper first={true}>
              #
            </HeaderWrapper>
          </IndexCell>
          <DivCell header first={true}>
            <HeaderWrapper first={true}>
              Collection Parent(s)
            </HeaderWrapper>
          </DivCell>
          <DivCell header>
            <HeaderWrapper>
              Range
            </HeaderWrapper>
          </DivCell>
          <SortableDivCell header isActive={collectionSortColumn === 'firstDate'}>
            <HeaderWrapper isSortable isActive={collectionSortColumn === 'firstDate'} onClick={() => handleCollectionSort("firstDate")}>
              First Inscribed {renderSortIcon("firstDate")} {collectionSortColumn != 'firstDate' && (<ChevronVerticalIcon size={'.875rem'} color={theme.colors.text.secondary} />)}
            </HeaderWrapper>
          </SortableDivCell>
          <SortableDivCell header isActive={collectionSortColumn === 'lastDate'}>
            <HeaderWrapper isSortable isActive={collectionSortColumn === 'lastDate'} onClick={() => handleCollectionSort("lastDate")}>
              Last Inscribed {renderSortIcon("lastDate")} {collectionSortColumn != 'lastDate' && (<ChevronVerticalIcon size={'.875rem'} color={theme.colors.text.secondary} />)}
            </HeaderWrapper>
          </SortableDivCell>
          <SortableDivCell header isActive={collectionSortColumn === 'supply'}>
            <HeaderWrapper isSortable isActive={collectionSortColumn === 'supply'} onClick={() => handleCollectionSort("supply")}>
              Supply {renderSortIcon("supply")} {collectionSortColumn != 'supply' && (<ChevronVerticalIcon size={'.875rem'} color={theme.colors.text.secondary} />)}
            </HeaderWrapper>
          </SortableDivCell>
          <SortableDivCell header isActive={collectionSortColumn === 'fees'}>
            <HeaderWrapper isSortable isActive={collectionSortColumn === 'fees'} onClick={() => handleCollectionSort("fees")}>
              Total Fees {renderSortIcon("fees")} {collectionSortColumn != 'fees' && (<ChevronVerticalIcon size={'.875rem'} color={theme.colors.text.secondary} />)}
            </HeaderWrapper>
          </SortableDivCell>
          <SortableDivCell header isActive={collectionSortColumn === 'volume'}>
            <HeaderWrapper isSortable isActive={collectionSortColumn === 'volume'} onClick={() => handleCollectionSort("volume")}>
              Traded Volume {renderSortIcon("volume")} {collectionSortColumn != 'volume' && (<ChevronVerticalIcon size={'.875rem'} color={theme.colors.text.secondary} />)}
            </HeaderWrapper>
          </SortableDivCell>
        </DivRow>
      </HeaderRow>

      {/* <ScrollContainer> */}
      <InfiniteScroll
        dataLength={collectionData?.length}
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
        {collectionData.map((row, index) => (
          <DivRow key={index}>
            <IndexCell>
              <DataWrapper first={true}>
                {index + 1}
              </DataWrapper>
            </IndexCell>
            <DivCell first={true}>
              <DataWrapper first={true}>
                <CollectionLink to={"/onchain_collection/" + formatParents(row?.parents)}>
                  <IconWrapper>
                    {row?.range_start && <InscriptionIcon endpoint={"/bun/rendered_content_number/" + row.parent_numbers[0]} useBlockIconDefault={false} size={'2.25rem'} /> }
                    <IconOverlay />
                  </IconWrapper>
                  <CollectionName>
                    {row?.parent_numbers ? (
                      Array.isArray(row.parent_numbers) 
                        ? row.parent_numbers.map(num => addCommas(num)).join(' • ') 
                        : addCommas(row.parent_numbers)
                    ) : ''}
                  </CollectionName>
                </CollectionLink>
              </DataWrapper>
            </DivCell>
            <DivCell>
              <DataWrapper>
                {row?.range_start ? shortenRange(row?.range_start) + " to " + shortenRange(row?.range_end) : ""}
              </DataWrapper>
            </DivCell>
            <DivCell>
              <DataWrapper>
                {row?.first_inscribed_date ? shortenDate(row.first_inscribed_date) : ""}
              </DataWrapper>
            </DivCell>
            <DivCell>
              <DataWrapper>
                {row?.last_inscribed_date ? shortenDate(row.last_inscribed_date) : ""}
              </DataWrapper>
            </DivCell>
            <DivCell>
              <DataWrapper>
                {addCommas(row?.supply)}
              </DataWrapper>
            </DivCell>
            <DivCell>
              <DataWrapper>
                {row?.total_inscription_fees ? (
                  <ValueWrapper>
                    <span>{formatSats(row?.total_inscription_fees).value}</span>
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
                {row?.total_volume ? (
                  <ValueWrapper>
                    <span>{formatSats(row?.total_volume).value}</span>
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

const CollectionIcon = styled.img`
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

  &:nth-child(2) {
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

  // Hide "First Inscribed" column on screens smaller than 1200px
  @media (max-width: 1200px) {
    &:nth-child(4) {
      display: none;
    }
  }

  // Hide "Total Fees" column on screens smaller than 1200px
  @media (max-width: 1200px) {
    &:nth-child(7) {
      display: none;
    }
  }

  // Hide "Last Inscribed" column on screens smaller than 1000px
  @media (max-width: 1000px) {
    &:nth-child(5) {
      display: none;
    }
  }

  // Hide "Range" column on screens smaller than 800px
  @media (max-width: 800px) {
    &:nth-child(3) {
      display: none;
    }
  }

  // Hide "Traded Volume" column on screens smaller than 630px
  @media (max-width: 630px) {
    &:nth-child(8) {
      display: none;
    }
  }

  // Hide "Supply" column on screens smaller than 400px
  @media (max-width: 400px) {
    &:nth-child(6) {
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
    flex: 2;
  }

  // Hide "First Inscribed" column on screens smaller than 1200px
  @media (max-width: 1200px) {
    &:nth-child(4) {
      display: none;
    }
  }

  // Hide "Total Fees" column on screens smaller than 1200px
  @media (max-width: 1200px) {
    &:nth-child(7) {
      display: none;
    }
  }

  // Hide "Last Inscribed" column on screens smaller than 1000px
  @media (max-width: 1000px) {
    &:nth-child(5) {
      display: none;
    }
  }

  // Hide "Range" column on screens smaller than 800px
  @media (max-width: 800px) {
    &:nth-child(3) {
      display: none;
    }
  }

  // Hide "Traded Volume" column on screens smaller than 630px
  @media (max-width: 630px) {
    &:nth-child(8) {
      display: none;
    }
  }

  // Hide "Supply" column on screens smaller than 400px
  @media (max-width: 400px) {
    &:nth-child(6) {
      display: none;
    }
  }
`;

const IndexCell = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;
  width: calc(.5rem + 1.5rem);
  padding-left: .5rem;
  margin: 0;
  font-family: ${theme.typography.fontFamilies.medium};
  font-size: ${props => props.header ? '.875rem' : '.875rem'};
  color: ${props => props.header ? theme.colors.text.secondary : theme.colors.text.primary};
  flex-shrink: 0;
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
  color: ${theme.colors.text.tertiary};
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

export default OnChainCollectionsTable;
