import React, { useState, useEffect, useRef } from 'react';
import { Link } from "react-router-dom";
import styled from 'styled-components';
import { addCommas, copyText, formatAddress } from '../helpers/utils';
import Spinner from '../components/Spinner';
import BoostIcon from '../assets/icons/BoostIcon';
import CommentIcon from '../assets/icons/CommentIcon';
import RefreshIcon from '../assets/icons/RefreshIcon';
import GalleryIcon from '../assets/icons/GalleryIcon';
import RuneIcon from '../assets/icons/RuneIcon';
import LinkIcon from '../assets/icons/LinkIcon';
import SkeletonImage from '../components/SkeletonImage';

const Trending = () => {
  const [inscriptions, setInscriptions] = useState([]);
  const [moreInscriptions, setMoreInscriptions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);

  // placeholder - recent inscriptions and most active wallets 
  const mostRecent = [77150702, 74151024, 0];
  const activeWallets = [
    {
      "address": "bc1pvkumrkmmr4jgp9u3xg6qjx52wupu5vcp0rh6zfpha2tlhslpf0eqt3c4m0",
      "count": 26
    },
    {
      "address": "bc1p66qckaaw5l8ecars7g7mxcgprk6e2tmhqs2ju95wjz8g0vt6xvlq505twd",
      "count": 17
    },
    {
      "address": "bc1pwc4gv8wdh703jg6c07jqpme6dhvs2zfq6kyarm9nx0dcj2sanzrsp2guex",
      "count": 13
    }
  ];
  
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

  const fetchMoreInscriptions = async () => {
    try {
      const response = await fetch(`/api/trending_feed?n=20`);
      const newInscriptions = await response.json();      
      setMoreInscriptions(newInscriptions);
    } catch (error) {
      console.error('Error fetching inscriptions:', error);
    } finally {
      console.log('trending', moreInscriptions);
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
    fetchMoreInscriptions();
  }, []);

  return (
    <MainContainer>
      <ContentWrapper>
        {/* Left column */}
        <SidebarContainer></SidebarContainer>

        {/* Middle column */}
        <FeedContainer>
          {moreInscriptions.map((inscription, i, inscriptions) => (
            <React.Fragment key={i}>
              <ContentContainer key={i+1} id={i+1}>
                <InfoContainer>
                  <TitleContainer>
                    <UnstyledLink to={'/inscription/' + inscription.inscriptions[0].number}>
                      <NumberText>#{addCommas(inscription.inscriptions[0].number)}</NumberText>
                    </UnstyledLink>
                    {inscription.inscriptions[0].spaced_rune && (
                      <RuneTag>
                        <RuneIcon svgSize={'1rem'} svgColor={'#D23B75'} />
                        {inscription.inscriptions[0].spaced_rune}
                      </RuneTag>
                    )}
                    {inscription.collection_name && (
                      <UnstyledLink to={'/collection/' + inscription.inscriptions[0].collection_symbol}>
                        <CollectionTag>
                          <GalleryIcon svgSize={'1rem'} svgColor={'#E34234'} />
                          {inscription.inscriptions[0].collection_name}
                        </CollectionTag>
                      </UnstyledLink>
                    )}
                  </TitleContainer>
                  <DetailsContainer>
                    <SocialButton empty onClick={() => copyText('https://vermilion.place/inscription/' + inscription.inscriptions[0].number)}>
                      <LinkIcon svgSize={'1.25rem'} svgColor={'#959595'} />
                    </SocialButton>
                  </DetailsContainer>
                </InfoContainer>
                <UnstyledLink to={'/inscription/' + inscription.inscriptions[0].number}>
                  <InscriptionContainer>
                    {
                      {
                        'image/png': <LoadingImage src={`/api/inscription_number/${inscription.inscriptions[0].number}`} />,
                        'image/jpeg': <LoadingImage src={`/api/inscription_number/${inscription.inscriptions[0].number}`} />,
                        'image/jpg': <LoadingImage src={`/api/inscription_number/${inscription.inscriptions[0].number}`} />,
                        'image/webp': <LoadingImage src={`/api/inscription_number/${inscription.inscriptions[0].number}`} />,
                        'image/gif': <LoadingImage src={`/api/inscription_number/${inscription.inscriptions[0].number}`} />,
                        'image/avif': <LoadingImage src={`/api/inscription_number/${inscription.inscriptions[0].number}`} />,
                        'image/svg+xml': <LoadingImage src={`/api/inscription_number/${inscription.inscriptions[0].number}`} scrolling='no' sandbox='allow-scripts allow-same-origin'/>,
                        'loading': <TextContainer>loading...</TextContainer>
                      }[inscription.inscriptions[0].content_type]
                    }
                  </InscriptionContainer>
                </UnstyledLink>
                <ActionContainer>
                  <SocialContainer>
                    <SocialButton>
                      <BoostIcon svgSize={'1.25rem'} svgColor={'#000000'}></BoostIcon>
                      <SocialText>{inscription.activity.delegate_count}</SocialText>
                    </SocialButton>
                    <SocialButton>
                      <CommentIcon svgSize={'1.25rem'} svgColor={'#000000'}></CommentIcon>
                      <SocialText>0</SocialText>
                    </SocialButton>
                  </SocialContainer>
                  <BoostContainer>
                    <BoostButton>
                      <BoostIcon svgSize={'1.25rem'} svgColor={'#000000'}></BoostIcon>
                      Boost
                    </BoostButton>
                  </BoostContainer>
                </ActionContainer>
              </ContentContainer>
              {i < moreInscriptions.length - 1 && <Divider />}
            </React.Fragment>
          ))}
          
          <LoadingContainer ref={loadMoreRef}>
            {isLoading && <Spinner />}
          </LoadingContainer>
        </FeedContainer>

        {/* Right column */}
        <SidebarContainer>
          <SectionContainer gapSize={'1rem'}>
            <SectionTitleWrapper>
              <SectionTitleText>Introducing Boosts</SectionTitleText>
            </SectionTitleWrapper>
            <SectionContainer gapSize={'.75rem'}>
              <SectionText>
                Boosts let you collect and amplify inscriptions using delegation.
              </SectionText>
              <SectionText>
                A boost is much more than a like—it’s onchain proof of your taste and timing. Each boost helps surface quality content while building connections between creators and collectors.
              </SectionText>
            </SectionContainer>

          </SectionContainer>
          <Divider />
          <SectionContainer gapSize={'1rem'}>
            <SectionTitleWrapper>
              <SectionTitleText>Recent Activity</SectionTitleText>
              <RefreshButton>
                <RefreshIcon svgSize={'1rem'} svgColor={'#959595'}></RefreshIcon>
                Refresh
              </RefreshButton>
            </SectionTitleWrapper>
            <SectionText>
              Placeholder...
            </SectionText>
          </SectionContainer>
          <Divider />
          <SectionContainer gapSize={'1rem'}>
            <SectionTitleWrapper>
              <SectionTitleText>Most Active Users</SectionTitleText>
              <SectionDetailText>Resets in 3d 22h 19m 36s</SectionDetailText>
            </SectionTitleWrapper>
            <SectionContainer gapSize={'.75rem'}>
              {activeWallets.map((inscription, i, inscriptions) => (
                <ActiveContainer key={i}>
                  <ElementWrapper gapSize={'.75rem'}>
                    <RankWrapper>#{i}</RankWrapper>
                    <ElementWrapper gapSize={'.375rem'}>
                      <PlaceholderImage />
                      <UnstyledLink to={'/address/' + inscription.address}>
                        <AddressText>{formatAddress(inscription.address)}</AddressText>
                      </UnstyledLink>
                    </ElementWrapper>
                  </ElementWrapper>
                  <SectionDetailText>{inscription.count} boosts</SectionDetailText>
                </ActiveContainer>
              ))}
            </SectionContainer>
          </SectionContainer>
        </SidebarContainer>
      </ContentWrapper>
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
  // flex-direction: column;
  // align-items: center;
`;

const ContentWrapper = styled.div`
  width: 100%;
  max-width: calc(100% - 6rem);
  padding: 1.5rem 3rem 3rem 3rem;
  margin: 0;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  gap: 2rem;

  @media (max-width: 1024px) {
    max-width: calc(100% - 3rem);
    padding: 1.5rem 1.5rem 3rem 1.5rem;  
  }
`;

const SidebarContainer = styled.div`
  width: 20rem;
  flex-shrink: 0;
  display: none;
  // background-color: red;

  @media (min-width: 1024px) {
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }
`;

const FeedContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 32rem;
  // padding: 1.5rem 1rem 3rem 1rem;
  gap: 1.5rem;

  // @media (max-width: 544px) {
  //   max-width: calc(100% - 2rem);
  // }
`;

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

const ContentContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: .5rem;
  justify-content: center;
  position: relative;
  background-color: #FFF;
  // padding-bottom: .75rem;
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

const SocialText = styled.p`
  font-family: Relative Trial Bold;
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
  border-radius: 1.25rem;
  font-family: Relative Trial Bold;
  font-size: 1rem;
  color: #000000;
  border: none;
  padding: 1rem;
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: .5rem;
  cursor: pointer;
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

const Divider = styled.div`
  width: 100%;
  border-bottom: 1px solid #E9E9E9;
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
  font-family: Relative Trial Bold;
  font-size: 1rem;
  margin: 0;
`;

const SectionDetailText = styled.p`
  font-family: Relative Trial Medium;
  font-size: .875rem;
  color: #959595;
  margin: 0;
`;

const SectionText = styled.p`
  font-family: Relative Trial Medium;
  font-size: .875rem;
  color: #959595;
  margin: 0;
`;

const RefreshButton = styled.button`
  height: 1.375rem;
  border-radius: .5rem;
  font-family: Relative Trial Medium;
  font-size: .875rem;
  color: #959595;
  border: none;
  padding: .125rem .375rem;
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: .25rem;
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
  font-family: Relative Trial Bold;
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
  font-family: Relative Trial Bold;
  font-size: .875rem;
  margin: 0;
`;

const UnstyledLink = styled(Link)`
  color: unset;
  text-decoration: unset;
`;

export default Trending;