import React, { useState, useEffect } from 'react';
import { useParams, Link } from "react-router-dom";
import styled from 'styled-components';
import Gallery from '../components/Gallery';
import GalleryInfiniteScroll from '../components/GalleryInfiniteScroll';
import TopSection from '../components/TopSection';
import Stack from '../components/Stack';
import EyeIcon from '../assets/icons/EyeIcon';
import BlockIcon from '../assets/icons/BlockIcon';
import { addCommas } from '../helpers/utils';
import FilterIcon from '../assets/icons/FilterIcon';
import ChevronDownIcon from '../assets/icons/ChevronDownIcon';
import Stat from '../components/Stat';
import BlockRow from '../components/BlockRow';
import SortbyDropdown from '../components/Dropdown';
import FilterMenu from '../components/FilterMenu';

const Explore = () => {
  const [baseApi, setBaseApi] = useState(null); 
  const [numberVisibility, setNumberVisibility] = useState(true);
  const [filterVisibility, setFilterVisibility] = useState(false);
  const [activeTab, setActiveTab] = useState('Inscriptions');
  const [selectedSortOption, setSelectedSortOption] = useState('newest');
  const [selectedFilterOptions, setSelectedFilterOptions] = useState({"Content Type": ["image"], "Satributes": [], "Charms":[]});

  //1. Get inscription list
  useEffect(() => {
    let query_string = "/api/inscriptions?sort_by=" + selectedSortOption
    if (selectedFilterOptions["Content Type"] !== undefined && selectedFilterOptions["Content Type"].length > 0) {
      console.log("hit");
      query_string += "&content_types=" + selectedFilterOptions["Content Type"].toString();
    }
    if (selectedFilterOptions["Satributes"] !== undefined && selectedFilterOptions["Satributes"].length > 0) {
      query_string += "&satributes=" + selectedFilterOptions["Satributes"].toString();
    }
    if (selectedFilterOptions["Charms"] !== undefined && selectedFilterOptions["Charms"].length > 0) {
      query_string += "&charms=" + selectedFilterOptions["Charms"].toString();
    }
    setBaseApi(query_string);
  },[selectedSortOption, selectedFilterOptions]);

  // function to toggle visibility of inscription numbers
  const toggleNumberVisibility = () => {
    setNumberVisibility(!numberVisibility);
  };

  const toggleFilterVisibility = () => {
    setFilterVisibility(!filterVisibility);
  };

  // function to update active tab
  const handleTabClick = (tabName) => {
    setActiveTab(tabName);
  };
  
  const handleSortOptionChange = (option) => {
    setSelectedSortOption(option);
    // Perform any necessary actions with the selected option
    console.log('Selected sort option:', option);
  };

  const handleFilterOptionsChange = (filterOptions) => {
    setSelectedFilterOptions(filterOptions);
    console.log('Selected filter option:', filterOptions);
  };

  // Example data for the table
  const blockData = [
    { block: '833,440', inscriptions: '2,095', creationDate: 'Jan 20, 2024', size: '1.64 MB', feeSpan: '30 to 646 sat/vB', medianFee: '~37 sat/vB', totalFees: '0.525 BTC' },
    { block: '833,440', inscriptions: '2,095', creationDate: 'Jan 20, 2024', size: '1.64 MB', feeSpan: '30 to 646 sat/vB', medianFee: '~37 sat/vB', totalFees: '0.525 BTC' },
    { block: '833,440', inscriptions: '2,095', creationDate: 'Jan 20, 2024', size: '1.64 MB', feeSpan: '30 to 646 sat/vB', medianFee: '~37 sat/vB', totalFees: '0.525 BTC' },
    { block: '833,440', inscriptions: '2,095', creationDate: 'Jan 20, 2024', size: '1.64 MB', feeSpan: '30 to 646 sat/vB', medianFee: '~37 sat/vB', totalFees: '0.525 BTC' },
    { block: '833,440', inscriptions: '2,095', creationDate: 'Jan 20, 2024', size: '1.64 MB', feeSpan: '30 to 646 sat/vB', medianFee: '~37 sat/vB', totalFees: '0.525 BTC' },
    { block: '833,440', inscriptions: '2,095', creationDate: 'Jan 20, 2024', size: '1.64 MB', feeSpan: '30 to 646 sat/vB', medianFee: '~37 sat/vB', totalFees: '0.525 BTC' },
    { block: '833,440', inscriptions: '2,095', creationDate: 'Jan 20, 2024', size: '1.64 MB', feeSpan: '30 to 646 sat/vB', medianFee: '~37 sat/vB', totalFees: '0.525 BTC' },
    { block: '833,440', inscriptions: '2,095', creationDate: 'Jan 20, 2024', size: '1.64 MB', feeSpan: '30 to 646 sat/vB', medianFee: '~37 sat/vB', totalFees: '0.525 BTC' },
    { block: '833,440', inscriptions: '2,095', creationDate: 'Jan 20, 2024', size: '1.64 MB', feeSpan: '30 to 646 sat/vB', medianFee: '~37 sat/vB', totalFees: '0.525 BTC' },
    { block: '833,440', inscriptions: '2,095', creationDate: 'Jan 20, 2024', size: '1.64 MB', feeSpan: '30 to 646 sat/vB', medianFee: '~37 sat/vB', totalFees: '0.525 BTC' },
    { block: '833,440', inscriptions: '2,095', creationDate: 'Jan 20, 2024', size: '1.64 MB', feeSpan: '30 to 646 sat/vB', medianFee: '~37 sat/vB', totalFees: '0.525 BTC' },
    { block: '833,440', inscriptions: '2,095', creationDate: 'Jan 20, 2024', size: '1.64 MB', feeSpan: '30 to 646 sat/vB', medianFee: '~37 sat/vB', totalFees: '0.525 BTC' },
    // Add more rows as needed
  ];

  // Example data for the table
  const collectionData = [
    { collection: 'Bitcoin Puppets', range: '89,945 to 11,523,702', date: 'Jan 20, 2024', supply: '10,001', owners: '5,988 (59.9%)', totalFees: '0.525 BTC', footprint: '5.675 BTC' },
    { collection: 'Bitcoin Puppets', range: '89,945 to 11,523,702', date: 'Jan 20, 2024', supply: '10,001', owners: '5,988 (59.9%)', totalFees: '0.525 BTC', footprint: '5.675 BTC' },
    { collection: 'Bitcoin Puppets', range: '89,945 to 11,523,702', date: 'Jan 20, 2024', supply: '10,001', owners: '5,988 (59.9%)', totalFees: '0.525 BTC', footprint: '5.675 BTC' },
    { collection: 'Bitcoin Puppets', range: '89,945 to 11,523,702', date: 'Jan 20, 2024', supply: '10,001', owners: '5,988 (59.9%)', totalFees: '0.525 BTC', footprint: '5.675 BTC' },
    { collection: 'Bitcoin Puppets', range: '89,945 to 11,523,702', date: 'Jan 20, 2024', supply: '10,001', owners: '5,988 (59.9%)', totalFees: '0.525 BTC', footprint: '5.675 BTC' },
    { collection: 'Bitcoin Puppets', range: '89,945 to 11,523,702', date: 'Jan 20, 2024', supply: '10,001', owners: '5,988 (59.9%)', totalFees: '0.525 BTC', footprint: '5.675 BTC' },
    { collection: 'Bitcoin Puppets', range: '89,945 to 11,523,702', date: 'Jan 20, 2024', supply: '10,001', owners: '5,988 (59.9%)', totalFees: '0.525 BTC', footprint: '5.675 BTC' },
    { collection: 'Bitcoin Puppets', range: '89,945 to 11,523,702', date: 'Jan 20, 2024', supply: '10,001', owners: '5,988 (59.9%)', totalFees: '0.525 BTC', footprint: '5.675 BTC' },
    { collection: 'Bitcoin Puppets', range: '89,945 to 11,523,702', date: 'Jan 20, 2024', supply: '10,001', owners: '5,988 (59.9%)', totalFees: '0.525 BTC', footprint: '5.675 BTC' },
    // Add more rows as needed
  ];

  return (
    <PageContainer>
      <TopSection />
      <MainContainer>
        {/* Stack placed within main container to allow for filter section */}
        <Stack horizontal={false} center={false} style={{gap: '1.5rem'}}>
          <RowContainer style={{justifyContent: 'flex-start'}}>
            <PageText>Explore</PageText>
          </RowContainer>
          <SectionContainer>
            {/* Update onClick to change active tab */}
            <TabButton 
              onClick={() => handleTabClick('Inscriptions')}
              isActive={activeTab === 'Inscriptions'}
              >
              Inscriptions
            </TabButton>
            <TabButton 
              onClick={() => handleTabClick('Blocks')}
              isActive={activeTab === 'Blocks'}
              >
              Blocks
            </TabButton>
            <TabButton 
              onClick={() => handleTabClick('Collections')}
              isActive={activeTab === 'Collections'}
              >
              Collections
            </TabButton>
          </SectionContainer>
            {/* 3. Conditional Rendering */}
            {activeTab === 'Inscriptions' && (
              <Stack horizontal={false} center={false} style={{gap: '1.5rem', width: '100%'}}>
                <RowContainer>
                  <FilterButton onClick={toggleFilterVisibility}>
                    Filter
                    <FilterIcon svgSize={'1rem'} svgColor={'#000000'}></FilterIcon>
                  </FilterButton>
                  <Stack horizontal={true} center={false} style={{gap: '1rem'}}>
                    {/* <FilterButton>
                      <FilterIcon svgSize={'1rem'} svgColor={'#000000'}></FilterIcon>  
                      Filters
                    </FilterButton> */}
                    <VisibilityButton onClick={toggleNumberVisibility}>
                      <EyeIcon svgSize={'1rem'} svgColor={numberVisibility ? '#000000' : '#959595'}></EyeIcon>
                    </VisibilityButton>
                  </Stack>
                  {/* <FilterButton>
                    Newest
                    <ChevronDownIcon svgSize={'1rem'} svgColor={'#000000'}></ChevronDownIcon>
                  </FilterButton> */}
                  <SortbyDropdown onOptionSelect={handleSortOptionChange} />
                </RowContainer>
                <RowContainer>
                  <FilterMenu isOpen={filterVisibility} onSelectionChange ={handleFilterOptionsChange}></FilterMenu>
                  <GalleryInfiniteScroll baseApi={baseApi} numberVisibility={numberVisibility} />
                </RowContainer>
              </Stack>
            )}
            {activeTab === 'Blocks' && (
              <ExploreContainer>
                <RowContainer>
                  <Stack horizontal={true} center={false} style={{gap: '1rem'}}>
                    <FilterButton>
                      <FilterIcon svgSize={'1rem'} svgColor={'#000000'}></FilterIcon>  
                      Filters
                    </FilterButton>
                    <VisibilityButton onClick={toggleNumberVisibility}>
                      <EyeIcon svgSize={'1rem'} svgColor={numberVisibility ? '#000000' : '#959595'}></EyeIcon>
                    </VisibilityButton>
                  </Stack>
                  <FilterButton>
                    Newest
                    <ChevronDownIcon svgSize={'1rem'} svgColor={'#000000'}></ChevronDownIcon>
                  </FilterButton>
                </RowContainer>
                <DivTable>
                  <DivRow header>
                    <DivCell header>Block</DivCell>
                    <DivCell header>Inscriptions</DivCell>
                    <DivCell header>Creation Date</DivCell>
                    <DivCell header>Size</DivCell>
                    <DivCell header>Fee Span</DivCell>
                    <DivCell header>Median Fee</DivCell>
                    <DivCell header>Total Fees</DivCell>
                  </DivRow>
                  {blockData.map((row, index) => (
                    <DivRow key={index}>
                      <DivCell>
                        <BlockImgContainer>
                          <BlockIcon svgSize={'2rem'} svgColor={'#E34234'}></BlockIcon>
                        </BlockImgContainer>
                        {row.block}
                      </DivCell>
                      <DivCell>{row.inscriptions}</DivCell>
                      <DivCell>{row.creationDate}</DivCell>
                      <DivCell>{row.size}</DivCell>
                      <DivCell>{row.feeSpan}</DivCell>
                      <DivCell>{row.medianFee}</DivCell>
                      <DivCell>{row.totalFees}</DivCell>
                    </DivRow>
                  ))}
                </DivTable>
              </ExploreContainer>
            )}
            {activeTab === 'Collections' && (
              <ExploreContainer>
                <RowContainer>
                  <Stack horizontal={true} center={false} style={{gap: '1rem'}}>
                    <FilterButton>
                      <FilterIcon svgSize={'1rem'} svgColor={'#000000'}></FilterIcon>  
                      Filters
                    </FilterButton>
                    <VisibilityButton onClick={toggleNumberVisibility}>
                      <EyeIcon svgSize={'1rem'} svgColor={numberVisibility ? '#000000' : '#959595'}></EyeIcon>
                    </VisibilityButton>
                  </Stack>
                  <FilterButton>
                    Newest
                    <ChevronDownIcon svgSize={'1rem'} svgColor={'#000000'}></ChevronDownIcon>
                  </FilterButton>
                </RowContainer>
                <DivTable>
                  <DivRow header>
                    <DivCell header>Collection</DivCell>
                    <DivCell header>Range</DivCell>
                    <DivCell header>Creation Date</DivCell>
                    <DivCell header>Supply</DivCell>
                    <DivCell header>Owners</DivCell>
                    <DivCell header>Creation Fee</DivCell>
                    <DivCell header>On Chain Footprint</DivCell>
                  </DivRow>
                  {collectionData.map((row, index) => (
                    <DivRow key={index}>
                      <DivCell>
                        <BlockImgContainer>
                          <BlockIcon svgSize={'2rem'} svgColor={'#E34234'}></BlockIcon>
                        </BlockImgContainer>
                        {row.collection}
                      </DivCell>
                      <DivCell>{row.range}</DivCell>
                      <DivCell>{row.date}</DivCell>
                      <DivCell>{row.supply}</DivCell>
                      <DivCell>{row.owners}</DivCell>
                      <DivCell>{row.totalFees}</DivCell>
                      <DivCell>{row.footprint}</DivCell>
                    </DivRow>
                  ))}
                </DivTable>
              </ExploreContainer>
            )}
        </Stack>
      </MainContainer>
    </PageContainer>
    
  )
}
  
