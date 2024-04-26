import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Home from '../pages/Home';
import Inscription from '../pages/Inscription';
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

const Navigation = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Explore />} />
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
        <Route path="/dbscan/:dbclass" element={<Dbscan />} />
      </Routes>
    </BrowserRouter>
  )
}

export default Navigation;