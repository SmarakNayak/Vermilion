import React, { useState, useEffect } from 'react';
import { useParams, Link } from "react-router-dom";
import styled from 'styled-components';
import InscriptionContainer from '../components/InscriptionContainer';

const Search = () => {
  let { number } = useParams();
  const [refs, setRefs] = useState([]);
  const [searchInput, setSearchInput] = useState("");
  const [image, setImage] = useState();
  const [imageURL, setImageURL] = useState();

  useEffect(() => {
    if (image === undefined) return;
    // const newImageURL = []
    // image.forEach(img => newImageURL.push(URL.createObjectURL(img)))
    setImageURL(URL.createObjectURL(image))
  },[image])

  const handleChange = (e) => {
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
    console.log(e.target.files)
    setImage(...e.target.files)
  }

  const fetchTextSearch = async () => {
    //1. Get inscription numbers
    const response = await fetch("/search_api/search/" + searchInput);
    let json = await response.json();
    console.log(json)
    //json = json.sort((a,b)=>b.genesis_fee/b.content_size-a.genesis_fee/a.content_size);
    setRefs(json);
  }

  const fetchImageSearch = async () => {
    const requestOptions = {
      method: 'POST',
      body: image
    };
    const response = await fetch('/search_api/search_by_image', requestOptions)
    let json = await response.json();
    console.log(json)
    //json = json.sort((a,b)=>b.genesis_fee/b.content_size-a.genesis_fee/a.content_size);
    setRefs(json);
  }

  //TODO: Add pagination
  return (
    <PageContainer>
      <Heading>Search</Heading>
      <form onSubmit={handleTextSubmit}>
        <input  type="text"
                placeholder="Search Bitcoin"
                onChange={handleChange}
                value={searchInput} />
        <input type="submit" value="Search by text" />
      </form>
      <form onSubmit={handleImageSubmit}>
        <input type="file" multiple accept='image/*' onChange={onImageChange}/>
        <input type="submit" value="Search by image" />
      </form>
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



export default Search;