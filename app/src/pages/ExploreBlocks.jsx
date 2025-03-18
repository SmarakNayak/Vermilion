import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import BlockTable from '../components/BlockTable';
import ReactGA from 'react-ga';
import theme from '../styles/theme';

const ExploreBlocks = () => {
  const [baseApi, setBaseApi] = useState(null); 
  const [selectedSortOption, setSelectedSortOption] = useState('newest');
  const [selectedFilterOptions, setSelectedFilterOptions] = useState({"Content Type": ["image"], "Satributes": [], "Charms":[]});

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

  return (
    <MainContainer>
      <RowContainer style={{justifyContent: 'flex-start'}}>
        <PageText>Blocks</PageText>
      </RowContainer>
      <Divider />
      <ExploreContainer>
        <BlockTable/>
      </ExploreContainer>
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
  transition: all 200ms ease;

  @media (max-width: 864px) {
    width: calc(100% - 2rem);
    padding: 1.5rem 1rem 2.5rem 1rem;
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
  font-family: ${theme.typography.fontFamilies.bold};
  font-size: 1.5rem;
  line-height: 2rem;
  margin: 0;
`;

const Divider = styled.div`
  width: 100%;
  border-bottom: 1px solid ${theme.colors.border};
`;

const ExploreContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  flex; 1;
  gap: 1.5rem;
`;

export default ExploreBlocks;
