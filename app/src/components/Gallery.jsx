import React, { useState, useEffect, ChangeEvent } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import GridItemContainer from './GridItemContainer';

const Gallery = (props) => {
  const [inscriptions, setInscriptions] = useState([]);

  //Update inscriptionList
  useEffect(() => {
    console.log(props)
    if(props?.inscriptionList===undefined || props.inscriptionList.length<1) {
      setInscriptions([]);
    } else {
      setInscriptions(props.inscriptionList)
    }
  },[props.inscriptionList])

  return(
    <GridContainer zoomGrid={props.zoomGrid}>
      {inscriptions.map(
        entry => 
        <GridItemContainer collection={entry.collection_name} key={entry.number} number={entry.number} id={entry.id} numberVisibility={props.numberVisibility} rune={entry.spaced_rune}></GridItemContainer>
      )}
    </GridContainer>
  )
}

const GridContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: .25rem;
  width: 100%;
  min-width: 100%;

  @media (min-width: 1346px) {
    grid-template-columns: ${props => props.zoomGrid ? 'repeat(4, minmax(0, 1fr))' : 'repeat(8, minmax(0, 1fr))'};
  }

  @media (max-width: 1346px) {
    grid-template-columns: ${props => props.zoomGrid ? 'repeat(3, minmax(0, 1fr))' : 'repeat(7, minmax(0, 1fr))'};
  }

  @media (max-width: 1080px) {
    grid-template-columns: ${props => props.zoomGrid ? 'repeat(3, minmax(0, 1fr))' : 'repeat(6, minmax(0, 1fr))'};
  }

  @media (max-width: 960px) {
    grid-template-columns: ${props => props.zoomGrid ? 'repeat(2, minmax(0, 1fr))' : 'repeat(5, minmax(0, 1fr))'};
  }

  @media (max-width: 812px) {
    grid-template-columns: ${props => props.zoomGrid ? 'repeat(2, minmax(0, 1fr))' : 'repeat(4, minmax(0, 1fr))'};
  }

  @media (max-width: 630px) {
    grid-template-columns: ${props => props.zoomGrid ? 'repeat(2, minmax(0, 1fr))' : 'repeat(3, minmax(0, 1fr))'};
  }

  @media (max-width: 480px) {
    grid-template-columns: ${props => props.zoomGrid ? 'repeat(1, minmax(0, 1fr))' : 'repeat(2, minmax(0, 1fr))'};
  }
`;

export default Gallery;
