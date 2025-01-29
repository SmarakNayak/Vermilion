import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import ReactGA from 'react-ga';
import CollectionsTable from '../components/CollectionsTable';
import OnChainCollectionsTable from '../components/OnChainCollectionsTable';
import { InfoCircleIcon } from '../components/common/Icon';

const ExploreCollections = () => {
  const [baseApi, setBaseApi] = useState(null); 
  const [numberVisibility, setNumberVisibility] = useState(true);
  const [filterVisibility, setFilterVisibility] = useState(false);
  const [selectedSortOption, setSelectedSortOption] = useState('newest');
  const [selectedFilterOptions, setSelectedFilterOptions] = useState({"Content Type": ["image"], "Satributes": [], "Charms":[]});
  const [activeTab, setActiveTab] = useState('Offchain');

  // record event in GA
  useEffect(() => {
    ReactGA.pageview(window.location.pathname)
  }, [])

  //Get inscriptions endpoint
  useEffect(() => {
    let query_string = "/api/inscriptions?sort_by=" + selectedSortOption;
    if (selectedFilterOptions["Content Type"] !== undefined && selectedFilterOptions["Content Type"].length > 0) {
      // console.log("hit");
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

  //Get collections endpoint


  // function to toggle visibility of inscription numbers
  const toggleNumberVisibility = () => {
    setNumberVisibility(!numberVisibility);
  };

  const toggleFilterVisibility = () => {
    setFilterVisibility(!filterVisibility);
  };
  
  //inscription handlers
  const handleSortOptionChange = (option) => {
    setSelectedSortOption(option);
    // Perform any necessary actions with the selected option
    // console.log('Selected inscription sort option:', option);
  };

  const handleFilterOptionsChange = (filterOptions) => {
    setSelectedFilterOptions(filterOptions);
    // console.log('Selected filter option:', filterOptions);
  };

    // function to update active tab
    const handleTabClick = (tabName) => {
      setActiveTab(tabName);
    };

  return (
    <MainContainer>
      <RowContainer style={{justifyContent: 'flex-start'}}>
        <PageText>Collections</PageText>
      </RowContainer>
      <Divider />
      <RowContainer style={{justifyContent: 'flex-start'}}>
        <ButtonContainer>
          <TabButton 
            onClick={() => handleTabClick('Offchain')}
            isActive={activeTab === 'Offchain'}
            >
            Offchain
          </TabButton>
          <TabButton 
            onClick={() => handleTabClick('Onchain')}
            isActive={activeTab === 'Onchain'}
            >
            Onchain
          </TabButton>
        </ButtonContainer>
      </RowContainer>
      {activeTab === 'Offchain' && (
        <ExploreContainer>
          <NoteContainer>
            <IconWrapper>
              <InfoCircleIcon svgSize={'1rem'} svgColor={'#959595'} />
            </IconWrapper>
            <NoteText>
              Collections that use JSON-based provenance, which is centrally controlled and offchain. This table includes both offchain collections and onchain collections as listed on marketplaces.
            </NoteText>
          </NoteContainer>
          <CollectionsTable/>
        </ExploreContainer>
      )}
      {activeTab === 'Onchain' && (
        <ExploreContainer>
          <NoteContainer>
            <IconWrapper>
              <InfoCircleIcon svgSize={'1rem'} svgColor={'#959595'} />
            </IconWrapper>            <NoteText>
            Collections that use parent-child provenance, the standard way to immutably record a collection on Bitcoin. Collections are considered separate if not all parents are the same.
            </NoteText>
          </NoteContainer>
          <OnChainCollectionsTable />
        </ExploreContainer>
      )}
      {/* <ExploreContainer>
        <CollectionsTable/>
      </ExploreContainer> */}
    </MainContainer>    
  )
}

const MainContainer = styled.div`
  width: calc(100% - 6rem);
  padding: 1.5rem 3rem 2.5rem 3rem;
  margin: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;

  @media (max-width: 864px) {
    width: calc(100% - 3rem);
    padding: 1.5rem 1.5rem 2.5rem 1.5rem;
  }
`;

const RowContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  justify-content: center;
  width: 100%;
`;

const GalleryContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const PageText = styled.p`
  font-family: Relative Trial Bold;
  font-size: 1.5rem;
  margin: 0;
`;

const SectionContainer = styled.div`
  display: flex;
  flex-direction: row;
  flex: 1;
  gap: 1rem;
  width: 100%;
  padding-bottom: 1.5rem;
  border-bottom: 1px #E9E9E9 solid;
  // overflow: scroll;
`;

const Divider = styled.div`
  width: 100%;
  border-bottom: 1px solid #E9E9E9;
`;

const ButtonContainer = styled.div`
  display: flex;
  flex-direction: row;
  gap: 1.5rem;
`;

const TabButton = styled.button`
  border: none;
  border-bottom: ${props => props.isActive ? '2px solid #E34234' : '2px solid transparent'};
  padding: .75rem .25rem;
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  gap: .5rem;
  font-family: Relative Trial Bold;
  font-size: 1rem;
  color: ${props => props.isActive ? '#E34234' : '#959595'}; 
  background-color: transparent; 
  transition: 
    background-color 350ms ease,
    transform 150ms ease;
  transform-origin: center center;

  &:hover {
    color: ${props => props.isActive ? '#E34234' : '#E34234'};
  }
`;

const ExploreContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  flex; 1;
  gap: 1.5rem;
`;

const NoteContainer = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
  // flex: 1;
  gap: .5rem;
  align-items: flex-start;
`;

const IconWrapper = styled.div`
  flex-shrink: 0; 
  width: 16px; 
  height: 16px;
  margin-top: 1px;
`;

const NoteText = styled.p`
  font-family: Relative Trial Medium;
  font-size: .875rem;
  color: #959595;
  margin: 0;
  padding: 0;
  flex: 1;
`;

export default ExploreCollections;
