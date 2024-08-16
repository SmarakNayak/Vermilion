import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import styled from 'styled-components';
import './App.css';
import Navigation from './navigation/Routes';
import ReactGA from 'react-ga4';
ReactGA.initialize('G-R5ZRQ7E8Q3');

const App = () => {
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
