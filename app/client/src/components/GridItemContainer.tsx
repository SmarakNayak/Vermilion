import React, { useEffect, useRef, useState } from 'react';
import InnerInscriptionContent from './common/InnerInscriptionContent';
import GridTag from './common/GridTag';
import { addCommas, shortenBytesString } from '../utils/format';
import theme from '../styles/theme';
import {
  UnstyledLink,
  TextLink,
  ItemContainer,
  MediaContainer,
  ContentOverlay,
  ItemText,
  InfoContainer,
  TagContainer
} from './common/GridItemStyles';

const GridItemContainer = (props: any) => {
  const [binaryContent, setBinaryContent] = useState<Blob|null>(null);
  const [blobUrl, setBlobUrl] = useState<string|null>(null);
  const [textContent, setTextContent] = useState<string|null>(null);
  const [rawContentType, setRawContentType] =useState<string|null>(null);
  const [contentType, setContentType] = useState<string|null>(null);

  // state for 3d
  const [modelUrl, setModelUrl] = useState<string|null>(null);
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
        case "audio/opus":
          setContentType("audio");
          break;
        case "audio/ogg":
          setContentType("audio");
          break;
        case "audio/ogg; codecs=opus":
          setContentType("audio");
          break;
        case "audio/ogg;codecs=opus":
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
      if((contentType==="text" || contentType==="svg" || contentType==="html") && binaryContent) {
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
  ? (props.numberVisibility && !props.rune && !props.is_boost && !props.is_child && !props.is_recursive && !(props.content_length > 2000000) && !(props.item_name?.length > 0))
  : (props.numberVisibility && !props.collection && !props.rune && !props.is_boost && !props.is_child && !props.is_recursive && !(props.content_length > 2000000));
  
  return(
  <ItemContainer>
    <UnstyledLink 
      to={'/inscription/' + props.number}
    >
      <MediaContainer>
        {/*@ts-ignore*/}
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
          {props.is_boost && (
            <GridTag
              color={theme.colors.text.secondary}
              value={'Boost'}
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

export default GridItemContainer;
