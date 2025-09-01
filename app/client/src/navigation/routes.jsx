import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { BrowserRouter, Routes, Route, Navigate, useParams } from 'react-router-dom';
import { Page } from '../components/layout/Page';
import TopBar from '../components/navigation/TopBar';
import ExploreBlocks from '../pages/ExploreBlocks';
import ExploreCollections from '../pages/ExploreCollections';
import ExploreInscriptions from '../pages/ExploreInscriptions';
import Address from '../pages/Address';
import Block from '../pages/Block';
import Sat from '../pages/Sat';
import SatBlock from '../pages/SatBlock';
import Collection from '../pages/Collection';
import Inscription from '../pages/Inscription';
import Discover from '../pages/Discover';
import Trending from '../pages/Trending';
import Search from '../pages/Search';
import NotFound from '../pages/NotFound';
import Edition from '../pages/Edition';
import OnChainCollection from '../pages/OnChainCollection';
import Children from '../pages/Children';
import Attributions from '../pages/Attributions';
import History from '../pages/History';
import Settings from '../pages/Settings';
import Folder from '../pages/Folder';

import { addCommas, formatAddress } from '../utils/format';
import PostHogPageView from '../../PostHogPageView';

const useDocumentTitle = (titleOrFn) => {
  useEffect(() => {
    const prevTitle = document.title;
    const updateTitle = () => {
      const newTitle = typeof titleOrFn === 'function' ? titleOrFn() : titleOrFn;
      document.title = `${newTitle} | Vermilion`;
    };

    updateTitle();

    return () => {
      document.title = prevTitle;
    };
  }, [titleOrFn]);
}

// Wrap each component with a title-setting component
const TitledComponent = ({ title, Component }) => {
  const params = useParams()
  useDocumentTitle(typeof title === 'function' ? () => title(params) : title)
  return <Component />
}

// New component for Collection with dynamic title
const CollectionWithDynamicTitle = () => {
  const [collectionSummary, setCollectionSummary] = useState(null)
  const { symbol } = useParams()

  useEffect(() => {
    const fetchCollectionSummary = async () => {
      const response = await fetch("/api/collection_summary/" + symbol)
      const json = await response.json()
      setCollectionSummary(json)
    }
    fetchCollectionSummary()
  }, [symbol])

  useDocumentTitle(() => collectionSummary?.name || 'Collection')

  return <Collection />
}

// New component for Children
const ChildrenWithDynamicTitle = () => {
  const [parentNumbers, setParentNumbers] = useState([]);
  const { number } = useParams();

  useDocumentTitle(() => {
    if (parentNumbers.length > 0) {
      return `Collection of ${parentNumbers.map(num => addCommas(num)).join(' • ')}`;
    }
    return `Collection of ${addCommas(number)}`;
  });

  return <OnChainCollection setParentNumbers={setParentNumbers} />;
};

const PageWrapper = styled(Page)`
  display: flex;
  flex-direction: column;
  align-items: start;
  margin: 0;
  background-color: #FFF;
`

const Navigation = () => {
  return (
    <BrowserRouter>
      <PostHogPageView />
      <PageWrapper>
        <TopBar />
        <Routes>
          <Route path="/" element={<TitledComponent title="Trending" Component={Trending} />} />
          <Route path="/explore/inscriptions" element={<TitledComponent title="Inscriptions" Component={ExploreInscriptions} />} />
          <Route path="/explore/blocks" element={<TitledComponent title="Blocks" Component={ExploreBlocks} />} />
          <Route path="/explore/collections" element={<TitledComponent title="Collections" Component={ExploreCollections} />} />

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
            path="/block/:number" 
            element={
              <TitledComponent 
                title={(params) => `Block ${addCommas(params.number)}`} 
                Component={Block} 
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
            path="/onchain_collection/:number" 
            element={<ChildrenWithDynamicTitle />}
          />
          <Route 
            path="/children/:number" 
            element={
              <TitledComponent 
                title={(params) => `Children of ${addCommas(params.number)}`} 
                Component={Children} 
              />
            }
          />
          <Route 
            path="/attributions/:number" 
            element={
              <TitledComponent 
                title={(params) => `Attributions of ${addCommas(params.number)}`} 
                Component={Attributions} 
              />
            }
          />
          <Route 
            path="/collection/:symbol" 
            element={<CollectionWithDynamicTitle />}
          />
          <Route 
            path="/folder/:folderId"
            element={<Folder/>}
          />
          <Route path="/discover" element={<TitledComponent title="Discover" Component={Discover} />} />
          {/* <Route path="/trending" element={<TitledComponent title="Trending" Component={Trending} />} /> */}
          <Route path="/search" element={<TitledComponent title="Search" Component={Search} />} />
          <Route path="/search/:query" element={<TitledComponent title="Search" Component={Search} />} />
          <Route path="/history" element={<TitledComponent title="Order History" Component={History} />} />
          <Route path="/settings/profile" element={<TitledComponent title="Edit Profile" Component={Settings} />} />

          {/* Add 404 route */}
          <Route path="*" element={<TitledComponent title="404 - Page Not Found" Component={NotFound} />} />
        </Routes>
      </PageWrapper>
    </BrowserRouter>
  )
}

export default Navigation

