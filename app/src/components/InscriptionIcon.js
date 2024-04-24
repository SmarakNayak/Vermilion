import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import ImageIcon from '../assets/icons/ImageIcon';
import BlockIcon from '../assets/icons/BlockIcon';


//no dependancy on metadata endpoint!
const InscriptionIcon = (props) => {
  const [binaryContent, setBinaryContent] = useState(null);
  const [blobUrl, setBlobUrl] = useState(null);
  const [rawContentType, setRawContentType] = useState(null);
  const [contentType, setContentType] = useState(null);

  useEffect(() => {
    const fetchContent = async () => {
      setBlobUrl(null);
      setContentType("loading");
      //1. Get content
      const response = await fetch(props.endpoint);
      //2. Assign local url
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setBinaryContent(blob);
      setBlobUrl(url);
      //3. Work out type
      let content_type = response.headers.get("content-type");
      setRawContentType(content_type);
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

    fetchContent();
  },[props.endpoint])

  return (
    <IconContainer>
      {
        {
          'image': <ImageContainer src={blobUrl} />,
          'svg': <ImageContainer src={props.endpoint} scrolling='no' sandbox='allow-scripts allow-same-origin' loading="lazy"/>,
          'html': <HtmlContainer><StyledIframe src={props.endpoint} scrolling='no' sandbox='allow-scripts allow-same-origin' loading="lazy"></StyledIframe></HtmlContainer>,
          'text': props.useBlockIconDefault ? <BlockIcon svgSize={'2rem'} svgColor={'#E34234'} /> : <ImageIcon svgSize={'2rem'} svgColor={'#E34234'}></ImageIcon>,
          'video': <VideoContainer controls loop muted autoplay><source src={blobUrl} type={rawContentType}/></VideoContainer>,
          'audio': props.useBlockIconDefault ? <BlockIcon svgSize={'2rem'} svgColor={'#E34234'} /> : <ImageIcon svgSize={'2rem'} svgColor={'#E34234'}></ImageIcon>,
          'pdf': props.useBlockIconDefault ? <BlockIcon svgSize={'2rem'} svgColor={'#E34234'} /> : <ImageIcon svgSize={'2rem'} svgColor={'#E34234'}></ImageIcon>,
          'model': props.useBlockIconDefault ? <BlockIcon svgSize={'2rem'} svgColor={'#E34234'} /> : <ImageIcon svgSize={'2rem'} svgColor={'#E34234'}></ImageIcon>,
          'unsupported': props.useBlockIconDefault ? <BlockIcon svgSize={'2rem'} svgColor={'#E34234'} /> : <ImageIcon svgSize={'2rem'} svgColor={'#E34234'}></ImageIcon>,
          'loading': props.useBlockIconDefault ? <BlockIcon svgSize={'2rem'} svgColor={'#E34234'} /> : <ImageIcon svgSize={'2rem'} svgColor={'#E34234'}></ImageIcon>
        }[contentType]
      }
    </IconContainer>
  )
}

const IconContainer = styled.div`
width: 3.75rem;
height: 3.75rem;
border-radius: 0.5rem;
background-color: #F5F5F5;
display: flex;
align-items: center;
justify-content: center;
`

const ImageContainer = styled.img`
  max-width: 100%;
  max-height: 100%;
  min-width: 100%; /* Ensures scaling up */
  min-height: 100%; /* Ensures scaling up */
  width: auto;
  height: auto;
  object-fit: contain;
  aspect-ratio: 1/1;
  //image-rendering: pixelated;
  border-radius: 0.5rem;
`;

const SvgContainer = styled.iframe`
  max-width: 100%;
  max-height: 100%;
  min-width: 100%; /* Ensures scaling up */
  min-height: 100%; /* Ensures scaling up */
  width: auto;
  height: auto;
  object-fit: contain;
  aspect-ratio: 1/1;
  image-rendering: pixelated;
  border-radius: 0.5rem;
`;

const HtmlContainer = styled.div`
  max-width: 100%;
  max-height: 100%;
  min-width: 100%; /* Ensures scaling up */
  min-height: 100%; /* Ensures scaling up */
  width: auto;
  height: auto;
  display: flex;
  margin: 0;
  font-size: .875rem;
  font-family: monospace;
  white-space-collapse: preserve;
  object-fit: contain;
  aspect-ratio: 1/1;
  overflow: hidden;
  text-overflow: ellipsis;
  text-wrap: wrap;
  border-radius: 0.5rem;
`;

const VideoContainer = styled.video`
  width: 100%;
  height: auto;
  aspect-ratio: 1/1;
`

const StyledIframe = styled.iframe`
  border: none;
  //flex: 0 100%;
  //flex-grow: 1;
  width: 100%;
  resize: both;
  aspect-ratio: 1/1;
`;

export default InscriptionIcon;