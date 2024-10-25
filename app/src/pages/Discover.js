import React, { useState, useEffect, useRef } from 'react';
import { Link } from "react-router-dom";
import styled from 'styled-components';
import { addCommas, copyText } from '../helpers/utils';
import Spinner from '../components/Spinner';
import BoostIcon from '../assets/icons/BoostIcon';
import CommentIcon from '../assets/icons/CommentIcon';
import ShuffleIcon from '../assets/icons/ShuffleIcon';
import GalleryIcon from '../assets/icons/GalleryIcon';
import RuneIcon from '../assets/icons/RuneIcon';
import LinkIcon from '../assets/icons/LinkIcon';
import SkeletonImage from '../components/SkeletonImage';

const Discover = () => {
  const [inscriptions, setInscriptions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  
  // Create a single observer ref
  const observerRef = useRef();
  // Create ref for the sentinel element
  const loadMoreRef = useRef();

  const fetchInscriptions = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/random_inscriptions?n=30`);
      const newInscriptions = await response.json();
      
      if (newInscriptions.length === 0) {
        setHasMore(false);
        return;
      }
      
      setInscriptions(prev => [...prev, ...newInscriptions]);
    } catch (error) {
      console.error('Error fetching inscriptions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Initialize intersection observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first.isIntersecting && !isLoading && hasMore) {
          fetchInscriptions();
        }
      },
      { threshold: 0.1 }
    );

    observerRef.current = observer;

    return () => observer.disconnect();
  }, [isLoading, hasMore]);

  // Observe the sentinel element
  useEffect(() => {
    const currentObserver = observerRef.current;
    const currentLoadMore = loadMoreRef.current;

    if (currentLoadMore && currentObserver) {
      currentObserver.observe(currentLoadMore);
    }

    return () => {
      if (currentLoadMore && currentObserver) {
        currentObserver.unobserve(currentLoadMore);
      }
    };
  }, [inscriptions]);

  // Initial fetch
  useEffect(() => {
    fetchInscriptions();
  }, []);

  return (
    <MainContainer>
      <FeedContainer>
        {inscriptions.map((inscription, i, inscriptions) => (
          <React.Fragment key={i}>
            <ContentContainer key={i+1} id={i+1}>
              <InfoContainer>
                <TitleContainer>
                  <UnstyledLink to={'/inscription/' + inscription.number}>
                    <NumberText>#{addCommas(inscription.number)}</NumberText>
                  </UnstyledLink>
                  {inscription.spaced_rune && (
                    <RuneTag>
                      <RuneIcon svgSize={'1rem'} svgColor={'#D23B75'} />
                      {inscription.spaced_rune}
                    </RuneTag>
                  )}
                  {inscription.collection_name && (
                    <UnstyledLink to={'/collection/' + inscription.collection_symbol}>
                      <CollectionTag>
                        <GalleryIcon svgSize={'1rem'} svgColor={'#E34234'} />
                        {inscription.collection_name}
                      </CollectionTag>
                    </UnstyledLink>
                  )}
                </TitleContainer>
                <DetailsContainer>
                  <SocialButton empty onClick={() => copyText('https://vermilion.place/inscription/' + inscription.number)}>
                    <LinkIcon svgSize={'1.25rem'} svgColor={'#959595'} />
                  </SocialButton>
                </DetailsContainer>
              </InfoContainer>
              <UnstyledLink to={'/inscription/' + inscription.number}>
                <InscriptionContainer>
                  {
                    {
                      'image/png': <LoadingImage src={`/api/inscription_number/${inscription.number}`} />,
                      'image/jpeg': <LoadingImage src={`/api/inscription_number/${inscription.number}`} />,
                      'image/jpg': <LoadingImage src={`/api/inscription_number/${inscription.number}`} />,
                      'image/webp': <LoadingImage src={`/api/inscription_number/${inscription.number}`} />,
                      'image/gif': <LoadingImage src={`/api/inscription_number/${inscription.number}`} />,
                      'image/avif': <LoadingImage src={`/api/inscription_number/${inscription.number}`} />,
                      'image/svg+xml': <LoadingImage src={`/api/inscription_number/${inscription.number}`} scrolling='no' sandbox='allow-scripts allow-same-origin'/>,
                      'loading': <TextContainer>loading...</TextContainer>
                    }[inscription.content_type]
                  }
                </InscriptionContainer>
              </UnstyledLink>
            </ContentContainer>
            {i < inscriptions.length - 1 && <Divider />}
          </React.Fragment>
        ))}
        
        <LoadingContainer ref={loadMoreRef}>
          {isLoading && <Spinner />}
        </LoadingContainer>
      </FeedContainer>
    </MainContainer>
  );
};

// Image component that handles loading state
const LoadingImage = ({ src, ...props }) => {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <>
      {isLoading && <SkeletonImage />}
      <ImageContainer 
        src={src} 
        onLoad={() => setIsLoading(false)}
        style={{ display: isLoading ? 'none' : 'block' }}
        {...props}
      />
    </>
  );
};

// Keep all your existing styled components
const MainContainer = styled.div`
  width: 100%;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const FeedContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 32rem;
  padding: 1.5rem 1rem 3rem 1rem;
  gap: 1.5rem;

  @media (max-width: 544px) {
    max-width: calc(100% - 2rem);
  }
`;

// Add new styled components for loading state
const LoadingContainer = styled.div`
  width: 100%;
  height: 4rem;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const LoadingText = styled.p`
  font-family: Relative Trial Medium;
  font-size: 1rem;
  color: #959595;
  margin: 0;
`;

// Keep all your other existing styled components...
const ContentContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: .5rem;
  justify-content: center;
  position: relative;
  background-color: #FFF;
  padding-bottom: .75rem;
`;

const InscriptionContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;  
  width: 32rem;
  max-width: 32rem;

  @media (max-width: 544px) {
    width: 100%;
    max-width: 100%;
  }
`;

const ImageContainer = styled.img`
  width: 32rem;
  height: auto;
  max-width: 32rem;
  image-rendering: pixelated;
  cursor: pointer;
  border-radius: .5rem;
  border: .0625rem solid #E9E9E9;

  @media (max-width: 544px) {
    width: 100%;
    max-width: 100%;
  }
`;

const TextContainer = styled.div`
  width: 32rem;
  height: auto;
  max-width: 32rem;
  padding: .75rem 1rem;
  border-radius: .5rem;
  border: .0625rem solid #E9E9E9;
  overflow: overlay;

  @media (max-width: 544px) {
    width: 100%;
    max-width: 100%;
  }
`;

const CollectionTag = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: .25rem;
  padding: .125rem .375rem;
  border-radius: .5rem;
  font-family: Relative Trial Medium;
  font-size: .875rem;
  margin: 0;
  color: #E34234;
  background-color: #FCECEB;
  cursor: pointer;
  transition: 
    background-color 350ms ease,
    transform 150ms ease;
  transform-origin: center center;

  &:hover {
    background-color: #FBE3E1;
  }

  &:active {
    transform: scale(0.96);
  }
`;

const RuneTag = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: .25rem;
  padding: .125rem .375rem;
  border-radius: .5rem;
  font-family: Relative Trial Medium;
  font-size: .875rem;
  margin: 0;
  color: #D23B75;
  background-color: #FAEBF1;
  cursor: pointer;
  transition: 
    background-color 350ms ease,
    transform 150ms ease;
  transform-origin: center center;

  &:hover {
    background-color: #F8E2EA;
  }

  &:active {
    transform: scale(0.96);
  }
`;

const InfoContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  width: 100%;
`;

const TitleContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: .5rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%;
  flex-grow: 1;
  min-width: 0;
`;

const DetailsContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-end;
  gap: .5rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex-shrink: 0;
`;

const NumberText = styled.p`
  font-family: Relative Trial Bold;
  font-size: 1rem;
  margin: 0;
`;

const SocialButton = styled.button`
  height: 2.5rem;
  min-height: 2.5rem;
  min-width: 2.5rem;
  border-radius: 1.25rem;
  font-family: Relative Trial Medium;
  font-size: 1rem;
  color: #000000;
  border: none;
  padding: ${props => props.empty ? '.375rem' : '.375rem .75rem'};
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: .375rem;
  cursor: pointer;
  background-color: #FFFFFF;
  transition: 
    background-color 350ms ease,
    transform 150ms ease;
  transform-origin: center center;

  &:hover {
    background-color: #F5F5F5;
  }

  &:active {
    transform: scale(0.96);
  }
`;

const Divider = styled.div`
  width: 100%;
  border-bottom: 1px solid #E9E9E9;
`;

const UnstyledLink = styled(Link)`
  color: unset;
  text-decoration: unset;
`;

export default Discover;