import React, { useState } from 'react'
import { ThemeProvider } from 'styled-components'
import theme from './styles/theme'
import Navigation from './navigation/routes'
import ReactGA from 'react-ga4';
ReactGA.initialize('G-R5ZRQ7E8Q3');

function App() {

  return (
    <ThemeProvider theme={theme}>
      <Navigation />
    </ThemeProvider>
  )
}

export default App
