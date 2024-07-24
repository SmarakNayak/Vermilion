import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
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
import TopSection from '../components/TopSection';
import GA from '../components/GA';

const Navigation = () => {
  return (
    <BrowserRouter>
      <GA/>
      <PageContainer>
        <TopSection/>
        <Routes>
          <Route path="/" element={<ExploreInscriptions />} />
          <Route path="/inscription/:number" element={<Inscription />} />
          <Route path="/edition/:sha256" element={<Edition />} />
          <Route path="/block/:number" element={<Block />} />
          <Route path="/address/:address" element={<Address />} />
          <Route path="/sat/:sat" element={<Sat />} />
          <Route path="/sat_block/:number" element={<SatBlock />} />
          <Route path="/search" element={<Search />} />
          <Route path="/search/:query" element={<Search />} />
          <Route path="/discover" element={<Discover />} />
          <Route path="/collection/:symbol" element={<Collection />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/explore/inscriptions" element={<ExploreInscriptions />} />
          <Route path="/explore/collections" element={<ExploreCollections />} />
          <Route path="/explore/blocks" element={<ExploreBlocks />} />
          <Route path="/dbscan/:dbclass" element={<Dbscan />} />          
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