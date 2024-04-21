import React, { useState, useEffect } from 'react';
import { useParams, Link } from "react-router-dom";
import styled from 'styled-components';
import InfiniteScroll from 'react-infinite-scroll-component';

import TopSection from '../components/TopSection';
import Stack from '../components/Stack';
import { addCommas, copyText, formatAddress } from '../helpers/utils';
import CopyIcon from '../assets/icons/CopyIcon';
import HashIcon from '../assets/icons/HashIcon';

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
    <PageContainer>
      <TopSection />
      <MainContainer>
        {/* Stack placed within main container to allow for filter section */}
        <Stack horizontal={false} center={false} style={{gap: '1.5rem'}}>
          <RowContainer>
            <Container style={{gap: '1rem'}}>
              {
                {
                  'image': <ImageContainer src={blobUrl} />,
                  'svg': <SvgContainer dangerouslySetInnerHTML={{__html: textContent}} />,
                  'html': <HtmlContainer><StyledIframe src={"/api/inscription_number/" + firstEdition} scrolling='no' sandbox='allow-scripts'></StyledIframe></HtmlContainer>,
                  'text': <TextContainer>{textContent}</TextContainer>,
                  'video': <video controls loop muted autoplay><source src={blobUrl} type={contentType}/></video>,
                  'audio': <audio controls><source src={blobUrl} type={contentType}/></audio>,
                  'pdf': <TextContainer>pdf unsupported'</TextContainer>,
                  'model': <TextContainer>gltf model type unsupported</TextContainer>,
                  'unsupported': <TextContainer>{contentType} content type unsupported</TextContainer>,
                  'loading': <TextContainer>loading...</TextContainer>
                }[contentType]
              } 
              <BlockText>{firstEdition !== null && firstEdition !== undefined ? 'Inscription ' + addCommas(firstEdition) : ''}</BlockText>
            </Container>
          </RowContainer>
          <RowContainer style={{gap: '1rem', flexWrap: 'wrap'}}>
            <InfoButton>
              <HashIcon svgSize={'1rem'} svgColor={'#959595'} />
              {editionCount + `${editionCount > 1 ? ' editions' : ' edition'}`}
            </InfoButton>
            <InfoButton isButton={true} onClick={() => copyText(sha256)}>
              Sha256: {formatAddress(sha256)}
              <CopyIcon svgSize={'1rem'} svgColor={'#959595'} />
            </InfoButton>
          </RowContainer>
            <TableContainer>
              <DivTable>
                <DivRow header>
                  <DivCell header>Edition #</DivCell>
                  <DivCell header>Inscription #</DivCell>
                  <DivCell header>Inscription ID</DivCell>
                </DivRow>
                <GalleryContainer>
                  <InfiniteScroll
                    dataLength={editions?.length}
                    next={fetchData}
                    hasMore={hasMore}
                    loader={
                      <LoaderContainer>
                        <p style={{color: '#959595'}}>Loading...</p>
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
                </InfiniteScroll>
              </GalleryContainer>
              </DivTable>
            </TableContainer>
          
        </Stack>
      </MainContainer>
    </PageContainer>
  )
}

const GalleryContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

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
  width: calc(100% - 3rem);
  padding: .5rem 1.5rem 2.5rem 1.5rem;
  margin: 0;
  display: flex;
  flex-direction: row;
  align-items: flex-start;
`;

const ImageContainer = styled.img`
  max-width: 4rem;
  max-height: 4rem;
  width: auto;
  height: auto;
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
  font-size: 1em;
  display: block;
  font-family: monospace;
  white-space-collapse: preserve;
  margin: 10em 10em;
`

const HtmlContainer = styled.div`
  display: flex;
  justify-content: center;
  min-width: 4rem;
  min-height: 4rem;
`

const StyledIframe = styled.iframe`
  border: none;
  //flex: 0 100%;
  //flex-grow: 1;
  width: 100%;
  resize: both;
  //aspect-ratio: 1/1;
`

const RowContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  width: 100%;
`;

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
  padding-top: 1.5rem;
  border-top: 1px solid #E9E9E9;
`;

const DivTable = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: calc(100% - 5rem);
  max-width: 40rem;
`;

const DivRow = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
  border-radius: .5rem;
  padding: ${props => props.header ? '0 3rem' : '1rem 3rem'};
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
  font-size: .875rem;
  color: ${props => props.header ? '#959595' : '#000000'};
  &:nth-child(1) {
    justify-content: flex-start;
  }

  @media (max-width: 425px) {
    &:last-child {
      display: none;
    }
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

const UnstyledLink = styled(Link)`
  color: unset;
  text-decoration: unset;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const LoaderContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  padding-top: 1.5rem;
`;


export default Edition;