import React, { useState, useEffect } from 'react';
import { useParams } from "react-router-dom";
import styled from 'styled-components';
import { lightTheme } from '../styles/themes';

const Inscription = () => {
  let { number } = useParams();
  const [metadata, setMetadata] = useState(null);
  const [nextNumber, setNextNumber] = useState(null);
  const [previousNumber, setPreviousNumber] = useState(null);
  const [randomNumber, setRandomNumber] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch("/api/inscription_number_metadata/"+number);
      const json = await response.json();
      console.log(json);
      setMetadata(json);
    }
    fetchData();
    setNextNumber(parseInt(number)+1);
    setPreviousNumber(parseInt(number)-1);
    setRandomNumber(Math.floor(Math.random() * 1000001));
  },[])

  return (
    <PageContainer>
      <Logo src={"/api/inscription_number/"+number} />
      <div>
        <p>Number: {metadata?.number}</p>
        <p>Id: {metadata?.id}</p>
        <p>Style: {metadata?.content_type}</p>
        <p>Size: {metadata?.content_length}</p>
        <p>Fee: {metadata?.genesis_fee}</p>
        <p>Inscription Blocktime: {metadata?.genesis_height} </p>
        <p>Inscription Clocktime: {metadata?.timestamp} </p>
        <LinksContainer>
          <a href={'/inscription/'+previousNumber}> previous </a>
          <a href={'/inscription/'+randomNumber}> discover </a>
          <a href={'/inscription/'+nextNumber}> next </a>
        </LinksContainer>
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

const LinksContainer = styled.div`
display: flex;
flex-direction: row;
flex: 1;
align-items: center;
justify-content: space-between;
position: relative;
`;

const Logo = styled.img`
  width: 16rem;
  height: 16rem;
  image-rendering: pixelated;
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