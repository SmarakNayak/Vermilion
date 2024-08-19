import { useParams, Link } from "react-router-dom";
import styled from 'styled-components';
import React, { useEffect, useRef, useState } from 'react';
import TopSection from '../components/TopSection';
import Stack from '../components/Stack';
import { addCommas, copyText, formatEditionRange } from '../helpers/utils';
import HashIcon from '../assets/icons/HashIcon';
import WebIcon from '../assets/icons/WebIcon';
import CopyIcon from '../assets/icons/CopyIcon';
import SparklesIcon from '../assets/icons/SparklesIcon';
import ChevronLeftIcon from '../assets/icons/ChevronLeftIcon';
import ChevronRightIcon from '../assets/icons/ChevronRightIcon';
import InfoCircleIcon from '../assets/icons/InfoCircleIcon';
import ConnectionIcon from '../assets/icons/ConnectionIcon';
import { shortenBytes } from '../helpers/utils';
import GridItemContainer from '../components/GridItemContainer';
import SmallItemContainer from '../components/SmallItemContainer';
import ChevronDownSmallIcon from '../assets/icons/ChevronDownSmallIcon';
import ScrollIcon from '../assets/icons/ScrollIcon';
import RibbonIcon from '../assets/icons/RibbonIcon';
import SproutIcon from '../assets/icons/SproutIcon';
import Person2Icon from '../assets/icons/Person2Icon';
import RouteIcon from '../assets/icons/RouteIcon';
import LayersIcon from '../assets/icons/LayersIcon';
import RepeatIcon from '../assets/icons/RepeatIcon';
import PaintIcon from '../assets/icons/PaintIcon';
import RuneIcon from '../assets/icons/RuneIcon';
import FlexItem from "../components/FlexItem";
import MasonryGrid from "../components/MasonryGrid";
import Tag from "../components/Tag";
import LinkTag from "../components/LinkTag";
const iframecontentwindow = require("../scripts/iframeResizer.contentWindow.min.txt");

