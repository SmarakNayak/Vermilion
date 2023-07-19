import React, { useState } from 'react';
import styled from 'styled-components';
import './App.css';
import Navigation from './navigation/Routes';

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
