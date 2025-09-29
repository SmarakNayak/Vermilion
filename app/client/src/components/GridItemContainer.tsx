import React, { useEffect, useRef, useState, useMemo, useReducer } from 'react';
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
  TagContainer,
  InfoTopRowContainer,
  HoverableItemContainer
} from './common/GridItemStyles';
import { DeleteIcon } from './common/Icon/icons/DeleteIcon';
import { InlineActionDropdown, ActionDropdownItem } from './common/InlineActionDropdown';

type ContentState = {
  blobUrl: string | null;
  textContent: string | null;
  rawContentType: string | null;
  contentType: string | null;
  modelUrl: string | null;
};

type ContentAction =
  | { type: 'SET_LOADING' }
  | { type: 'SET_CONTENT'; payload: Partial<ContentState> };

const contentReducer = (state: ContentState, action: ContentAction): ContentState => {
  switch (action.type) {
    case 'SET_LOADING':
      return {
        ...state,
        blobUrl: null,
        textContent: null,
        contentType: 'loading'
      };
    case 'SET_CONTENT':
      return {
        ...state,
        ...action.payload
      };
    default:
      return state;
  }
};

const GridItemContainer = (props: any) => {
  // we use a reducer to save re-renders
  // when they were separate states, it re-rendered on every setState call
  const [contentState, dispatch] = useReducer(contentReducer, {
    blobUrl: null,
    textContent: null,
    rawContentType: null,
    contentType: null,
    modelUrl: null
  });

  const { blobUrl, textContent, rawContentType, contentType, modelUrl } = contentState;

  // state for display name
  const displayName = props.item_name && props.item_name.trim() !== "" ? props.item_name : addCommas(props.number);

  //Update content
  useEffect(() => {
    const fetchContent = async () => {
      dispatch({ type: 'SET_LOADING' });
      //1. Get content
      const response = await fetch("/api/inscription_number/"+props.number);
      //2. Assign local url
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      //3. Work out type
      let content_type = response.headers.get("content-type");
      switch (content_type) {
        //Image types
        case "image/png":
          content_type = "image";
          break;
        case "image/jpeg":
          content_type = "image";
          break;
        case "image/jpg":
          content_type = "image";
          break;
        case "image/webp":
          content_type = "image";
          break;
        case "image/svg+xml":
          content_type = "svg";
          break;
        case "image/gif":
          content_type = "image";
          break;
        case "image/avif":
          content_type = "image";
          break;
        //Text types
        case "text/plain;charset=utf-8":
          content_type = "text";
          break;
        case "application/json":
          content_type = "text";
          break;
        case "text/plain":
          content_type = "text";
          break;
        case "text/rtf":
          content_type = "text";
          break;
        //Html types
        case "text/html;charset=utf-8":
          content_type = "html";
          break;
        case "text/html":
          content_type = "html";
          break;
        //Video types
        case "video/mp4":
          content_type = "video";
          break;
        case "video/webm":
          content_type = "video";
          break;
        //Audio types
        case "audio/mpeg":
          content_type = "audio";
          break;
        case "audio/opus":
          content_type = "audio";
          break;
        case "audio/ogg":
          content_type = "audio";
          break;
        case "audio/ogg; codecs=opus":
          content_type = "audio";
          break;
        case "audio/ogg;codecs=opus":
          content_type = "audio";
          break;
        //Pdf types
        case "application/pdf":
          content_type = "pdf";
          break;
        //Model types
        case "model/gltf-binary":
          content_type = "unsupported";
          break;
        case "model/gltf+json":
          content_type = "model";
          break;
        default:
          content_type = "unsupported";
          break;
      }

      // Process text content and check for recursive SVG
      let textContent = null;
      if (content_type === "text" || content_type === "svg" || content_type === "html") {
        const text = await blob.text();
        textContent = text;
        // Check for recursive SVG
        if (content_type === "svg" && text.includes("/content")) {
          content_type = "svg-recursive";
        }
      }

      // Set all final state in one dispatch
      dispatch({
        type: 'SET_CONTENT',
        payload: {
          blobUrl: url,
          textContent,
          rawContentType: response.headers.get("content-type"),
          contentType: content_type,
          modelUrl: content_type === "model" ? url : null
        }
      });
    }

    fetchContent();
  },[props.number])

  const shouldApplySpace = props.isCollectionPage
  ? (props.numberVisibility && !props.rune && !props.is_boost && !props.is_child && !props.is_recursive && !(props.content_length > 2000000) && !(props.item_name?.length > 0))
  : (props.numberVisibility && !props.collection && !props.rune && !props.is_boost && !props.is_child && !props.is_recursive && !(props.content_length > 2000000));

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  return(
  <HoverableItemContainer>
    <UnstyledLink 
      to={props.isGalleryPage ? '/gallery/' + props.id : '/inscription/' + props.number}
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
        <InfoTopRowContainer>
          <TextLink to={props.isGalleryPage ? '/gallery/' + props.id : '/inscription/' + props.number} >
            <ItemText>{props.isCollectionPage || props.isGalleryPage ? displayName : addCommas(props.number)}</ItemText>
          </TextLink>
          {props?.showInlineActionDropdown && (
            <InlineActionDropdown isOpen={isDropdownOpen} setIsOpen={setIsDropdownOpen}>
              <ActionDropdownItem onClick={(e) => props?.onDeleteClick() }>
                <DeleteIcon size ='1.25rem'/>Remove inscription
              </ActionDropdownItem>
            </InlineActionDropdown>
          )}
        </InfoTopRowContainer>
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
          {props.onChainArtist && (
            <GridTag
              color={theme.colors.background.verm}
              value={props.onChainArtist}
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
  </HoverableItemContainer>
  )
}

export default GridItemContainer;
