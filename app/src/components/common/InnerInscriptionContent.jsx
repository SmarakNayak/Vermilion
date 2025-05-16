import React, { use, useEffect, useRef, useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { BlockIcon, ImageIcon } from './Icon';
import theme from '../../styles/theme';

const InnerInscriptionContent = ({
  contentType: initialContentType,
  blobUrl,
  number,
  metadata,
  textContent,
  modelUrl,
  serverHTML,
  isIcon,
  endpoint,
  useBlockIconDefault,
  useFeedStyles
  // isLoading,
  // isCentered = false,
}) => {

  // Add state to track the actual content type
  const [contentType, setContentType] = useState(initialContentType);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (useFeedStyles) {
      setIsLoading(true);
    }
  }, [useFeedStyles]);

  // Add effect to handle recursive SVGs
  useEffect(() => {
    // Check if this is a recursive SVG that needs special handling
    if(metadata?.is_recursive && contentType=="svg") {
      setContentType("svg-recursive")
    } else {
      setContentType(initialContentType);
    }
  }, [initialContentType, metadata]);  

  // Reference for 3D model viewer
  const modelViewerRef = useRef(null);

  // Handle 3D model rendering
  useEffect(() => {
    if (contentType === 'model' && modelUrl && modelViewerRef.current) {
      const modelViewer = modelViewerRef.current;
      modelViewer.src = modelUrl;
      modelViewer.alt = "3D model";
      modelViewer.autoRotate = true;
      modelViewer.cameraControls = true;
      modelViewer.environmentImage = "neutral";
      modelViewer.shadowIntensity = 1;
      modelViewer.exposure = 0.7;
      modelViewer.style.backgroundColor = "transparent";
    }
  }, [contentType, modelUrl]);

  // Early return for loading state
  if (!contentType || contentType === 'loading') {
    return <SkeletonContainer />;
  }

  // Special case for icon mode with certain content types
  if (isIcon && (contentType === 'text' || contentType === 'audio' || 
    contentType === 'pdf' || contentType === 'unsupported')) {
  return useBlockIconDefault ? 
    <BlockIcon size={'1rem'} color={theme.colors.background.verm} /> : 
    <ImageIcon size={'1rem'} color={theme.colors.background.verm} />;
  }

  

  // Render content based on contentType
  switch(contentType) {

    // Render image content - use blobUrl for both page/grid and icon
    case 'image':

      return (
        <>
          {isLoading && <SkeletonContainer />}
          <ImageContainer 
            src={blobUrl} 
            alt={`Inscription ${number}`}
            onLoad={() => setIsLoading(false)}
            style={{ display: isLoading ? 'none' : 'block' }}
            useFeedStyles={useFeedStyles}
          />
        </>
      );
      
    // Render SVG content - use number for page/grid and endpoint + isIcon for icon
    case 'svg':
      return (
        <ImageContainer 
          src={isIcon ? endpoint : `/api/inscription_number/${number}`}
          alt={`SVG Inscription ${number}`}
          scrolling={isIcon ? "no" : undefined}
          sandbox={isIcon ? "allow-scripts allow-same-origin" : undefined}
          loading="lazy"
        />
      );
      
    // Render SVG content - use number for page/grid and endpoint + isIcon for icon  
    case 'svg-recursive':
      return (
        <SvgContainer 
          src={isIcon ? endpoint : `/api/inscription_number/${number}`}
          scrolling="no" 
          sandbox="allow-scripts" 
          loading="lazy"
        />
      );

    // Render HTML content - use id for page, id + serverHTML for grid, and endpoint + isIcon for icon  
    case 'html':
      return serverHTML ? (
        <ImageContainer 
          src={"/bun/rendered_content/" + metadata?.id}
          alt={`HTML Inscription ${number}`}
        />
      ) : (
        <HtmlContainer>
          <StyledIframe 
            src={isIcon ? endpoint : `/content/${metadata?.id}`} 
            scrolling="no" 
            sandbox="allow-scripts" 
            loading="lazy"
          />
        </HtmlContainer>
      );
    
    // Render text content - use textContent for page/grid (fallback for icon)  
    case 'text':
      return (
        <TextContainer>
          <MediaText>{textContent}</MediaText>
        </TextContainer>
      );
      
    // Render video content - use blobUrl for both page/grid and icon
    case 'video':
      return (
        <VideoContainer controls loop muted>
          <source src={blobUrl} type={metadata?.content_type} />
        </VideoContainer>
      );
      
    // Render audio content - use blobUrl for page/grid (fallback for icon)
    case 'audio':
      return (
        <AudioContainer controls>
          <source src={blobUrl} type={metadata?.content_type} />
        </AudioContainer>
      );
      
    // Render PDF content - not supported message for page/grid (fallback for icon)
    case 'pdf':
      return <TextContainer>PDF not yet supported</TextContainer>;
      
    // Render 3D model content - use modelUrl for both page/grid and icon
    case 'model':
      return modelUrl ? (
        <ModelViewerContainer>
          <model-viewer
            ref={modelViewerRef}
            camera-controls={isIcon ? false : true}
            disable-zoom={isIcon ? true : false}
            auto-rotate
            ar
            ar-status="not-presenting"
            interaction-prompt="none"
            loading="lazy"
            touch-action={isIcon ? "none" : "pan-y"}
            src={modelUrl}
            style={{ height: '100%', width: '100%' }}
          >
            <div slot="progress-bar" />
          </model-viewer>
        </ModelViewerContainer>
      ) : (
        <TextContainer loading isCentered>Loading 3D model...</TextContainer>
      );
      
    case 'unsupported':
      return (
        <TextContainer unsupported isCentered>
          {metadata?.content_type || 'Unknown'} content type not yet supported
        </TextContainer>
      );
      
    // case 'loading':
    // default:
    //   return <SkeletonContainer />;
  }
};

