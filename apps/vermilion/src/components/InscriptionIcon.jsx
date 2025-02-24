import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { BlockIcon, ImageIcon } from './common/Icon';

//no dependancy on metadata endpoint!
const InscriptionIcon = (props) => {
  const [binaryContent, setBinaryContent] = useState(null);
  const [blobUrl, setBlobUrl] = useState(null);
  const [rawContentType, setRawContentType] = useState(null);
  const [contentType, setContentType] = useState(null);

  // state for 3d
  const [modelUrl, setModelUrl] = useState(null);
  const modelViewerRef = useRef(null);

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
          setContentType("unsupported");
          break;
        case "model/gltf+json":
          setContentType("model");
          setModelUrl(url);  // Set the modelUrl for 3D models
          break;
        default:
          setContentType("unsupported");
          break;
      }
    }

    fetchContent();
  },[props.endpoint])

  // render 3d inscriptions
  useEffect(() => {
    if (contentType === 'model' && modelUrl) {
      const modelViewer = modelViewerRef.current;
      if (modelViewer) {
        modelViewer.src = modelUrl;
        modelViewer.alt = "3D model";
        modelViewer.autoRotate = true;
        modelViewer.cameraControls = true;
        modelViewer.environmentImage = "neutral";
        modelViewer.shadowIntensity = 1;
        modelViewer.exposure = 0.7;  // Adjust this for overall brightness
        modelViewer.style.backgroundColor = "transparent";
      }
    }
  }, [contentType, modelUrl]);

  return (
    <IconContainer>
      {
        {
          'image': <ImageContainer src={blobUrl} />,
          'svg': <ImageContainer src={props.endpoint} scrolling='no' sandbox='allow-scripts allow-same-origin' loading="lazy"/>,
          'html': <HtmlContainer><StyledIframe src={props.endpoint} scrolling='no' sandbox='allow-scripts allow-same-origin' loading="lazy"></StyledIframe></HtmlContainer>,
          'text': props.useBlockIconDefault ? <BlockIcon size={'1rem'} color={'#E34234'} /> : <ImageIcon size={'1rem'} color={'#E34234'}></ImageIcon>,
          'video': <VideoContainer controls loop muted autoplay><source src={blobUrl} type={rawContentType}/></VideoContainer>,
          'audio': props.useBlockIconDefault ? <BlockIcon size={'1rem'} color={'#E34234'} /> : <ImageIcon size={'1rem'} color={'#E34234'}></ImageIcon>,
          'pdf': props.useBlockIconDefault ? <BlockIcon size={'1rem'} color={'#E34234'} /> : <ImageIcon size={'1rem'} color={'#E34234'}></ImageIcon>,
          'model': modelUrl ? (
            <ModelViewerContainer>
              <model-viewer
              ref={modelViewerRef}
              // camera-controls
              disable-zoom
              auto-rotate
              ar
              ar-status="not-presenting"
              interaction-prompt="none"
              loading="lazy"
              touch-action="none"
              src={modelUrl}
              style={{height: '100%', width: '100%'}}
              >
                <div slot="progress-bar" />
              </model-viewer>
            </ModelViewerContainer>
          ) : <TextContainer loading isCentered>Loading 3D model...</TextContainer>,   
          'unsupported': props.useBlockIconDefault ? <BlockIcon size={'1rem'} color={'#E34234'} /> : <ImageIcon size={'1rem'} color={'#E34234'}></ImageIcon>,
          'loading': props.useBlockIconDefault ? <BlockIcon size={'1rem'} color={'#E34234'} /> : <ImageIcon size={'1rem'} color={'#E34234'}></ImageIcon>
        }[contentType]
      }
    </IconContainer>
  )
}

const IconContainer = styled.div`
  width: 2.25rem;
  height: 2.25rem;
  border-radius: 0.25rem;
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
  border-radius: 0.25rem;
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
  border-radius: 0.25rem;
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
  border-radius: 0.25rem;
  resize: none;
`;

const VideoContainer = styled.video`
  width: 100%;
  height: auto;
  aspect-ratio: 1/1;
  border-radius: 0.25rem;
`

const StyledIframe = styled.iframe`
  border: none;
  //flex: 0 100%;
  //flex-grow: 1;
  width: 100%;
  resize: both;
  aspect-ratio: 1/1;
  resize: none;
  border-radius: 0.25rem;
`;

const ModelViewerContainer = styled.div`
  width: 100%;
  height: 100%;
  aspect-ratio: 1/1;
`;

const TextContainer = styled.div`
  max-width: 100%;
  max-height: 100%;
  min-width: 100%; /* Ensures scaling up */
  min-height: 100%; /* Ensures scaling up */
  width: auto;
  height: auto;
  display: flex;
  align-items: ${props => props.isCentered ? 'center' : ''};
  justify-content: ${props => props.isCentered ? 'center' : ''};
  margin: 0;
  font-size: .875rem;
  font-family: Relative Trial Medium;
  color: ${props => props.loading ? '#959595' : '#000000'};
  object-fit: contain;
  aspect-ratio: 1/1;
  border-radius: 0.25rem;
  filter: drop-shadow(0 8px 24px rgba(158,158,158,.2));
  transition: 
    background-color 350ms ease,
    transform 150ms ease;
  transform-origin: center center;

  white-space-collapse: preserve;
  overflow: hidden;
  text-overflow: ellipsis;
  text-wrap: wrap;
`;

export default InscriptionIcon;
