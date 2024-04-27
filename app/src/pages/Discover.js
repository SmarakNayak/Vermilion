import React, { useState, useEffect, useRef, createRef } from 'react';
import { useParams, Link } from "react-router-dom";
import styled from 'styled-components';
import { addCommas } from '../helpers/utils';
import TopSection from '../components/TopSection';
import CopyIcon from '../assets/icons/CopyIcon';
import ArrowSquareIcon from '../assets/icons/ArrowSquareIcon';
import { Toaster, toast } from 'sonner';
const iframecontentwindow = require("../scripts/iframeResizer.contentWindow.min.txt");

const Discover = () => {
  const [number, setNumber] = useState(0);
  const [metadata, setMetadata] = useState(null);
  const [inscriptions, setInscriptions] = useState([]);
  const [activeInscription, setActiveInscription] = useState(null);

  const fetchInscriptions = async () => {
    console.log("Fetching")
    const response = await fetch(`/api/random_inscriptions?n=30`);
    const newInscriptions = await response.json();
    setInscriptions(inscriptions => [...inscriptions, ...newInscriptions])
    return newInscriptions;
  }

  const fetchInitial = async() => {
    //Start both calls at same time
    const genesis_promise = fetch(`/api/inscription_metadata_number/0`);
    const random_promise = fetch(`/api/random_inscriptions?n=30`);
    //Responses should arrive at similar times:
    const genesis_response = await genesis_promise;
    const random_response = await random_promise;
    const genesis_json = await genesis_response.json();
    const random_json = await random_response.json();
    //load both responses at same time to avoid lag after genesis/ out of order
    setInscriptions([genesis_json, ...random_json])
  }

  useEffect(() => {
    console.log("Initial fetch");
    fetchInitial();
  }, []);

  const observerTarget = useRef(null);
  const inscriptionReferences = useRef([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting) {
          console.log("3 to go, prefetch");
          fetchInscriptions();
        }
      },
      { threshold: 0.5 }
    );

    
    if (inscriptionReferences.current[inscriptions.length-3]) {
      observer.observe(inscriptionReferences.current[inscriptions.length-3]);
    }

    return () => {
      if (inscriptionReferences.current[inscriptions.length-3]) {
        observer.unobserve(inscriptionReferences.current[inscriptions.length-3]);
      }
    }

  }, [inscriptions, inscriptionReferences])

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && inscriptions.length !==0) { // Already prefetching on page load, no need to double prefetch
          console.log("last one, definitely prefetch");
          fetchInscriptions()
        }
      },
      { threshold: 0.5 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => {
      if (observerTarget.current) {
        observer.unobserve(observerTarget.current);
      }
    }
  }, [observerTarget]);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(function() {
      console.log('Copying to clipboard was successful!');
    }, function(err) {
      console.error('Could not copy text: ', err);
    });
  }

  const scrollToInscription = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setActiveInscription(entry.target.id);
          }
        });
      },
      { root: null, threshold: 0.5 } // Adjust threshold as needed
    );

    inscriptionReferences.current.forEach(ref => {
      if (ref) observer.observe(ref);
    });

    return () => {
      inscriptionReferences.current.forEach(ref => {
        if (ref) observer.unobserve(ref);
      });
    };
  }, [inscriptions]); // Dependency on inscriptions to re-attach observers when list changes

  // useEffect(() => {
  //   if (activeInscription) {
  //     // Find the index of the active inscription based on its ID.
  //     const index = parseInt(activeInscription.replace('inscription-', ''), 10) - 1;
  //     const inscriptionListElement = document.getElementById('inscription-list');
  //     const activeThumbnailElement = inscriptionListElement.children[index];
  
  //     if (activeThumbnailElement) {
  //       // Calculate the offset needed to center the thumbnail.
  //       const centerPosition = inscriptionListElement.offsetHeight / 2;
  //       const activeThumbnailOffset = activeThumbnailElement.offsetTop + activeThumbnailElement.offsetHeight / 2;
        
  //       // Adjust the scroll position of the InscriptionList.
  //       inscriptionListElement.scrollTop = activeThumbnailOffset - centerPosition;
  //     }
  //   }
  // }, [activeInscription]);

  useEffect(() => {
    if (activeInscription) {
      const headerHeight = 60; // Height of the header in pixels
      const index = parseInt(activeInscription.replace('inscription-', ''), 10) - 1;
      const inscriptionListElement = document.getElementById('inscription-list');
      const activeThumbnailElement = inscriptionListElement.children[index];
  
      if (activeThumbnailElement) {
        const listVisibleTop = inscriptionListElement.scrollTop + headerHeight; // Adjusted for header
        const listVisibleBottom = listVisibleTop + inscriptionListElement.clientHeight - headerHeight; // Adjusted for header
        const thumbnailTop = activeThumbnailElement.offsetTop;
        const thumbnailBottom = thumbnailTop + activeThumbnailElement.clientHeight;
  
        // Check if the thumbnail is not fully visible and adjust scroll position
        if (thumbnailTop < listVisibleTop) {
          // Thumbnail is above the visible area, adjust scrollTop to bring it into view
          inscriptionListElement.scrollTop = thumbnailTop - headerHeight;
        } else if (thumbnailBottom > listVisibleBottom) {
          // Thumbnail is below the visible area, adjust scrollTop to bring it into view
          inscriptionListElement.scrollTop = thumbnailBottom - inscriptionListElement.clientHeight + headerHeight;
        }
      }
    }
  }, [activeInscription]);

  return (
    <PageContainer>
      {inscriptions.map((inscription, i, inscriptions) => (
        <ContentContainer key={i+1} id={i+1} ref={el => inscriptionReferences.current[i] = el}>
          <InscriptionContainer>
            {inscription.is_recursive==true && inscription.content_type=='image/svg+xml'
              ? <SvgContainer src={`/api/inscription_number/` + inscription.number} scrolling='no' sandbox='allow-scripts allow-same-origin'/>
              : {
                  'image/png': <ImageContainer src={`/api/inscription_number/` + inscription.number} />,
                  'image/jpeg': <ImageContainer src={`/api/inscription_number/` + inscription.number} />,
                  'image/jpg': <ImageContainer src={`/api/inscription_number/` + inscription.number} />,
                  'image/webp': <ImageContainer src={`/api/inscription_number/` + inscription.number} />,
                  'image/gif': <ImageContainer src={`/api/inscription_number/` + inscription.number} />,
                  'image/avif': <ImageContainer src={`/api/inscription_number/` + inscription.number} />,
                  'image/svg+xml': <ImageContainer src={`/api/inscription_number/` + inscription.number} scrolling='no' sandbox='allow-scripts allow-same-origin'/>,
                  'text/plain;charset=utf-8': <TextContainer><InscriptionText>{inscription.text}</InscriptionText></TextContainer>,
                  'text/plain': <TextContainer><InscriptionText>{inscription.text}</InscriptionText></TextContainer>,
                  'text/rtf': <TextContainer><InscriptionText>{inscription.text}</InscriptionText></TextContainer>,
                  'application/json': <TextContainer><InscriptionText>{inscription.text}</InscriptionText></TextContainer>,
                  'text/html;charset=utf-8': <HtmlContainer><StyledIframe src={"/api/inscription_number/"+ inscription.number} scrolling='no' sandbox='allow-scripts allow-same-origin'></StyledIframe></HtmlContainer>,
                  'text/html': <HtmlContainer><StyledIframe src={"/api/inscription_number/"+ inscription.number} scrolling='no' sandbox='allow-scripts allow-same-origin'></StyledIframe></HtmlContainer>,
                  'video/mp4': <VideoContainer controls loop muted autoPlay><source src={`/api/inscription_number/` + inscription.number} type={inscription.content_type}/></VideoContainer>,
                  'video/webm': <VideoContainer controls loop muted autoPlay><source src={`/api/inscription_number/` + inscription.number} type={inscription.content_type}/></VideoContainer>,
                  'audio/mpeg': <audio controls><source src={`/api/inscription_number/` + inscription.number} type={inscription.content_type}/></audio>,
                  'application/pdf': <TextContainer>pdf unsupported</TextContainer>,
                  'model/gltf-binary': <TextContainer>gltf model type unsupported</TextContainer>,
  
                  // to update
                  'unsupported': <TextContainer>{metadata?.content_type} content type unsupported</TextContainer>,
                  'loading': <TextContainer>loading...</TextContainer>
                }[inscription.content_type]
            }
          </InscriptionContainer>
          <InfoContainer>
            <NumberText>{addCommas(inscription.number)}</NumberText>
            {/* <MediaTextContainer>
              <MediaTypeText>{inscription.content_type}</MediaTypeText>
            </MediaTextContainer> */}
            <ButtonContainer>
              <Toaster />
              <ActionButton onClick={() => {copyToClipboard(`https://vermilion.place/inscription/` + inscription.number)}}>
                <CopyIcon svgColor='#000000' svgSize='1.5rem' />
              </ActionButton>
              <a href={'/inscription/' + inscription.number} target='_blank'>
                <ActionButton>
                  <ArrowSquareIcon svgColor='#000000' svgSize='1.5rem' />
                </ActionButton>
              </a>
              {/* <ActionButton>
                <Share1Icon color='#000' height='16px' width='16px' />
              </ActionButton> */}
            </ButtonContainer>
          </InfoContainer>
        </ContentContainer>
      ))}
      <div ref={observerTarget}></div>
      <InscriptionList id='inscription-list'>
        {inscriptions.map((inscription, i) => (
          <InscriptionThumbnail
            key={i}
            isActive={`${i+1}` === activeInscription}
            onClick={() => scrollToInscription(`${i+1}`)}
          >
            <img src={`/api/inscription_number/` + inscription.number} alt={`Inscription ${inscription.number}`} />
          </InscriptionThumbnail>
        ))}
      </InscriptionList>
    </PageContainer>
    
  )
}

