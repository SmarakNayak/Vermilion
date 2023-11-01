import React, { useState, useEffect } from 'react';
import { useParams, Link } from "react-router-dom";
import styled from 'styled-components';
import { lightTheme } from '../styles/themes';
const iframecontentwindow = require("../scripts/iframeResizer.contentWindow.min.txt");

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
  const [address, setAddress] = useState(null);
  const [transfers, setTransfers] = useState(null); //Not displayed yet

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
          setContentType("svg");
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
      for (let index = 0; index < json.length; index++) {        
        const element = json[index];
        if(element.number==number){
          setEditionNumber(element.edition);
        }
      }
      setEditionCount(json[0].total);
    }

    const fetchRandom = async () => {
      setRandomNumber(Math.floor(Math.random() * 1000001));
      //1. Get content
      const response = await fetch("/api/random_inscription");
      const json = await response.json();
      setRandomNumber(json?.number);
    }

    const fetchAddress = async () => {
      //1. Get address
      const response = await fetch("/api/inscription_last_transfer_number/" + number);
      const json = await response.json();
      setAddress(json);
      console.log(json);
    }

    const fetchTransfers = async () => {
      //1. Get transfers
      const response = await fetch("/api/inscription_transfers_number/" + number);
      const json = await response.json();
      setTransfers(json);
      console.log(json);
    }

    fetchContent();
    fetchMetadata();
    //fetchAddress();
    //fetchTransfers();
    fetchEditions();
    fetchRandom();
    setNextNumber(parseInt(number)+1);
    setPreviousNumber(parseInt(number)-1);
  },[number])

  useEffect(()=> {
    const updateText = async () => {
      //1. Update text state variable if text type
      if(contentType=="text" || contentType=="svg" || contentType=="html" ) {
        const text = await binaryContent.text();
        setTextContent(text);
      }
      if(metadata?.is_recursive && contentType=="svg") {
        setContentType("svg-recursive")
      }
    }
    updateText();
  },[contentType])

  //TODO: add tz using moment.js or timeZoneName: "long"
  // <HtmlContainer><StyledIframe srcDoc={textContent} scrolling='no' sandbox='allow-scripts'></StyledIframe></HtmlContainer> alternative that doesn't require another network call - size is buggy though..
  return (
    <PageContainer>
      <NumberText>Inscription {metadata?.number}</NumberText>
      {
        {
          'image': <ImageContainer src={blobUrl} />,
          'svg-recursive': <SvgContainer src={"/api/inscription_number/"+ number} scrolling='no' sandbox='allow-scripts allow-same-origin' loading="lazy"/>,
          'svg': <ImageContainer src={"/api/inscription_number/"+ number}/>,
          'html': <HtmlContainer><StyledIframe src={"/api/inscription_number/"+ number} scrolling='no' sandbox='allow-scripts allow-same-origin' loading="lazy"></StyledIframe></HtmlContainer>,
          'text': <TextContainer><p>{textContent}</p></TextContainer>,
          'video': <video controls loop muted autoplay><source src={blobUrl} type={metadata?.content_type}/></video>,
          'audio': <audio controls><source src={blobUrl} type={metadata?.content_type}/></audio>,
          'pdf': <TextContainer>pdf unsupported</TextContainer>,
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
        <MetadataContainer>
          <StyledP>Blocktime: </StyledP><Link to={'/block/' + metadata?.genesis_height}>{metadata?.genesis_height} </Link>
        </MetadataContainer>
        <p>Clocktime: {metadata?.timestamp ? new Date(metadata?.timestamp*1000).toLocaleString(undefined, {day:"numeric", month: "short", year:"numeric", hour: 'numeric', minute: 'numeric', hour12: true}) : ""} </p>
        {/* <MetadataContainer>
          <StyledP>{address ? "Address: " : "Address: "} </StyledP><Link to={'/address/' + address?.address}>{address?.address} </Link>
        </MetadataContainer> */}
        <MetadataContainer>
          <StyledP>{metadata?.sat ? "Sat: " : "Sat: "} </StyledP><Link to={'/sat/' + metadata?.sat}>{metadata?.sat} </Link>
        </MetadataContainer>
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
  margin-top: 25px;
  margin-bottom: 25px;
`;

const ImageContainer = styled.img`
  min-width: 16rem;
  width: auto;
  height: auto;
  max-width: 32rem;
  max-height: 32rem;
  image-rendering: pixelated;
  border-radius: 4px;
  border: 8px solid #FFF;
  box-shadow: 0px 1px 6px 0px rgba(0, 0, 0, 0.09);

  @media (max-width: 576px) {
    max-width: 20rem;
    max-height: 20rem;
  }
`;

const SvgContainer = styled.iframe`
  display: flex;
  justify-content: center;
  align-items: center;
  width: auto;
  height: auto;
  min-width:16rem;
  min-height:16rem;
  max-width: 32rem;
  max-height: 32rem;
  image-rendering: pixelated;
  border-radius: 4px;
  border: 8px solid #FFF;
  box-shadow: 0px 1px 6px 0px rgba(0, 0, 0, 0.09);
  resize: both;

  @media (max-width: 576px) {
    max-width: 20rem;
    max-height: 20rem;
  }
`;

const Heading = styled.h2`
  font-family: monospace;
  font-weight: normal;
`

const MetadataContainer = styled.div`
  align-items: baseline;
  display: flex;
  margin-block-start: 1em;
  margin-block-end: 1em;
`

const StyledP = styled.p`
  margin-block-start: 0em;
  margin-block-end: 0em;
  margin-inline-end: 5px;
`

const TextContainer = styled.div`
  display: flex;
  align-items: center;
  min-height: 11rem;
  max-width: 800px;
  margin: 1em;
  font-size: 1em;
  font-family: monospace;
  white-space-collapse: preserve;
`;

const HtmlContainer = styled.div`
  display: flex;
  justify-content: center;
  width: auto;
  height: auto;
  min-width:16rem;
  min-height:16rem;
  max-width: 32rem;
  max-height: 32rem;
  border-radius: 4px;
  border: 8px solid #FFF;
  box-shadow: 0px 1px 6px 0px rgba(0, 0, 0, 0.09);

  @media (max-width: 576px) {
    max-width: 20rem;
    max-height: 20rem;
  }
`

const StyledIframe = styled.iframe`
  border: none;
  //flex: 0 100%;
  //flex-grow: 1;
  width: 100%;
  resize: both;
  //aspect-ratio: 1/1;
`

const NumberText = styled.p`
  font-family: ABC Camera Unlicensed Trial Medium Italic;
  font-size: 2em;
  margin: 0;
`;

export default Inscription;