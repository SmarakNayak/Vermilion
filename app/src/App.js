import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import styled from 'styled-components';
import './App.css';
import Navigation from './navigation/Routes';
import ReactGA from 'react-ga';
ReactGA.initialize('G-D585YNE3Q5');

const App = () => {
  const location = useLocation();
  useEffect(() => {
    ReactGA.pageview(location.pathname + location.search);
  }, [location]);

  return (
    <AppWrapper>
      <Navigation />
    </AppWrapper>
  );
}

const AppWrapper = styled.div`
  min-height: 100vh;
  width: 100%;
`;

export default App;
