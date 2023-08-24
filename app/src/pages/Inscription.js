import React, { useState, useEffect } from 'react';
import { useParams, Link } from "react-router-dom";
import styled from 'styled-components';
import { lightTheme } from '../styles/themes';

const Inscription = () => {
  let { number } = useParams();
  const [binaryContent, setBinaryContent] = useState(null);
  const [blobUrl, setBlobUrl] = useState(null);
  const [textContent, setTextContent] = useState(null);
  const [metadata, setMetadata] = useState(null);
  const [editions, setEditions] = useState(null);
  const [editionNumber, setEditionNumber] = useState(null);
  const [editionCount, setEditionCount] = useState(null);
  const [contentType, setContentType] = useState(null);
  const [nextNumber, setNextNumber] = useState(null);
  const [previousNumber, setPreviousNumber] = useState(null);
  const [randomNumber, setRandomNumber] = useState(null);

  useEffect(() => {

    const fetchContent = async () => {
      setBlobUrl(null);
      setTextContent(null);
      setContentType("loading");
      //1. Get content
      const response = await fetch("/api/inscription_number/"+number);
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
    
    const fetchMetadata = async () => {
      const response = await fetch("/api/inscription_metadata_number/"+number);
      const json = await response.json();
      setMetadata(json);
    }

    const fetchEditions = async () => {
      setEditionNumber(null);
      setEditionCount(null);
      const response = await fetch("/api/inscription_editions_number/"+number);
      const json = await response.json();
      setEditions(json);
      var max;
      for (let index = 0; index < json.length; index++) {        
        const element = json[index];
        if(element.number==number){
          setEditionNumber(element.edition);
        }
        if (max == null || element.edition > max) {
          max = element.edition;
        }        
      }
      setEditionCount(max);
    }

    fetchContent();
    fetchMetadata();
    fetchEditions();
    setNextNumber(parseInt(number)+1);
    setPreviousNumber(parseInt(number)-1);
    setRandomNumber(Math.floor(Math.random() * 1000001));
  },[number])

  useEffect(()=> {
    const updateText = async () => {
      //1. Update text state variable if text type
      if(contentType=="text") {
        const text = await binaryContent.text();
        setTextContent(text);
      }
    }
    updateText();    
  },[contentType])
  
  
  //TODO: add tz using moment.js or timeZoneName: "long" 
  return (
    <PageContainer>
      <Heading>Inscription {metadata?.number}</Heading>
      {
        {
          'image': <ImageContainer src={blobUrl} />,
          'html': <HtmlContainer src={blobUrl}/>, //
          'text': <TextContainer>{textContent}</TextContainer>,
          'video': <video controls loop muted autoplay><source src={blobUrl} type={metadata?.content_type}/></video>,
          'audio': <audio controls><source src={blobUrl} type={metadata?.content_type}/></audio>,
          'pdf': <TextContainer>pdf unsupported'</TextContainer>,
          'model': <TextContainer>gltf model type unsupported</TextContainer>,
          'unsupported': <TextContainer>{metadata?.content_type} content type unsupported</TextContainer>,
          'loading': <TextContainer>loading...</TextContainer>
        }[contentType]
      }
      <div>
        <p>Id: {metadata?.id}</p>
        <p>Style: {metadata?.content_type}</p>
        <p>Size: {metadata?.content_length}</p>
        <p>Fee: {metadata?.genesis_fee}</p>
        <p>Blocktime: {metadata?.genesis_height} </p>
        <p>Clocktime: {metadata?.timestamp ? new Date(metadata?.timestamp*1000).toLocaleString(undefined, {day:"numeric", month: "short", year:"numeric", hour: 'numeric', minute: 'numeric', hour12: true}) : ""} </p>
        <MetadataContainer>
          <StyledP>{editionNumber ? "Edition: " : ""} </StyledP><Link to={'/edition/' + metadata?.sha256}>{editionNumber ? editionNumber + "/" + editionCount : ""} </Link>
        </MetadataContainer>
        <LinksContainer>
          <Link to={'/inscription/' + previousNumber}> previous </Link>
          <Link to={'/inscription/' + randomNumber}> discover </Link>
          <Link to={'/inscription/' + nextNumber}> next </Link>
        </LinksContainer>
      </div>
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

const LinksContainer = styled.div`
  display: flex;
  flex-direction: row;
  flex: 1;
  align-items: center;
  justify-content: space-between;
  position: relative;
`;

const ImageContainer = styled.img`
  min-height:16rem;
  min-height:16rem;
  max-width:32rem;
  max-height:32rem;
  width: auto;
  height: auto;
  image-rendering: pixelated;
`;

const Heading = styled.h2`
  font-family: monospace;
  font-weight: normal;
`

const MetadataContainer = styled.div`
  align-items: baseline;
  display: flex;
`

const StyledP = styled.p`
  margin-block-start: 0em;
  margin-inline-end: 5px;
`

const TextContainer = styled.p`
  max-width: 800px;
  font-size: 1em;
  display: block;
  font-family: monospace;
  white-space-collapse: preserve;
  margin: 10em 10em;
`;

const HtmlContainer = styled.iframe`
  width: 45rem;
  height: 40rem;
`

export default Inscription;