import React, { useState, useEffect, ChangeEvent } from 'react';
import { Link } from "react-router-dom";
import styled from 'styled-components';
import InscriptionContainer from '../components/InscriptionContainer';
import ToggleSwitch from '../components/toggle'
import GridItemContainer from './GridItemContainer';

const Gallery = (props) => {
  //Pagination
  const pageSize = 30
  const [pageNo, setPageNo] = useState(1);
  const [noOfPages, setNoOfPages] = useState(1);
  const [jsonFiltered, setJsonFiltered] = useState(true);
  const [filteredInscriptions, setFilteredInscriptions] = useState([]);
  const [visibleInscriptions, setVisibleInscriptions] = useState([]);

  const [showToggle, setShowToggle] = useState(false);

  //Update inscriptionList
  useEffect(() => {
    console.log(props)
    if(props?.inscriptionList===undefined || props.inscriptionList.length<1) {
      setFilteredInscriptions([]);
    } else if(jsonFiltered) {
      const filtered = props.inscriptionList.filter( inscription =>
        !inscription.is_json &
        !inscription.is_maybe_json &
        !inscription.is_bitmap_style
      )
      setFilteredInscriptions(filtered)
    } else {
      setFilteredInscriptions(props.inscriptionList)
    }
  },[props.inscriptionList, jsonFiltered])

  useEffect(()=>{
    if (filteredInscriptions !== undefined) {
      setNoOfPages(Math.max(1,Math.ceil(filteredInscriptions.length/pageSize)))
      setPageNo(1)
    } else {
      setNoOfPages(1)
      setPageNo(1)
    }
  },[filteredInscriptions])

  useEffect(()=>{
    const visible = filteredInscriptions.slice((pageNo-1)*pageSize, pageNo*pageSize)
    setVisibleInscriptions(visible)
  },[filteredInscriptions, pageNo, noOfPages])

  const onLeftArrowClick = () => {
		setPageNo(Math.max(pageNo-1, 1)) //pageNo can't be lower than 1
	}
	const onRightArrowClick = () => {
		setPageNo(Math.min(pageNo+1, noOfPages)) //pageNo can't exceed noOfPage
	}

  //Json Toggle
  const onJsonToggle = (e) => {
    //if(e===undefined) return;
    setJsonFiltered(e.target.checked)
    //setJsonFiltered(!jsonFiltered)
  }

  useEffect(() => {
    setShowToggle(props.displayJsonToggle);
  },[props.displayJsonToggle])

  return(
    <GridContainer>
      {/* {showToggle ? <ToggleSwitch checked={jsonFiltered} text={"Hide json"} onChange={onJsonToggle}/> : <div/>} */}
      {/* <Masonry>
        {visibleInscriptions.map(
          entry => 
          <Brick key={entry.number}>
            <UnstyledLink to={'/inscription/' + entry.number}>
              <InscriptionContainer number={entry.number}/>
            </UnstyledLink>
          </Brick>)}
      </Masonry> */}
      {visibleInscriptions.map(
          entry => 
          // <ItemContainer key={entry.number} number={entry.number}>
          //   <UnstyledLink to={'/inscription/' + entry.number}>
          //     <ImageContainer>
          //       <ImageWrapper>
          //         <InscriptionContainer number={entry.number}/>
          //       </ImageWrapper>
          //     </ImageContainer>
          //   </UnstyledLink>
          // </ItemContainer>
          <GridItemContainer key={entry.number} number={entry.number} numberVisibility={props.numberVisibility}></GridItemContainer>
      )}
      {/* {visibleInscriptions.length>0 ? 
        <StyledTablePaginator>
          <StyledArrowContainer onClick = {onLeftArrowClick}>←</StyledArrowContainer> 
          <p>Page {pageNo} of {noOfPages}</p> 
          <StyledArrowContainer onClick = {onRightArrowClick}>→</StyledArrowContainer>
        </StyledTablePaginator>
        : <div/>
      } */}
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

const GridContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 16px;
  width: 100%;

  @media (max-width: 1984px) {
    // grid-template-columns: repeat(5, 1fr);
    grid-template-columns: repeat(5, minmax(0, 1fr));
  }

  @media (max-width: 1346px) {
    grid-template-columns: repeat(4, 1fr);
  }

  @media (max-width: 960px) {
    grid-template-columns: repeat(3, 1fr);
  }

  @media (max-width: 630px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 320px) {
    grid-template-columns: repeat(1, 1fr);
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