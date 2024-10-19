import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

const InscriptionContainer = (props) => {
  const [binaryContent, setBinaryContent] = useState(null);
  const [blobUrl, setBlobUrl] = useState(null);
  const [textContent, setTextContent] = useState(null);
  const [rawContentType, setRawContentType] =useState(null);
  const [contentType, setContentType] = useState(null);

  //Update content
  useEffect(() => {
    const fetchContent = async () => {
      setBlobUrl(null);
      setTextContent(null);
      setContentType("loading");
      //1. Get content
      const response = await fetch("/api/inscription_number/"+props.number);
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
  },[props.number])

  //Update text
  useEffect(()=> {
    const updateText = async () => {
      //1. Update text state variable if text type
      if(contentType==="text" || contentType==="svg" || contentType==="html") {
        const text = await binaryContent.text();
        setTextContent(text);
      }
    }
    updateText();    
  },[contentType])

  return(
    <div>
      {
        {
          'image': <ImageContainer src={blobUrl} />,
          'svg': <SvgContainer dangerouslySetInnerHTML={{__html: textContent}} />,
          'html': <HtmlContainer><StyledIframe src={"/content/" + props.id} scrolling='no'></StyledIframe></HtmlContainer>,
          'text': <TextContainer><p>{textContent}</p></TextContainer>,
          'video': <video controls loop muted autoplay><source src={blobUrl} type={rawContentType}/></video>,
          'audio': <audio controls><source src={blobUrl} type={rawContentType}/></audio>,
          'pdf': <TextContainer>pdf unsupported'</TextContainer>,
          'model': <TextContainer>gltf model type unsupported</TextContainer>,
          'unsupported': <TextContainer>{rawContentType} content type unsupported</TextContainer>,
          'loading': <TextContainer>loading...</TextContainer>
        }[contentType]
      }
    </div>
  )
}

const ImageContainer = styled.img`
  min-width:16rem;
  max-width:32rem;
  width: auto;
  height: auto;
  image-rendering: pixelated;
`;

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
  min-width: 35rem;
  min-height: 35rem;
`

const SvgContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height:12rem;
  min-width:24rem;
  max-width:32rem;
  width: auto;
  height: auto;
  image-rendering: pixelated;
`;

const StyledIframe = styled.iframe`
  border: none;
  //flex: 0 100%;
  //flex-grow: 1;
  width: 100%;
  resize: both;
  //aspect-ratio: 1/1;
`

export default InscriptionContainer;