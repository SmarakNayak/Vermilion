import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import Spinner from '../components/Spinner';
import SkeletonImage from '../components/SkeletonImage';
import InnerInscriptionContent from '../components/common/InnerInscriptionContent';
import { addCommas } from '../utils/format';
import { copyText } from '../utils/clipboard';
import { FireIcon, GalleryIcon, LinkIcon, RuneIcon, SparklesIcon } from '../components/common/Icon';
import theme from '../styles/theme';

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
        <LinkContainer>
          <PageText>Feed</PageText>
          <VerticalDivider />
          <ButtonContainer>
            <TabButton to="/" isActive={false}>
              <FireIcon size={'1.25rem'} />
              Trending
            </TabButton>
            <TabButton to="/discover" isActive={true}>
              <SparklesIcon size={'1.25rem'} />
              Discover
            </TabButton>
          </ButtonContainer>
        </LinkContainer>
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
                      <RuneIcon size={'1rem'} color={theme.colors.background.purp} />
                      {inscription.spaced_rune}
                    </RuneTag>
                  )}
                  {inscription.collection_name && (
                    <UnstyledLink to={'/collection/' + inscription.collection_symbol}>
                      <CollectionTag>
                        <GalleryIcon size={'1rem'} color={theme.colors.background.verm} />
                        {inscription.collection_name}
                      </CollectionTag>
                    </UnstyledLink>
                  )}
                </TitleContainer>
                <DetailsContainer>
                  <SocialButton empty onClick={() => copyText('https://vermilion.place/inscription/' + inscription.number)}>
                    <LinkIcon size={'1.25rem'} color={theme.colors.text.secondary} />
                  </SocialButton>
                </DetailsContainer>
              </InfoContainer>
              <UnstyledLink to={'/inscription/' + inscription.number}>
                <InscriptionContainer>
                  <InnerInscriptionContent
                    contentType={inscription.content_type === 'loading' ? 'loading' : 'image'}
                    blobUrl={`/api/inscription_number/${inscription.number}`}
                    number={inscription.number}
                    metadata={{
                      id: inscription.id,
                      content_type: inscription.content_type,
                      is_recursive: inscription.is_recursive
                    }}
                    useFeedStyles={true}
                  />
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

const LoadingContainer = styled.div`
  width: 100%;
  height: 4rem;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const LinkContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: .75rem;
  padding-bottom: 1rem;
`;

const PageText = styled.p`
  font-family: ${theme.typography.fontFamilies.bold};
  font-size: 1.5rem;
  line-height: 2rem;
  color: ${theme.colors.text.primary};
  margin: 0;
`;

const VerticalDivider = styled.div`
  height: 2rem;
  border-right: 1px solid ${theme.colors.border};
`;

const ButtonContainer = styled.div`
  display: flex;
  flex-direction: row;
  gap: .25rem;
`;

const TabButton = styled(Link)`
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
  color: ${props => props.isActive ? theme.colors.background.verm : theme.colors.text.tertiary}; 
  background-color: ${props => props.isActive ? theme.colors.background.primary : theme.colors.background.white}; 
  transition: all 200ms ease;
  transform-origin: center center;
  text-decoration: none;

  &:hover {
    color: ${theme.colors.background.verm};
    background-color: ${theme.colors.background.primary};

    svg {
      fill: ${theme.colors.background.verm};
    }
  }

  &:active {
    transform: scale(0.96);
  }

  svg {
    fill: ${props => props.isActive ? theme.colors.background.verm : theme.colors.text.tertiary};
    transition: fill 200ms ease;
  }
`;

const LoadingText = styled.p`
  font-family: ${theme.typography.fontFamilies.medium};
  font-size: 1rem;
  color: ${theme.colors.text.secondary};
  margin: 0;
`;

const ContentContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: .5rem;
  justify-content: center;
  position: relative;
  background-color: ${theme.colors.background.white};
  padding-bottom: .75rem;
`;

const InscriptionContainer = styled.div`
  // display: flex;
  // align-items: center;
  // justify-content: center;  
  width: 32rem;
  max-width: 32rem;
  height: auto;
  padding: 0;
  margin: 0;
  line-height: 0;
  font-size: 0;
  border-radius: .5rem;
  box-sizing: border-box;
  border: .0625rem solid ${theme.colors.border};
  overflow: hidden;

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
  border: .0625rem solid ${theme.colors.border};

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
  border: .0625rem solid ${theme.colors.border};
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
  font-family: ${theme.typography.fontFamilies.medium};
  font-size: .875rem;
  margin: 0;
  color: ${theme.colors.background.verm};
  background-color: #FCECEB;
  cursor: pointer;
  transition: all 200ms ease;
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
  font-family: ${theme.typography.fontFamilies.medium};
  font-size: .875rem;
  margin: 0;
  color: ${theme.colors.background.purp};
  background-color: #FAEBF1;
  cursor: pointer;
  transition: all 200ms ease;
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
  font-family: ${theme.typography.fontFamilies.medium};
  font-size: 1rem;
  margin: 0;
`;

const SocialButton = styled.button`
  height: 2.5rem;
  min-height: 2.5rem;
  min-width: 2.5rem;
  border-radius: 1.25rem;
  font-family: ${theme.typography.fontFamilies.medium};
  font-size: 1rem;
  color: ${theme.colors.background.dark};
  border: none;
  padding: ${props => props.empty ? '.375rem' : '.375rem .75rem'};
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: .375rem;
  cursor: pointer;
  background-color: ${theme.colors.background.white};
  transition: all 200ms ease;
  transform-origin: center center;

  &:hover {
    background-color: ${theme.colors.background.primary};
  }

  &:active {
    transform: scale(0.96);
  }
`;

const Divider = styled.div`
  width: 100%;
  border-bottom: 1px solid ${theme.colors.border};
`;

const UnstyledLink = styled(Link)`
  color: unset;
  text-decoration: unset;
`;

export default Discover;