const Inscription = () => {
  let { number } = useParams();
  const [binaryContent, setBinaryContent] = useState(null);
  const [blobUrl, setBlobUrl] = useState(null);
  const [textContent, setTextContent] = useState(null);
  const [metadata, setMetadata] = useState(null);
  const [editions, setEditions] = useState(null);
  const [editionNumber, setEditionNumber] = useState(null);
  const [editionCount, setEditionCount] = useState(null);
  const [contentType, setContentType] = useState(null);
  const [nextNumber, setNextNumber] = useState(null);
  const [previousNumber, setPreviousNumber] = useState(null);
  const [randomNumber, setRandomNumber] = useState(null);
  const [isCollectionItem, setIsCollectionItem] = useState(null);
  const [address, setAddress] = useState(null);
  const [transfers, setTransfers] = useState(null); //Not displayed yet
  const [shortId, setShortId] = useState(null);
  const [shortAddress, setShortAddress] = useState(null);
  const [prettySize, setPrettySize] = useState(null);
  const [sha256, setSha256] = useState(null);
  const [similarInscriptions, setSimilarInscriptions] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  // const [similarInscriptionsContent, setSimilarInscriptionsContent] = useState(null);

  const [parentsData, setParentsData] = useState([]);
  const [delegateData, setDelegateData] = useState(null);
  const [recursiveSubmodulesData, setRecursiveSubmodulesData] = useState([]);
  const [satributeEditions, setSatributeEditions] = useState(null);
  const [referencedByData, setReferencedByData] = useState([]);
  const [childrenInscriptions, setChildrenInscriptions] = useState([]);

  // state to track section visibility (collapse/expand)
  const [sectionVisibility, setSectionVisibility] = useState({
    details: true,
    collectionMetadata: true,
    provenance: true,
    satributes: true
  });

  useEffect(() => {
    const fetchContent = async () => {
      setBlobUrl(null);
      setTextContent(null);
      setContentType("loading");
      //1. Get content
      const response = await fetch("/api/inscription_number/"+number);
      //2. Assign local url
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      console.log('return', blob, url)
      setBinaryContent(blob);
      setBlobUrl(url);
      //3. Work out type
      let content_type = response.headers.get("content-type");
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
          setContentType("model");
          break;
        default:
          setContentType("unsupported");
          break;
      }
    }
    
    const fetchMetadata = async () => {
      const response = await fetch("/api/inscription_metadata_number/"+number);
      const json = await response.json();
      setMetadata(json);
      const id = json.id;
      const short_id = id.slice(0, 5) + "..." + id.slice(-5);
      setShortId(short_id);
      const pretty_size = shortenBytes(json.content_length);
      setPrettySize(pretty_size);
      setSha256(json.sha256); // for similar
      setIsLoading(false); // can display metadata
    }

    const fetchEditions = async () => {
      setEditionNumber(null);
      setEditionCount(null);
      const response = await fetch("/api/inscription_edition_number/"+number);
      const json = await response.json();      
      setEditionNumber(json.edition);
      setEditionCount(json.total);
    }

    const fetchRandom = async () => {
      setRandomNumber(Math.floor(Math.random() * 1000001));
      //1. Get content
      const response = await fetch("/api/random_inscription");
      const json = await response.json();
      setRandomNumber(json?.number);
    }

    const fetchAddress = async () => {
      //1. Get address
      const response = await fetch("/api/inscription_last_transfer_number/" + number);
      const json = await response.json();
      const address = json.address;
      let short_address = "";
      if (address ==="unbound") {
        short_address = "unbound";
      } else {
        short_address = address.slice(0, 5) + "..." + address.slice(-5);
      }
      setShortAddress(short_address);
      setAddress(json);
      console.log(json);
    }

    const fetchTransfers = async () => {
      //1. Get transfers
      const response = await fetch("/api/inscription_transfers_number/" + number);
      const json = await response.json();
      setTransfers(json);
      console.log(json);
    }

    fetchContent();
    fetchMetadata();
    fetchAddress();
    //fetchTransfers();
    fetchEditions();
    // fetchRandom();
    // setNextNumber(parseInt(number)+1);
    // setPreviousNumber(parseInt(number)-1);
  },[number])

  useEffect(()=> {
    const updateText = async () => {
      //1. Update text state variable if text type
      if(contentType=="text" || contentType=="svg" || contentType=="html" ) {
        const text = await binaryContent.text();
        setTextContent(text);
      }
      if(metadata?.is_recursive && contentType=="svg") {
        setContentType("svg-recursive")
      }
    }
    updateText();
    console.log('metadata' , metadata); // remove
  },[contentType, metadata])

  const fetchSimilar = async () => {
    //1. Get similar inscriptions
    const response = await fetch("/search_api/similar/" + sha256 + "?n=50");
    const json = await response.json();
    setSimilarInscriptions(json);
  }

  useEffect(()=> {
    fetchSimilar();
  },[sha256]);

  const scrollContainer = useRef(null);

  const scrollLeft = () => {
    if (scrollContainer.current) {
      scrollContainer.current.scrollBy({ left: -268, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainer.current) {
      scrollContainer.current.scrollBy({ left: 268, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0); // Scrolls to the top of the page
  }, [number]);

  useEffect(() => {
    if (metadata) {
      const fetchInscriptionData = async (id) => {
        try {
          const metadataResponse = await fetch(`/api/inscription_metadata/${id}`);
          const metadataJson = await metadataResponse.json();
          // const contentResponse = await fetch(`/api/inscription_content_id/${metadataJson.number}`);
          // const contentBlob = await contentResponse.blob();
          return { 
            metadata: metadataJson, 
            // content: URL.createObjectURL(contentBlob),
            // contentType: contentResponse.headers.get("content-type")
          };
        } catch (error) {
          console.error(`Error fetching data for inscription ${id}:`, error);
          return null;
        }
      };

      const fetchRelatedInscriptions = async () => {
        // Fetch parents data
        if (metadata.parents && metadata.parents.length > 0) {
          const parentsPromises = metadata.parents.map(fetchInscriptionData);
          const parentsResults = await Promise.all(parentsPromises);
          setParentsData(parentsResults.filter(result => result !== null));
          console.log('parents', parentsResults)
        }

        // Fetch delegate data
        if (metadata.delegate) {
          const delegateResult = await fetchInscriptionData(metadata.delegate);
          setDelegateData(delegateResult);
          console.log('delegate', delegateResult)
        }

        // Fetch recursive submodules data
        if (metadata.referenced_ids && metadata.referenced_ids.length > 0) {
          const submodulesPromises = metadata.referenced_ids.map(fetchInscriptionData);
          const submodulesResults = await Promise.all(submodulesPromises);
          setRecursiveSubmodulesData(submodulesResults.filter(result => result !== null));
          console.log('rec sub', submodulesResults)
        }
      };

      fetchRelatedInscriptions();
    }
  }, [metadata]);

  useEffect(() => {
    const fetchSatributeEditions = async () => {
      if (metadata?.number) {
        try {
          const response = await fetch(`/api/inscription_satribute_editions_number/${metadata.number}`);
          const data = await response.json();
          setSatributeEditions(data);
        } catch (error) {
          console.error("Error fetching satribute editions:", error);
        }
      }
    };
  
    fetchSatributeEditions();
  }, [metadata?.number]);

  useEffect(() => {
    const fetchReferencedBy = async () => {
      if (metadata?.number) {
        try {
          const response = await fetch(`/api/inscription_referenced_by_number/${number}`);
          const data = await response.json();
          setReferencedByData(data);
          console.log('ref by', data)
        } catch (error) {
          console.error("Error fetching referenced by data:", error);
        }
      }
    };
  
    fetchReferencedBy();
  }, [metadata?.number]);
  
  useEffect(() => {
    const fetchChildrenInscriptions = async () => {
      if (metadata?.number) {
        try {
          const response = await fetch(`/api/inscription_children_number/${metadata.number}`);
          const data = await response.json();
          setChildrenInscriptions(data);
        } catch (error) {
          console.error("Error fetching children inscriptions:", error);
        }
      }
    };
  
    fetchChildrenInscriptions();
  }, [metadata?.number]);  
  
  const toggleSectionVisibility = (section) => {
    setSectionVisibility(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  }; 
  
  const renderLimitedTags = (data, limit = 6) => {
    const displayedTags = data.slice(0, limit);
  
    return (
      <>
        {displayedTags.map((item, index) => (
          <LinkTag key={index} hideIcon={true} link={`/inscription/${item.number}`} value={addCommas(item.number)} category={item.content_category} />
        ))}
      </>
    );
  };

  //TODO: add tz using moment.js or timeZoneName: "long"
  // <HtmlContainer><StyledIframe srcDoc={textContent} scrolling='no' sandbox='allow-scripts'></StyledIframe></HtmlContainer> alternative that doesn't require another network call - size is buggy though..
  return (
    <>
      <MainContainer>
        <ContentContainer>
          <MediaContainer>
            {
              {
                'image': <ImageContainer src={blobUrl} />,
                'svg-recursive': <SvgContainer src={"/api/inscription_number/"+ number} scrolling='no' sandbox='allow-scripts allow-same-origin' loading="lazy"/>,
                'svg': <ImageContainer src={"/api/inscription_number/"+ number}/>,
                'html': <HtmlContainer><StyledIframe src={"/api/inscription_number/"+ number} scrolling='no' sandbox='allow-scripts allow-same-origin' loading="lazy"></StyledIframe></HtmlContainer>,
                'text': <TextContainer><MediaText>{textContent}</MediaText></TextContainer>,
                'video': <VideoContainer controls loop muted autoplay><source src={blobUrl} type={metadata?.content_type}/></VideoContainer>,
                'audio': <AudioContainer controls><source src={blobUrl} type={metadata?.content_type}/></AudioContainer>,
                'pdf': <TextContainer>PDF not yet supported</TextContainer>,
                'model': <TextContainer>glTF model type not yet supported</TextContainer>,
                'unsupported': <TextContainer unsupported isCentered>{metadata?.content_type} content type not yet supported</TextContainer>,
                'loading': <TextContainer loading isCentered>Loading...</TextContainer>
              }[contentType]
            }
          </MediaContainer>
        </ContentContainer>
        <InfoContainer>
          {isLoading ? (
            <SkeletonContainer parent gap={'2.5rem'}>
              <SkeletonContainer gap={'.5rem'}>
                <SkeletonElement width={'12.5rem'} height={'1.625rem'} />
                <SkeletonElement width={'10rem'} height={'2.5rem'} />
                <SkeletonElement width={'7.5rem'} height={'1.625rem'} />
              </SkeletonContainer>
              <SkeletonContainer gap={'1.5rem'}>
                <SkeletonElement width={'100%'} height={'3rem'} />
                <SkeletonElement width={'100%'} height={'1.125rem'} />
                <SkeletonElement width={'100%'} height={'1.125rem'} />
                <SkeletonElement width={'100%'} height={'1.125rem'} />
                <SkeletonElement width={'100%'} height={'1.125rem'} />
                <SkeletonElement width={'100%'} height={'1.125rem'} />
                <SkeletonElement width={'100%'} height={'1.125rem'} />
                <SkeletonElement width={'100%'} height={'1.125rem'} />
                <SkeletonElement width={'100%'} height={'1.125rem'} />
              </SkeletonContainer>
            </SkeletonContainer>
          ) : (
            <>
              <DataContainer info gapSize={'1rem'}>
                <SectionPadding gap={'.75rem'}>
                  {metadata?.collection_name != null && metadata?.collection_name != undefined && (
                    <CollectionWrapper>
                      <CollectionLink to={'/collection/' + metadata?.collection_symbol}>
                        <CollectionContainer>
                          <CollectionText>
                            {metadata?.collection_name}
                          </CollectionText>
                          <IconWrapper>
                            <RibbonIcon svgSize={'1.25rem'} svgColor={'#E34234'} />
                          </IconWrapper>
                        </CollectionContainer>
                      </CollectionLink>
                    </CollectionWrapper>
                  )}
                  {metadata?.spaced_rune != null && metadata?.spaced_rune != undefined && (
                    <RuneWrapper>
                      <RuneContainer isRune={true}>
                        <IconWrapper isRune={true}>
                          <RuneIcon svgSize={'1.25rem'} svgColor={'#D23B75'} />
                        </IconWrapper>
                        <CollectionText>
                          {metadata?.spaced_rune}
                        </CollectionText>
                      </RuneContainer>
                    </RuneWrapper>
                    // <Stack gap={'.25rem'} horizontal={false}>
                    //   <CollectionContainer isRune={true}>
                    //     <RuneIcon svgSize={'1.25rem'} svgColor={'#D23B75'} />
                    //     <CollectionText>
                    //       {metadata?.spaced_rune != null && metadata?.spaced_rune != undefined ? metadata?.spaced_rune : ""}
                    //     </CollectionText>
                    //   </CollectionContainer>
                    // </Stack>
                  )}
                  <NumberText>
                    {metadata?.off_chain_metadata?.name 
                      ? metadata.off_chain_metadata.name 
                      : addCommas(metadata?.number)}
                  </NumberText>
                  {(metadata?.delegate || metadata?.is_recursive || metadata?.parents.length > 0 || childrenInscriptions.length > 0) && (
                    <Stack horizontal={true} gap={'.5rem'} style={{flexWrap: 'wrap'}}>
                      {metadata?.delegate && (
                        <TagContainer>
                          <LayersIcon svgSize={'1.125rem'} svgColor={'#000000'} />
                          Delegate
                        </TagContainer>
                      )}
                      {metadata?.is_recursive && (
                        <TagContainer>
                          <RepeatIcon svgSize={'1.125rem'} svgColor={'#000000'} />
                          Recursive
                        </TagContainer>
                      )}
                      {childrenInscriptions.length > 0 && (
                        <TagContainer>
                          <Person2Icon svgSize={'1.125rem'} svgColor={'#000000'} />
                          Parent
                        </TagContainer>
                      )}
                      {metadata?.parents.length > 0 && (
                        <TagContainer>
                          <SproutIcon svgSize={'1.125rem'} svgColor={'#000000'} />
                          Child
                        </TagContainer>
                      )}
                    </Stack>
                  )}
                </SectionPadding>
                {/* <PillContainer>
                  {editionNumber != null && editionNumber != undefined && (
                    <UnstyledLink to={'/edition/' + metadata?.sha256}>
                      <DataButton>
                        <HashIcon svgSize={'1rem'} svgColor={'#959595'}></HashIcon>
                        {editionNumber ? "Edition " + editionNumber + " of " + editionCount : ""}
                      </DataButton>
                    </UnstyledLink>
                  )}
                  <UnstyledLink to={'https://ordinals.com/inscription/' + metadata?.id} target='_blank'>
                    <DataButton>
                      <WebIcon svgSize={'1rem'} svgColor={'#959595'}></WebIcon>
                      View on ordinals.com
                    </DataButton>
                  </UnstyledLink>
                </PillContainer> */}
              </DataContainer>
              <DataContainer gapSize={'.75rem'}>
                <SectionHeader onClick={() => toggleSectionVisibility('details')}>
                  <SectionTextSpan>
                    <InfoCircleIcon svgSize={'1.25rem'} svgColor={'#000000'} />
                    Details
                  </SectionTextSpan>
                  <RotatableChevron svgSize={'1.25rem'} svgColor={'#000000'} isOpen={sectionVisibility.details} />
                </SectionHeader>
                {/* <InfoSectionText>Details</InfoSectionText> */}
                {sectionVisibility.details && (
                  <SectionPadding>
                    <DataContainer gapSize={'0'}>
                      <InfoRowContainer>
                        <InfoLabelContainer>
                          <InfoText isLabel={true}>Owner</InfoText>
                        </InfoLabelContainer>
                        <InfoDataContainer>
                          <UnstyledLink to={address?.address !== "unbound" ? '/address/' + address?.address : ""}>
                            <InfoText isLink={true}>{address?.address ? shortAddress : ""}</InfoText>
                          </UnstyledLink>
                        </InfoDataContainer>
                      </InfoRowContainer>
                      <InfoRowContainer isMiddle={true}>
                        <InfoLabelContainer>
                          <InfoText isLabel={true}>Inscription ID</InfoText>
                        </InfoLabelContainer>
                        <InfoDataContainer>
                          <UnstyledButton onClick={() => copyText(metadata?.id)}>
                            <InfoText>{metadata?.id ? shortId : ""}</InfoText>
                            <CopyIcon svgSize={'1rem'} svgColor={'#D9D9D9'} />
                          </UnstyledButton>
                        </InfoDataContainer>
                      </InfoRowContainer>
                      <InfoRowContainer isMiddle={true}>
                        <InfoLabelContainer>
                          <InfoText isLabel={true}>File Type</InfoText>
                        </InfoLabelContainer>
                        <InfoDataContainer>
                          <InfoText>{metadata?.content_type ? metadata?.content_type : ""}</InfoText>
                        </InfoDataContainer>
                      </InfoRowContainer>
                      <InfoRowContainer isMiddle={true}>
                        <InfoLabelContainer>
                          <InfoText isLabel={true}>File Size</InfoText>
                        </InfoLabelContainer>
                        <InfoDataContainer>
                          <InfoText>{metadata?.content_length ? prettySize : ""}</InfoText>
                        </InfoDataContainer>
                      </InfoRowContainer>
                      <InfoRowContainer isMiddle={true}>
                        <InfoLabelContainer>
                          <InfoText isLabel={true}>Block Time</InfoText>
                        </InfoLabelContainer>
                        <InfoDataContainer>
                          <UnstyledLink to={'/block/' + metadata?.genesis_height}>
                            <InfoText isLink={true}>{metadata?.genesis_height ? addCommas(metadata?.genesis_height) : ""}</InfoText>
                          </UnstyledLink>
                        </InfoDataContainer>
                      </InfoRowContainer>
                      <InfoRowContainer isMiddle={true}>
                        <InfoLabelContainer>
                          <InfoText isLabel={true}>Clock Time</InfoText>
                        </InfoLabelContainer>
                        <InfoDataContainer>
                          <InfoText>{metadata?.timestamp ? new Date(metadata?.timestamp*1000).toLocaleString(undefined, {day:"numeric", month: "short", year:"numeric", hour: 'numeric', minute: 'numeric', hour12: true}) : ""}</InfoText>
                        </InfoDataContainer>
                      </InfoRowContainer>
                      <InfoRowContainer isMiddle={true}>
                        <InfoLabelContainer>
                          <InfoText isLabel={true}>Fee</InfoText>
                        </InfoLabelContainer>
                        <InfoDataContainer>
                          <InfoText>{metadata?.genesis_fee ? addCommas(metadata?.genesis_fee) + " sats" : ""}</InfoText>
                        </InfoDataContainer>
                      </InfoRowContainer>
                      <InfoRowContainer isMiddle={true}>
                        <InfoLabelContainer>
                          <InfoText isLabel={true}>Sat Number</InfoText>
                        </InfoLabelContainer>
                        <InfoDataContainer>
                          <UnstyledLink to={'/sat/' + metadata?.sat}>
                            <InfoText isLink={true}>{metadata?.sat ? addCommas(metadata?.sat) : ""}</InfoText>
                          </UnstyledLink>
                        </InfoDataContainer>
                      </InfoRowContainer>
                    </DataContainer>
                  </SectionPadding>
                )}
              </DataContainer>
              {metadata?.off_chain_metadata?.attributes && metadata.off_chain_metadata.attributes.length > 0 && (
                <DataContainer gapSize={'.75rem'}>
                  <SectionHeader onClick={() => toggleSectionVisibility('collectionMetadata')}>
                    <SectionTextSpan>
                      <PaintIcon svgSize={'1.25rem'} svgColor={'#000000'} />
                      Collection Metadata
                    </SectionTextSpan>
                    <ChevronDownSmallIcon svgSize={'1.25rem'} svgColor={'#000000'} />
                  </SectionHeader>
                  {sectionVisibility.collectionMetadata && (
                    <SectionPadding gap={'1.5rem'}>
                      <DataContainer gapSize={'0'}>
                        <ElementContainer style={{flexWrap: 'wrap'}}>
                          {metadata.off_chain_metadata.attributes.map((attribute, index) => (
                            <Tag value={attribute.value} category={attribute.trait_type} />
                          ))}
                        </ElementContainer>
                      </DataContainer>
                      <InfoText isLabel={true}>Offchain metadata displayed</InfoText>
                    </SectionPadding>
                  )}
                </DataContainer>
              )}
              <DataContainer gapSize={'.75rem'}>
                <SectionHeader onClick={() => toggleSectionVisibility('provenance')}>
                  <SectionTextSpan>
                    <RouteIcon svgSize={'1.25rem'} svgColor={'#000000'} />
                    Provenance
                  </SectionTextSpan>
                  <ChevronDownSmallIcon svgSize={'1.25rem'} svgColor={'#000000'} />
                </SectionHeader>
                {sectionVisibility.provenance && (
                  <SectionPadding gap={'1.5rem'}>
                    {metadata?.parents.length > 0 && (
                      <SubSectionContainer>
                        <SubSectionHeaderContainer>
                          <Stack horizontal={true} center={true} gap={'.5rem'}>
                            <SubSectionHeader>Parent Inscriptions</SubSectionHeader>
                            {/* <ProvenanceCountText>{metadata?.parents.length}</ProvenanceCountText> */}
                          </Stack>
                        </SubSectionHeaderContainer>
                        <ElementContainer style={{flexWrap: 'wrap'}}>
                        {parentsData.map((parent, index) => (
                          <LinkTag key={index} hideIcon={true} link={`/inscription/${parent.metadata.number}`} value={addCommas(parent.metadata.number)} category={parent.metadata.content_category} />
                        ))}
                        </ElementContainer>
                      </SubSectionContainer>
                    )}
                    {metadata?.referenced_ids.length > 0 && (
                      <SubSectionContainer>
                        <SubSectionHeaderContainer>
                          <Stack horizontal={true} center={true} gap={'.5rem'}>
                            <SubSectionHeader>Recursive Submodules</SubSectionHeader>
                            {/* <ProvenanceCountText>{metadata?.referenced_ids.length}</ProvenanceCountText> */}
                          </Stack>
                        </SubSectionHeaderContainer>
                        <ElementContainer style={{flexWrap: 'wrap'}}>
                        {recursiveSubmodulesData.map((submodule, index) => (
                          <LinkTag key={index} hideIcon={true} link={`/inscription/${submodule.metadata.number}`} value={addCommas(submodule.metadata.number)} category={submodule.metadata.content_category} />
                        ))}
                        </ElementContainer>
                      </SubSectionContainer>
                    )}
                    {childrenInscriptions.length > 0 && (
                      <SubSectionContainer>
                        <SubSectionHeaderContainer>
                          <Stack horizontal={true} center={true} gap={'.5rem'}>
                            <SubSectionHeader>Child Inscriptions</SubSectionHeader>
                          </Stack>
                        </SubSectionHeaderContainer>
                        <ElementContainer style={{flexWrap: 'wrap'}}>
                          {renderLimitedTags(childrenInscriptions)}
                        </ElementContainer>
                      </SubSectionContainer>
                    )}
                    {referencedByData.length > 0 && (
                      <SubSectionContainer>
                        <SubSectionHeaderContainer>
                          <Stack horizontal={true} center={true} gap={'.5rem'}>
                            <SubSectionHeader>Referenced By</SubSectionHeader>
                          </Stack>
                        </SubSectionHeaderContainer>
                        <ElementContainer style={{flexWrap: 'wrap'}}>
                          {renderLimitedTags(referencedByData)}
                        </ElementContainer>
                      </SubSectionContainer>
                    )}
                    {metadata?.delegate && (
                      <SubSectionContainer>
                        <SubSectionHeaderContainer>
                          <Stack horizontal={true} center={true} gap={'.5rem'}>
                            <SubSectionHeader>Delegate</SubSectionHeader>
                          </Stack>
                        </SubSectionHeaderContainer>
                        <ElementContainer style={{flexWrap: 'wrap'}}>
                          {delegateData?.metadata.number && (
                            <TagContainer>
                              <TagSpan isValue={true}>{addCommas(delegateData.metadata.number)}</TagSpan>
                              <TagSpan>{' • ' + delegateData.metadata.content_category}</TagSpan>
                            </TagContainer>
                          )}
                        </ElementContainer>
                      </SubSectionContainer>
                    )}
                    {editionNumber != null && editionNumber != undefined && metadata?.delegate == null && (
                      <SubSectionContainer>
                        <SubSectionHeaderContainer>
                          <Stack horizontal={true} center={true} gap={'.5rem'}>
                            <SubSectionHeader>Editions</SubSectionHeader>
                            <ProvenanceCountText>{editionNumber ? editionNumber + " of " + editionCount : ""}</ProvenanceCountText>
                          </Stack>
                          <UnstyledLink to={'/edition/' + metadata?.sha256}>
                            <LinkButton isLink={true}>View all</LinkButton>
                          </UnstyledLink>
                        </SubSectionHeaderContainer>
                      </SubSectionContainer>
                    )}
                  </SectionPadding>
                )}
              </DataContainer>
              {metadata?.satributes.length > 0 && (
                <DataContainer gapSize={'.75rem'}>
                  <SectionHeader onClick={() => toggleSectionVisibility('satributes')}>
                    <SectionTextSpan>
                      <ScrollIcon svgSize={'1.25rem'} svgColor={'#000000'} />
                      Satributes
                    </SectionTextSpan>
                    <ChevronDownSmallIcon svgSize={'1.25rem'} svgColor={'#000000'} />
                  </SectionHeader>
                  {sectionVisibility.satributes && (
                    <SectionPadding isLast={true}>
                      <DataContainer gapSize={'0'}>
                        <ElementContainer style={{flexWrap: 'wrap'}}>
                          {metadata?.satributes.map(satribute => {
                            const editionInfo = satributeEditions?.find(se => se.satribute === satribute);
                            return (
                              <TagContainer key={satribute}>
                                <TagSpan isValue={true}>{satribute}</TagSpan>
                                {editionInfo && (
                                  <TagSpan>{formatEditionRange(editionInfo.satribute_edition) + '/' + formatEditionRange(editionInfo.total)}</TagSpan>
                                )}
                              </TagContainer>
                            );
                          })}
                        </ElementContainer>
                      </DataContainer>
                    </SectionPadding>
                  )}
                </DataContainer>
              )}
            </>
          )}
        </InfoContainer>
      </MainContainer>
      {similarInscriptions?.length > 0 && (
        <SimilarContentContainer>
          <SectionContainer>
            <SectionHeaderContainer>
              <SparklesIcon svgSize={'1.5rem'} svgColor={'#000000'} />
              <SimilarText>Similar Inscriptions</SimilarText>
            </SectionHeaderContainer>
            {/* <ArrowContainer>
              <ArrowButton onClick={scrollLeft}>
                <ChevronLeftIcon svgSize={'1.25rem'} svgColor={'#959595'} />
              </ArrowButton>
              <ArrowButton onClick={scrollRight}>
                <ChevronRightIcon svgSize={'1.25rem'} svgColor={'#959595'} />
              </ArrowButton>
            </ArrowContainer> */}
          </SectionContainer>
          {/* <ImageRowContainer ref={scrollContainer}>
            {similarInscriptions?.map(
              entry =>
                <SmallItemContainer key={entry.id} number={entry.number} />
            )}
          </ImageRowContainer> */}
          <MasonryGrid similarInscriptions={similarInscriptions} />
        </SimilarContentContainer>
      )}
    </>
  )
}

const PageContainer = styled.div`
  //width: 100%;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  flex: 1;
  align-items: center;
  justify-content: space-between;
  position: relative;
  overflow-x: hidden;
  -ms-overflow-style: none;
  scrollbar-width: none;
  gap: 0;

  // @media (max-width: 768px) {
  //   padding: 0 2rem;
  // }
`;

const MainContainer = styled.div`
  width: 100%;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: row;
  align-items: flex-start;

  @media (max-width: 864px) {
    flex-direction: column;;
    align-items: center;
    width: calc(100% - 3rem);
    padding: 1rem 1.5rem 2.5rem 1.5rem;
    gap: 2rem;
  }
`;

const ContentContainer = styled.div`
  background-color: #F7F7F7;
  position: sticky;
  top: 5rem;
  max-height: 100vh;
  overflow-y: scroll;
  display: flex;
  flex-direction: column;
  flex-wrap: nowrap;
  justify-content: center;
  align-items: center;
  width: calc(100% - 27rem);
  height: calc(100vh - 5rem);
  flex: 1;
  overflow: hidden;
  margin: 0;
  padding: 0 1.5rem;
  min-width: 20rem;

  @media (max-width: 864px) {
    position: static;
    background-color: #FFFFFF;
    width: 100%;
    min-width: unset;
  }
`;

const MediaContainer = styled.div`
  background-color: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  max-width: 32rem;
  height: auto;
  aspect-ratio: 1/1;
`;

const UnstyledLink = styled(Link)`
  color: unset;
  text-decoration: unset;
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
`;

const SvgContainer = styled.iframe`
  max-width: 100%;
  max-height: 100%;
  min-width: 100%; /* Ensures scaling up */
  min-height: 100%; /* Ensures scaling up */
  width: auto;
  height: auto;
  object-fit: contain;
  aspect-ratio: 1/1;
  image-rendering: pixelated;
  border: none;
`;

const TextContainer = styled.div`
  background-color: #FFFFFF;
  border: 2px solid #F5F5F5;
  box-sizing: border-box;
  padding: .5rem;
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
  white-space-collapse: preserve;
  overflow: hidden;
  overflow-y: scroll;
  // text-overflow: ellipsis;
  text-wrap: wrap;
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
  overflow: hidden;
  text-overflow: ellipsis;
  text-wrap: wrap;
`;

const AudioContainer = styled.audio`
  margin-top: 6rem;
  margin-bottom: 6rem;
  @media (max-width: 576px) {
    margin-top: 3rem;
    margin-bottom: 3rem;
  }
`

const VideoContainer = styled.video`
  width: 100%;
  height: auto;
  aspect-ratio: 1/1;
`

const StyledIframe = styled.iframe`
  border: none;
  //flex: 0 100%;
  //flex-grow: 1;
  width: 100%;
  resize: both;
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
  cursor: pointer;
`;

const InfoContainer = styled.div`
  padding: 3rem 2rem;
  width: 100%;
  max-width: 27rem;
  display: flex;
  flex-direction: column;
  // gap: 2.5rem;
  overflow-y: auto; // Enable scrolling for overflow content
  position: relative; // Adjust if necessary for layout

  @media (max-width: 864px) {
    padding: 1rem 0 0 0;
    max-width: 100%; 
  }
`;

const DataContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${(props) => props.gapSize};

  @media (max-width: 768px) {
    align-items: ${(props) => props.info ? 'center' : ''};
  }
`;

const PillContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  gap: 1rem;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    justify-content: center;
  }
`;

const NumberText = styled.h1`
  font-family: Relative Trial Bold;
  font-size: 2em;
  margin: 0;
`;

const InfoRowContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;
  flex-wrap: nowrap;
  width: 100%;
  gap: .5rem;
  padding: .75rem 0;
  border-top: ${(props) => props.isMiddle ? '1px solid #E9E9E9' : 'none'};
`;

const ElementContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;
  flex-wrap: nowrap;
  width: 100%;
  gap: .5rem;
  padding: 0;
`;

const InfoLabelContainer = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  justify-content: flex-start;
  align-items: center;
  width: 100%;
`;

const InfoDataContainer = styled.div`
  display: flex;
  flex: none;
  flex-direction: row;
  flex-wrap: nowrap;
  justify-content: flex-start;
  align-items: center;
  gap: .5rem;
`;

const InfoSectionText = styled.p`
  font-family: Relative Trial Medium;
  font-size: .875rem;
  margin: 0;
  padding: 0;
`;

const InfoText = styled.p`
  font-family: Relative Trial Medium;
  font-size: .875rem;
  margin: 0;
  padding: 0;
  color: ${props => props.isLabel ? '#959595' : '#000000'};
  text-decoration: ${props => props.isLink ? 'underline' : 'none'};
  text-underline-offset: .25rem;
`;

const LinkButton = styled.p`
  font-family: Relative Trial Medium;
  font-size: .875rem;
  border: none;
  margin: 0;
  padding: 0;
  color: #959595;
  text-decoration: underline;
  text-underline-offset: .25rem;
  transition: 
    color 350ms ease,
    transform 150ms ease;
  transform-origin: center center;

  &:hover {
    color: #000000;
  }
`;

const DataButton = styled.button`
  border-radius: .5rem;
  border: none;
  padding: .25rem .5rem;
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  gap: .5rem;
  font-family: Relative Trial Medium;
  font-size: .875rem;
  color: #959595;
  background-color: #F5F5F5;
  transition: 
    background-color 350ms ease,
    transform 150ms ease;
  transform-origin: center center;

  &:hover {
    background-color: #E9E9E9;
  }

  &:active {
    transform: scale(0.96);
  }
`;

const UnstyledButton = styled.button`
  border: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: .5rem;
  background-color: #FFFFFF;
  cursor: pointer;

  transition: 
    background-color 350ms ease,
    transform 150ms ease;
  transform-origin: center center;

  &:active {
    transform: scale(0.96);
  }
`;

const SectionContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin: 0 0 1.5rem 0;
`;

const SectionHeaderContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: .5rem;
`;

const SimilarContentContainer = styled.div`
  width: calc(100% - 6rem);
  padding: 1.5rem 3rem;
  display: block; // Ensure it is a block element

  @media (max-width: 864px) {
    width: calc(100% - 3rem);
    padding: 1.5rem;
  }
`;

const SimilarText = styled.p`
  font-family: Relative Trial Bold;
  font-size: 1.5rem;
  margin: 0;
  padding: 0;
`;

const ArrowContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: .5rem;
`;

const ArrowButton = styled.div`
  border-radius: 2rem;
  border: none;
  height: 2rem;
  width: 2rem;
  margin: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  gap: .5rem;
  font-family: Relative Trial Medium;
  font-size: .875rem;
  color: #959595;
  background-color: #F5F5F5;
  transition: 
    background-color 350ms ease,
    transform 150ms ease;
  transform-origin: center center;
  // opacity: .2;

  &:hover {
    background-color: #E9E9E9;
  }

  &:active {
    transform: scale(0.96);
  }
`;

const ImageRowContainer = styled.div`
  display: flex; // Use flexbox for layout
  flex-direction: row; // Arrange children in a row
  gap: .75rem; // Space between items
  overflow-x: auto; // Allow horizontal scrolling
  width: 100%;
  align-items: center; // Align items vertically in the center
  white-space: nowrap; // Prevent wrapping of content within items

  & > * {
    flex: 1 0 192px; // Grow to fill available space, don't shrink, minimum width of 128px
  }

  &::-webkit-scrollbar {
    display: none; // Optionally hide the scrollbar
  }
`;

const GridContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
  width: 100%;
  overflow-x: auto;
  padding-bottom: 1rem;

  &::-webkit-scrollbar {
    height: 6px;
  }

  &::-webkit-scrollbar-thumb {
    background-color: #D0D0D0;
    border-radius: 3px;
  }

  &::-webkit-scrollbar-track {
    background-color: #F0F0F0;
  }
`;



const SectionHeader = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  height: 3rem;
  background-color: #FFFFFF;
  padding: 0 1rem;
  border-radius: 1.5rem;
  cursor: pointer;
  transition: 
    background-color 350ms ease,
    transform 150ms ease;
  transform-origin: center center;
  user-select: none;

  &:hover {
    background-color: #F5F5F5;
  }

  // &:active {
  //   transform: scale(0.96);
  // }
`;

const SectionTextSpan = styled.span`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: .5rem;
  font-family: Relative Trial Medium;
  font-size: 1rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%;
`;

const SectionPadding = styled.div`
  width: 100%;
  // max-width: 23rem;
  box-sizing: border-box;
  padding: ${props => props.isLast ? '0 1rem' : '0 1rem 2.5rem 1rem'};
  display: flex;
  flex-direction: column;
  gap: ${(props) => props.gap};
`; 

const SubSectionContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: .75rem;
`;

const SubSectionHeaderContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;

const SubSectionHeader = styled.p`
  font-family: Relative Trial Medium;
  font-size: .875rem;
  margin: 0;
  padding: 0;
`;

const ProvenanceCountText = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  background-color: #F5F5F5;
  padding: .125rem .375rem;
  border-radius: .5rem;
  box-sizing: border-box;
  min-width: 1.375rem;
  height: 1.375rem;
  font-family: Relative Trial Medium;
  font-size: .875rem;
  color: #959595;
`;

const CollectionWrapper = styled.div`
  width: 100%;
  max-width: 100%;
`;

const CollectionLink = styled(Link)`
  display: inline-block;
  max-width: 100%;
  color: unset;
  text-decoration: unset;
`;

const CollectionContainer = styled.div`
  display: inline-flex;
  flex-direction: row;
  align-items: center;
  box-sizing: border-box;
  background-color: #F5F5F5;
  padding: .25rem .5rem;
  border-radius: .5rem;
  font-family: Relative Trial Medium;
  font-size: 1rem;
  color: ${props => props.isRune ? '#D23B75' : '#E34234'}; 
  max-width: 100%;
  width: 100%;
  cursor: pointer;
  transition: 
    background-color 350ms ease,
    transform 150ms ease;
  transform-origin: center center;

  &:hover {
    background-color: #E9E9E9;
  }
`;

const RuneWrapper = styled.div`
  display: inline-block;
  max-width: 100%;
`;

const RuneContainer = styled(CollectionContainer)`
  width: auto;
`;

const CollectionText = styled.span`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
  min-width: 0;
  max-width: calc(100% - 1.5rem); // Adjust based on icon size
`;

const IconWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin: ${props => props.isRune ? '0 .25rem 0 0' : '0 0 0 .25rem'}; 
  width: 1.25rem;
`;

const SkeletonContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${(props) => props.gap};
  width: 100%;
  max-width: 23rem;
  padding: ${props => props.parent ? '0 1rem' : '0'};
`;

const SkeletonBase = styled.div`
  background-color: #F5F5F5;
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  border-radius: .5rem;

  @keyframes pulse {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: .5;
    }
  }
`;

const SkeletonElement = styled(SkeletonBase)`
  height: ${(props) => props.height};
  width: ${(props) => props.width};
`;

const SkeletonNumberText = styled(SkeletonBase)`
  height: 2.5rem;
  width: 200px;
`;

const SkeletonDetailSection = styled(SkeletonBase)`
  height: 3rem;
  width: 100%;
`;

const TagContainer = styled.button`
  border-radius: .5rem;
  border: none;
  padding: .25rem .5rem;
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  gap: .25rem;
  font-family: Relative Trial Medium;
  font-size: .875rem;
  color: #000000;
  background-color: #F5F5F5;
  transition: 
    background-color 350ms ease,
    transform 150ms ease;
  transform-origin: center center;

  &:hover {
    background-color: #E9E9E9;
  }

  &:active {
    transform: scale(0.96);
  }
`;

const TagSpan = styled.span`
  color: ${props => props.isValue ? '#000000' : '#959595'};
`;

const RotatableChevron = styled(ChevronDownSmallIcon)`
  transition: transform 0.3s ease;
  transform: ${props => props.isOpen ? 'rotate(0deg)' : 'rotate(-90deg)'};
`;

export default Inscription;