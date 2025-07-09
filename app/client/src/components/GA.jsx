import React, { useEffect } from 'react';
const ReactGA = require('react-ga4').default;
import { useLocation } from 'react-router-dom';

const GA = () => {
  const location = useLocation();

  useEffect(() => {
    ReactGA.send({
      hitType: "pageview",
      page: location.pathname + location.search
    });
  }, [location]);

  return (
    <></>
  )
}

export default GA;
