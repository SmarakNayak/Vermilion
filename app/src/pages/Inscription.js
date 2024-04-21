import React, { useState, useEffect } from 'react';
import { useParams, Link } from "react-router-dom";
import styled from 'styled-components';
import TopSection from '../components/TopSection';
import Stack from '../components/Stack';
import { addCommas, copyText } from '../helpers/utils';
import HashIcon from '../assets/icons/HashIcon';
import WebIcon from '../assets/icons/WebIcon';
import CopyIcon from '../assets/icons/CopyIcon';
import { shortenBytes } from '../helpers/utils';
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
  },[contentType])

  //TODO: add tz using moment.js or timeZoneName: "long"
  // <HtmlContainer><StyledIframe srcDoc={textContent} scrolling='no' sandbox='allow-scripts'></StyledIframe></HtmlContainer> alternative that doesn't require another network call - size is buggy though..
  return (
    <PageContainer>
      <TopSection />
      <MainContainer>
        <ContentContainer>
          {
            {
              'image': <ImageContainer src={blobUrl} />,
              'svg-recursive': <SvgContainer src={"/api/inscription_number/"+ number} scrolling='no' sandbox='allow-scripts allow-same-origin' loading="lazy"/>,
              'svg': <ImageContainer src={"/api/inscription_number/"+ number}/>,
              'html': <HtmlContainer><StyledIframe src={"/api/inscription_number/"+ number} scrolling='no' sandbox='allow-scripts allow-same-origin' loading="lazy"></StyledIframe></HtmlContainer>,
              'text': <TextContainer><p>{textContent}</p></TextContainer>,
              'video': <VideoContainer controls loop muted autoplay><source src={blobUrl} type={metadata?.content_type}/></VideoContainer>,
              'audio': <AudioContainer controls><source src={blobUrl} type={metadata?.content_type}/></AudioContainer>,
              'pdf': <TextContainer>pdf unsupported</TextContainer>,
              'model': <TextContainer>gltf model type unsupported</TextContainer>,
              'unsupported': <TextContainer>{metadata?.content_type} content type unsupported</TextContainer>,
              'loading': <TextContainer>loading...</TextContainer>
            }[contentType]
          }
        </ContentContainer>
        <InfoContainer>
          <DataContainer gapSize={'1rem'}>
            <NumberText>{metadata?.number ? addCommas(metadata?.number) : ""}</NumberText>
            <Stack horizontal={true} center={false} style={{gap: '1rem', flexWrap: 'wrap'}}>
              <UnstyledLink to={'/edition/' + metadata?.sha256}>
                <DataButton>
                  <HashIcon svgSize={'1rem'} svgColor={'#959595'}></HashIcon>
                  {editionNumber ? "Edition " + editionNumber + " of " + editionCount : ""}
                </DataButton>
              </UnstyledLink>
              <UnstyledLink to={'https://ordinals.com/inscription/' + metadata?.id} target='_blank'>
                <DataButton>
                  <WebIcon svgSize={'1rem'} svgColor={'#959595'}></WebIcon>
                  View on ordinals.com
                </DataButton>
              </UnstyledLink>
            </Stack>
          </DataContainer>
          <DataContainer gapSize={'.75rem'}>
            <InfoSectionText>Details</InfoSectionText>
            <DataContainer gapSize={'0'}>
              <InfoRowContainer>
                <InfoLabelContainer>
                  <InfoText isLabel={true}>Owner</InfoText>
                </InfoLabelContainer>
                <InfoDataContainer>
                  <UnstyledLink to={'/address/' + address?.address}>
                    <InfoText isLink={true}>{address?.address ? shortAddress : ""}</InfoText>
                  </UnstyledLink>
                  <UnstyledButton onClick={() => copyText(metadata?.id)}>                    
                    <CopyIcon svgSize={'1rem'} svgColor={'#D9D9D9'} />
                  </UnstyledButton>
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
        </InfoContainer>
      </MainContainer>
    </PageContainer>
    
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

  @media (max-width: 768px) {
    padding: 0 2rem;
  }
`;

const MainContainer = styled.div`
  width: 100%;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  flex: 1;

  @media (max-width: 768px) {
    flex-direction: column;;
    align-items: center;
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

  @media (max-width: 768px) {
    width: 100%;
    background-color: #FFFFFF;
  }
`;

const UnstyledLink = styled(Link)`
  color: unset;
  text-decoration: unset;
`;

const LinksContainer = styled.div`
  display: flex;
  flex-direction: row;
  flex: 1;
  align-items: center;
  justify-content: space-between;
  position: relative;
  margin-top: 25px;
  margin-bottom: 25px;
`;

const ImageContainer = styled.img`
  min-width: 16rem;
  width: auto;
  height: auto;
  max-width: 32rem;
  max-height: 32rem;
  image-rendering: pixelated;

  @media (max-width: 576px) {
    max-width: 20rem;
    max-height: 20rem;
    margin-top: 3rem;
    margin-bottom: 3rem;
  }
`;

const SvgContainer = styled.iframe`
  display: flex;
  justify-content: center;
  align-items: center;
  width: auto;
  height: auto;
  min-width:16rem;
  min-height:16rem;
  max-width: 32rem;
  max-height: 32rem;
  image-rendering: pixelated;
  border-radius: 4px;
  border: 8px solid #FFF;
  box-shadow: 0px 1px 6px 0px rgba(0, 0, 0, 0.09);
  resize: both;
  margin-top: 6rem;
  margin-bottom: 6rem;

  @media (max-width: 576px) {
    max-width: 20rem;
    max-height: 20rem;
    margin-top: 3rem;
    margin-bottom: 3rem;
  }
`;

const Heading = styled.h2`
  font-family: monospace;
  font-weight: normal;
`

const MetadataContainer = styled.div`
  min-width: 30rem;

  @media (max-width: 576px) {
    min-width: 20rem;
    max-width: 20rem;
  }
`

const MetadataLineContainer = styled.div`
  align-items: baseline;
  display: flex;
  margin-block-start: 1em;
  margin-block-end: 1em;
  justify-content: space-between;
`

const StyledP = styled.p`
  margin-block-start: 0em;
  margin-block-end: 0em;
  margin-inline-end: 5px;
`

const TextContainer = styled.div`
  display: flex;
  align-items: center;
  min-height: 11rem;
  max-width: 800px;
  margin: 1em;
  font-size: 1em;
  font-family: monospace;
  white-space-collapse: preserve;
  margin-top: 6rem;
  margin-bottom: 6rem;
  @media (max-width: 576px) {
    margin-top: 3rem;
    margin-bottom: 3rem;
  }
`;

const HtmlContainer = styled.div`
  display: flex;
  justify-content: center;
  width: auto;
  height: auto;
  min-width:16rem;
  min-height:16rem;
  max-width: 32rem;
  max-height: 32rem;
  border-radius: 4px;
  border: 8px solid #FFF;
  box-shadow: 0px 1px 6px 0px rgba(0, 0, 0, 0.09);
  margin-top: 6rem;
  margin-bottom: 6rem;

  @media (max-width: 576px) {
    max-width: 20rem;
    max-height: 20rem;
    margin-top: 3rem;
    margin-bottom: 3rem;
  }
`

const AudioContainer = styled.audio`
  margin-top: 6rem;
  margin-bottom: 6rem;
  @media (max-width: 576px) {
    margin-top: 3rem;
    margin-bottom: 3rem;
  }
`

const VideoContainer = styled.video`
  margin-top: 6rem;
  margin-bottom: 6rem;
  @media (max-width: 576px) {
    margin-top: 3rem;
    margin-bottom: 3rem;
  }
`

const StyledIframe = styled.iframe`
  border: none;
  //flex: 0 100%;
  //flex-grow: 1;
  width: 100%;
  resize: both;
  //aspect-ratio: 1/1;
`;

const TopContainer = styled.div`
  width: 96%;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  // position: absolute;
  // top: 0;
  height: 4rem;
`;

const CenterContainer = styled.div`
  width: 96%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

const BottomContainer = styled.div`
  width: 96%;
  display: flex;
  visibility: hidden;
  height: 4rem;
`;

const TopLinksContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  column-gap: 1rem;
`;

const SiteText = styled(Link)`
  font-family: ABC Camera Unlicensed Trial Bold;
  font-size: 1.25rem;
  color: #E34234;
  padding: 0;
  margin: 0;
  cursor: pointer;
  text-decoration: none;
`;

const InfoContainer = styled.div`
  padding: 3rem 3rem;
  width: 100%;
  max-width: 25rem;
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
`;

const DataContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${(props) => props.gapSize};
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

export default Inscription;