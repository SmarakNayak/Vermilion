import React, { useState, useEffect, ChangeEvent } from 'react';
import { Link } from "react-router-dom";
import styled from 'styled-components';
import InscriptionContainer from '../components/InscriptionContainer';
import ToggleSwitch from '../components/toggle'
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

const GalleryContainer = styled.div`

`

const StyledGallery = styled(Gallery)`
  width: 100%;
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

const UnstyledLink = styled(Link)`
  color: unset;
  text-decoration: unset;
`

const StyledArrowContainer = styled.p`
	color: rgb(150,150,150);
	cursor: pointer;
	:hover,
  :focus {
    color: rgb(0,0,0);
  }

  &.active {
    color: rgb(0,0,0);
    font-weight:550;
  }
`

const StyledTablePaginator = styled.div`
	display: flex;
	justify-content: center;
	gap: 10px;
	padding-top: 10px;
`;

const LoaderContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  padding-top: 1.5rem;
`;

const GridContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 1.5rem;
  width: 100%;
  min-width: 100%;

  @media (min-width: 1984px) {
    grid-template-columns: ${props => props.zoomGrid ? 'repeat(5, minmax(0, 1fr))' : 'repeat(12, minmax(0, 1fr))'};
  }

  @media (max-width: 1984px) {
    grid-template-columns: ${props => props.zoomGrid ? 'repeat(4, minmax(0, 1fr))' : 'repeat(10, minmax(0, 1fr))'};
  }

  @media (max-width: 1750px) {
    grid-template-columns: ${props => props.zoomGrid ? 'repeat(4, minmax(0, 1fr))' : 'repeat(9, minmax(0, 1fr))'};
  }

  @media (max-width: 1550px) {
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
    grid-template-columns: ${props => props.zoomGrid ? 'repeat(1, minmax(0, 1fr))' : 'repeat(3, minmax(0, 1fr))'};
  }

  @media (max-width: 480px) {
    grid-template-columns: ${props => props.zoomGrid ? 'repeat(1, minmax(0, 1fr))' : 'repeat(2, minmax(0, 1fr))'};
  }
`;

const ItemContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: .5rem;
  cursor: pointer;
`;

const ImageContainer = styled.div`
  background-color: #F5F5F5;
  padding: 15%;
  display: flex;
  align-items: center;
  justify-content: center;
  aspect-ratio: 360/400;
  transition: all 350ms ease;

  ${ItemContainer}:hover & {
    background-color: #E9E9E9;
  }
`;

const ImageWrapper = styled.div`
  // width: 16rem;
  // height: 16rem;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const LoadedImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: contain;
  aspect-ratio: 1/1;
  filter: drop-shadow(0 8px 24px rgba(158,158,158,.2));
  transition: all 350ms ease;

  ${ItemContainer}:hover & {
    transform: scale(1.03);
  }
`;

const ItemText = styled.p`
  font-size: .875rem;
  color: #959595;
  margin: 0;

  transition: all 350ms ease;

  ${ItemContainer}:hover & {
    color: #000000;
  }
`;

export default Gallery;