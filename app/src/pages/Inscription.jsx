import { useParams } from 'react-router-dom';
import React, { useEffect, useRef, useState, useCallback } from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { createInscriptions } from '../wallet/inscriptionBuilder';

// Components from Inscription folder
import {
  CollectionInfo,
  CollectionMetadata,
  DetailsSection,
  LoadingSkeleton,
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

// Other components
import Gallery from '../components/Gallery';
import InnerInscriptionContent from '../components/common/InnerInscriptionContent';
import MainText from '../components/common/text/MainText';
import IconButton from '../components/common/buttons/IconButton';
import Spinner from '../components/Spinner';
import InscriptionIcon from '../components/InscriptionIcon';


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
} from '../components/common/Icon';
import theme from '../styles/theme';

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
  const [comments, setComments] = useState(0);
  const [commentsList, setCommentsList] = useState([]);

  // Loading states for different data fetches
  const [metadataLoading, setMetadataLoading] = useState(true);
  const [addressLoading, setAddressLoading] = useState(true);
  const [editionsLoading, setEditionsLoading] = useState(true);
  const [relatedInscriptionsLoading, setRelatedInscriptionsLoading] = useState(true);
  
  // Compute overall loading state
  const isLoading = metadataLoading || addressLoading || editionsLoading || relatedInscriptionsLoading;
  
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
    } catch (error) {
      console.error("Error fetching boosts:", error);
      setIsBoostsLoading(false);
    }
  }, [metadata, boostsPage, hasMoreBoosts, isBoostsLoading]);

  // Fetch comments
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
        setComments(0);
        return;
      }
      
      const response = await fetch(`/api/inscription_comments/${targetId}`);
      const data = await response.json();
      
      if (Array.isArray(data) && data.length > 0 && data[0].total !== undefined) {
        setComments(data[0].total);
      } else {
        setComments(0);
      }
    } catch (error) {
      console.error("Error fetching comments:", error);
      setComments(0);
    }
  }, [metadata]);

  // Main data loading effect
  useEffect(() => {
    fetchMetadata();
    fetchAddress();
    fetchEditions();
    
    // Reset scroll position when inscription number changes
    window.scrollTo(0, 0);
  }, [number, fetchMetadata, fetchAddress, fetchEditions]);

  // Fetch boosts and comments when metadata is available
  useEffect(() => {
    if (metadata) {
      fetchBoosts();
      fetchComments();
    }
  }, [metadata, fetchBoosts, fetchComments]);

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
    if (!metadata?.number) return;
    
    const fetchChildrenInscriptions = async () => {
      try {
        const response = await fetch(`/api/inscription_children_number/${metadata.number}`);
        const data = await response.json();
        setChildrenInscriptions(data);
      } catch (error) {
        console.error("Error fetching children inscriptions:", error);
      }
    };
  
    fetchChildrenInscriptions();
  }, [metadata?.number]);

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

  console.log(metadata)

  console.log("modal status", isBoostsModalOpen)

  return (
    <>
      <MainContainer>
        <ContentContainer>
          <MediaContainer>
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
                    <CountButton onClick={toggleBoostsModal}>
                      <ChevronUpDuoIcon size={'1.25rem'} color={theme.colors.text.primary} />
                        {boostEdition ? `${addCommas(boostEdition)} / ${addCommas(boosts)} boosts` : `${addCommas(boosts)} boosts`}
                      </CountButton>
                    <CountButton onClick={toggleCommentsModal}>
                      <CommentIcon size={'1.25rem'} color={theme.colors.text.primary} />
                      {addCommas(comments)} comments
                    </CountButton>
                  </ButtonsRow>
                  <ButtonsRow gap={'.75rem'}>
                    <BoostButton onClick={toggleCheckoutModal}>
                      <ChevronUpDuoIcon size={'1.25rem'} color={theme.colors.background.white} />
                      Boost
                    </BoostButton>
                    <IconButton onClick={() => copyText(`https://vermilion.place/inscription/${number}`)}>
                      <LinkIcon size={'1.25rem'} color={theme.colors.text.primary} />
                    </IconButton>
                    <IconButton onClick={() => window.open(`https://ordinals.com/inscription/${number}`, '_blank')}>
                      <WebIcon size={'1.25rem'} color={theme.colors.text.primary} />
                    </IconButton>
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
                delegateData={delegateData}
                metadata={metadata}
                number={number}
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
          <SectionContainer>
            <SectionHeaderContainer>
              <SparklesIcon size={'1.25rem'} color={theme.colors.text.primary} />
              <SimilarText>Similar Inscriptions</SimilarText>
            </SectionHeaderContainer>
          </SectionContainer>
          <Gallery inscriptionList={similarInscriptions} numberVisibility={false} zoomGrid={true} />
        </SimilarContentContainer>
      )}
    </>
  );
};

