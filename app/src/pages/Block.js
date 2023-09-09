import React, { useState, useEffect } from 'react';
import { useParams, Link } from "react-router-dom";
import styled from 'styled-components';


const Block = () => {
  let { number } = useParams();
  const [refs, setRefs] = useState(null); 
  const [nextNumber, setNextNumber] = useState(null);
  const [previousNumber, setPreviousNumber] = useState(null);

  useEffect(() => {

    const fetchContent = async () => {
      //1. Get inscription numbers
      const response = await fetch("/api/inscriptions_in_block/" + number);
      let json = await response.json();
      setRefs(json);

    }
    fetchContent();
    setNextNumber(parseInt(number)+1);
    setPreviousNumber(parseInt(number)-1);
  },[number])

  return (
    <PageContainer>
      <Heading>Block {number}</Heading>
      {refs?.map(entry => <a href={'/inscription/' +entry.number}><ImageContainer src={"/api/inscription/" + entry.id}></ImageContainer></a> )}
      <LinksContainer>
        <Link to={'/block/' + previousNumber}> previous </Link>
        <Link to={'/block/' + nextNumber}> next </Link>
      </LinksContainer>
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

const ImageContainer = styled.img`
  min-width:16rem;
  max-width:32rem;
  width: auto;
  height: auto;
  image-rendering: pixelated;
`;

const LinksContainer = styled.div`
  display: flex;
  flex-direction: row;
  flex: 1;
  align-items: center;
  justify-content: space-between;
  position: relative;
  width: 30%;
`;

const Heading = styled.h2`
  font-family: monospace;
  font-weight: normal;
`

export default Block;