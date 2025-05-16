import React, { useRef } from 'react';
import styled from 'styled-components';

const MediaDisplay = ({ 
  contentType, 
  blobUrl, 
  number, 
  textContent, 
  metadata,
  modelUrl,
  modelViewerRef
}) => {
  // Debug content type and metadata
  console.log(`MediaDisplay: contentType=${contentType}, number=${number}, metadata.id=${metadata?.id}`);
  
  // Early return for loading state
  if (!contentType || contentType === 'loading') {
    return <TextContainer loading isCentered>Loading...</TextContainer>;
  }
  
  // Render based on content type
  switch (contentType) {
    case 'image':
      return (
        <ImageContainer 
          src={blobUrl} 
          alt={`Inscription ${number}`} 
          onError={(e) => {
            console.error("Image load error:", e);
            e.target.onerror = null; // Prevent infinite error loops
            e.target.src = `/api/inscription_number/${number}`; // Try direct API endpoint as fallback
          }}
        />
      );
      
    case 'svg-recursive':
      // For recursive SVG content, use iframe with script permissions
      return (
        <SvgContainer 
          src={`/api/inscription_number/${number}`} 
          scrolling="no" 
          sandbox="allow-scripts allow-same-origin" 
          loading="lazy"
          title={`Recursive SVG Inscription ${number}`}
        />
      );
      
    case 'svg':
      // For regular SVG content, use image element for better performance
      return <ImageContainer src={`/api/inscription_number/${number}`} alt={`SVG Inscription ${number}`} />;
      
    case 'html':
      return (
        <HtmlContainer>
          <StyledIframe 
            src={`/content/${metadata?.id}`} 
            sandbox="allow-scripts allow-same-origin" 
            loading="lazy" 
            scrolling="no"
            title={`HTML Content for Inscription ${number}`}
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
          Your browser does not support the video tag.
        </VideoContainer>
      );
      
    case 'audio':
      return (
        <AudioContainer controls>
          <source src={blobUrl} type={metadata?.content_type} />
          Your browser does not support the audio tag.
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
    default:
      return (
        <TextContainer unsupported isCentered>
          {metadata?.content_type || 'Unknown'} content type not yet supported
        </TextContainer>
      );
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
  margin-top: 6rem;
  margin-bottom: 6rem;
  @media (max-width: 576px) {
    margin-top: 3rem;
    margin-bottom: 3rem;
  }
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

const ContentOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  height: 100%;
  width: 100%;
  z-index: 1;
`;

export default MediaDisplay;
