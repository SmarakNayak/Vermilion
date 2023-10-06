import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Home from '../pages/Home';
import Inscription from '../pages/Inscription';
import Edition from '../pages/Edition';
import Block from '../pages/Block';
import Address from '../pages/Address';
import Sat from '../pages/Sat';

const Navigation = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/inscription/:number" element={<Inscription />} />
        <Route path="/edition/:sha256" element={<Edition />} />
        <Route path="/block/:number" element={<Block />} />
        <Route path="/address/:address" element={<Address />} />
        <Route path="/sat/:sat" element={<Sat />} />
      </Routes>
    </BrowserRouter>
  )
}

export default Navigation;