import { useParams } from 'react-router-dom';
import React, { useEffect, useRef, useState, useCallback } from 'react';

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

// Utils
import { shortenBytes } from '../utils/format';
import { copyText } from '../utils/clipboard';

// Icons
import { 
  InfoCircleIcon, 
  PaintIcon, 
  RouteIcon, 
  ScrollIcon, 
  SparklesIcon,
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
  const [isLoading, setIsLoading] = useState(true);
  
  // Relationship data
  const [parentsData, setParentsData] = useState([]);
  const [delegateData, setDelegateData] = useState(null);
  const [recursiveSubmodulesData, setRecursiveSubmodulesData] = useState([]);
  const [satributeEditions, setSatributeEditions] = useState(null);
  const [referencedByData, setReferencedByData] = useState([]);
  const [childrenInscriptions, setChildrenInscriptions] = useState([]);
  const [similarInscriptions, setSimilarInscriptions] = useState(null);
  
  // 3D model reference
  const modelViewerRef = useRef(null);

  // Fetch metadata
  const fetchMetadata = useCallback(async () => {
    try {
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
      
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching metadata:", error);
      setIsLoading(false);
    }
  }, [number]);
  
  // Fetch owner address
  const fetchAddress = useCallback(async () => {
    try {
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
    } catch (error) {
      console.error("Error fetching address:", error);
    }
  }, [number]);
  
  // Fetch edition info
  const fetchEditions = useCallback(async () => {
    try {
      setEditionNumber(null);
      setEditionCount(null);
      
      const response = await fetch(`/api/inscription_edition_number/${number}`);
      const json = await response.json();
      
      setEditionNumber(json.edition);
      setEditionCount(json.total);
    } catch (error) {
      console.error("Error fetching editions:", error);
    }
  }, [number]);
  
  // Main data loading effect
  useEffect(() => {
    fetchMetadata();
    fetchAddress();
    fetchEditions();
    
    // Reset scroll position when inscription number changes
    window.scrollTo(0, 0);
  }, [number, fetchMetadata, fetchAddress, fetchEditions]);

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
      } catch (error) {
        console.error("Error fetching related inscriptions:", error);
      }
    };

    fetchRelatedInscriptions();
  }, [metadata, fetchInscriptionData]);

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

  console.log(metadata)

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
              
              {/* Collection Metadata Section */}
              {(metadata?.off_chain_metadata?.attributes?.length > 0 || 
                (metadata?.on_chain_metadata && Object.keys(metadata.on_chain_metadata).length > 0)) && (
                <DataContainer gapsize={'.75rem'}>
                  <SectionHeader
                    section="collectionMetadata"
                    icon={<PaintIcon size={'1.25rem'} color={theme.colors.text.primary} />}
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
              
              {/* Satributes Section */}
              {metadata?.satributes?.length > 0 && (
                <DataContainer gapsize={'.75rem'}>
                  <SectionHeader
                    section="satributes"
                    icon={<ScrollIcon size={'1.25rem'} color={theme.colors.text.primary} />}
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
              <SparklesIcon size={'1.5rem'} color={theme.colors.text.primary} />
              <SimilarText>Similar Inscriptions</SimilarText>
            </SectionHeaderContainer>
          </SectionContainer>
          <Gallery inscriptionList={similarInscriptions} numberVisibility={false} zoomGrid={true} />
        </SimilarContentContainer>
      )}
    </>
  );
};

export default Inscription;
