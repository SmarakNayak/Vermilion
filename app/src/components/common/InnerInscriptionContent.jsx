import React, { useEffect, useRef, useState } from 'react';
import styled, { keyframes } from 'styled-components';
import theme from '../../styles/theme';

const InnerInscriptionContent = ({
  contentType,
  blobUrl,
  number,
  metadata,
  textContent,
  modelUrl,
  serverHTML,
  // isLoading,
  // isCentered = false,
}) => {

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

  // Render content based on contentType
  switch(contentType) {
    case 'image':
      return (
        <ImageContainer 
          src={blobUrl} 
          alt={`Inscription ${number}`}
        />
      );
      
    case 'svg-recursive':
      return (
        <SvgContainer 
          src={`/api/inscription_number/${number}`} 
          scrolling="no" 
          sandbox="allow-scripts allow-same-origin" 
          loading="lazy"
        />
      );
      
    case 'svg':
      return (
        <ImageContainer 
          src={`/api/inscription_number/${number}`} 
          alt={`SVG Inscription ${number}`}
        />
      );
      
    case 'html':
      return serverHTML ? (
        <ImageContainer 
          src={"/bun/rendered_content/" + metadata?.id}
          alt={`HTML Inscription ${number}`}
        />
      ) : (
        <HtmlContainer>
          <StyledIframe 
            src={`/content/${metadata?.id}`} 
            scrolling="no" 
            sandbox="allow-scripts allow-same-origin" 
            loading="lazy"
          />
        </HtmlContainer>
      );
      
    case 'text':
      return (
        <TextContainer>
          <MediaText>{textContent}</MediaText>
        </TextContainer>
      );
      
    case 'video':
      return (
        <VideoContainer controls loop muted autoPlay>
          <source src={blobUrl} type={metadata?.content_type} />
        </VideoContainer>
      );
      
    case 'audio':
      return (
        <AudioContainer controls>
          <source src={blobUrl} type={metadata?.content_type} />
        </AudioContainer>
      );
      
    case 'pdf':
      return <TextContainer>PDF not yet supported</TextContainer>;
      
    case 'model':
      return modelUrl ? (
        <ModelViewerContainer>
          <model-viewer
            ref={modelViewerRef}
            camera-controls
            auto-rotate
            ar
            ar-status="not-presenting"
            interaction-prompt="none"
            loading="lazy"
            touch-action="pan-y"
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
  max-width: 100%;
  max-height: 100%;
  min-width: 100%;
  min-height: 100%;
  width: auto;
  height: auto;
  object-fit: contain;
  aspect-ratio: 1/1;
  image-rendering: pixelated;
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
  background-color: #FFFFFF;
  border: 2px solid #F5F5F5;
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
  font-family: Relative Trial Medium;
  color: ${props => props.loading ? '#959595' : '#000000'};
  object-fit: contain;
  aspect-ratio: 1/1;
  white-space-collapse: preserve;
  overflow: hidden;
  overflow-y: scroll;
  text-wrap: wrap;
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
  font-family: Relative Trial Medium;
  font-size: .875rem;
  color: #000000;
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
  border: .0625rem solid ${theme.colors.border};

  @media (max-width: 544px) {
    width: 100%;
    max-width: 100%;
    height: 100vw;
  }
`;

export default InnerInscriptionContent;
