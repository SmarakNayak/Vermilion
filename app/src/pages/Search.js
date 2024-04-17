import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from "react-router-dom";
import styled from 'styled-components';
import Gallery from '../components/Gallery';
import TopSection from '../components/TopSection';
import Stack from '../components/Stack';
import EyeIcon from '../assets/icons/EyeIcon';
import BlockIcon from '../assets/icons/BlockIcon';
import { addCommas } from '../helpers/utils';
import FilterIcon from '../assets/icons/FilterIcon';
import ChevronDownIcon from '../assets/icons/ChevronDownIcon';
import UploadIcon from '../assets/icons/UploadIcon';
import SearchIcon from '../assets/icons/SearchIcon';
import Stat from '../components/Stat';

const Search = () => {
  // let number = 780346;
  const [numberVisibility, setNumberVisibility] = useState(true);
  const [inscriptionList, setInscriptionList] = useState([]);
  const [searchInput, setSearchInput] = useState("");
  const [image, setImage] = useState();

  const handleTextChange = (e) => {
    e.preventDefault();
    setSearchInput(e.target.value);
  };

  const handleTextSubmit = (e) => {
    e.preventDefault();
    fetchTextSearch();
  }

  const handleKeyPress = (e) => {
    if (e.key === 13) {
    }
  }

  const fetchTextSearch = async () => {
    //1. Get inscription numbers
    const response = await fetch("/search_api/search/" + searchInput + "?n=10");
    let json = await response.json();
    //json = json.sort((a,b)=>b.genesis_fee/b.content_size-a.genesis_fee/a.content_size);
    setInscriptionList(json);
  }

  // function to toggle visibility of inscription numbers
  const toggleNumberVisibility = () => {
    setNumberVisibility(!numberVisibility);
  };

  const fileInputRef = useRef(null); // Create a ref for the file input

  const handleFileButtonClick = () => {
    fileInputRef.current.click(); // Programmatically click the hidden file input
  };

  // const handleImageSubmit = (e) => {
  //   e.preventDefault();
  //   fetchImageSearch();
  // }

  // Modified to set image and run search (no submit button)

  const onImageChange = (e) => {
    setImage(...e.target.files) 
    fetchImageSearch(...e.target.files);
    setSearchInput(""); // Clear search input when image search is run
  }

  const fetchImageSearch = async (file) => {
    const requestOptions = {
      method: 'POST',
      body: file
    };
    const response = await fetch('/search_api/search_by_image?n=10', requestOptions)
    let json = await response.json();
    //json = json.sort((a,b)=>b.genesis_fee/b.content_size-a.genesis_fee/a.content_size);
    setInscriptionList(json);
  }

  return (
    <PageContainer>
      <TopSection />
      <MainContainer>
        {/* Stack placed within main container to allow for filter section */}
        <Stack horizontal={false} center={false} style={{gap: '1.5rem'}}>
          <RowContainer style={{justifyContent: 'flex-start'}}>
            <PageText>Search</PageText>
          </RowContainer>
          <RowContainer style={{gap: '1rem'}}>
            <Stack horizontal={true} center={false} style={{gap: '1rem'}}>
              {/* <FilterButton>
                <FilterIcon svgSize={'1rem'} svgColor={'#000000'}></FilterIcon>  
                Filters
              </FilterButton> */}
              <VisibilityButton onClick={toggleNumberVisibility}>
                <EyeIcon svgSize={'1rem'} svgColor={numberVisibility ? '#000000' : '#959595'}></EyeIcon>
              </VisibilityButton>
            </Stack>
            <SearchContainer>
              <SearchIcon svgSize={'1rem'} svgColor={'#959595'}></SearchIcon>
              <form onSubmit={handleTextSubmit}>
                <SearchInput 
                  placeholder='Search for inscriptions'
                  type='text'
                  onChange={handleTextChange}
                  onKeyDown={handleKeyPress}
                  value={searchInput}
                />
              </form>
            </SearchContainer>
            <Stack horizontal={true} style={{gap: '1rem', justifyContent: 'flex-end'}}>
              {/* <form onSubmit={handleTextSubmit}>
                <input  type="text"
                        placeholder="Search Bitcoin"
                        onChange={handleTextChange}
                        value={searchInput} />
                <input type="submit" value="Search by text" />
              </form>
              <form onSubmit={handleImageSubmit}>
                <input type="file" multiple accept='image/*' onChange={onImageChange}/>
                <input type="submit" value="Search by image" />
              </form> */}
              {/* <form onSubmit={handleImageSubmit}>
                <input 
                  type="file" multiple accept='image/*' onChange={onImageChange}
                />
              </form>
              <FilterButton>
                <UploadIcon svgSize={'1rem'} svgColor={'#000000'}></UploadIcon>
                Upload image
              </FilterButton> */}
              <input 
                type="file" 
                multiple 
                accept='image/*' 
                onChange={onImageChange}
                style={{ display: 'none' }} // Hide the file input
                ref={fileInputRef} // Attach the ref
              />
              <FilterButton onClick={handleFileButtonClick}>
                <UploadIcon svgSize={'1rem'} svgColor={'#000000'}></UploadIcon>
                Upload image
              </FilterButton>
              <FilterButton>
                Newest
                <ChevronDownIcon svgSize={'1rem'} svgColor={'#000000'}></ChevronDownIcon>
              </FilterButton>
            </Stack>
          </RowContainer>
          <RowContainer>
            {/* {inscriptionList.length ? (
              <Gallery inscriptionList={inscriptionList} numberVisibility={numberVisibility} />
            ) : (
              <div>results</div>
            )} */}
            <Gallery inscriptionList={inscriptionList} numberVisibility={numberVisibility} />
          </RowContainer>
        </Stack>
      </MainContainer>
    </PageContainer>
  )
}
  