const PageContainer = styled.div`
  position: relative;
  overflow-y: auto;
  overscroll-behavior-y: contain;
  scroll-snap-type: y mandatory;
  height: 100vh;
  max-height: calc(100vh - 4.5rem);
  width: 100%;
  -ms-overflow-style: none;
  scrollbar-width: none;
  &::-webkit-scrollbar {
    display: none;
  }
`;

const InscriptionList = styled.div`
  position: fixed;
  right: 0;
  top: 0;
  height: calc(100vh - 6rem);
  width: 5rem;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: .5rem;
  overflow-y: auto;
  margin-top: 6rem; 
  padding-right: 1.5rem;

  @media (max-width: 768px) {
    display: none;
  }
`;

const InscriptionThumbnail = styled.div`
  width: ${({ isActive }) => (isActive ? '80px' : '64px')};
  height: ${({ isActive }) => (isActive ? '80px' : '64px')};
  transition: width 0.3s ease, height 0.3s ease; // Optional: smooth transition for size change

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 4px;
    border: 2px solid #F5F5F5;
    image-rendering: pixelated;
  }
  cursor: pointer;
`;

const InscriptionContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;  
  width: 32rem;
  max-width: 32rem;
  height: 32rem;
  max-height: 32rem;

  @media (max-width: 576px) {
    width: 20rem;
    max-width: 20rem;
    height: 20rem;
    max-height: 20rem;
  }
