import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from "react-router-dom";
import styled from 'styled-components';
import Gallery from '../components/Gallery';
import Stack from '../components/Stack';
import SortbyDropdown from '../components/Dropdown';
import InfoText from '../components/common/text/InfoText';
import PageContainer from '../components/layout/PageContainer';
import { HorizontalDivider } from '../components/grid/Layout';
import IconButton from '../components/common/buttons/IconButton';
import Spinner from '../components/Spinner';
import { DotGridIcon, EraseIcon, EyeIcon, GridIcon, SearchIcon, UploadIcon } from '../components/common/Icon';
import theme from '../styles/theme';

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
  const [zoomGrid, setZoomGrid] = useState(true);

  useEffect(() => {
    if(query !== undefined && query !== searchInput) {
      // console.log(query_string); // Query string for debugging - not visible in console
      //path different to search input - start search
      setFirstLoad(false);
      // console.log("path different to search input"); // Debugging - not visible in console
      setSearchInput(query);
      submitSearch(query);
    } else {
      //path same as search input - do nothing
      // console.log("path same as search input"); // Debugging - not visible in console
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
    const response = await fetch("/search_api/search/" + searchTerm + "?n=48");
    let json = await response.json();
    setInscriptionList(json);
    setIsLoading(false); // End loading
    navigate(`/search/${searchTerm}`);
  };

  // function to toggle visibility of inscription numbers
  const toggleNumberVisibility = () => {
    setNumberVisibility(!numberVisibility);
  };

  const toggleGridType = () => {
    setZoomGrid(!zoomGrid);
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
    const response = await fetch('/search_api/search_by_image?n=48', requestOptions)
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
  };

  return (
    <PageContainer>
      <RowContainer style={{justifyContent: 'flex-start'}}>
        <PageText>Visual Search</PageText>
      </RowContainer>
      <HorizontalDivider></HorizontalDivider>
      <RowContainer style={{gap: '0.75rem'}}>
        <IconButton onClick={toggleNumberVisibility}>
          <EyeIcon size={'1.25rem'} color={numberVisibility ? theme.colors.text.primary : theme.colors.text.secondary}></EyeIcon>
        </IconButton>
        <IconButton onClick={toggleGridType}>
          {zoomGrid ? (
            <GridIcon size={'1.25rem'} color={theme.colors.text.primary} />
          ) : (
            <DotGridIcon size={'1.25rem'} color={theme.colors.text.primary} />
          )}
        </IconButton>
        <SearchContainer>
          <SearchIcon size={'1.25rem'} color={theme.colors.text.secondary}></SearchIcon>
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
        <Stack horizontal={true} style={{gap: '0.75rem', justifyContent: 'flex-end'}}>
          <input 
            type="file" 
            multiple 
            accept='image/*' 
            onChange={onImageChange}
            style={{ display: 'none' }} // Hide the file input
            ref={fileInputRef} // Attach the ref
          />
          <IconButton onClick={handleFileButtonClick}>
            <UploadIcon size={'1.25rem'} color={theme.colors.text.primary}></UploadIcon>
          </IconButton>
          <SortbyDropdown 
            onOptionSelect={handleSortOptionChange}
            initialOption={'most_relevant'}
            includeRelevance={true}
          />
        </Stack>
      </RowContainer>

      {firstLoad && (
        <Stack horizontal={false} center={true} style={{gap: '1.5rem', width: '100%', marginTop: '1.5rem'}}>
          <InfoText islarge={true} style={{textAlign: 'center', textWrap: 'wrap'}}>
            Type something or upload an image to find similar inscriptions. Try with one of these keywords:
          </InfoText>
          <RowContainer style={{gap: '0.75rem', flexWrap: 'wrap', maxWidth: '30rem'}}>
            <SearchButton onClick={() => handleSearchButtonClick('running bitcoin')}>running bitcoin</SearchButton>
            <SearchButton onClick={() => handleSearchButtonClick('messi')}>messi</SearchButton>
            <SearchButton onClick={() => handleSearchButtonClick('world peace')}>world peace</SearchButton>
            <SearchButton onClick={() => handleSearchButtonClick('cordyceps')}>cordyceps</SearchButton>
            <SearchButton onClick={() => handleSearchButtonClick('free ross')}>free ross</SearchButton>
          </RowContainer>
        </Stack>
      )}

      {isLoading && (
        <RowContainer style={{justifyContent: 'center', margin: '1.5rem 0'}}>
          <Spinner />
        </RowContainer>
      )}
      
      {isError && (
        <RowContainer style={{justifyContent: 'center'}}>
          <ErrorMessage>Error: please try a different search</ErrorMessage>
        </RowContainer>
      )}
      
      {!isLoading && !isError && inscriptionList.length > 0 && (
        <>
          <RowContainer style={{justifyContent: 'flex-start', alignItems: 'center', margin: '0.5rem 0'}}>
            <Stack horizontal={true} center={true} style={{gap: '.5rem', flexWrap: 'wrap'}}>
              <SummaryText>{`Showing top results for "${image ? image.name : lastSearch}"`}</SummaryText>
              <ClearButton onClick={clearSearch}>
                Clear
              </ClearButton>
            </Stack>
          </RowContainer>
          <RowContainer>
            <Gallery inscriptionList={inscriptionList} numberVisibility={numberVisibility} zoomGrid={zoomGrid} />
          </RowContainer>
        </>
      )}
    </PageContainer>
  )
}

const RowContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  width: 100%;
`;

const PageText = styled.p`
  font-family: ${theme.typography.fontFamilies.bold};
  font-size: 1.5rem;
  line-height: 2rem;
  margin: 0;
`;

const SearchContainer = styled.div`
  width: 100%;
  height: 2.75rem;
  display: flex;
  flex-direction: row;
  align-items: center;
  background-color: ${theme.colors.background.primary};
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
  transition: all 200ms ease;
  background-color: transparent;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  margin: 0;
  outline: none;
  font-family: ${theme.typography.fontFamilies.medium};
  color: ${theme.colors.text.secondary};
  font-size: 1rem;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 0 1rem 0 2.5rem;
  box-sizing: border-box;

  &:hover {
    border: 2px solid ${theme.colors.border};
  }

  &:focus {
    border: 2px solid ${props => props.isError ? '#FF0000' : theme.colors.border};
  }

  &::placeholder { /* Chrome, Firefox, Opera, Safari 10.1+ */
    color: ${theme.colors.text.secondary};
  }
  
  &:-ms-input-placeholder { /* Internet Explorer 10-11 */
    color: ${theme.colors.text.secondary};
  }
  
  &::-ms-input-placeholder { /* Microsoft Edge */
    color: ${theme.colors.text.secondary};
  }
`;

const SummaryText = styled.p`
  font-size: 1rem;
  color: ${theme.colors.text.primary};
  margin: 0;
  flex-shrink: 0;
`;

const SearchButton = styled.button`
  border-radius: 1.5rem;
  border: none;
  padding: .5rem 1rem;
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  gap: .5rem;
  white-space: nowrap; 
  font-family: ${theme.typography.fontFamilies.medium};
  font-size: 1rem;
  color: ${theme.colors.text.primary};
  background-color: ${theme.colors.background.primary};
  transition: all 200ms ease;
  transform-origin: center center;
  flex-shrink: 1;
  overflow: hidden;

  &:hover {
    background-color: ${theme.colors.background.secondary};
    color: ${theme.colors.text.primary};
  }

  &:active {
    transform: scale(0.96);
  };
`;

const ClearButton = styled.button`
  border: none;
  padding: 0;
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  gap: .5rem;
  white-space: nowrap; 
  font-family: ${theme.typography.fontFamilies.medium};
  font-size: 1rem;
  color: ${theme.colors.text.secondary};
  background-color: ${theme.colors.background.white};
  transition: all 200ms ease;
  transform-origin: center center;
  flex-shrink: 1;
  overflow: hidden;

  &:hover {
    color: ${theme.colors.text.primary};
  }

  &:active {
    transform: scale(0.96);
  };
`;

const ErrorMessage = styled.p`
  color: #FF0000;
  font-size: 1rem;
  padding: 0;
  margin: 0;
  font-family: ${theme.typography.fontFamilies.medium};
  text-align: center;
  text-wrap: wrap;
`;

export default Search;
