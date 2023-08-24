import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Home from '../pages/Home';
import Inscription from '../pages/Inscription';
import Edition from '../pages/Edition';

const Navigation = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/inscription/:number" element={<Inscription />} />
        <Route path="/edition/:sha256" element={<Edition />} />
      </Routes>
    </BrowserRouter>
  )
}

export default Navigation;