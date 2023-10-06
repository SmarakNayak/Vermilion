import React, { useState, useEffect } from 'react';
import { useParams, Link } from "react-router-dom";
import styled from 'styled-components';
import InscriptionContainer from '../components/InscriptionContainer';

const Sat = () => {
  let { sat } = useParams();
  const [inscriptions, setInscriptions] = useState([]); 
  const [metadata, setMetadata] = useState(null);

  //1. Get links
  useEffect(() => {
    const fetchInscriptions = async () => {
      setInscriptions([]);
      //1. Get inscription numbers
      const response = await fetch("/api/inscriptions_on_sat/" + sat);
      let json = await response.json();
      console.log(json);
      setInscriptions(json);
    }
    const fetchSatMetadata = async () => {
      setMetadata(null);
      const response = await fetch("/api/sat_metadata/" + sat);
      let json = await response.json();
      console.log(json);
      setMetadata(json);
    }
    fetchInscriptions();
    fetchSatMetadata();
  },[sat])

  //TODO: Add pagination
  return (
    <PageContainer>
      <Heading>Sat {sat}</Heading>
      <Masonry>
        {inscriptions?.map(entry => <Brick><UnstyledLink to={'/inscription/' + entry.number}><InscriptionContainer number={entry.number}></InscriptionContainer></UnstyledLink></Brick>)}
      </Masonry>
      <div>
        <p>Sat Name: {metadata?.name}</p>
        <MetadataContainer>
          <StyledP>Sat Blocktime: </StyledP><Link to={'/sat_block/' + metadata?.block}>{metadata?.block} </Link>
        </MetadataContainer>
        <p>Sat Clocktime: {metadata?.timestamp ? new Date(metadata?.timestamp*1000).toLocaleString(undefined, {day:"numeric", month: "short", year:"numeric", hour: 'numeric', minute: 'numeric', hour12: true}) : ""}</p>
        <p>Sat Rarity: {metadata?.rarity ? metadata?.rarity.charAt(0).toUpperCase() + metadata?.rarity.slice(1) : ""}</p>
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

const MetadataContainer = styled.div`
  align-items: baseline;
  display: flex;
  margin-block-start: 1em;
  margin-block-end: 1em;
`

const StyledP = styled.p`
  margin-block-start: 0em;
  margin-block-end: 0em;
  margin-inline-end: 5px;
`


export default Sat;