const PageContainer = styled.div`
  width: 100%;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  // flex: 1;
  align-items: start;
  // justify-content: center;
  margin: 0;

  @media (max-width: 768px) {
    
  }
`;

const MainContainer = styled.div`
  width: calc(100% - 3rem);
  padding: .5rem 1.5rem 2.5rem 1.5rem;
  margin: 0;
  display: flex;
  flex-direction: row;
  align-items: flex-start;

  @media (max-width: 630px) {
    width: calc(100% - 3rem);
    padding: 1rem 1.5rem 2.5rem 1.5rem;
  }
`;

const RowContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  justify-content: center;
  width: 100%;
`;

const PageText = styled.p`
    font-family: ABC Camera Plain Unlicensed Trial Medium;
    font-size: 1.25rem;
    margin: 0;
`;

const BlockImgContainer = styled.div`
  width: 3.75rem;
  height: 3.75rem;
  background-color: #F5F5F5;
  border-radius: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const BlockText = styled.p`
  font-family: ABC Camera Plain Unlicensed Trial Medium;
  font-size: 1.5rem;
  margin: 0;
`;

const Container = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
`;

const StatusWrapper = styled.div`
  display: flex;
  padding: .5rem 1rem;
  border-radius: .5rem;
  background-color: #EBFCF4;
