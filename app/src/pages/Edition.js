import React, { useState, useEffect } from 'react';
import { useParams, Link } from "react-router-dom";
import styled from 'styled-components';
import InfiniteScroll from 'react-infinite-scroll-component';

import TopSection from '../components/TopSection';
import Stack from '../components/Stack';
import { addCommas, copyText, formatAddress } from '../helpers/utils';
import CopyIcon from '../assets/icons/CopyIcon';
import HashIcon from '../assets/icons/HashIcon';
import Tag from '../components/Tag';
import CopyTag from '../components/CopyTag';

const Edition = () => {
  let { sha256 } = useParams();
  const [binaryContent, setBinaryContent] = useState(null);
  const [blobUrl, setBlobUrl] = useState(null);
  const [textContent, setTextContent] = useState(null);
  const [editions, setEditions] = useState([]);
  const [firstEdition, setFirstEdition] = useState(null);
  const [editionCount, setEditionCount] = useState('');
  const [contentType, setContentType] = useState(null);
  //InfiniteScroll
  const [pageSize, setPageSize] = useState(50);
  const [nextPageNo, setNextPageNo] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {

    const fetchContent = async () => {
      setBlobUrl(null);
      setTextContent(null);
      setContentType("loading");
      //1. Get content
      const response = await fetch("/api/inscription_sha256/"+sha256);
      //2. Assign local url
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setBinaryContent(blob);
      setBlobUrl(url);
      //3. Work out type
      let content_type = response.headers.get("content-type");
      switch (content_type) {
        //Image types
        case "image/png":
          setContentType("image");
          break;
        case "image/jpeg":
          setContentType("image");
          break;
        case "image/jpg":
          setContentType("image");
          break;
        case "image/webp":
          setContentType("image");
          break;
        case "image/svg+xml":
          setContentType("image");
          break;
        case "image/gif":
          setContentType("image");
          break;
        case "image/avif":
          setContentType("image");
          break;
        //Text types
        case "text/plain;charset=utf-8":
          setContentType("text");
          break;
        case "application/json":
          setContentType("text");
          break;
        case "text/plain":
          setContentType("text");
          break;
        case "text/rtf":
          setContentType("text");
          break;
        //Html types
        case "text/html;charset=utf-8":
          setContentType("html");
          break;
        case "text/html":
          setContentType("html");
          break;
        //Video types
        case "video/mp4":
          setContentType("video");
          break;
        case "video/webm":
          setContentType("video");
          break;
        //Audio types
        case "audio/mpeg":
          setContentType("audio");
          break;
        //Pdf types
        case "application/pdf":
          setContentType("pdf");
          break;
        //Model types
        case "model/gltf-binary":
          setContentType("model");
          break;
        default:
          setContentType("unsupported");
          break;
      }
    }

    fetchContent();
    fetchInital();
  },[sha256])

  const fetchInital = async () => {
    console.log("fetch initial data")
    const query_string = "/api/inscription_editions_sha256/" + sha256 + "?page_size=" + pageSize + "&page_number=0";
    console.log(query_string);
    const response = await fetch(query_string);
    const newEditions = await response.json();

    setFirstEdition(newEditions[0]?.number);
    setEditionCount(newEditions[0]?.total)
    setEditions(newEditions);
    setHasMore(newEditions?.length === pageSize);
    setNextPageNo(1);

    console.log('ed', newEditions)
  }

  const fetchData = async () => {
    console.log("fetch data")
    const query_string = "/api/inscription_editions_sha256/"+ sha256 + "?page_size=" + pageSize + "&page_number=" + nextPageNo;
    console.log(query_string);
    const response = await fetch(query_string);
    const newEditions = await response.json();

    setEditions([...editions, ...newEditions]);
    setHasMore(newEditions?.length === pageSize);
    setNextPageNo(nextPageNo+1);
  };

  useEffect(()=> {
    const updateText = async () => {
      //1. Update text state variable if text type
      if(contentType=="text" || contentType==="svg" || contentType==="html") {
        const text = await binaryContent.text();
        setTextContent(text);
      }
    }
    updateText();    
  },[contentType])
  
  return (
    <MainContainer>
      <HeaderContainer>
        <MainContentStack>
          <BackButtonContainer>
            <UnstyledLink to={`/inscription/${firstEdition}`}>
              <LinkButton isLink={true}>Back to Inscription page</LinkButton>
            </UnstyledLink>
          </BackButtonContainer>
          <PageText>Editions of {firstEdition !== null && firstEdition !== undefined ? addCommas(firstEdition) : ''}</PageText>
        </MainContentStack>
      </HeaderContainer>
      <RowContainer style={{gap: '.5rem', flexFlow: 'wrap'}}>
        <Tag isLarge={true} value={addCommas(editionCount)} category={'Editions'} />
        <CopyTag isLarge={true} value={formatAddress(sha256)} category={'SHA256'} copy={sha256} />
      </RowContainer>
      <Divider></Divider>
      <TableContainer>
        <DivTable>
          <DivRow header>
            <DivCell header>Edition #</DivCell>
            <DivCell header>Inscription #</DivCell>
            <DivCell header>Inscription ID</DivCell>
          </DivRow>
          <GalleryContainer>
            <StyledInfiniteScroll
              dataLength={editions?.length}
              next={fetchData}
              hasMore={hasMore}
              loader={
                <LoaderContainer>
                  <p style={{color: '#959595', margin: 0}}>Loading...</p>
                </LoaderContainer>
              }
            >
              {editions.map((edition, index) => (
                <UnstyledLink to={'/inscription/' + edition.number}>
                  <DivRow key={index}>
                    <DivCell>{edition.edition}</DivCell>
                    <DivCell>{addCommas(edition.number)}</DivCell>
                    <DivCell>{formatAddress(edition.id)}</DivCell>
                  </DivRow>
                </UnstyledLink>
              ))}
          </StyledInfiniteScroll>
        </GalleryContainer>
        </DivTable>
      </TableContainer>
    </MainContainer>
  )
}

