import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { lightTheme } from '../styles/themes';

const Inscription = () => {
  const [metadata, setMetadata] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch("/api/inscription_metadata/6fb976ab49dcec017f1e201e84395983204ae1a7c2abf7ced0a85d692e442799i0");
      const json = await response.json();
      console.log(json);
      setMetadata(json);
    }
    fetchData();
  },[])

  return (
    <PageContainer>
      <Logo src={"/api/inscription/6fb976ab49dcec017f1e201e84395983204ae1a7c2abf7ced0a85d692e442799i0"} />
      <div>
        <p>Number: {metadata?.number}</p>
        <p>Id: {metadata?.id}</p>
        <p>Style: {metadata?.content_type}</p>
        <p>Size: {metadata?.content_length}</p>
        <p>Fee: {metadata?.genesis_fee}</p>
        <p>Inscription Blocktime: {metadata?.genesis_height} </p>
        <p>Inscription Clocktime: {metadata?.timestamp} </p>
      </div>
    </PageContainer>
  )
}

const PageContainer = styled.div`
  width: 100%;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  flex: 1;
  align-items: center;
  justify-content: center;
  position: relative;

  @media (max-width: 768px) {
    padding: 0 2rem;
  }
`;

const Logo = styled.img`
  width: 16rem;
  height: 16rem;
`;

const InfoText = styled.p`
  font-family: OptimaRoman;
  font-size: 1.25rem;
  margin: 2.5rem 0 0 0;
  max-width: 50rem;
  text-align: center;
  text-transform: uppercase;
`;

export default Inscription;