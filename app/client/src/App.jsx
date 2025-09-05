import React, { useState } from 'react';
import { ThemeProvider } from 'styled-components';
import theme from './styles/theme';
import Navigation from './navigation/routes';
import { PostHogProvider } from 'posthog-js/react';
import { Toaster } from 'sonner';
import { CustomToaster } from './components/toast/CustomToaster';
const ReactGA = require('react-ga4').default; // ESM import syntax doesn't work for this package in bun, using old cjs syntax for now

const options = {
  api_host: "https://us.i.posthog.com",
  capture_pageview: false,
  capture_pageleave: true,
};

ReactGA.initialize('G-R5ZRQ7E8Q3');

function App() {
  
  return (
    <ThemeProvider theme={theme}>
      <PostHogProvider
        apiKey={"phc_kjp6iXdDozXqygUNEMlUjLckwOcHvewazUvCOU05Ng9"}
        options={options}
      >
        <Navigation />
        {/* <CustomToaster /> */}
        <Toaster/> {/* Using default sonner toaster for now, long error messages don't look so good with the custom one */}
      </PostHogProvider>
    </ThemeProvider>
  )
};

export default App;