const PageContainer = styled.div`
  width: 100%;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  // flex: 1;
  align-items: start;
  // justify-content: center;
  margin: 0;

  @media (max-width: 768px) {
    
  }
`;

const MainContainer = styled.div`
  width: calc(100% - 3rem);
  padding: .5rem 1.5rem 2.5rem 1.5rem;
  margin: 0;
  display: flex;
  flex-direction: row;
  align-items: flex-start;

  @media (max-width: 630px) {
    width: calc(100% - 3rem);
    padding: 1rem 1.5rem 2.5rem 1.5rem;
  }
`;

const RowContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  width: 100%;
`;

const PageText = styled.p`
    font-family: ABC Camera Plain Unlicensed Trial Medium;
    font-size: 1.25rem;
    margin: 0;
`;

const SearchContainer = styled.div`
  width: 100%;
  height: 2.5rem;
  display: flex;
  flex-direction: row;
  align-items: center;
  background-color: #F5F5F5;
  border: none;  
  border-radius: .5rem;
  padding: 0 1rem;
  gap: .5rem;
  position: relative;
`;

const SearchInput = styled.input`
  width: auto;
  height: auto;
  border: none;
  border-radius: .5rem;
  transition: all 150ms ease;
  background-color: transparent;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  margin: 0;
  outline: none;
  font-family: ABC Camera Plain Unlicensed Trial Regular;
  font-weight: 500;
  color: #000000;
  font-size: .875rem;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 0 1rem 0 2.5rem;

  ::placeholder { /* Chrome, Firefox, Opera, Safari 10.1+ */
    color: #959595;
  }
  
  :-ms-input-placeholder { /* Internet Explorer 10-11 */
    color: #959595;
  }
  
  ::-ms-input-placeholder { /* Microsoft Edge */
    color: #959595;
  }
`;

const BlockImgContainer = styled.div`
  width: 3.75rem;
  height: 3.75rem;
  background-color: #F5F5F5;
  border-radius: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const BlockText = styled.p`
  font-family: ABC Camera Plain Unlicensed Trial Medium;
  font-size: 1.5rem;
  margin: 0;
`;

const Container = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
`;

const StatusWrapper = styled.div`
  display: flex;
  padding: .5rem 1rem;
  border-radius: .5rem;
  background-color: #EBFCF4;
`;

const StatusText = styled.p`
  font-family: ABC Camera Plain Unlicensed Trial Medium;
  font-size: .875rem;
  color: #009859;
  margin: 0;
`;

const StatsText = styled.p`
  font-size: .875rem;
  margin: 0;
`;

const SectionContainer = styled.div`
  display: flex;
  flex-direction: row;
  flex: 1;
  gap: 1rem;
  width: 100%;
  padding-bottom: 1rem;
  border-bottom: 1px #E9E9E9 solid;
`;

const ShareButton = styled.button`
  height: 36px;
  border-radius: .5rem;
  border: none;
  padding: .5rem 1rem;
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-family: 'ABC Camera Plain Unlicensed Trial Medium';
  font-size: .875rem;
  color: #FFFFFF;
  background-color: #000000;
`;

const TabButton = styled.button`
  border-radius: .5rem;
  border: none;
  padding: .5rem 1rem;
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  gap: .5rem;
  font-family: 'ABC Camera Plain Unlicensed Trial Medium';
  font-size: .875rem;
  color: ${props => props.isActive ? '#E34234' : '#959595'}; // Change text color based on isActive
  background-color: ${props => props.isActive ? '#F9E8E7' : '#FFFFFF'}; // Change background based on isActive
  transition: 
    background-color 350ms ease,
    transform 150ms ease;
  transform-origin: center center;

  &:hover {
    background-color: ${props => props.isActive ? '#F9E8E7' : '#F5F5F5'};
  }

  &:active {
    transform: scale(0.96);
  }
`;

const VisibilityButton = styled.button`
  height: 40px;
  width: 40px;
  border-radius: .5rem;
  border: none;
  padding: .5rem;
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-family: 'ABC Camera Plain Unlicensed Trial Medium';
  font-size: .875rem;
  color: #959595;
  background-color: #F5F5F5;
  transition: 
    background-color 350ms ease,
    transform 150ms ease;
  transform-origin: center center;

  &:hover {
    background-color: #E9E9E9;
  }

  &:active {
    transform: scale(0.96);
  }
`;

const FilterButton = styled.button`
  height: 40px;
  border-radius: .5rem;
  border: none;
  padding: .5rem 1rem;
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  gap: .5rem;
  white-space: nowrap; 
  font-family: 'ABC Camera Plain Unlicensed Trial Medium';
  font-size: .875rem;
  color: #000000;
  background-color: #F5F5F5;
  transition: 
    background-color 350ms ease,
    transform 150ms ease;
  transform-origin: center center;

  &:hover {
    background-color: #E9E9E9;
  }

  &:active {
    transform: scale(0.96);
  }
`;

export default Search;