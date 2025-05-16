import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import InnerInscriptionContent from './common/InnerInscriptionContent';
import GridTag from './common/GridTag';
import { addCommas, shortenBytesString } from '../utils/format';
import theme from '../styles/theme';

const GridItemContainer = (props) => {
  const [binaryContent, setBinaryContent] = useState(null);
  const [blobUrl, setBlobUrl] = useState(null);
  const [textContent, setTextContent] = useState(null);
  const [rawContentType, setRawContentType] =useState(null);
  const [contentType, setContentType] = useState(null);

  // state for 3d
  const [modelUrl, setModelUrl] = useState(null);
  const modelViewerRef = useRef(null);

  // state for display name
  const displayName = props.item_name && props.item_name.trim() !== "" ? props.item_name : addCommas(props.number);

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

  const shouldApplySpace = props.isCollectionPage
  ? (props.numberVisibility && !props.rune && !props.is_child && !props.is_recursive && !(props.content_length > 2000000) && !(props.item_name?.length > 0))
  : (props.numberVisibility && !props.collection && !props.rune && !props.is_child && !props.is_recursive && !(props.content_length > 2000000));
  
  return(
  <ItemContainer>
    <UnstyledLink 
      to={'/inscription/' + props.number} 
      applySpace={shouldApplySpace}
    >
      <MediaContainer>
        <InnerInscriptionContent
          contentType={contentType}
          blobUrl={blobUrl}
          number={props.number}
          metadata={{
            id: props.id,
            content_type: rawContentType
          }}
          textContent={textContent}
          modelUrl={modelUrl}
          serverHTML={true}
        />
        <ContentOverlay />
      </MediaContainer>
    </UnstyledLink>
    
    {props.numberVisibility && (
      <InfoContainer applySpace={shouldApplySpace}>
        <TextLink to={'/inscription/' + props.number} >
          <ItemText>{props.isCollectionPage ? displayName : addCommas(props.number)}</ItemText>
        </TextLink>
        <TagContainer>
          {props.isCollectionPage && props.item_name?.length > 0 && (
            <GridTag
              color={theme.colors.text.secondary}
              value={addCommas(props.number)}
            />
          )}
          {!props.isCollectionPage && props.collection && (
            <GridTag 
              color={theme.colors.background.verm}
              link={`/collection/${encodeURIComponent(props.collection_symbol)}`}
              value={props.collection}
            />
          )}
          {props.rune && (
            <GridTag
              color={theme.colors.background.purp}
              value={props.rune}
            />
          )}
          {props.is_child && (
            <GridTag
              color={theme.colors.text.secondary}
              value={'Child'}
            />
          )}
          {props.is_recursive && (
            <GridTag
              color={theme.colors.text.secondary}
              value={'Recursive'}
            />
          )}
          {props.content_length > 1000000 && (
            <GridTag
              color={theme.colors.text.secondary}
              value={shortenBytesString(props.content_length)}
            />
          )}
        </TagContainer>
      </InfoContainer>
    )}
  </ItemContainer>
  )
}

const UnstyledLink = styled(Link)`
  color: unset;
  text-decoration: unset;
  width: 100%; 
  display: block; 
`;

const TextLink = styled(Link)`
  color: unset;
  text-decoration: unset;
  display: block; 
`;

const ItemContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: .75rem;
  width: 100%;
`;

const MediaContainer = styled.div`
  background-color: ${theme.colors.background.primary};
  border-radius: .125rem;
  padding: 16% 10%;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 80%;
  height: auto;
  aspect-ratio: 1/1;
  cursor: pointer;
  transition: background-color 200ms ease;
  position: relative;

  &:hover {
    background-color: ${theme.colors.border};
  }
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
  font-size: 1rem;
  color: #121212;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.375rem;
  // width: 100%;
  text-decoration-line: underline;
  text-decoration-color: transparent;
  text-decoration-thickness: 2px;
  text-underline-offset: 2px;

  transition: 
    background-color 200ms ease,
    transform 200ms ease;
  transform-origin: center center;

  &:hover {
    text-decoration-color: #121212;
  }
`;

const InfoContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: .5rem;
  width: 100%;
  padding-bottom: ${props => props.applySpace ? '1.625rem' : '0'};
  margin-bottom: 1rem;
`;

const TagContainer = styled.div`
  display: flex;
  flex-direction: row;
  gap: .25rem;
  width: 100%;
  overflow: hidden; 
  white-space: nowrap; 
  
  /* Prioritize first tag */
  & > *:first-child {
    flex-shrink: 0; /* Don't shrink first tag */
    min-width: 1rem; /* Ensure first tag is always visible */
  }
  
  /* Make remaining tags share available space */
  & > *:not(:first-child) {
    flex-shrink: 1; /* Allow shrinking */
    min-width: 0; /* Allow complete shrinking if needed */
  }
`;

export default GridItemContainer;