const BoostsModal = ({ boostsList, onClose, fetchMoreBoosts, hasMoreBoosts, isBoostsLoading, isBoostsModalOpen }) => {
  const observer = useRef();
  const modalContentRef = useRef(); // Ref for the modal content

  useEffect(() => {
    if (isBoostsModalOpen) {
      document.body.style.overflow = 'hidden'; // Disable page scrolling
    } else {
      document.body.style.overflow = 'auto'; // Enable page scrolling

      // Reset scroll position when modal is closed
      if (modalContentRef.current) {
        modalContentRef.current.scrollTop = 0;
      }
    }

    return () => {
      document.body.style.overflow = 'auto'; // Cleanup on unmount
    };
  }, [isBoostsModalOpen]);

  const lastBoostRef = useCallback(
    (node) => {
      if (isBoostsLoading) return;
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMoreBoosts) {
          fetchMoreBoosts();
        }
      });

      if (node) observer.current.observe(node);
    },
    [isBoostsLoading, hasMoreBoosts, fetchMoreBoosts]
  );

  return (
    <ModalOverlay isOpen={isBoostsModalOpen} onClick={onClose}>
      <ModalContainer isOpen={isBoostsModalOpen} onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <HeaderText>Boosts</HeaderText>
          <CloseButton onClick={onClose}>
            <CrossIcon size={'1.25rem'} color={theme.colors.text.secondary} />
          </CloseButton>
        </ModalHeader>
        <ModalContent ref={modalContentRef}>
          {boostsList.map((boost, index) => (
            <BoostEntry
              key={index}
              ref={index === boostsList.length - 1 ? lastBoostRef : null}
            >
              <BoostDetails>
                <BoostNumber>{boost.bootleg_edition}</BoostNumber>
                <TextLink to={`/inscription/${boost.bootleg_number}`}>
                  <BoostText>
                    #{addCommas(boost.bootleg_number)}
                  </BoostText>
                </TextLink>
              </BoostDetails>
              <OwnerDetails>
                <SupportText>owned by</SupportText>
                <TextLink to={`/address/${boost.address}`}>
                  <BoostText>
                    {formatAddress(boost.address)}
                  </BoostText>
                </TextLink>
              </OwnerDetails>
            </BoostEntry>
          ))}
          <SpinnerContainer>
            {isBoostsLoading && <Spinner />}
          </SpinnerContainer>
        </ModalContent>
      </ModalContainer>
    </ModalOverlay>
  );
};

