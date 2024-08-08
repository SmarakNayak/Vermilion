import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from "react-router-dom";
import styled from 'styled-components';
import Gallery from '../components/Gallery';
import TopSection from '../components/TopSection';
import Stack from '../components/Stack';
import EyeIcon from '../assets/icons/EyeIcon';
import BoltIcon from '../assets/icons/BoltIcon';
import BlockIcon from '../assets/icons/BlockIcon';
import { addCommas } from '../helpers/utils';
import FilterIcon from '../assets/icons/FilterIcon';
import ChevronDownIcon from '../assets/icons/ChevronDownIcon';
import UploadIcon from '../assets/icons/UploadIcon';
import SearchIcon from '../assets/icons/SearchIcon';
import CrossIcon from '../assets/icons/CrossIcon'; // Ensure this import is correct based on your project structure
import Stat from '../components/Stat';
import SearchDropdown from '../components/SearchDropdown';

const Search = () => {
  let { query } = useParams();
  const navigate = useNavigate();
  const [numberVisibility, setNumberVisibility] = useState(true);
  const [inscriptionList, setInscriptionList] = useState([]);
  const [searchInput, setSearchInput] = useState("");
  const [lastSearch, setlastSearch] = useState("");
  const [image, setImage] = useState();
  const [isError, setIsError] = useState(false);
  const [errorMsg, setErrorMsg] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [firstLoad, setFirstLoad] = useState(true);

  useEffect(() => {
    if(query !== undefined && query !== searchInput) {
      console.log(query);
      //path different to search input - start search
      setFirstLoad(false);
      console.log("path different to search input");
      setSearchInput(query);
      submitSearch(query);
    } else {
      //path same as search input - do nothing
      console.log("path same as search input");
    }
  },[query])

  const handleTextChange = (e) => {
    e.preventDefault();
    setSearchInput(e.target.value);
    setIsError(false);
  };

  const handleSearchButtonClick = (searchTerm) => {
    setSearchInput(searchTerm); // Update the input with the search term
    submitSearch(searchTerm); // Programmatically submit the search
  };
  
  const submitSearch = async (searchTerm) => {
    if (searchTerm.trim() === "") {
      setIsError(true); // Set error state if input is blank
    } else {
      setFirstLoad(false);
      setImage(undefined);
      setlastSearch(searchTerm);
      await fetchTextSearch(searchTerm); // Assuming fetchTextSearch can optionally take a searchTerm
      setIsError(false); // Reset error state on valid submission
    }
  };

  // Modify handleTextSubmit to use submitSearch
  const handleTextSubmit = (e) => {
    e.preventDefault();
    submitSearch(searchInput);
  };

  const handleKeyPress = (e) => {
    if (e.key === 13) {
    }
  }

  // Adjusted fetchTextSearch to optionally take a searchTerm and use it
  const fetchTextSearch = async (searchTerm = searchInput) => {
    setIsLoading(true); // Start loading
    const response = await fetch("/search_api/search/" + searchTerm + "?n=50");
    let json = await response.json();
    setInscriptionList(json);
    setIsLoading(false); // End loading
    navigate(`/search/${searchTerm}`);
  };

  // function to toggle visibility of inscription numbers
  const toggleNumberVisibility = () => {
    setNumberVisibility(!numberVisibility);
  };

  const fileInputRef = useRef(null); // Create a ref for the file input

  const handleFileButtonClick = () => {
    fileInputRef.current.click(); // Programmatically click the hidden file input
  };

  // Modified to set image and run search (no submit button)

  const onImageChange = (e) => {
    setFirstLoad(false);
    setImage(...e.target.files) 
    fetchImageSearch(...e.target.files);
    setSearchInput(""); // Clear search input when image search is run
    e.target.value = null;
  };

  const fetchImageSearch = async (file) => {
    setIsLoading(true); // Start loading
    const requestOptions = {
      method: 'POST',
      body: file
    };
    const response = await fetch('/search_api/search_by_image?n=50', requestOptions)
    if (response.status != 200) {
      setIsError(true);
      setErrorMsg(response.statusText);
      setIsLoading(false);
      clearSearch();
    } else {
      let json = await response.json();
      setIsError(false);
      setInscriptionList(json);
      setIsLoading(false); // End loading
      navigate(`/search`);
    }
  };

  const clearSearch = () => {
    setInscriptionList([]);
    setSearchInput("");
    setlastSearch("");
    setImage(undefined); // Clear image if used
    navigate(`/search`);
  };

  const handleSortOptionChange = (option) => {
    let inscriptions = [...inscriptionList];    
    if (option==="most_relevant") {
      inscriptions = inscriptions.sort((a,b)=>b.distance-a.distance);
    } else if (option==="newest") {
      inscriptions = inscriptions.sort((a,b)=>b.sequence_number-a.sequence_number);
    } else if (option==="oldest") {
      inscriptions = inscriptions.sort((a,b)=>a.sequence_number-b.sequence_number);
    } else if (option==="newest_sat") {
      inscriptions = inscriptions.sort((a,b)=>b.sat-a.sat);
    } else if (option==="oldest_sat") {
      inscriptions = inscriptions.sort((a,b)=>a.sat-b.sat);
    } else if (option==="biggest") {
      inscriptions = inscriptions.sort((a,b)=>b.content_length-a.content_length);
    } else if (option==="smallest") {
      inscriptions = inscriptions.sort((a,b)=>a.content_length-b.content_length);
    } else if (option==="highest_fee") {
      inscriptions = inscriptions.sort((a,b)=>b.genesis_fee-a.genesis_fee);
    } else if (option==="lowest_fee") {
      inscriptions = inscriptions.sort((a,b)=>a.genesis_fee-b.genesis_fee);
    }
    setInscriptionList(inscriptions);
    console.log('Selected inscription sort option:', option);
  };

  return (
    <MainContainer>
      {/* Stack placed within main container to allow for filter section */}
      <Stack horizontal={false} center={false} style={{gap: '1.5rem'}}>
        <RowContainer style={{justifyContent: 'flex-start'}}>
          <PageText>Search</PageText>
        </RowContainer>
        <RowContainer style={{gap: '1rem'}}>
          <VisibilityButton onClick={toggleNumberVisibility}>
            <EyeIcon svgSize={'1.25rem'} svgColor={numberVisibility ? '#000000' : '#959595'}></EyeIcon>
          </VisibilityButton>
          <SearchContainer>
            <SearchIcon svgSize={'1.25rem'} svgColor={'#959595'}></SearchIcon>
            <form onSubmit={handleTextSubmit}>
              <SearchInput 
                placeholder='Search for inscriptions'
                type='text'
                onChange={handleTextChange}
                onKeyDown={handleKeyPress}
                value={searchInput}
                isError={isError}
              />
            </form>
          </SearchContainer>
          <Stack horizontal={true} style={{gap: '1rem', justifyContent: 'flex-end'}}>
            <input 
              type="file" 
              multiple 
              accept='image/*' 
              onChange={onImageChange}
              style={{ display: 'none' }} // Hide the file input
              ref={fileInputRef} // Attach the ref
            />
            <FilterButton onClick={handleFileButtonClick}>
              <UploadIcon svgSize={'1.25rem'} svgColor={'#000000'}></UploadIcon>
              {/* <UploadText>Upload image</UploadText> */}
            </FilterButton>
            <SearchDropdown onOptionSelect={handleSortOptionChange} />
          </Stack>
        </RowContainer>
        {firstLoad && (
          <Stack horizontal={false} center={true} style={{gap: '1.5rem', width: '100%', marginTop: '1rem'}}>
            <Stack horizontal={false} center={true} style={{gap: '.5rem', width: '100%'}}>
              <BoltIcon svgSize={'1.5rem'} svgColor={'#E34234'} />
              <MessageText header>Visual Search</MessageText>
            </Stack>
            <MessageText>
              Type something or upload an image to discover similar inscriptions. Try with one of these keywords:
            </MessageText>
            <RowContainer style={{gap: '1rem', flexWrap: 'wrap'}}>
              <SearchButton onClick={() => handleSearchButtonClick('running bitcoin')}>running bitcoin</SearchButton>
              <SearchButton onClick={() => handleSearchButtonClick('messi')}>messi</SearchButton>
              <SearchButton onClick={() => handleSearchButtonClick('world peace')}>world peace</SearchButton>
              <SearchButton onClick={() => handleSearchButtonClick('cordyceps')}>cordyceps</SearchButton>
            </RowContainer>
          </Stack>
        )}
        {isLoading && <p style={{color: '#959595', fontSize: '.875rem', padding: '.5rem 0', margin: 0}}>Loading...</p>}
        {isError && <p style={{color: '#959595', fontSize: '.875rem', padding: '.5rem 0', margin: 0}}>{"Error: " + errorMsg}</p>}
        {/* Add search summary message */}
        {!isLoading && inscriptionList.length > 0 && (
          <RowContainer style={{justifyContent: 'flex-start', alignItems: 'center'}}>
            <Stack horizontal={true} center={true} style={{gap: '.5rem'}}>
              <SummaryText>Showing {inscriptionList.length} results for</SummaryText>
              <SearchButton onClick={clearSearch}>
                <SearchButtonText>
                  {image ? image.name : lastSearch}
                </SearchButtonText>
                <CrossIcon svgSize={'1rem'} svgColor={'#000000'} />
              </SearchButton>
            </Stack>
          </RowContainer>
        )}
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
`;

const MainContainer = styled.div`
  width: calc(100% - 6rem);
  padding: 1.5rem 3rem 2.5rem 3rem;
  margin: 0;
  display: flex;
  flex-direction: row;
  align-items: flex-start;

  @media (max-width: 630px) {
    width: calc(100% - 3rem);
    padding: 1.5rem 1.5rem 2.5rem 1.5rem;
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
    font-family: Relative Trial Bold;
    font-size: 1.5rem;
    margin: 0;
`;

const SearchContainer = styled.div`
  width: 100%;
  height: 3rem;
  display: flex;
  flex-direction: row;
  align-items: center;
  background-color: #F5F5F5;
  border: none;  
  border-radius: 1.5rem;
  padding: 0 1rem;
  gap: .5rem;
  position: relative;
`;

const SearchInput = styled.input`
  width: auto;
  height: auto;
  border: 2px solid transparent;
  border-radius: 1.5rem;
  transition: all 150ms ease;
  background-color: transparent;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  margin: 0;
  outline: none;
  font-family: Relative Trial Medium;
  font-weight: 500;
  color: #000000;
  font-size: 1rem;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 0 1rem 0 2.5rem;
  box-sizing: border-box;

  &:hover {
    border: 2px solid #E9E9E9;
  }

  &:focus {
    border: 2px solid ${props => props.isError ? '#FF0000' : '#E9E9E9'};
  }

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

const SummaryText = styled.p`
  font-size: 1rem;
  color: #000000;
  margin: 0;
  flex-shrink: 0;
`;

const VisibilityButton = styled.button`
  height: 3rem;
  width: 3rem;
  min-height: 3rem;
  min-width: 3rem;
  border-radius: 1.5rem;
  border: none;
  padding: .5rem;
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
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
  height: 3rem;
  width: 3rem;
  border-radius: 1.5rem;
  border: none;
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  gap: .5rem;
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

const SearchButton = styled.button`
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
  font-family: Relative Trial Medium;
  font-size: 1rem;
  color: #000000;
  background-color: #F9E8E7;
  transition: 
    background-color 350ms ease,
    transform 150ms ease;
  transform-origin: center center;
  flex-shrink: 1;
  overflow: hidden;

  &:hover {
    background-color: #F9D9D6;
  }

  &:active {
    transform: scale(0.96);
  };
`;

const SearchButtonText = styled.span`
  width: 100%; 
  overflow: hidden;
  text-overflow: ellipsis;
`;


const UploadText = styled.p`
  font-family: Relative Trial Medium;
  font-size: .875rem;
  color: #000000;

  @media (max-width: 630px) {
    display: none;
  }
`;

const MessageText = styled.p`
  font-family: ${props => props.header ? 'Relative Trial Bold' : 'Relative Trial Medium'}; 
  font-size: ${props => props.header ? '1.125rem' : '1rem'};
  color: ${props => props.header ? '#000000' : '#959595'};
  margin: 0;
  padding: 0;
  text-wrap: wrap;
  text-align: center;
`;

export default Search;