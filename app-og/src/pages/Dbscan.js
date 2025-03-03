import React, { useState, useEffect } from 'react';
import { useParams, Link } from "react-router-dom";
import styled from 'styled-components';
import Gallery from '../components/Gallery';

const Dbscan = () => {
  let { dbclass } = useParams();
  const [inscriptionList, setInscriptionList] = useState([]); 
  const [nextNumber, setNextNumber] = useState(null);
  const [previousNumber, setPreviousNumber] = useState(null);

  //1. Get links
  useEffect(() => {
    const fetchContent = async () => {
      //1. Get inscription numbers
      setInscriptionList([]);
      const response = await fetch("/search_api/get_class/" + dbclass);
      let json = await response.json();
      json = json.sort((a,b)=>a.number-b.number);
      setInscriptionList(json);
    }
    fetchContent();
    setNextNumber(parseInt(dbclass)+1);
    setPreviousNumber(parseInt(dbclass)-1);
  },[dbclass])

  return (
    <PageContainer>
      <Heading>Class {dbclass} Inscriptions</Heading>
      <Gallery inscriptionList={inscriptionList} displayJsonToggle={false}/>
      <LinksContainer>
        <Link to={'/dbscan/' + previousNumber}> previous class </Link>
        <Link to={'/dbscan/' + nextNumber}> next class </Link>
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

const LinksContainer = styled.div`
  display: flex;
  flex-direction: row;
  flex: 1;
  align-items: center;
  justify-content: space-between;
  position: relative;
  width: 30%;
  margin-top: 25px;
  margin-bottom: 25px;
`;

const Heading = styled.h2`
  font-family: monospace;
  font-weight: normal;
  margin-top: 50px;
  margin-bottom: 50px;
`



export default Dbscan;