import { useParams } from 'react-router-dom';
import React, { useEffect, useRef, useState, useCallback } from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';

// Components from Inscription folder
import {
  CollectionInfo,
  CollectionMetadata,
  DetailsSection,
  MediaDisplay,
  ProvenanceSection,
  SatributeSection,
  SectionHeader,
} from '../components/Inscription';

// Layout components
import {
  MainContainer,
  ContentContainer,
  MediaContainer,
  InfoContainer,
  DataContainer,
  SectionPadding,
  SimilarContentContainer,
  SectionContainer,
  SectionHeaderContainer,
  SimilarText
} from '../components/Inscription/Layout';

// Skeleton components
import { 
  LoadingSkeleton, 
  CompactLoadingSkeleton, 
  StatsSkeleton 
} from '../components/Inscription/LoadingSkeleton';

// Other components
import Gallery from '../components/Gallery';
import InnerInscriptionContent from '../components/common/InnerInscriptionContent';
import MainText from '../components/common/text/MainText';
import IconButton from '../components/common/buttons/IconButton';
import Spinner from '../components/Spinner';
import InscriptionIcon from '../components/InscriptionIcon';
import CheckoutModal from '../components/modals/CheckoutModal';
import BoostsModal from '../components/modals/BoostsModal';
import CommentsModal from '../components/modals/CommentsModal';
import { BookmarkDropdown } from '../components/menus/BookmarkDropdown';

// Utils
import { addCommas, formatAddress, shortenBytes } from '../utils/format';
import { copyText } from '../utils/clipboard';

// Icons
import { 
  InfoCircleIcon, 
  FileIcon, 
  RouteIcon, 
  TagIcon, 
  SparklesIcon,
  CommentIcon,
  ChevronUpDuoIcon,
  LinkIcon,
  WebIcon,
  CrossIcon,
  MinusIcon,
  PlusIcon,
  ArrowRotateIcon,
  CheckIcon,
  ClockIcon,
  ScanIcon,
  BookmarkIcon,
  BookmarkIconFilled
} from '../components/common/Icon';
import theme from '../styles/theme';
import Tooltip from '../components/common/Tooltip';
import { useClickOutside } from '../hooks/useClickOutside';