`;

const ImageContainer = styled.img`
  min-width: 16rem;
  width: auto;
  height: auto;
  max-width: 32rem;
  max-height: 32rem;
  image-rendering: pixelated;
  border-radius: 4px;
  border: 8px solid #FFF;
  box-shadow: 0px 1px 6px 0px rgba(0, 0, 0, 0.09);

  @media (max-width: 576px) {
    max-width: 20rem;
    max-height: 20rem;
  }
`;

const HtmlContainer = styled.div`
  display: flex;
  justify-content: center;
  width: auto;
  height: auto;
  min-width: 16rem;
  min-height: 16rem;
  max-width: 32rem;
  max-height: 32rem;
  border-radius: 4px;
  border: 8px solid #FFF;
  box-shadow: 0px 1px 6px 0px rgba(0, 0, 0, 0.09);

  @media (max-width: 576px) {
    max-width: 20rem;
    max-height: 20rem;
  }
`

const SvgContainer = styled.iframe`
  // This container is required for recursive SVGs, as img elements cannot reference external content
  display: flex;
  justify-content: center;
  align-items: center;
  width: auto;
  height: auto;
  min-width: 16rem;
  min-height: 16rem;
  max-width: 32rem;
  max-height: 32rem;
  image-rendering: pixelated;
  border-radius: 4px;
  border: 8px solid #FFF;
  box-shadow: 0px 1px 6px 0px rgba(0, 0, 0, 0.09);
  resize: both;

  @media (max-width: 576px) {
    max-width: 20rem;
    max-height: 20rem;
  }
`;

const StyledIframe = styled.iframe`
  border: none;
  //flex: 0 100%;
  //flex-grow: 1;
  width: 100%;
  resize: both;
  //aspect-ratio: 1/1;
`

const TextContainer = styled.div`
  width: auto;
  height: auto;
  max-width: 32rem;
  max-height: 32rem;
  padding: .75rem 1rem;
  border-radius: 4px;
  border: 8px solid #FFF;
  box-shadow: 0px 1px 6px 0px rgba(0, 0, 0, 0.09);
  overflow: overlay; //Can also do hidden

  @media (max-width: 576px) {
    max-width: 20rem;
    max-height: 20rem;
  }
`;

const InscriptionText = styled.p`
  font-size: 1rem;
  margin: 0;
`;

const InfoContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  // padding: 0 1rem;
`;

const NumberText = styled.p`
  font-family: Relative Trial Bold;
  font-size: 2em;
  margin: 0;
`;

const ContentContainer = styled.div`
  height: 100vh;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 2rem;
  justify-content: center;
  align-items: center;
  position: relative;
  scroll-snap-align: center;
  scroll-snap-stop: always;
  background-color: #FFF;
`;

const VideoContainer = styled.video`
  width: auto;
  height: auto;
  max-width: 32rem;
  max-height: 32rem;
  border-radius: 4px;
  border: 8px solid #FFF;
  box-shadow: 0px 1px 6px 0px rgba(0, 0, 0, 0.09);

  @media (max-width: 576px) {
    max-width: 20rem;
    max-height: 20rem;
  }
`;

const ButtonContainer = styled.div`
  position: relative;
  bottom: 0;
  display: inline-flex;
  align-items: center;
  gap: 12px;
  margin-top: 1rem;
`;

const ActionButton = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  border: none;
  background-color: #F5F5F5;
  padding: .75em;
  border-radius: 3rem;
  height: 2rem;
  width: 2rem;
  cursor: pointer;
  transition: 
    background-color 350ms ease,
    transform 150ms ease;
  transform-origin: center center;

  &:hover {
    background-color: #E9E9E9;
  }

  &:active {
    transform: scale(0.96);
  };
`;

export default Discover;