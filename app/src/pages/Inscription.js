import React, { useEffect, useRef, useState } from 'react';
import { useParams, Link } from "react-router-dom";
import styled from 'styled-components';
import TopSection from '../components/TopSection';
import Stack from '../components/Stack';
import { addCommas, copyText } from '../helpers/utils';
import HashIcon from '../assets/icons/HashIcon';
import WebIcon from '../assets/icons/WebIcon';
import CopyIcon from '../assets/icons/CopyIcon';
import IntersectionIcon from '../assets/icons/IntersectionIcon';
import ChevronLeftIcon from '../assets/icons/ChevronLeftIcon';
import ChevronRightIcon from '../assets/icons/ChevronRightIcon';
import { shortenBytes } from '../helpers/utils';
import GridItemContainer from '../components/GridItemContainer';
import SmallItemContainer from '../components/SmallItemContainer';
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
  const [address, setAddress] = useState(null);
  const [transfers, setTransfers] = useState(null); //Not displayed yet
  const [shortId, setShortId] = useState(null);
  const [shortAddress, setShortAddress] = useState(null);
  const [prettySize, setPrettySize] = useState(null);
  const [sha256, setSha256] = useState(null);
  const [similarInscriptions, setSimilarInscriptions] = useState(null);
  // const [similarInscriptionsContent, setSimilarInscriptionsContent] = useState(null);

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
    fetchRandom();
    setNextNumber(parseInt(number)+1);
    setPreviousNumber(parseInt(number)-1);
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
  },[contentType, metadata])

  const fetchSimilar = async () => {
    //1. Get similar inscriptions
    const response = await fetch("/search_api/similar/" + sha256);
    const json = await response.json();
    setSimilarInscriptions(json);
    console.log('similar', json);
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
          <DataContainer info gapSize={'1rem'}>
            <NumberText>{metadata?.number != null && metadata?.number != undefined ? addCommas(metadata?.number) : ""}</NumberText>
            <PillContainer>
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
            </PillContainer>
          </DataContainer>
          <DataContainer gapSize={'.75rem'}>
            <InfoSectionText>Details</InfoSectionText>
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
          </DataContainer>
          {metadata?.satributes.length > 0 && (
            <DataContainer gapSize={'.75rem'}>
              <InfoSectionText>Satributes</InfoSectionText>
              <DataContainer gapSize={'0'}>
                <InfoRowContainer style={{flexWrap: 'wrap'}}>
                  {metadata?.satributes.map( 
                    satribute => 
                      <DataButton>{satribute}</DataButton>
                    )}
                </InfoRowContainer>
              </DataContainer>
            </DataContainer>
          )}
        </InfoContainer>
      </MainContainer>
      {similarInscriptions?.length > 0 && (
        <SimilarContentContainer>
          <SectionContainer>
            <SectionHeaderContainer>
              <IntersectionIcon svgSize={'1.125rem'} svgColor={'#000000'} />
              <SimilarText>Similar inscriptions</SimilarText>
            </SectionHeaderContainer>
            <ArrowContainer>
              <ArrowButton onClick={scrollLeft}>
                <ChevronLeftIcon svgSize={'1.25rem'} svgColor={'#959595'} />
              </ArrowButton>
              <ArrowButton onClick={scrollRight}>
                <ChevronRightIcon svgSize={'1.25rem'} svgColor={'#959595'} />
              </ArrowButton>
            </ArrowContainer>
          </SectionContainer>
          <ImageRowContainer ref={scrollContainer}>
            {similarInscriptions?.map(
              entry =>
                <SmallItemContainer key={entry.id} number={entry.number} />
            )}
          </ImageRowContainer>
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

  @media (max-width: 768px) {
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
  width: calc(100% - 25rem);
  height: calc(100vh - 4.5rem);
  flex: 1;
  overflow: hidden;
  margin: 0;
  padding: 0 1.5rem;
  min-width: 20rem;

  @media (max-width: 768px) {
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
  padding: 3rem 3rem;
  width: 100%;
  max-width: 25rem;
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
  overflow-y: auto; // Enable scrolling for overflow content
  position: relative; // Adjust if necessary for layout

  @media (max-width: 768px) {
    padding: 0rem;
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

const NumberText = styled.p`
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
  margin: 0 0 1rem 0;
`;

const SectionHeaderContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: .5rem;
`;

const SimilarContentContainer = styled.div`
  width: calc(100% - 3rem);
  padding: 2rem 1.5rem;
  display: block; // Ensure it is a block element
`;

const SimilarText = styled.p`
  font-family: Relative Trial Medium;
  font-size: 1rem;
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

export default Inscription;