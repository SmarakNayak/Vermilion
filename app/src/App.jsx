import React, { useState } from 'react'
import { ThemeProvider } from 'styled-components'
import theme from './styles/theme'
import Navigation from './navigation/routes'
const ReactGA = require('react-ga4').default; // ESM import syntax doesn't work for this package in bun, using old cjs syntax for now
ReactGA.initialize('G-R5ZRQ7E8Q3');

function App() {

  return (
    <ThemeProvider theme={theme}>
      <Navigation />
    </ThemeProvider>
  )
}

export default App