// Custom hook for handling section visibility
const useSectionVisibility = (initialState) => {
  const [visibility, setVisibility] = useState(initialState);
  
  const toggleSection = useCallback((section) => {
    setVisibility(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  }, []);
  
  return [visibility, toggleSection];
};

// Custom hook for fetching inscription content
const useInscriptionContent = (number) => {
  const [state, setState] = useState({
    binaryContent: null,
    blobUrl: null,
    textContent: null,
    contentType: null,
    modelUrl: null,
    isLoading: true
  });

  useEffect(() => {
    const fetchContent = async () => {
      try {
        setState(prev => ({
          ...prev, 
          blobUrl: null, 
          textContent: null, 
          contentType: "loading", 
          modelUrl: null
        }));

        const response = await fetch(`/api/inscription_number/${number}`);
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        
        let content_type = response.headers.get("content-type");
        let contentTypeCategory;
        
        // Determine content type category
        switch (content_type) {
          //Image types
          case "image/png":
            contentTypeCategory = "image";
            break;
          case "image/jpeg":
            contentTypeCategory = "image";
            break;
          case "image/jpg":
            contentTypeCategory = "image";
            break;
          case "image/webp":
            contentTypeCategory = "image";
            break;
          case "image/svg+xml":
            contentTypeCategory = "svg";
            break;
          case "image/gif":
            contentTypeCategory = "image";
            break;
          case "image/avif":
            contentTypeCategory = "image";
            break;
          //Text types
          case "text/plain;charset=utf-8":
            contentTypeCategory = "text";
            break;
          case "application/json":
            contentTypeCategory = "text";
            break;
          case "text/plain":
            contentTypeCategory = "text";
            break;
          case "text/rtf":
            contentTypeCategory = "text";
            break;
          //Html types
          case "text/html;charset=utf-8":
            contentTypeCategory = "html";
            break;
          case "text/html":
            contentTypeCategory = "html";
            break;
          //Video types
          case "video/mp4":
            contentTypeCategory = "video";
            break;
          case "video/webm":
            contentTypeCategory = "video";
            break;
          //Audio types
          case "audio/mpeg":
            contentTypeCategory = "audio";
            break;
          case "audio/opus":
            contentTypeCategory = "audio";
            break;
          case "audio/ogg":
            contentTypeCategory = "audio";
            break;
          case "audio/ogg; codecs=opus":
            contentTypeCategory = "audio";
            break;
          case "audio/ogg;codecs=opus":
            contentTypeCategory = "audio";
            break;
          //Pdf types
          case "application/pdf":
            contentTypeCategory = "pdf";
            break;
          //Model types
          case "model/gltf-binary":
            contentTypeCategory = "unsupported";
            break;
          case "model/gltf+json":
            contentTypeCategory = "model";
            setModelUrl(url);  // Set the modelUrl for 3D models
            break;
          default:
            contentTypeCategory = "unsupported";
            break;
        }
        
        setState(prev => ({
          ...prev,
          binaryContent: blob,
          blobUrl: url,
          contentType: contentTypeCategory,
          modelUrl: contentTypeCategory === "model" ? url : null
        }));
        
      } catch (error) {
        console.error("Error fetching inscription content:", error);
        setState(prev => ({
          ...prev,
          contentType: "error"
        }));
      }
    };

    if (number) {
      fetchContent();
    }
  }, [number]);

  // Update text content when binary content changes
  useEffect(() => {
    const updateText = async () => {
      if (state.binaryContent && ["text", "svg", "html"].includes(state.contentType)) {
        try {
          const text = await state.binaryContent.text();
          setState(prev => ({ ...prev, textContent: text }));
        } catch (error) {
          console.error("Error converting binary to text:", error);
        }
      }
    };
    
    updateText();
  }, [state.binaryContent, state.contentType]);

  return state;
};

const Inscription = () => {
  const { number } = useParams();
  const [sectionVisibility, toggleSectionVisibility] = useSectionVisibility({
    details: true,
    collectionMetadata: true,
    provenance: true,
    satributes: true
  });
  
  // Content state
  const { 
    binaryContent, 
    blobUrl, 
    textContent, 
    contentType, 
    modelUrl 
  } = useInscriptionContent(number);
  
  // Metadata state
  const [metadata, setMetadata] = useState(null);
  const [editionNumber, setEditionNumber] = useState(null);
  const [editionCount, setEditionCount] = useState(null);
  const [address, setAddress] = useState(null);
  const [shortId, setShortId] = useState(null);
  const [shortAddress, setShortAddress] = useState(null);
  const [prettySize, setPrettySize] = useState(null);
  const [sha256, setSha256] = useState(null);
  
  // Relationship data
  const [parentsData, setParentsData] = useState([]);
  const [delegateData, setDelegateData] = useState(null);
  const [recursiveSubmodulesData, setRecursiveSubmodulesData] = useState([]);
  const [satributeEditions, setSatributeEditions] = useState(null);
  const [referencedByData, setReferencedByData] = useState([]);
  const [childrenInscriptions, setChildrenInscriptions] = useState([]);
  const [similarInscriptions, setSimilarInscriptions] = useState(null);
  const [boosts, setBoosts] = useState(0);
  const [boostsList, setBoostsList] = useState([]);
  const [boostEdition, setBoostEdition] = useState(null); 
  const [boostsPage, setBoostsPage] = useState(0); 
  const [isBoostsLoading, setIsBoostsLoading] = useState(false);
  const [hasMoreBoosts, setHasMoreBoosts] = useState(true); 
  const [boostCountLoading, setBoostCountLoading] = useState(true);
  const [commentCount, setCommentCount] = useState(0);
  const [commentsList, setCommentsList] = useState([]);
  const [hasMatchingComment, setHasMatchingComment] = useState(false);
  const [commentContent, setCommentContent] = useState(null);
  const [commentCountLoading, setCommentCountLoading] = useState(true);
  const [activeDot, setActiveDot] = useState(0);
  const [slideDirection, setSlideDirection] = useState(null); // Track slide direction

  // Loading states for different data fetches
  const [metadataLoading, setMetadataLoading] = useState(true);
  const [addressLoading, setAddressLoading] = useState(true);
  const [editionsLoading, setEditionsLoading] = useState(true);
  const [relatedInscriptionsLoading, setRelatedInscriptionsLoading] = useState(true);
  
  // Compute overall loading state
  // const isLoading = metadataLoading || addressLoading || editionsLoading || relatedInscriptionsLoading;
  const isLoading = metadataLoading || addressLoading;
  const dataLoading = editionsLoading || relatedInscriptionsLoading;
  const socialCountLoading = commentCountLoading || boostCountLoading;

  // State for managing copy action
  const [copied, setCopied] = useState(false);
  
  // 3D model reference
  const modelViewerRef = useRef(null);

  // Fetch metadata
  const fetchMetadata = useCallback(async () => {
    try {
      setMetadataLoading(true);
      const response = await fetch(`/api/inscription_metadata_number/${number}`);
      const json = await response.json();
      
      setMetadata(json);
      
      // Format and set derived metadata
      if (json.id) {
        setShortId(json.id.slice(0, 5) + "..." + json.id.slice(-5));
      }
      
      if (json.content_length) {
        const sizeInfo = shortenBytes(json.content_length);
        setPrettySize(`${sizeInfo.value} ${sizeInfo.unit}`);
      }
      
      if (json.sha256) {
        setSha256(json.sha256);
      }
      
      setMetadataLoading(false);
    } catch (error) {
      console.error("Error fetching metadata:", error);
      setMetadataLoading(false);
    }
  }, [number]);
  
  // Fetch owner address
  const fetchAddress = useCallback(async () => {
    try {
      setAddressLoading(true);
      const response = await fetch(`/api/inscription_last_transfer_number/${number}`);
      const json = await response.json();
      setAddress(json);
      
      if (json.address) {
        const address = json.address;
        const shortAddress = address === "unbound" 
          ? "unbound" 
          : address.slice(0, 5) + "..." + address.slice(-5);
        setShortAddress(shortAddress);
      }
      setAddressLoading(false);
    } catch (error) {
      console.error("Error fetching address:", error);
      setAddressLoading(false);
    }
  }, [number]);
  
  // Fetch edition info
  const fetchEditions = useCallback(async () => {
    try {
      setEditionsLoading(true);
      setEditionNumber(null);
      setEditionCount(null);
      
      const response = await fetch(`/api/inscription_edition_number/${number}`);
      const json = await response.json();
      
      setEditionNumber(json.edition);
      setEditionCount(json.total);
      setEditionsLoading(false);
    } catch (error) {
      console.error("Error fetching editions:", error);
      setEditionsLoading(false);
    }
  }, [number]);

  // Fetch boosts
  const fetchBoosts = useCallback(async () => {
    try {
      if (!metadata || !hasMoreBoosts || isBoostsLoading) {
        return;
      }
  
      setIsBoostsLoading(true);
  
      const targetId = metadata.delegate || metadata.id;
  
      if (!targetId) {
        setBoosts(0);
        setBoostsList([]);
        setBoostEdition(null);
        setIsBoostsLoading(false);
        setBoostCountLoading(false);
        return;
      }
  
      // Fetch boosts with pagination
      const response = await fetch(`/api/inscription_bootlegs/${targetId}?page_size=20&page_number=${boostsPage}`);
      const data = await response.json();
  
      if (Array.isArray(data) && data.length > 0) {
        setBoosts(data[0].total); // Set total boosts
        setBoostsList((prev) => [...prev, ...data]); // Append new boosts to the list
        setBoostsPage((prev) => prev + 1); // Increment the page
      } else {
        setHasMoreBoosts(false); // No more boosts to fetch
      }

      // Fetch boost edition if there's a delegate
      if (metadata.delegate) {
        const boostEditionResponse = await fetch(`/api/bootleg_edition_number/${number}`);
        const boostEditionData = await boostEditionResponse.json();
        setBoostEdition(boostEditionData.bootleg_edition || null); // Set boost edition
      } else {
        setBoostEdition(null); // Reset boostEdition if no delegate
      }
  
      setIsBoostsLoading(false);
      setBoostCountLoading(false);
    } catch (error) {
      console.error("Error fetching boosts:", error);
      setIsBoostsLoading(false);
      setBoostCountLoading(false);
    }
  }, [metadata, boostsPage, hasMoreBoosts, isBoostsLoading]);

  const fetchComments = useCallback(async () => {
    try {
      // We only need metadata to be available
      if (!metadata) {
        return;
      }
  
      // Determine which ID to use:
      // 1. If there's a delegate, use metadata.delegate
      // 2. Otherwise, use the inscription's own ID
      const targetId = metadata.delegate || metadata.id;
  
      if (!targetId) {
        setCommentCount(0);
        setCommentsList([]); // Reset comments list
        setCommentCountLoading(false);
        return;
      }
  
      const response = await fetch(`/api/inscription_comments/${targetId}`);
      const data = await response.json();
  
      if (Array.isArray(data) && data.length > 0) {
        setCommentCount(data.length);
  
        // Fetch content for each comment
        const enrichedComments = await Promise.all(
          data.map(async (comment) => {
            try {
              const contentResponse = await fetch(`/api/comment/${comment.comment_id}`);
              const contentText = await contentResponse.text(); // Read raw text response
  
              let content;
              try {
                // Attempt to parse JSON
                const contentData = JSON.parse(contentText);
                content = contentData.content;
              } catch (parseError) {
                console.warn(`Failed to parse JSON for comment ${comment.comment_id}:`, parseError);
                content = contentText; // Fallback to raw text
              }
  
              // Ensure "0" is stored as a string
              if (content === "0" || contentText === "0") {
                return { ...comment, content: "0" };
              }
  
              return { ...comment, content };
            } catch (error) {
              console.error(`Error fetching content for comment ${comment.comment_id}:`, error);
              return { ...comment, content: null }; // Fallback to null if fetch fails
            }
          })
        );
  
        setCommentsList(enrichedComments); // Store enriched comments
        setCommentCountLoading(false);
      } else {
        setCommentCount(0);
        setCommentsList([]); // Reset comments list if no data
        setCommentCountLoading(false);
      }
    } catch (error) {
      console.error("Error fetching comments:", error);
      setCommentCount(0);
      setCommentsList([]); // Reset comments list on error
      setCommentCountLoading(false);
    }
  }, [metadata]);

  // Main data loading effect
  useEffect(() => {
    fetchMetadata();
    fetchAddress();
    fetchEditions();
  }, [number, fetchMetadata, fetchAddress, fetchEditions]);

  // Fetch boosts and comments when metadata is available
  useEffect(() => {
    if (metadata) {
      // Initial fetch for boosts
      // This will only run when the component mounts or when metadata changes
      if (boostsPage === 0 && !isBoostsLoading && hasMoreBoosts && boostsList.length === 0) {
        fetchBoosts();
      }      

      // Initial fetch for comments
      // Similarly, this will only run when the component mounts or when metadata changes
      if (commentsList.length === 0 && commentCountLoading) { 
        fetchComments();
      }
    }
  }, [metadata, commentCountLoading]); // Includes commentCountLoading to ensure comments are fetched when metadata is available

  // Check if comments match the current inscription number
  useEffect(() => {
    if (commentsList.length > 0) {
      commentsList.forEach((comment) => {
        if (comment.comment_number == number) {
          setHasMatchingComment(true);
          setCommentContent(comment.content);
        }
      });
    }
  }, [commentsList]);

  const handleDotClick = (index) => {
    if (index !== activeDot) {
      setSlideDirection(index > activeDot ? 'right' : 'left'); // Determine slide direction
      setActiveDot(index); // Update the active dot
    }
  };

  // Custom hook to detect svg-recursive type
  const actualContentType = React.useMemo(() => {
    if (metadata?.is_recursive && contentType === "svg") {
      return "svg-recursive";
    }
    return contentType;
  }, [contentType, metadata]);
  
  // Clean up model viewer when svg-recursive is detected
  useEffect(() => {
    if (actualContentType === "svg-recursive") {
      document.querySelector('model-viewer')?.remove();
    }
  }, [actualContentType]);

  // Fetch similar inscriptions when sha256 hash is available
  useEffect(() => {
    const fetchSimilar = async () => {
      if (!sha256) return;
      
      try {
        const response = await fetch(`/search_api/similar/${sha256}?n=48`);
        const json = await response.json();
        setSimilarInscriptions(json);
      } catch (error) {
        console.error("Error fetching similar inscriptions:", error);
      }
    };

    fetchSimilar();
  }, [sha256]);

  // Helper function to fetch related inscription metadata
  const fetchInscriptionData = useCallback(async (id) => {
    try {
      const metadataResponse = await fetch(`/api/inscription_metadata/${id}`);
      const metadataJson = await metadataResponse.json();
      return { metadata: metadataJson };
    } catch (error) {
      console.error(`Error fetching data for inscription ${id}:`, error);
      return null;
    }
  }, []);

  // Fetch related inscriptions when metadata is available
  useEffect(() => {
    if (!metadata) return;
    
    const fetchRelatedInscriptions = async () => {
      try {
        setRelatedInscriptionsLoading(true);
        // Fetch parents data
        if (metadata.parents?.length > 0) {
          const parentsPromises = metadata.parents.map(fetchInscriptionData);
          const parentsResults = await Promise.all(parentsPromises);
          setParentsData(parentsResults.filter(Boolean));
        }

        // Fetch delegate data
        if (metadata.delegate) {
          const delegateResult = await fetchInscriptionData(metadata.delegate);
          setDelegateData(delegateResult);
        }

        // Fetch recursive submodules data
        if (metadata.referenced_ids?.length > 0) {
          const submodulesPromises = metadata.referenced_ids.map(fetchInscriptionData);
          const submodulesResults = await Promise.all(submodulesPromises);
          setRecursiveSubmodulesData(submodulesResults.filter(Boolean));
        }
        
        // Fetch children inscriptions
        if (metadata.number) {
          const childrenResponse = await fetch(`/api/inscription_children_number/${metadata.number}`);
          const childrenData = await childrenResponse.json();
          setChildrenInscriptions(childrenData);
        }
        
        // Fetch referenced by data
        const referencedByResponse = await fetch(`/api/inscription_referenced_by_number/${number}`);
        const referencedByData = await referencedByResponse.json();
        setReferencedByData(referencedByData);
        
        setRelatedInscriptionsLoading(false);
      } catch (error) {
        console.error("Error fetching related inscriptions:", error);
        setRelatedInscriptionsLoading(false);
      }
    };

    fetchRelatedInscriptions();
  }, [metadata, fetchInscriptionData, number]);

  // Fetch satribute editions
  useEffect(() => {
    if (!metadata?.number) return;
    
    const fetchSatributeEditions = async () => {
      try {
        const response = await fetch(`/api/inscription_satribute_editions_number/${metadata.number}`);
        const data = await response.json();
        setSatributeEditions(data);
      } catch (error) {
        console.error("Error fetching satribute editions:", error);
      }
    };
  
    fetchSatributeEditions();
  }, [metadata?.number]);

  // Fetch referenced by data
  useEffect(() => {
    if (!metadata?.number) return;
    
    const fetchReferencedBy = async () => {
      try {
        const response = await fetch(`/api/inscription_referenced_by_number/${number}`);
        const data = await response.json();
        setReferencedByData(data);
      } catch (error) {
        console.error("Error fetching referenced by data:", error);
      }
    };
  
    fetchReferencedBy();
  }, [metadata?.number, number]);
  
  // Fetch children inscriptions
  useEffect(() => {
    if (!metadata?.id) return;
    
    const fetchChildrenInscriptions = async () => {
      try {
        const response = await fetch(`/api/inscription_children/${metadata.id}`);
        const data = await response.json();
        setChildrenInscriptions(data);
      } catch (error) {
        console.error("Error fetching children inscriptions:", error);
      }
    };
  
    fetchChildrenInscriptions();
  }, [metadata?.id]);

  // Setup 3D model viewer when model URL is available
  useEffect(() => {
    if (contentType === 'model' && modelUrl && modelViewerRef.current) {
      // Configure model viewer properties
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

  const [isBoostsModalOpen, setBoostsModalOpen] = useState(false);

  const toggleBoostsModal = () => {
    setBoostsModalOpen((prev) => {
      const isOpening = !prev;
      document.body.style.overflow = isOpening ? 'hidden' : 'auto'; 
      return isOpening;
    });
  };

  const [isCommentsModalOpen, setCommentsModalOpen] = useState(false);

  const toggleCommentsModal = () => {
    setCommentsModalOpen((prev) => {
      const isOpening = !prev;
      document.body.style.overflow = isOpening ? 'hidden' : 'auto';
      return isOpening;
    });
  };

  const [isCheckoutModalOpen, setCheckoutModalOpen] = useState(false);

  const toggleCheckoutModal = () => {
    setCheckoutModalOpen((prev) => {
      const isOpening = !prev;
      document.body.style.overflow = isOpening ? 'hidden' : 'auto';
      return isOpening;
    });
  };

  const handleCopyClick = () => {
    copyText(`https://vermilion.place/inscription/${number}`)
    setCopied(true);
    setTimeout(() => setCopied(false), 2000); // Reset after 2 seconds
  };

  const [bookmarked, setBookmarked] = useState(false);
  const bookmarkDropdownRef = useRef(null);
  const bookmarkRef = useRef(null);
  const [showFolderOverlay, setShowFolderOverlay] = useState(false);
  useClickOutside(bookmarkDropdownRef, (event) => {
    if (bookmarkRef.current?.contains(event.target)) {
      return;
    }
    setShowFolderOverlay(false)
  });
  const handleBookmarkClick = (e) => {
    setShowFolderOverlay((prev) => !prev);
  };

  useEffect(() => {
    // Reset state when navigating to a new inscription
    setBoosts(0);
    setBoostsList([]);
    setBoostEdition(null);
    setBoostsPage(0);
    setHasMoreBoosts(true);
    setIsBoostsLoading(false);
    setBoostCountLoading(true);
  
    setCommentCount(0);
    setCommentsList([]);
    setHasMatchingComment(false);
    setCommentContent(null);
    setCommentCountLoading(true);
  
    setMetadata(null);
    setEditionNumber(null);
    setEditionCount(null);
    setAddress(null);
    setShortId(null);
    setShortAddress(null);
    setPrettySize(null);
    setSha256(null);
  
    setParentsData([]);
    setDelegateData(null);
    setRecursiveSubmodulesData([]);
    setSatributeEditions(null);
    setReferencedByData([]);
    setChildrenInscriptions([]);
    setSimilarInscriptions(null);
  
    setActiveDot(0);
    setSlideDirection(null);
  
    // Reset loading states
    setMetadataLoading(true);
    setAddressLoading(true);
    setEditionsLoading(true);
    setRelatedInscriptionsLoading(true);
  
    // Close all modals
    setBoostsModalOpen(false);
    setCommentsModalOpen(false);
    setCheckoutModalOpen(false);
  
    // Reset scroll position
    window.scrollTo(0, 0);
  }, [number]);

  return (
    <>
      <MainContainer>
        <ContentContainer>
            {activeDot === 0 ? (
              <MediaContainer key="media">
                <InnerInscriptionContent 
                  contentType={contentType}
                  blobUrl={blobUrl}
                  number={number}
                  metadata={{
                    id: metadata?.id,
                    content_type: metadata?.content_type,
                    is_recursive: metadata?.is_recursive
                  }}
                  textContent={textContent}
                  modelUrl={modelUrl}
                  serverHTML={false}
                />
              </MediaContainer>
            ) : (
              <MediaContainer key="comment">
                <InnerInscriptionContent
                  contentType={'text'}
                  textContent={commentContent}
                />
              </MediaContainer>
            )}
          {/* Render carousel dots if there's a matching comment */}
          {hasMatchingComment && (
            <CarouselDots>
              {[0, 1].map((dotIndex) => (
                <Tooltip content={dotIndex === 0 ? 'View delegate inscription' : 'View comment'} key={dotIndex}>
                  <Dot
                    key={dotIndex}
                    isActive={activeDot === dotIndex}
                    onClick={() => handleDotClick(dotIndex)}
                  />
                </Tooltip>
              ))}
            </CarouselDots>
          )}
        </ContentContainer>
        
        <InfoContainer>
          {isLoading ? (
            <LoadingSkeleton />
          ) : (
            <>
              {/* Collection/Inscription Info */}
              <DataContainer info gapsize={'1rem'}>
                <SectionPadding gap={'.75rem'}>
                  <CollectionInfo 
                    metadata={metadata}
                    editionNumber={editionNumber}
                    editionCount={editionCount}
                    childrenInscriptions={childrenInscriptions}
                  />
                </SectionPadding>
              </DataContainer>

              {/* Boosts Section */}
              <DataContainer gapsize={'.75rem'}>
                <SectionPadding gap={'.75rem'}>
                  <ButtonsRow gap={'.5rem'}>
                    {socialCountLoading ? (
                      <>
                        <StatsSkeleton />
                        <StatsSkeleton />
                      </>
                    ) : (
                      <>
                        <CountButton onClick={toggleBoostsModal}>
                          <ChevronUpDuoIcon size={'1.25rem'} color={theme.colors.text.primary} />
                            {boostEdition ? `${addCommas(boostEdition)} / ${addCommas(boosts)} boosts` : `${addCommas(boosts)} boosts`}
                          </CountButton>
                        <CountButton onClick={toggleCommentsModal}>
                          <CommentIcon size={'1.25rem'} color={theme.colors.text.primary} />
                          {addCommas(commentCount)} comments
                        </CountButton>
                      </>
                    )}
                  </ButtonsRow>
                  <ButtonsRow gap={'.75rem'}>
                    <BoostButton onClick={toggleCheckoutModal}>
                      <ChevronUpDuoIcon size={'1.25rem'} color={theme.colors.background.white} />
                      Boost
                    </BoostButton>
                    <TooltipOverlayContainer>
                      <Tooltip content={bookmarked ? 'Bookmarked!' : 'Bookmark'}>
                        <ButtonWrapper>
                          <IconButton onClick={(e) => handleBookmarkClick(e)} bookmarked={bookmarked} ref={bookmarkRef}>
                            {bookmarked ? <BookmarkIconFilled size={'1.25rem'} color={theme.colors.text.primary} /> : <BookmarkIcon size={'1.25rem'} color={theme.colors.text.primary} />}
                          </IconButton>
                        </ButtonWrapper>
                      </Tooltip>
                      {showFolderOverlay && (
                        <BookmarkDropdown 
                          ref={bookmarkDropdownRef}
                          inscriptionId={metadata?.id}
                          onClose={() => setShowFolderOverlay(false)}
                        />
                      )}
                    </TooltipOverlayContainer>
                    <Tooltip content={copied ? 'Copied!' : 'Copy link'}>
                      <ButtonWrapper>
                        <IconButton onClick={() => handleCopyClick()} copied={copied}>
                          {copied ? <CheckIcon size={'1.25rem'} color={theme.colors.background.success} /> : <LinkIcon size={'1.25rem'} color={theme.colors.text.primary} />}
                        </IconButton>
                      </ButtonWrapper>
                    </Tooltip>
                    <Tooltip content={'View on ordinals.com'}>
                      <ButtonWrapper>
                        <IconButton onClick={() => window.open(`https://ordinals.com/inscription/${number}`, '_blank')}>
                          <WebIcon size={'1.25rem'} color={theme.colors.text.primary} />
                        </IconButton>
                      </ButtonWrapper>
                    </Tooltip>
                  </ButtonsRow>
                  <Separator />
                </SectionPadding>
              </DataContainer>

              {/* Boosts Modal */}
              <BoostsModal
                boostsList={boostsList}
                onClose={toggleBoostsModal}
                fetchMoreBoosts={fetchBoosts}
                hasMoreBoosts={hasMoreBoosts}
                isBoostsLoading={isBoostsLoading}
                isBoostsModalOpen={isBoostsModalOpen}
              />

              {/* Comments Modal */}
              <CommentsModal
                commentsList={commentsList}
                onClose={toggleCommentsModal}
                isCommentsModalOpen={isCommentsModalOpen}
              />

              {/* Checkout Modal */}
              <CheckoutModal
                onClose={toggleCheckoutModal}
                isCheckoutModalOpen={isCheckoutModalOpen}
                delegateData={delegateData?.metadata || metadata} // if inscription has a delegate, use that metadata, otherwise use it's own
              />
              
              {/* Details Section */}
              <DataContainer gapsize={'.75rem'}>
                <SectionHeader
                  section="details"
                  icon={<InfoCircleIcon size={'1.25rem'} color={theme.colors.text.primary} />}
                  title="Details"
                  isVisible={sectionVisibility.details}
                  onToggle={toggleSectionVisibility}
                />
                
                {sectionVisibility.details && (
                  <SectionPadding>
                    <DetailsSection
                      metadata={metadata}
                      shortId={shortId}
                      prettySize={prettySize}
                      address={address}
                      shortAddress={shortAddress}
                      onCopy={copyText}
                    />
                  </SectionPadding>
                )}
              </DataContainer>

              {/* Provenance Section */}
              <DataContainer gapsize={'.75rem'}>
                <SectionHeader
                  section="provenance"
                  icon={<RouteIcon size={'1.25rem'} color={theme.colors.text.primary} />}
                  title="Provenance"
                  isVisible={sectionVisibility.provenance}
                  onToggle={toggleSectionVisibility}
                />
                
                {sectionVisibility.provenance && (
                  <SectionPadding gap={'1.5rem'}>
                    <ProvenanceSection
                      metadata={metadata}
                      number={number}
                      parentsData={parentsData}
                      recursiveSubmodulesData={recursiveSubmodulesData}
                      childrenInscriptions={childrenInscriptions}
                      referencedByData={referencedByData}
                      delegateData={delegateData}
                      editionNumber={editionNumber}
                      editionCount={editionCount}
                    />
                  </SectionPadding>
                )}
              </DataContainer>
              
              {/* Collection Metadata Section */}
              {(metadata?.off_chain_metadata?.attributes?.length > 0 || 
                (metadata?.on_chain_metadata && Object.keys(metadata.on_chain_metadata).length > 0)) && (
                <DataContainer gapsize={'.75rem'}>
                  <SectionHeader
                    section="collectionMetadata"
                    icon={<FileIcon size={'1.25rem'} color={theme.colors.text.primary} />}
                    title="Metadata"
                    isVisible={sectionVisibility.collectionMetadata}
                    onToggle={toggleSectionVisibility}
                  />
                  
                  {sectionVisibility.collectionMetadata && (
                    <SectionPadding gap={'1.5rem'}>
                      <CollectionMetadata 
                        offchainAttributes={metadata.off_chain_metadata?.attributes} 
                        onchainAttributes={metadata.on_chain_metadata}
                      />
                    </SectionPadding>
                  )}
                </DataContainer>
              )}
              
              {/* Satributes Section */}
              {metadata?.satributes?.length > 0 && (
                <DataContainer gapsize={'.75rem'}>
                  <SectionHeader
                    section="satributes"
                    icon={<TagIcon size={'1.25rem'} color={theme.colors.text.primary} />}
                    title="Satributes"
                    isVisible={sectionVisibility.satributes}
                    onToggle={toggleSectionVisibility}
                  />
                  
                  {sectionVisibility.satributes && (
                    <SectionPadding isLast={true}>
                      <SatributeSection
                        satributes={metadata.satributes}
                        satributeEditions={satributeEditions}
                      />
                    </SectionPadding>
                  )}
                </DataContainer>
              )}
            </>
          )}
        </InfoContainer>
      </MainContainer>
      
      {/* Similar Inscriptions Section */}
      {similarInscriptions?.length > 0 && (
        <SimilarContentContainer>
          <SectionHeaderContainer>
            <TabButton isActive={true}>
              <ScanIcon size={'1.25rem'} />
              Similar Inscriptions
            </TabButton>
            <DisabledButton isActive={false}>
              <ClockIcon size={'1.25rem'} />
              Activity
              <SoonTag>Coming Soon</SoonTag>
            </DisabledButton>
          </SectionHeaderContainer>
          <Gallery inscriptionList={similarInscriptions} numberVisibility={false} zoomGrid={true} />
        </SimilarContentContainer>
      )}
    </>
  );
};

const ButtonsRow = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: ${props => props.gap || '.5rem'};
  width: 100%;
`;

const CountButton = styled.button`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: .375rem;
  background-color: ${theme.colors.background.white};
  font-family: ${theme.typography.fontFamilies.medium};
  font-size: 1rem;
  line-height: 1.25rem;
  color: ${theme.colors.text.primary};
  border-radius: 1rem;
  padding: .375rem .75rem;
  border: none;
  cursor: pointer;
  transition: all 200ms ease;
  transform-origin: center center;

  &:hover {
    background-color: ${theme.colors.background.primary};
  }
  &:active {
    transform: scale(0.96);
  }
`;

const BoostButton = styled.button`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: .5rem;
  background-color: ${theme.colors.background.dark};
  font-family: ${theme.typography.fontFamilies.bold};
  font-size: 1rem;
  line-height: 1.25rem;
  color: ${theme.colors.background.white};
  border-radius: 1.375rem;
  padding: .75rem 1rem;
  border: none;
  cursor: pointer;
  transition: all 200ms ease;
  transform-origin: center center;
  flex-grow: 1;
  width: 100%;

  &:hover {
    opacity: 75%;
  }
  &:active {
    transform: scale(0.98);
  }
`;

const Separator = styled.div`
  height: 2rem;
  width: 100%;
  background: transparent;
  border-bottom: 1px solid ${theme.colors.border};
`;

const MediaSliderContainer = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
  overflow: hidden;
  position: relative;

  & > div {
    flex-shrink: 0;
    width: 100%;
    transform: ${(props) =>
      props.slideDirection === 'right'
        ? 'translateX(-100%)'
        : props.slideDirection === 'left'
        ? 'translateX(100%)'
        : 'translateX(0)'};
    transition: transform 0.5s ease-in-out;
  }
`;

const TextContainer = styled.div`
  background-color: #FFFFFF;
  border: 2px solid #F6F6F6;
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
  color: ${props => props.loading ? '#959595' : '#000000'};
  object-fit: contain;
  aspect-ratio: 1/1;
  white-space-collapse: preserve;
  overflow: hidden;
  overflow-y: scroll;
  text-wrap: wrap;
`;

const CarouselDots = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  gap: 0.375rem;
  margin-top: 1.5rem;
`;

const Dot = styled.div`
  width: 0.75rem;
  height: 0.75rem;
  border-radius: 0.375rem;
  background-color: ${(props) =>
    props.isActive ? theme.colors.text.secondary : theme.colors.border};
  cursor: pointer;
  transition: background-color 200ms ease;

  &:hover {
    background-color: ${theme.colors.text.secondary};
  }
`;

const TabButton = styled.button`
  border: none;
  padding: 0 .75rem;
  height: 2rem;
  border-radius: 1rem;
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: .25rem;
  cursor: pointer;
  font-family: ${theme.typography.fontFamilies.medium};
  font-size: 1rem;
  line-height: 1.25rem;
  color: ${props => props.isActive ? theme.colors.text.primary : theme.colors.text.tertiary}; 
  background-color: ${props => props.isActive ? theme.colors.background.primary : theme.colors.background.white}; 
  transition: all 200ms ease;
  transform-origin: center center;
  text-decoration: none;

  &:hover {
    color: ${theme.colors.text.primary};
    background-color: ${theme.colors.background.primary};

    svg {
      fill: ${theme.colors.text.primary};
    }
  }

  &:active {
    transform: scale(0.96);
  }

  svg {
    fill: ${props => props.isActive ? theme.colors.text.primary : theme.colors.text.tertiary};
    transition: fill 200ms ease;
  }

  @media (max-width: 420px) {
    svg {
      display: none; /* Hides the icons when the screen width is less than 416px */
    }
  }
`;

const DisabledButton = styled.button`
  border: none;
  padding: 0 .75rem;
  height: 2rem;
  border-radius: 1rem;
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: .25rem;
  cursor: not-allowed;
  font-family: ${theme.typography.fontFamilies.medium};
  font-size: 1rem;
  line-height: 1.25rem;
  color: ${theme.colors.text.tertiary}; 
  background-color: ${theme.colors.background.white}; 
  transition: all 200ms ease;
  transform-origin: center center;
  text-decoration: none;

  svg {
    fill: ${theme.colors.text.tertiary};
    transition: fill 200ms ease;
  }

  @media (max-width: 420px) {
    svg {
      display: none; /* Hides the icons when the screen width is less than 416px */
    }
  }
`;

const SoonTag = styled.span`
  background-color: ${theme.colors.background.primary};
  color: ${theme.colors.text.tertiary};
  font-family: ${theme.typography.fontFamilies.medium};
  font-size: .75rem;
  line-height: 1rem;
  padding: .125rem .25rem;
  border-radius: .25rem;
  margin-left: .375rem;

  @media (max-width: 372px) {
    display: none; 
  }
`;

const ButtonWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  margin: 0;
  ${props => props.relative && 'position: relative;'}
`;

const TooltipOverlayContainer = styled.div`
  position: relative;
  display: flex;
  justify-content: center;
`;

export default Inscription;
