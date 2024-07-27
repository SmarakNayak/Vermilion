import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import styled from 'styled-components';
import './App.css';
import Navigation from './navigation/Routes';
import ReactGA from 'react-ga4';
ReactGA.initialize('G-R5ZRQ7E8Q3');

const App = () => {
  // Commented out. Page views are done automatically in ga4
  // const location = useLocation();
  // useEffect(() => {
  //   // Send pageview with a custom path
  //   ReactGA.send({ hitType: "pageview", page: location.pathname + location.search });
  // }, [location])

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
