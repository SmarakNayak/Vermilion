import React, { useState, useEffect } from 'react';
import { useParams, Link } from "react-router-dom";
import styled from 'styled-components';
import InscriptionContainer from '../components/InscriptionContainer';

const Address = () => {
  let { address } = useParams();
  const [refs, setRefs] = useState([]); 

  //1. Get links
  useEffect(() => {
    const fetchContent = async () => {
      setRefs(null);
      //1. Get inscription numbers
      const response = await fetch("/api/inscriptions_in_address/" + address);
      let json = await response.json();
      console.log(json);
      setRefs(json);
    }
    fetchContent();
  },[address])

  //TODO: Add pagination
  return (
    <PageContainer>
      <Heading>Address {address}</Heading>
      <Masonry>
        {refs?.map(entry => <Brick><UnstyledLink to={'/inscription/' +entry.number}><InscriptionContainer number={entry.number}></InscriptionContainer></UnstyledLink></Brick>)}
      </Masonry>
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

const UnstyledLink = styled(Link)`
  color: unset;
  text-decoration: unset;
`

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

const Masonry = styled.div`
  column-rule: 1px solid #eee;
  column-gap: 50px;
  column-count: 3;
  column-fill: initial;
  transition: all .5s ease-in-out;
`

const Brick = styled.div`
  padding-bottom: 25px;
  margin-bottom: 25px;
  border-bottom: 1px solid #eee;
  //display: inline-block;
  vertical-align: top;
  display: flex;
  justify-content: center;
`

export default Address;