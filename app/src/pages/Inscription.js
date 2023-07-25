import React, { useState, useEffect } from 'react';
import { useParams, Link } from "react-router-dom";
import styled from 'styled-components';
import { lightTheme } from '../styles/themes';

const Inscription = () => {
  let { number } = useParams();
  const [content, setContent] = useState(null);
  const [metadata, setMetadata] = useState(null);
  const [contentType, setContentType] = useState(null);
  const [nextNumber, setNextNumber] = useState(null);
  const [previousNumber, setPreviousNumber] = useState(null);
  const [randomNumber, setRandomNumber] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch("/api/inscription_number_metadata/"+number);
      const json = await response.json();
      console.log(json);
      setMetadata(json);
      switch (json?.content_type) {
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
    const fetchContent = async () => {
      const content = await fetch("/api/inscription_number/"+number);
      const text = await content.text();
      setContent(text);
    }
    setContent("");
    fetchData();
    fetchContent();
    setNextNumber(parseInt(number)+1);
    setPreviousNumber(parseInt(number)-1);
    setRandomNumber(Math.floor(Math.random() * 1000001));
  },[number])

  return (
    <PageContainer>
      {
        {
          'image': <ImageContainer src={"/api/inscription_number/"+number} />,
          'html': <HtmlContainer src={"/api/inscription_number/"+number}/>, //
          'text': <TextContainer>{content}</TextContainer>,
          'video': <video controls loop muted autoplay><source src={"/api/inscription_number/"+number} type={metadata?.content_type}/></video>,
          'audio': <audio controls><source src={"/api/inscription_number/"+number} type={metadata?.content_type}/></audio>,
          'pdf': <TextContainer>pdf unsupported'</TextContainer>,
          'model': <TextContainer>gltf model type unsupported</TextContainer>,
          'unsupported': <p>{metadata?.content_type} content type unsupported</p>
        }[contentType]
      }
      <div>
        <p>Number: {metadata?.number}</p>
        <p>Id: {metadata?.id}</p>
        <p>Style: {metadata?.content_type}</p>
        <p>Size: {metadata?.content_length}</p>
        <p>Fee: {metadata?.genesis_fee}</p>
        <p>Inscription Blocktime: {metadata?.genesis_height} </p>
        <p>Inscription Clocktime: {metadata?.timestamp} </p>
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
  width: 16rem;
  height: 16rem;
  image-rendering: pixelated;
`;

const TextContainer = styled.p`
  margin-bottom: 100px;
`;

const HtmlContainer = styled.iframe`
  width: 45rem;
  height: 40rem;
`

export default Inscription;