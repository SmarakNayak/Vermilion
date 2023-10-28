import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import Gallery from '../components/Gallery';

const Search = () => {
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

  const handleImageSubmit = (e) => {
    e.preventDefault();
    fetchImageSearch();
  }

  const onImageChange = (e) => {
    setImage(...e.target.files)
  }

  const fetchTextSearch = async () => {
    //1. Get inscription numbers
    const response = await fetch("/search_api/search/" + searchInput + "?n=100");
    let json = await response.json();
    //json = json.sort((a,b)=>b.genesis_fee/b.content_size-a.genesis_fee/a.content_size);
    setInscriptionList(json);
  }

  const fetchImageSearch = async () => {
    const requestOptions = {
      method: 'POST',
      body: image
    };
    const response = await fetch('/search_api/search_by_image?n=100', requestOptions)
    let json = await response.json();
    //json = json.sort((a,b)=>b.genesis_fee/b.content_size-a.genesis_fee/a.content_size);
    setInscriptionList(json);
  }

  return (
    <PageContainer>
      <Heading>Search</Heading>
      <form onSubmit={handleTextSubmit}>
        <input  type="text"
                placeholder="Search Bitcoin"
                onChange={handleTextChange}
                value={searchInput} />
        <input type="submit" value="Search by text" />
      </form>
      <form onSubmit={handleImageSubmit}>
        <input type="file" multiple accept='image/*' onChange={onImageChange}/>
        <input type="submit" value="Search by image" />
      </form>
      <Gallery inscriptionList={inscriptionList}/>
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

const Heading = styled.h2`
  font-family: monospace;
  font-weight: normal;
  margin-top: 50px;
  margin-bottom: 50px;
`

export default Search;