const CommentsModal = ({ commentsList, onClose, isCommentsModalOpen }) => {
  const placeholderComments = [
    { id: 1, address: "bc1p3...hfr7e", text: "🔥🔥🔥", time: "3d" },
    { id: 2, address: "bc1p3...hfr7e", text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.", time: "23h" },
    { id: 3, address: "bc1qy...e83u2", text: "Yet another comment.", time: "56m" },
  ];

  const observer = useRef();
  const modalContentRef = useRef(); // Ref for the modal content

  useEffect(() => {
    if (isCommentsModalOpen) {
      document.body.style.overflow = 'hidden'; // Disable page scrolling
    } else {
      document.body.style.overflow = 'auto'; // Enable page scrolling

      // Reset scroll position when modal is closed
      if (modalContentRef.current) {
        modalContentRef.current.scrollTop = 0;
      }
    }

    return () => {
      document.body.style.overflow = 'auto'; // Cleanup on unmount
    };
  }, [isCommentsModalOpen]);

  return (
    <ModalOverlay isOpen={isCommentsModalOpen} onClick={onClose}>
      <ModalContainer isOpen={isCommentsModalOpen} onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <HeaderText>Comments</HeaderText>
          <CloseButton onClick={onClose}>
            <CrossIcon size={'1.25rem'} color={theme.colors.text.secondary} />
          </CloseButton>
        </ModalHeader>
        <ModalContent gap="1.5rem" ref={modalContentRef}>
          {placeholderComments.map((comment) => (
            <CommentEntry key={comment.id}>
              {/* <CommentDetails> */}
                <DetailsRow>
                  <ProfileImage />
                  <DetailsInfo>
                    <TextLink
                      to={`/address/${comment.address}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <BoostText>{comment.address}</BoostText>
                    </TextLink>
                    <TimeText>{comment.time}</TimeText>
                  </DetailsInfo>
                </DetailsRow>
                <CommentText>{comment.text}</CommentText>
              {/* </CommentDetails> */}
            </CommentEntry>
          ))}
        </ModalContent>
      </ModalContainer>
    </ModalOverlay>
  );
};

const CheckoutModal = ({ onClose, isCheckoutModalOpen, delegateData, metadata, number }) => {
  const placeholderFees = [
    { id: 1, btc: "0.00002816 BTC", usd: "$2.55" },
    { id: 2, btc: "0.00002000 BTC", usd: "$1.90" },
    { id: 3, btc: "0.00004816 BTC", usd: "$4.45" },
  ];

  const observer = useRef();
  const modalContentRef = useRef(); // Ref for the modal content

  useEffect(() => {
    if (isCheckoutModalOpen) {
      document.body.style.overflow = 'hidden'; // Disable page scrolling
    } else {
      document.body.style.overflow = 'auto'; // Enable page scrolling

      // Reset scroll position when modal is closed
      if (modalContentRef.current) {
        modalContentRef.current.scrollTop = 0;
      }
    }

    return () => {
      document.body.style.overflow = 'auto'; // Cleanup on unmount
    };
  }, [isCheckoutModalOpen]);

  return (
    <ModalOverlay isOpen={isCheckoutModalOpen} onClick={onClose}>
      <ModalContainer isOpen={isCheckoutModalOpen} onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <HeaderText>Checkout</HeaderText>
          <CloseButton onClick={onClose}>
            <CrossIcon size={'1.25rem'} color={theme.colors.text.secondary} />
          </CloseButton>
        </ModalHeader>
        <ModalContent gap="1.5rem" ref={modalContentRef}>
          <SummaryDiv>
            <PlainText color={theme.colors.text.secondary}>
              You are about to boost this inscription:
            </PlainText>
            <SummaryRow>
              <InscriptionIcon
                size="4rem"
                useBlockIconDefault={false}
                endpoint={`/api/inscription_number/${delegateData?.metadata.number || number}`}
                number={metadata?.delegate || number}
              />
              <SummaryDetails>
                <PlainText>
                  {addCommas(delegateData?.metadata.number) || addCommas(number)}
                </PlainText>
                <ContentTag>
                  {delegateData?.metadata.content_type || metadata?.content_type}
                </ContentTag>
              </SummaryDetails>
            </SummaryRow>
          </SummaryDiv>

          {/* Divider */}
          <Divider />

          {/* Input Fields Section */}
          <InputFieldsContainer>
            {/* First Input Field */}
            <InputFieldDiv>
              <InputLabel>
                <PlainText>Comment</PlainText>
                <PlainText color={theme.colors.text.tertiary}>
                  (Optional)
                </PlainText>
                <InfoCircleIcon size="1.25rem" color={theme.colors.text.tertiary} />
              </InputLabel>
              <StyledInput placeholder="Add a comment" />
            </InputFieldDiv>

            {/* Second Input Field */}
            <InputFieldDiv>
              <InputLabel>
                <PlainText>Quantity</PlainText>
                <PlainText color={theme.colors.text.tertiary}>
                  (Limit 100 per transaction)
                </PlainText>
              </InputLabel>
              <QuantityRow>
                <StyledInput placeholder="1" />
                <QuantityButton>
                  <MinusIcon size="1.25rem" color={theme.colors.text.tertiary} />
                </QuantityButton>
                <QuantityButton>
                  <PlusIcon size="1.25rem" color={theme.colors.text.tertiary} />
                </QuantityButton>
              </QuantityRow>
            </InputFieldDiv>
          </InputFieldsContainer>

          {/* Divider */}
          <Divider />

          {/* Fee Summary Section */}
          <FeeSummaryContainer>
            {/* Row 1: Network Fees */}
            <FeeRow>
              <PlainText color={theme.colors.text.secondary}>Network fees</PlainText>
              <FeeDetails>
                <PlainText color={theme.colors.text.secondary}>{placeholderFees[0].btc}</PlainText>
                <PlainText color={theme.colors.text.tertiary}>{placeholderFees[0].usd}</PlainText>
              </FeeDetails>
            </FeeRow>

            {/* Row 2: Service Fees */}
            <FeeRow>
              <PlainText color={theme.colors.text.secondary}>Service fees</PlainText>
              <FeeDetails>
                <PlainText color={theme.colors.text.secondary}>{placeholderFees[1].btc}</PlainText>
                <PlainText color={theme.colors.text.tertiary}>{placeholderFees[1].usd}</PlainText>
              </FeeDetails>
            </FeeRow>

            {/* Dotted Divider */}
            <DottedDivider />

            {/* Row 3: Total Fees */}
            <FeeRow>
              <PlainText color={theme.colors.text.primary}>Total fees</PlainText>
              <FeeDetails>
                <PlainText color={theme.colors.text.primary}>{placeholderFees[2].btc}</PlainText>
                <PlainText color={theme.colors.text.tertiary}>{placeholderFees[2].usd}</PlainText>
              </FeeDetails>
            </FeeRow>
          </FeeSummaryContainer>

          {/* Boost Button Section */}
          <BoostButtonContainer>
            <ModalBoostButton>
              <ChevronUpDuoIcon size="1.25rem" color={theme.colors.background.white} />
              Boost
            </ModalBoostButton>
          </BoostButtonContainer>
        </ModalContent>
      </ModalContainer>
    </ModalOverlay>
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

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(0.125rem);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  opacity: ${props => (props.isOpen ? 1 : 0)};
  visibility: ${props => (props.isOpen ? 'visible' : 'hidden')};
  transition: opacity 200ms ease, visibility 200ms ease, backdrop-filter 200ms ease;
`;

const ModalContainer = styled.div`
  background: ${theme.colors.background.white};
  border-radius: 1rem;
  max-width: 400px;
  max-height: 630px;
  width: 90vw;
  height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  opacity: ${props => (props.isOpen ? 1 : 0)};
  visibility: ${props => (props.isOpen ? 'visible' : 'hidden')};
  transform: ${props => (props.isOpen ? 'scale(1)' : 'scale(0.92)')};
  transition: opacity 200ms ease, visibility 200ms ease, transform 200ms ease;

  @media (max-width: 400px) {
    max-width: 90vw;
  }
  @media (max-height: 630px) {
    max-height: 90vh;
  }
`;

const ModalContent = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1; 
  gap: ${props => props.gap || '0'};
  overflow-y: auto;
  padding: 0.5rem 1.25rem 1.5rem;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem 1.5rem;
  background: ${theme.colors.background.white};
`;

const HeaderText = styled.p`
  font-family: ${theme.typography.fontFamilies.bold};
  font-size: 1.25rem;
  line-height: 2rem;
  color: ${theme.colors.text.primary};
  margin: 0;
`;

const CloseButton = styled.button`
  background-color: ${theme.colors.background.white};
  border: none;
  border-radius: 1rem;
  height: 2rem;
  width: 2rem;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0;
  font-size: 1.5rem;
  cursor: pointer;
  transition: all 200ms ease;

  &:hover {
    background-color: ${theme.colors.background.primary};
  }

  &:active {
    transform: scale(0.96);
  }
`;

const SpinnerContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  width: 100%;
  padding-top: 1rem;
`;

const BoostEntry = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.375rem;
  background: ${theme.colors.background.white};
  border-radius: 0.75rem;
  padding: 0.75rem 0.5rem;
  transition: background 200ms ease;

  &:hover {
    background: ${theme.colors.background.primary};
  }
`;

const BoostNumber = styled.div`
  width: 1.75rem;
  text-align: left;
  font-family: ${theme.typography.fontFamilies.medium};
  font-size: 1rem;
  line-height: 1.5rem;
  color: ${theme.colors.text.primary};
`;

const BoostDetails = styled.div`
  display: flex;
  align-items: center;
  gap: 0.375rem;
  width: 100%;
`;

const OwnerDetails = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.25rem;
  width: 100%;
`;

const ProfileImage = styled.div`
  width: 1.75rem;
  height: 1.75rem;
  border-radius: 50%;
  // border: 0.125rem solid ${theme.colors.border};
  background: linear-gradient(180deg, ${theme.colors.background.white}, ${theme.colors.background.verm});
`;

const WalletAddress = styled.span`
  font-family: ${theme.typography.fontFamilies.medium};
  font-size: 1rem;
  line-height: 1.5rem;
  color: ${theme.colors.text.primary};
`;

const BoostDuration = styled.div`
  width: 3.75rem;
  text-align: right;
  font-family: ${theme.typography.fontFamilies.medium};
  font-size: 1rem;
  line-height: 1.5rem;
  color: ${theme.colors.text.tertiary};
`;

const TextLink = styled(Link)`
  color: unset;
  text-decoration: unset;
  display: block; 
`;

const BoostText = styled.p`
  font-size: 1rem;
  color: ${theme.colors.text.primary};
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.5rem;
  // width: 100%;
  text-decoration-line: underline;
  text-decoration-color: transparent;
  text-decoration-thickness: 2px;
  text-underline-offset: 2px;

  transition: all 200ms ease;
  transform-origin: center center;

  &:hover {
    text-decoration-color: ${theme.colors.text.primary};};
  }
`;

const SupportText = styled.p`
  font-family: ${theme.typography.fontFamilies.medium};
  font-size: 1rem;
  line-height: 1.5rem;
  color: ${theme.colors.text.tertiary};
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  @media (max-width: 400px) {
    display: none;
  }
`;

const CommentEntry = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

// const CommentDetails = styled.div`
//   display: flex;
//   flex-direction: column;
//   gap: 0.75rem;
// `;

const DetailsRow = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
`;

const DetailsInfo = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 0.5rem;
`;

const CommentText = styled.p`
  padding-left: 2.25rem;
  font-family: ${theme.typography.fontFamilies.medium};
  font-size: 1rem;
  line-height: 1.375rem;
  color: ${theme.colors.text.secondary};
  margin: 0;
`;

const TimeText = styled.p`
  font-family: ${theme.typography.fontFamilies.medium};
  font-size: 0.875rem;
  line-height: 1.25rem;
  color: ${theme.colors.text.tertiary};
  margin: 0;
`;

const PlainText = styled.p`
  font-family: ${theme.typography.fontFamilies.medium};
  font-size: 1rem;
  line-height: 1.5rem;
  color: ${props => props.color || theme.colors.text.primary};
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const SummaryDiv = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const SummaryRow = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 0.75rem;
`;

const SummaryDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

const ContentTag = styled.div`
  background: ${theme.colors.background.primary};
  border-radius: 0.25rem;
  padding: 0.125rem 0.25rem;
  font-family: ${theme.typography.fontFamilies.medium};
  font-size: 0.875rem;
  line-height: 1.25rem;
  color: ${theme.colors.text.secondary};
`;

const Divider = styled.div`
  width: 100%;
  border-bottom: 1px solid ${theme.colors.border};
`;

const QuantityRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.375rem;
`;

const QuantityButton = styled.button`
  width: 2.25rem;
  height: 2.25rem;
  min-width: 2.25rem;
  min-height: 2.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${theme.colors.background.primary};
  border: none;
  border-radius: 0.75rem;
  cursor: pointer;
  transition: all 200ms ease;
  transform-origin: center center;

  &:hover {
    background-color: ${theme.colors.background.secondary};
  }

  &:active {
    transform: scale(0.96);
  }
`;

const InputFieldsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const InputFieldDiv = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
`;

const InputLabel = styled.div`
  display: flex;
  align-items: center;
  gap: 0.25rem;
`;

const StyledInput = styled.input`
  height: 2.25rem;
  width: 100%;
  max-width: calc(100% - 1.5rem);
  padding: 0 0.75rem;
  background-color: ${theme.colors.background.primary};
  font-family: ${theme.typography.fontFamilies.medium};
  font-size: 1rem;
  line-height: 1.5rem;
  color: ${theme.colors.text.primary};
  border: none;
  border-radius: 0.75rem;
  outline: none;

  &::placeholder {
    color: ${theme.colors.text.tertiary};
  }
`;

const FeeSummaryContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

const FeeRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const FeeDetails = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 0.25rem;
`;

const DottedDivider = styled.div`
  width: 100%;
  border-bottom: 1px dashed ${theme.colors.border};
`;

const BoostButtonContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
`;

const ModalBoostButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  background-color: ${theme.colors.background.dark};
  font-family: ${theme.typography.fontFamilies.bold};
  font-size: 1rem;
  line-height: 1.25rem;
  color: ${theme.colors.background.white};
  border-radius: 0.75rem; /* Updated border radius */
  padding: 0.75rem 1rem;
  border: none;
  cursor: pointer;
  transition: all 200ms ease;
  transform-origin: center center;
  width: 100%;

  &:hover {
    opacity: 75%;
  }

  &:active {
    transform: scale(0.98);
  }
`;

export default Inscription;