const ImageContainer = styled.img`
  max-width: ${props => props.useFeedStyles ? '32rem' : '100%'};
  max-height: ${props => props.useFeedStyles ? 'none' : '100%'};
  min-width: ${props => props.useFeedStyles ? 'none' : '100%'};
  min-height: ${props => props.useFeedStyles ? 'none' : '100%'};
  width: ${props => props.useFeedStyles ? '32rem' : 'auto'};
  height: auto;
  object-fit: contain;
  aspect-ratio: ${props => props.useFeedStyles ? '' : '1/1'};
  image-rendering: pixelated;

  @media (max-width: 544px) {
    width: ${props => props.useFeedStyles ? '100%' : ''};
    max-width: ${props => props.useFeedStyles ? '100%' : ''};
  }
`;

const SvgContainer = styled.iframe`
  max-width: 100%;
  max-height: 100%;
  min-width: 100%;
  min-height: 100%;
  width: 100%;
  height: 100%;
  object-fit: contain;
  aspect-ratio: 1/1;
  image-rendering: pixelated;
  border: none;
  background: transparent;
`;

const TextContainer = styled.div`
  background-color: ${theme.colors.background.white};
  box-sizing: border-box;
  padding: .5rem;
  max-width: 100%;
  max-height: 100%;
  min-width: 100%;
  min-height: 100%;
  width: auto;
  height: auto;
  display: flex;
  align-items: ${props => props.isCentered ? 'center' : ''};
  justify-content: ${props => props.isCentered ? 'center' : ''};
  margin: 0;
  font-size: .875rem;
  font-family: ${theme.typography.fontFamilies.medium};
  color: ${theme.colors.text.primary};
  object-fit: contain;
  aspect-ratio: 1/1;
  white-space-collapse: preserve;
  overflow: hidden;
  overflow-y: scroll;
  text-wrap: wrap;

  @media (max-width: 864px) {
    border: 2px solid ${theme.colors.border};
  }
`;

const HtmlContainer = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0;
  padding: 0;
  aspect-ratio: 1/1;
  overflow: hidden;
  background-color: transparent;
  position: relative;
`;

const StyledIframe = styled.iframe`
  border: none;
  width: 100%;
  height: 100%;
  flex: 1;
  min-height: 100%;
  min-width: 100%;
  aspect-ratio: 1/1;
  background: transparent;
  overflow: hidden;
`;

const AudioContainer = styled.audio`
  margin-top: auto;
  margin-bottom: auto;
`;

const VideoContainer = styled.video`
  width: 100%;
  height: auto;
  aspect-ratio: 1/1;
`;

const ModelViewerContainer = styled.div`
  width: 100%;
  height: 100%;
  aspect-ratio: 1/1;
`;

const MediaText = styled.p`
  font-family: ${theme.typography.fontFamilies.medium};
  font-size: .875rem;
  color: ${theme.colors.text.primary};
  margin: 0;
  padding: 0;
  overflow-wrap: break-word;
  word-break: break-word;
  white-space: pre-wrap;
`;

// const pulse = keyframes`
//   0%, 100% {
//     opacity: 1;
//   }
//   50% {
//     opacity: .5;
//   }
// `;

// const SkeletonContainer = styled.div`
//   width: 100%;
//   height: 100%;
//   aspect-ratio: 1/1;
//   background-color: ${theme.colors.border};
//   animation: ${pulse} 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
//   // border-radius: .5rem;
//   border: .0625rem solid ${theme.colors.border};

//   @media (max-width: 544px) {
//     width: 100%;
//     max-width: 100%;
//     height: 100vw;
//   }
// `;

const shimmer = keyframes`
  0% {
    background-position: -1000px 0;
  }
  100% {
    background-position: 1000px 0;
  }
`;

const SkeletonContainer = styled.div`
  width: 100%;
  height: 100%;
  aspect-ratio: 1/1;
  background: linear-gradient(90deg, #F3F3F3 25%, #F9F9F9 50%, #F3F3F3 75%);
  // background-size: 1000px 100%;
  animation: ${shimmer} 4s infinite linear;
  // border-radius: .5rem;
  // border: .0625rem solid ${theme.colors.border};

  @media (max-width: 544px) {
    width: 100%;
    max-width: 100%;
    height: 100vw;
  }
`;

export default InnerInscriptionContent;
