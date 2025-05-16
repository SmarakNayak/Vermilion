import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import Spinner from '../components/Spinner';
import SkeletonImage from '../components/SkeletonImage';
import InnerInscriptionContent from '../components/common/InnerInscriptionContent';
import { addCommas } from '../utils/format';
import { copyText } from '../utils/clipboard';
import { BoostIcon, CheckIcon, ChevronUpDuoIcon, CommentIcon, CopyIcon, CurrencyIcon, FireIcon, GalleryIcon, LinkIcon, Person2Icon, RefreshIcon, RuneIcon, SparklesIcon, SproutIcon } from '../components/common/Icon';
import theme from '../styles/theme';
import CheckoutModal from '../components/modals/CheckoutModal';
import BoostsModal from '../components/modals/BoostsModal';
import CommentsModal from '../components/modals/CommentsModal';

const Discover = () => {
  const [inscriptions, setInscriptions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [copied, setCopied] = useState(false);
  const [copiedRowId, setCopiedRowId] = useState(null);

  const handleCopyClick = (id, content) => {
    copyText(content);
    setCopiedRowId(id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000); // Reset after 2 seconds
    setTimeout(() => setCopiedRowId(null), 2000); // Reset after 2 seconds
  };
  
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
            <ContentContainer id={i+1}>
              <InfoContainer>
                <TitleContainer>
                  <UnstyledLink to={'/inscription/' + inscription.number}>
                    <NumberText>#{addCommas(inscription.number)}</NumberText>
                  </UnstyledLink>
                  {inscription.spaced_rune && (
                    <Tag>
                      <CurrencyIcon size={'1rem'} color={theme.colors.background.purp} />
                      <TagSpan color={theme.colors.background.purp}>
                        {inscription.spaced_rune}
                      </TagSpan>
                    </Tag>
                  )}
                  {inscription.collection_name && (
                    <UnstyledLink to={'/collection/' + inscription.collection_symbol}>
                      <Tag>
                        <GalleryIcon size={'1rem'} color={theme.colors.background.verm} />
                        <TagSpan color={theme.colors.background.verm}>
                          {inscription.collection_name}
                        </TagSpan>
                      </Tag>
                    </UnstyledLink>
                  )}
                  {/* Add parent tag when data is available */}
                </TitleContainer>
                <DetailsContainer>
                  <CopyButton onClick={() => handleCopyClick(i, 'https://vermilion.place/inscription/' + inscription.number)} copied={copied}>
                    {copiedRowId === i ? <CheckIcon size={'1.25rem'} color={theme.colors.background.success} /> : <LinkIcon size={'1.25rem'} />}
                  </CopyButton>
                </DetailsContainer>   
              </InfoContainer>
              <UnstyledLink to={'/inscription/' + inscription.number}>
                <InscriptionContainer>
                  <InscriptionContentWrapper>
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
                    <ContentOverlay />
                  </InscriptionContentWrapper>
                </InscriptionContainer>
              </UnstyledLink>

              {/* Insert action container */}
              
            </ContentContainer>
            {i < inscriptions.length - 1 && <Divider />}
          </React.Fragment>
        ))}
        
        <LoadingContainer ref={loadMoreRef}>
          {isLoading && <Spinner />}
        </LoadingContainer>
      </FeedContainer>

      {/* Insert modals */}

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
  // padding-bottom: .75rem;
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

const InscriptionContentWrapper = styled.div`
  position: relative;
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

const ImageContainer = styled.img`
  width: 32rem;
  height: auto;
  max-width: 32rem;
  image-rendering: pixelated;
  cursor: pointer;
  border-radius: .5rem;
  border: .0625rem solid ${theme.colors.border};

  @media (max-width: 560px) {
    width: 100%;
    max-width: 100%;
  }
`;

const HtmlContainer = styled.div`
  position: relative; /* Add this */
  width: 32rem;
  max-width: 32rem;
  cursor: pointer;
  border-radius: .5rem;
  border: .0625rem solid ${theme.colors.border};
  overflow: hidden;

  &:after { /* Add overlay as a pseudo-element */
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 1;
  }

  @media (max-width: 544px) {
    width: 100%;
    max-width: 100%;
  }
