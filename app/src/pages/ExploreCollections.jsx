import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
const ReactGA = require('react-ga4').default;
import CollectionsTable from '../components/CollectionsTable';
import OnChainCollectionsTable from '../components/OnChainCollectionsTable';
import { FileUploadIcon, InfoCircleIcon, LockIcon } from '../components/common/Icon';
import theme from '../styles/theme';

const ExploreCollections = () => {
  const [baseApi, setBaseApi] = useState(null); 
  const [selectedSortOption, setSelectedSortOption] = useState('newest');
  const [selectedFilterOptions, setSelectedFilterOptions] = useState({"Content Type": ["image"], "Satributes": [], "Charms":[]});
  const [activeTab, setActiveTab] = useState('Offchain');

  // record event in GA
  useEffect(() => {
    ReactGA.send({
      hitType: "pageview",
      page: location.pathname + location.search
    });
  }, [])

  //Get inscriptions endpoint
  useEffect(() => {
    let query_string = "/api/inscriptions?sort_by=" + selectedSortOption;
    if (selectedFilterOptions["Content Type"] !== undefined && selectedFilterOptions["Content Type"].length > 0) {
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

    // function to update active tab
    const handleTabClick = (tabName) => {
      setActiveTab(tabName);
    };

  return (
    <MainContainer>
      <LinkContainer>
        <PageText>Collections</PageText>
        <VerticalDivider />
        <ButtonContainer>
          <TabButton 
            onClick={() => handleTabClick('Offchain')}
            isActive={activeTab === 'Offchain'}
          >
            <FileUploadIcon size={'1.25rem'} />
            Offchain
          </TabButton>
          <TabButton 
            onClick={() => handleTabClick('Onchain')}
            isActive={activeTab === 'Onchain'}
          >
            <LockIcon size={'1.25rem'} />
            Onchain
          </TabButton>
        </ButtonContainer>
      </LinkContainer>
      {/* <RowContainer style={{justifyContent: 'space-between'}}>
        <PageText>Collections</PageText>
        <ButtonContainer>
          <TabButton 
            onClick={() => handleTabClick('Offchain')}
            isActive={activeTab === 'Offchain'}
          >
            <FileUploadIcon size={'1.25rem'} color={activeTab === 'Offchain' ? theme.colors.background.verm : theme.colors.text.tertiary} />
            Offchain
          </TabButton>
          <TabButton 
            onClick={() => handleTabClick('Onchain')}
            isActive={activeTab === 'Onchain'}
          >
            <LockIcon size={'1.25rem'} color={activeTab === 'Onchain' ? theme.colors.background.verm : theme.colors.text.tertiary} />
            Onchain
          </TabButton>
        </ButtonContainer>
      </RowContainer> */}
      <Divider />
      {activeTab === 'Offchain' && (
        <ExploreContainer>
          <NoteContainer>
            <IconWrapper>
              <InfoCircleIcon size={'1.25rem'} color={theme.colors.text.secondary} />
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
              <InfoCircleIcon size={'1.25rem'} color={theme.colors.text.secondary} />
            </IconWrapper>            
            <NoteText>
              Collections that use parent-child provenance, the standard way to immutably record a collection on Bitcoin. Collections are considered separate if not all parents are the same.
            </NoteText>
          </NoteContainer>
          <OnChainCollectionsTable />
        </ExploreContainer>
      )}
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

const LinkContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  width: 100%;
  gap: .75rem;
`;

const VerticalDivider = styled.div`
  height: 2rem;
  border-right: 1px solid ${theme.colors.border};
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

const ButtonContainer = styled.div`
  display: flex;
  flex-direction: row;
  gap: .25rem;
`;

const TabButton = styled.button`
  border: none;
  padding: 0 .75rem;
  height: 2rem;
  border-radius: 1rem;
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: .25rem;
  cursor: pointer;
  font-family: ${theme.typography.fontFamilies.medium};
  font-size: 1rem;
  line-height: 1.25rem;
  color: ${props => props.isActive ? theme.colors.background.verm : theme.colors.text.tertiary}; 
  background-color: ${props => props.isActive ? theme.colors.background.primary : theme.colors.background.white}; 
  transition: all 200ms ease;
  transform-origin: center center;
  text-decoration: none;

  &:hover {
    color: ${theme.colors.background.verm};
    background-color: ${theme.colors.background.primary};

    svg {
      fill: ${theme.colors.background.verm};
    }
  }

  &:active {
    transform: scale(0.96);
  }

  svg {
    fill: ${props => props.isActive ? theme.colors.background.verm : theme.colors.text.tertiary};
    transition: fill 200ms ease;
  }

  @media (max-width: 416px) {
    svg {
      display: none; /* Hides the icons when the screen width is less than 416px */
    }
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
  width: 1.25rem; 
  height: 1.25rem;
`;

const NoteText = styled.p`
  font-family: ${theme.typography.fontFamilies.medium};
  font-size: .875rem;
  line-height: 1.25rem;
  color: ${theme.colors.text.secondary};
  margin: 0;
  padding: 0;
  flex: 1;
`;

export default ExploreCollections;
