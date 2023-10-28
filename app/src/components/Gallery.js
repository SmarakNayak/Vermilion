import React, { useState, useEffect, ChangeEvent } from 'react';
import { Link } from "react-router-dom";
import styled from 'styled-components';
import InscriptionContainer from '../components/InscriptionContainer';
import ToggleSwitch from '../components/toggle'

const Gallery = (props) => {
  //Pagination
  const pageSize = 10
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
        !inscription.isJson &
        !inscription.isMaybeJson &
        !inscription.isBitmapStyle
      )
      setFilteredInscriptions(filtered)
    } else {
      setFilteredInscriptions(props.inscriptionList)
    }
  },[props.inscriptionList])

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
    <GalleryContainer>
      {showToggle ? <ToggleSwitch checked={jsonFiltered} text={"Hide json"} onChange={onJsonToggle}/> : <div/>}
      <Masonry>
        {visibleInscriptions.map(
          entry => 
          <Brick key={entry.number}>
            <UnstyledLink to={'/inscription/' + entry.number}>
              <InscriptionContainer number={entry.number}/>
            </UnstyledLink>
          </Brick>)}
      </Masonry>
      {visibleInscriptions.length>0 ? 
        <StyledTablePaginator>
          <StyledArrowContainer onClick = {onLeftArrowClick}>←</StyledArrowContainer> 
          <p>Page {pageNo} of {noOfPages}</p> 
          <StyledArrowContainer onClick = {onRightArrowClick}>→</StyledArrowContainer>
        </StyledTablePaginator>
        : <div/>
      }
    </GalleryContainer>
  )
}

const GalleryContainer = styled.div`

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
`

export default Gallery;