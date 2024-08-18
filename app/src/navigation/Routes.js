import React from 'react';
import { BrowserRouter, Route, Routes, useParams } from 'react-router-dom';
import styled from 'styled-components';
import Home from '../pages/Home';
import Inscription from '../pages/Inscription';
import ExploreBlocks from '../pages/ExploreBlocks';
import ExploreCollections from '../pages/ExploreCollections';
import ExploreInscriptions from '../pages/ExploreInscriptions';
import Edition from '../pages/Edition';
import Block from '../pages/Block';
import Address from '../pages/Address';
import Sat from '../pages/Sat';
import SatBlock from '../pages/SatBlock';
import Search from '../pages/Search';
import Discover from '../pages/Discover';
import Dbscan from '../pages/Dbscan';
import Collection from '../pages/Collection';
import Explore from '../pages/Explore';
import NotFound from '../pages/NotFound';
import TopSection from '../components/TopSection';
import GA from '../components/GA';
import useDocumentTitle from './useDocumentTitle'; // Import the custom hook
import { addCommas, formatAddress } from '../helpers/utils';

// Wrap each component with a title-setting component
const TitledComponent = ({ title, Component }) => {
  const params = useParams();
  useDocumentTitle(typeof title === 'function' ? () => title(params) : title);
  return <Component />;
};

// New component for Collection with dynamic title
const CollectionWithDynamicTitle = () => {
  const [collectionSummary, setCollectionSummary] = React.useState(null);
  const { symbol } = useParams();

  React.useEffect(() => {
    const fetchCollectionSummary = async () => {
      const response = await fetch("/api/collection_summary/" + symbol);
      const json = await response.json();
      setCollectionSummary(json);
    };
    fetchCollectionSummary();
  }, [symbol]);

  useDocumentTitle(() => collectionSummary?.name || 'Collection');

  return <Collection />;
};

const Navigation = () => {
  return (
    <BrowserRouter>
      <GA/>
      <PageContainer>
        <TopSection/>
        <Routes>
          <Route path="/" element={<TitledComponent title="Inscriptions" Component={ExploreInscriptions} />} />
          <Route path="/explore/inscriptions" element={<TitledComponent title="Inscriptions" Component={ExploreInscriptions} />} />
          <Route path="/explore/collections" element={<TitledComponent title="Collections" Component={ExploreCollections} />} />
          <Route path="/explore/blocks" element={<TitledComponent title="Blocks" Component={ExploreBlocks} />} />
          <Route 
            path="/inscription/:number" 
            element={
              <TitledComponent 
                title={(params) => `Inscription ${addCommas(params.number)}`} 
                Component={Inscription} 
              />
            } 
          />
          <Route 
            path="/edition/:sha256" 
            element={
              <TitledComponent 
                title={(params) => `Editions of ${formatAddress(params.sha256)}`} 
                Component={Edition} 
              />
            }
          />
          <Route 
            path="/block/:number" 
            element={
              <TitledComponent 
                title={(params) => `Block ${addCommas(params.number)}`} 
                Component={Block} 
              />
            } 
          />
          <Route 
            path="/address/:address" 
            element={
              <TitledComponent 
                title={(params) => `Address ${formatAddress(params.address)}`} 
                Component={Address} 
              />
            } 
          />
          <Route 
            path="/sat/:sat" 
            element={
              <TitledComponent 
                title={(params) => `Sat ${addCommas(params.sat)}`}  
                Component={Sat} 
              />
            } 
          />
          <Route 
            path="/sat_block/:number" 
            element={
              <TitledComponent 
                title={(params) => `Sat Creation Block ${addCommas(params.number)}`} 
                Component={SatBlock} 
              />
            } 
          />
          <Route path="/search" element={<TitledComponent title="Search" Component={Search} />} />
          <Route path="/search/:query" element={<TitledComponent title="Search" Component={Search} />} />
          <Route 
            path="/collection/:symbol" 
            element={<CollectionWithDynamicTitle />}
          />
          <Route path="/dbscan/:dbclass" element={<TitledComponent title="DBSCAN" Component={Dbscan} />} />          
          <Route path="*" element={<TitledComponent title="404 - Page Not Found" Component={NotFound} />} />
        </Routes>
      </PageContainer>
    </BrowserRouter>
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
  background-color: #FFF;
  @media (max-width: 768px) {
    
  }
`;

export default Navigation;