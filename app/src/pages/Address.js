import React, { useState, useEffect } from 'react';
import { useParams, Link } from "react-router-dom";
import styled from 'styled-components';
import Gallery from '../components/Gallery';

const Address = () => {
  let { address } = useParams();
  const [inscriptionList, setInscriptionList] = useState([]); 

  //1. Get links
  useEffect(() => {
    const fetchContent = async () => {
      setInscriptionList([]);
      //1. Get inscription numbers
      const response = await fetch("/api/inscriptions_in_address/" + address);
      let json = await response.json();
      console.log(json);
      setInscriptionList(json);
    }
    fetchContent();
  },[address])

  //TODO: Add pagination
  return (
    <PageContainer>
      <Heading>Address {address}</Heading>
      <Gallery inscriptionList={inscriptionList} displayJsonToggle={false}/>
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

const Heading = styled.h2`
  font-family: monospace;
  font-weight: normal;
  margin-top: 50px;
  margin-bottom: 50px;
`

export default Address;