`;

const HtmlWrapper = styled.div`
  position: relative;
  width: 100%;
  padding-top: 100%;

  iframe {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    border: none;
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

  @media (max-width: 560px) {
    width: 100%;
    max-width: 100%;
  }
`;

const StyledIframe = styled.iframe`
  border: none;
  //flex: 0 100%;
  //flex-grow: 1;
  width: 100%;
  resize: both;
  //aspect-ratio: 1/1;
`;

const Tag = styled.div`
  display: inline-flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: .25rem;
  padding: .125rem .375rem;
  border-radius: .25rem;
  font-family: ${theme.typography.fontFamilies.medium};
  font-size: .875rem;
  line-height: 1.125rem;
  margin: 0;
  background-color: ${theme.colors.background.primary};
  cursor: pointer;
  transition: all 200ms ease;
  transform-origin: center center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
  width: fit-content;

  &:hover {
    background-color: ${theme.colors.background.secondary};
  }

  &:active {
    transform: scale(0.96);
  }
`;

const TagSpan = styled.span`
  font-family: ${theme.typography.fontFamilies.medium};
  font-size: .875rem;
  line-height: 1.125rem;
  color: ${props => props.color};
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
  flex: 0 1 auto; 
  white-space: nowrap;
  min-width: 0; 
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
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex-shrink: 0;
`;

const NumberText = styled.p`
  font-family: ${theme.typography.fontFamilies.medium};
  font-size: 1rem;
  line-height: 1.5rem;
  margin: 0;
`;

const CopyButton = styled.button`
  border: none;
  margin: 0;
  padding: 0;
  height: 2rem;
  width: 2rem;
  min-height: 2rem;
  min-width: 2rem;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: .5rem;
  background-color: ${theme.colors.background.white};
  border-radius: 1rem;
  cursor: pointer;
  transition: all 200ms ease;
  transform-origin: center center;

  svg {
    fill: ${theme.colors.text.tertiary};
    transition: all 200ms ease;
  }

  &:hover {
    background-color: ${theme.colors.background.primary};
    svg {
      fill: ${theme.colors.text.primary};
    }
  }

  &:active {
    transform: scale(0.96);
  }
`;

const ActionContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;

const SocialContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: .5rem;
`;

const SocialButton = styled.button`
  height: 2rem;
  min-height: 2rem;
  min-width: 2rem;
  border-radius: 1rem;
  font-family: ${theme.typography.fontFamilies.medium};
  font-size: 1rem;
  color: ${theme.colors.text.primary};
  border: none;
  padding: 0.375rem 0.75rem;
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

const SocialText = styled.p`
  font-family: ${theme.typography.fontFamilies.medium};
  font-size: 1rem;
  margin: 0;
`;

const BoostContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
`;

const BoostButton = styled.button`
  height: 2.5rem;
  min-height: 2.5rem;
  border-radius: 1.25rem;
  font-family: ${theme.typography.fontFamilies.medium};
  font-size: 1rem;
  color: ${theme.colors.background.white};
  border: none;
  padding: 1rem;
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: .5rem;
  cursor: pointer;
  background-color: ${theme.colors.background.dark};
  transition: all 200ms ease;
  transform-origin: center center;

  &:hover {
    opacity: 0.75;
  }

  &:active {
    transform: scale(0.98);
  }
`;

const Divider = styled.div`
  width: 100%;
  border-bottom: 1px solid ${theme.colors.border};
`;

const SectionContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.gapSize};
`;

const SectionTitleWrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  height: 1.375rem;
`;

const SectionTitleText = styled.p`
  font-family: ${theme.typography.fontFamilies.medium};
  font-size: 1rem;
  margin: 0;
`;

const SectionDetailText = styled.p`
  font-family: ${theme.typography.fontFamilies.medium};
  font-size: .875rem;
  color: ${theme.colors.text.secondary};
  margin: 0;
`;

const SectionText = styled.p`
  font-family: ${theme.typography.fontFamilies.medium};
  font-size: .875rem;
  color: ${theme.colors.text.secondary};
  margin: 0;
`;

const RefreshButton = styled.button`
  height: 1.375rem;
  border-radius: .5rem;
  font-family: ${theme.typography.fontFamilies.medium};
  font-size: .875rem;
  color: ${theme.colors.text.secondary};
  border: none;
  padding: .125rem .375rem;
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: .25rem;
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

const ActiveContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;

const ElementWrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: ${props => props.gapSize};
`;

const RankWrapper = styled.div`
  border-radius: 1rem;
  font-family: ${theme.typography.fontFamilies.medium};
  font-size: .875rem;
  padding: .125rem 0;
  width: 2rem;
  color: #E34234;
  background-color: #FCECEB;
  display: flex;
  justify-content: center;
`;

const PlaceholderImage = styled.div`
  height: 2.5rem;
  width: 2.5rem;
  background-color: #E8803F;
  border-radius: 1.25rem;
`;

const AddressText = styled.p`
  font-family: ${theme.typography.fontFamilies.medium};
  font-size: .875rem;
  margin: 0;
`;

const LinkText = styled.p`
  font-family: ${theme.typography.fontFamilies.medium};
  font-size: .875rem;
  color: ${theme.colors.text.secondary};
  margin: 0;

  transition: all 200ms ease;
  transform-origin: center center;

  &:hover {
    color: #000000;
  }
`;

const UnstyledLink = styled(Link)`
  color: unset;
  text-decoration: unset;
  display: inline-block;
  max-width: 100%;
`;

export default Discover;