const MainContainer = styled.div`
  width: calc(100% - 6rem);
  padding: 1.5rem 3rem 2.5rem 3rem;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;

  @media (max-width: 630px) {
    width: calc(100% - 3rem);
    padding: 1.5rem 1.5rem 2.5rem 1.5rem;
  }
`;

const HeaderContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  width: 100%;

  @media (max-width: 864px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 1.5rem;
  }
`;

const MainContentStack = styled.div`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  max-width: calc(100% - 10.5rem);
  gap: .5rem;

  @media (max-width: 864px) {
    max-width: 100%;
  }
`;

const BackButtonContainer = styled.div`
  display: inline-block; // This makes the container only as wide as its content
`;

const UnstyledLink = styled(Link)`
  color: unset;
  text-decoration: unset;
`;

const LinkButton = styled.p`
  font-family: Relative Trial Medium;
  font-size: .875rem;
  border: none;
  margin: 0;
  padding: 0;
  color: #959595;
  transition: 
    color 350ms ease,
    transform 150ms ease;
  transform-origin: center center;
  display: inline-block; // This ensures the text doesn't wrap

  &:hover {
    color: #000000;
  }
`;

const RowContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  width: 100%;
`;

const GalleryContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const PageText = styled.p`
    font-family: Relative Trial Bold;
    font-size: 1.5rem;
    margin: 0;
`;

const InfoText = styled.p`
  font-family: Relative Trial Medium;
  font-size: ${props => props.isLarge ? '1rem' : '.875rem'};
  color: ${props => props.isPrimary ? '#000000' : '#959595'};
  margin: 0;
`;

const Divider = styled.div`
  width: 100%;
  border-bottom: 1px solid #E9E9E9;
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

const VisibilityButton = styled(FilterButton)``;

const LoadingText = styled.p`
  font-family: Relative Trial Medium;
  font-size: 1rem;
  color: #959595;
  text-align: center;
`;

const StyledInfiniteScroll = styled(InfiniteScroll)`
  overflow: hidden !important;
  width: 100%;
`

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

const ImageContainer = styled.img`
  max-width: 4rem;
  max-height: 4rem;
  width: auto;
  height: auto;
  image-rendering: pixelated;
  object-fit: contain;
  aspect-ratio: 1/1;
  image-rendering: pixelated;
`;

const SvgContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  max-width: 4rem;
  width: auto;
  height: auto;
  image-rendering: pixelated;
`;

const TextContainer = styled.p`
  max-width: 4rem;
  max-height: 4rem;
  font-family: Relative Trial Medium;
  font-size: .75rem;
  color: #000000;
  margin: 0;
  object-fit: contain;
  aspect-ratio: 1/1;
  overflow: hidden;
  overflow-y: hidden;
  text-wrap: wrap;
  white-space-collapse: preserve;
  border: 2px solid #F5F5F5;
`

const HtmlContainer = styled.div`
  max-width: 4rem;
  max-height: 4rem;
  font-family: Relative Trial Medium;
  font-size: .75rem;
  color: #000000;
  margin: 0;
  object-fit: contain;
  aspect-ratio: 1/1;
  overflow: hidden;
  overflow-y: hidden;
  text-wrap: wrap;
  white-space-collapse: preserve;
  border: 2px solid #F5F5F5;
`

const StyledIframe = styled.iframe`
  border: none;
  //flex: 0 100%;
  //flex-grow: 1;
  width: 100%;
  resize: both;
  aspect-ratio: 1/1;
`

const Container = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
`;

const BlockText = styled.p`
  font-family: Relative Trial Bold;
  font-size: 1.5rem;
  margin: 0;
`;

const InfoButton = styled.button`
  border-radius: 1.5rem;
  border: none;
  padding: .5rem 1rem;
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: ${props => props.isButton ? 'pointer' : 'default'};
  gap: .5rem;
  font-family: Relative Trial Medium;
  font-size: .875rem;
  color: #000000;  
  text-wrap: nowrap;
  background-color:#F5F5F5;
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

const TableContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  flex; 1;
  gap: 1.5rem;
`;

const DivTable = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
`;

const DivRow = styled.div`
  display: flex;
  flex-direction: row;
  width: calc(100% - 3rem);
  border-radius: .5rem;
  padding: ${props => props.header ? '0 1.5rem' : '1rem 1.5rem'};
  background-color: ${props => props.header ? 'transparent' : 'transparent'};
  cursor: ${props => props.header ? 'default' : 'pointer'};
  transition: 
    background-color 350ms ease,
    transform 150ms ease;
  transform-origin: center center;

  &:hover {
    background-color: ${props => props.header ? '#transparent' : '#F5F5F5'};
  }
  &:not(:last-child) {
    margin-bottom: 0.5rem;
  }
`;

const DivCell = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-end;
  gap: 1rem;
  flex: 1;
  margin: 0;
  font-family: 'Relative Trial Medium';
  font-size: ${props => props.header ? '.875rem' : '1rem'};
  color: ${props => props.header ? '#959595' : '#000000'};
  &:nth-child(1) {
    justify-content: flex-start;
  }

  @media (max-width: 630px) {
    &:last-child {
      display: none;
    }
  }
`;

const LoaderContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  max-width: 
  max-height:
`;


export default Edition;