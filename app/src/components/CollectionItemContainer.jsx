import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { Link, useNavigate } from "react-router-dom";
import { addCommas } from '../utils/format'

const CollectionItemContainer = (props) => {
  const [binaryContent, setBinaryContent] = useState(null);
  const [blobUrl, setBlobUrl] = useState(null);
  const [textContent, setTextContent] = useState(null);
  const [rawContentType, setRawContentType] =useState(null);
  const [contentType, setContentType] = useState(null);

  // state for 3d
  const [modelUrl, setModelUrl] = useState(null);
  const modelViewerRef = useRef(null);

  const displayName = props.itemName && props.itemName.trim() !== "" ? props.itemName : `${addCommas(props.number)}`;

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
  },[props.number])

  //Update text & check for recursive svg
  useEffect(()=> {
    const updateText = async () => {
      //1. Update text state variable if text type
      if(contentType==="text" || contentType==="svg" || contentType==="html") {
        const text = await binaryContent.text();
        setTextContent(text);
        if(contentType==="svg" && text.includes("/content")) {
          setContentType("svg-recursive")
        }
      }
    }
    updateText();    
  },[contentType]);

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

  return(
    <UnstyledLink 
      to={'/inscription/' + props.number} 
    >
      <ItemContainer>
        <MediaContainer>
          {
            {
              'image': <ImageContainer src={blobUrl} />,
              'svg': <ImageContainer src={"/api/inscription_number/"+ props.number} />,
              'svg-recursive': <SvgContainer src={"/api/inscription_number/"+ props.number} scrolling='no' sandbox='allow-scripts allow-same-origin' loading="lazy"/>,
              'html': <ImageContainer src={"/bun/rendered_content/" + props.id}></ImageContainer>,
              'text': <TextContainer><MediaText>{textContent}</MediaText></TextContainer>,
              'video': <video controls loop muted autoplay style={{width: '100%', height: 'auto', aspectRatio: '1/1'}}><ContentOverlay /><source src={blobUrl} type={rawContentType}/></video>,
              'audio': <audio controls><ContentOverlay /><source src={blobUrl} type={rawContentType}/></audio>,
              'pdf': <TextContainer>PDF not yet supported</TextContainer>,
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
              'unsupported': <TextContainer isCentered>{rawContentType} content type not yet supported</TextContainer>,
              'loading': <TextContainer loading isCentered>Loading...</TextContainer>
            }[contentType]
          }
        </MediaContainer>
        {props.numberVisibility && (
          <InfoContainer>
            <ItemText isPrimary>{displayName}</ItemText>
            <ItemText>{addCommas(props.number)}</ItemText>
          </InfoContainer>
        )}
      </ItemContainer>

    </UnstyledLink>
  )
}

const UnstyledLink = styled(Link)`
  color: unset;
  text-decoration: unset;
  margin-bottom: ${props => props.applyMargin ? '1.625rem' : '0'};
`

const ItemContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: .75rem;
  cursor: pointer;
  width: 100%;
`;

const MediaContainer = styled.div`
  background-color: #F5F5F5;
  border-radius: .25rem;
  padding: 15%;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 70%;
  height: auto;
  aspect-ratio: 1/1;
  transition: 
    background-color 350ms ease,
    transform 150ms ease;
  transform-origin: center center;

  ${ItemContainer}:hover & {
    background-color: #E9E9E9;
  }
`;

const ImageContainer = styled.img`
  max-width: 100%;
  max-height: 100%;
  min-width: 100%; /* Ensures scaling up */
  min-height: 100%; /* Ensures scaling up */
  width: auto;
  height: auto;
  object-fit: contain;
  aspect-ratio: 1/1;
  image-rendering: pixelated;
  filter: drop-shadow(0 8px 24px rgba(158,158,158,.2));
  transition: 
    background-color 350ms ease,
    transform 150ms ease;
  transform-origin: center center;

  // ${ItemContainer}:hover & {
  //   transform: scale(1.03);
  // }
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
  filter: drop-shadow(0 8px 24px rgba(158,158,158,.2));
  transition: 
    background-color 350ms ease,
    transform 150ms ease;
  transform-origin: center center;

  // ${ItemContainer}:hover & {
  //   transform: scale(1.03);
  // }

  white-space-collapse: preserve;
  overflow: hidden;
  text-overflow: ellipsis;
  text-wrap: wrap;
`;

const MediaText = styled.p`
  font-family: Relative Trial Medium;
  font-size: .875rem;
  color: #000000;
  margin: 0;
  padding: 0;
  overflow-wrap: break-word;
  word-break: break-word;
  white-space: pre-wrap;
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
  filter: drop-shadow(0 8px 24px rgba(158,158,158,.2));
  transition: all 350ms ease;  transition: 
    background-color 350ms ease,
    transform 150ms ease;
  transform-origin: center center;

  // ${ItemContainer}:hover & {
  //   transform: scale(1.03);
  // }

  overflow: hidden;
  text-overflow: ellipsis;
  text-wrap: wrap;
`;

const SvgContainer = styled.iframe`
  border: none;
  max-width: 100%;
  max-height: 100%;
  min-width: 100%; /* Ensures scaling up */
  min-height: 100%; /* Ensures scaling up */
  width: auto;
  height: auto;
  object-fit: contain;
  aspect-ratio: 1/1;
  image-rendering: pixelated;
  filter: drop-shadow(0 8px 24px rgba(158,158,158,.2));
  transition: 
    background-color 350ms ease,
    transform 150ms ease;
  transform-origin: center center;

  // ${ItemContainer}:hover & {
  //   transform: scale(1.03);
  // }
`;

const StyledIframe = styled.iframe`
  border: none;
  //flex: 0 100%;
  //flex-grow: 1;
  width: 100%;
  resize: both;
  //aspect-ratio: 1/1;
`;

const ModelViewerContainer = styled.div`
  width: 100%;
  height: 100%;
  aspect-ratio: 1/1;
`;

const ContentOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  height: 100%;
  width: 100%;
  cursor: pointer;
`;

const ItemText = styled.p`
  font-size: ${props => props.isPrimary ? '1rem' : '.875rem'};
  color: ${props => props.isPrimary ? '#000000' : '#959595'};
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%;

  transition: 
    background-color 350ms ease,
    transform 150ms ease;
  transform-origin: center center;

  // ${ItemContainer}:hover & {
  //   color: #000000;
  // }
`;

const InfoContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: .5rem;
  cursor: pointer;
  width: 100%;
`;

const MetadataContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  height: 1.125rem;
  gap: .25rem;
  cursor: pointer;
  margin: 0;
  padding: 0;
  font-size: .875rem;
  font-family: Relative Trial Medium;
  color: ${props => props.isRune ? '#D23B75' : '#E34234'};
`;

export default CollectionItemContainer;