`;

const StatusText = styled.p`
  font-family: ABC Camera Plain Unlicensed Trial Medium;
  font-size: .875rem;
  color: #009859;
  margin: 0;
`;

const StatsText = styled.p`
  font-size: .875rem;
  margin: 0;
`;

const SectionContainer = styled.div`
  display: flex;
  flex-direction: row;
  flex: 1;
  gap: 1rem;
  width: 100%;
  padding-bottom: 1rem;
  border-bottom: 1px #E9E9E9 solid;
`;

const ShareButton = styled.button`
  height: 36px;
  border-radius: .5rem;
  border: none;
  padding: .5rem 1rem;
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-family: 'ABC Camera Plain Unlicensed Trial Medium';
  font-size: .875rem;
  color: #FFFFFF;
  background-color: #000000;
`;

const TabButton = styled.button`
  border-radius: .5rem;
  border: none;
  padding: .5rem 1rem;
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  gap: .5rem;
  font-family: 'ABC Camera Plain Unlicensed Trial Medium';
  font-size: .875rem;
  color: ${props => props.isActive ? '#E34234' : '#959595'}; // Change text color based on isActive
  background-color: ${props => props.isActive ? '#F9E8E7' : '#FFFFFF'}; // Change background based on isActive
  transition: 
    background-color 350ms ease,
    transform 150ms ease;
  transform-origin: center center;

  &:hover {
    background-color: ${props => props.isActive ? '#F9E8E7' : '#F5F5F5'};
  }

  &:active {
    transform: scale(0.96);
  }
`;

const VisibilityButton = styled.button`
  height: 40px;
  width: 40px;
  border-radius: .5rem;
  border: none;
  padding: .5rem;
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-family: 'ABC Camera Plain Unlicensed Trial Medium';
  font-size: .875rem;
  color: #959595;
  background-color: #F5F5F5;
  transition: 
    background-color 350ms ease,
    transform 150ms ease;
  transform-origin: center center;

  &:hover {
    background-color: #E9E9E9;
  }

  &:active {
    transform: scale(0.96);
  }
`;

const FilterButton = styled.button`
  height: 40px;
  border-radius: .5rem;
  border: none;
  padding: .5rem 1rem;
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  gap: .5rem;
  font-family: 'ABC Camera Plain Unlicensed Trial Medium';
  font-size: .875rem;
  color: #000000;
  background-color: #F5F5F5;
  transition: 
    background-color 350ms ease,
    transform 150ms ease;
  transform-origin: center center;

  &:hover {
    background-color: #E9E9E9;
  }

  &:active {
    transform: scale(0.96);
  }
`;

const ExploreContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  flex; 1;
  gap: 1.5rem;
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

export default Explore;