import React, { useState, useEffect, useRef } from 'react';
import { Link } from "react-router-dom";
import styled from 'styled-components';
import Spinner from '../components/Spinner';
import InnerInscriptionContent from '../components/common/InnerInscriptionContent';
import { addCommas } from '../utils/format';
import { copyText } from '../utils/clipboard';
import { CheckIcon, ChevronUpDuoIcon, CommentIcon, CurrencyIcon, FireIcon, GalleryIcon, LinkIcon, Person2Icon, SparklesIcon } from '../components/common/Icon';
import theme from '../styles/theme';
import CheckoutModal from '../components/modals/CheckoutModal';
import BoostsModal from '../components/modals/BoostsModal';
import CommentsModal from '../components/modals/CommentsModal';

const Trending = () => {
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
      const response = await fetch(`/api/trending_feed?n=12`);
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

  // Manage modal state
  const [isBoostsModalOpen, setBoostsModalOpen] = useState(false);
  const [boostsList, setBoostsList] = useState([]);
  const [isBoostsLoading, setIsBoostsLoading] = useState(false);
  const [hasMoreBoosts, setHasMoreBoosts] = useState(true);
  const [boostsPage, setBoostsPage] = useState(0);
  const [selectedBoostId, setSelectedBoostId] = useState(null);
  
  const fetchBoosts = async (boostId) => {
    if (isBoostsLoading || !hasMoreBoosts) return;
  
    try {
      setIsBoostsLoading(true);
  
      const response = await fetch(`/api/inscription_bootlegs/${boostId}?page_size=20&page_number=${boostsPage}`);
      const data = await response.json();
  
      if (Array.isArray(data) && data.length > 0) {
        setBoostsList((prev) => [...prev, ...data]);
        setBoostsPage((prev) => prev + 1);
      } else {
        setHasMoreBoosts(false);
      }
    } catch (error) {
      console.error('Error fetching boosts:', error);
    } finally {
      setIsBoostsLoading(false);
    }
  };
  
  const toggleBoostsModal = (boostId = null, delegateCount = 0) => {
    if (!isBoostsModalOpen && boostId) {
      setSelectedBoostId(boostId);
      setBoostsList([]); // Reset boosts list
      setBoostsPage(0); // Reset pagination
      setHasMoreBoosts(true); // Reset "has more" state
  
      if (delegateCount > 0) {
        // Only fetch boosts if there are any
        fetchBoosts(boostId);
      }
    } else if (isBoostsModalOpen) {
      setBoostsList([]); // Clear boosts list when closing the modal
      setBoostsPage(0); // Reset pagination
    }
  
    setBoostsModalOpen((prev) => {
      const isOpening = !prev;
      document.body.style.overflow = isOpening ? 'hidden' : 'auto';
      return isOpening;
    });
  };

  const [isCommentsModalOpen, setCommentsModalOpen] = useState(false);
  const [commentsList, setCommentsList] = useState([]);
  const [isCommentsLoading, setIsCommentsLoading] = useState(false);
  const [selectedCommentId, setSelectedCommentId] = useState(null);

  const fetchComments = async (commentId) => {
    if (isCommentsLoading) return;
  
    try {
      setIsCommentsLoading(true);
  
      const response = await fetch(`/api/inscription_comments/${commentId}`);
      const data = await response.json();
  
      if (Array.isArray(data)) {
        setCommentsList(data);
      } else {
        setCommentsList([]); // Handle case where no comments are returned
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setIsCommentsLoading(false);
    }
  };

  const toggleCommentsModal = (commentId = null, commentCount = 0) => {
    if (!isCommentsModalOpen && commentId) {
      setSelectedCommentId(commentId);
      setCommentsList([]); // Reset comments list
  
      if (commentCount > 0) {
        // Only fetch comments if there are any
        fetchComments(commentId);
      }
    }
  
    setCommentsModalOpen((prev) => {
      const isOpening = !prev;
      document.body.style.overflow = isOpening ? 'hidden' : 'auto';
      return isOpening;
    });
  };

  const [isCheckoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [selectedDelegateData, setSelectedDelegateData] = useState(null);

  const toggleCheckoutModal = (delegateData = null) => {
    setSelectedDelegateData(delegateData);
    setCheckoutModalOpen((prev) => {
      const isOpening = !prev;
      document.body.style.overflow = isOpening ? 'hidden' : 'auto';
      return isOpening;
    });
  };

  // Helper function to map raw content type to component's expected contentType prop
  const getContentTypeProp = (rawContentType) => {
    if (rawContentType === 'loading') {
      return 'loading';
    }
    if (rawContentType) {
      if (rawContentType.startsWith('image/svg')) {
        // InnerInscriptionContent will handle the recursive aspect based on metadata.is_recursive
        return 'svg';
      }
      if (rawContentType.startsWith('text/html')) {
        return 'html';
      }
      if (rawContentType.startsWith('application/pdf')) {
        return 'pdf';
      }
      if (rawContentType.startsWith('model/')) {
        return 'model';
      }
      if (rawContentType.startsWith('image/')) { // Must come after image/svg
        return 'image';
      }
      if (rawContentType.startsWith('text/')) { // Must come after text/html
        return 'text';
      }
      if (rawContentType.startsWith('video/')) {
        return 'video';
      }
      if (rawContentType.startsWith('audio/')) {
        return 'audio';
      }
    }
    // Default for unknown, undefined, or unhandled types
    return 'unsupported';
  };

  const formatParents = (parents) => {
    if (!parents) return '';
    return Array.isArray(parents) ? parents.join(',') : parents;
  };
  
  return (
    <MainContainer>
      <FeedContainer>
        <LinkContainer>
          <PageText>Feed</PageText>
          <VerticalDivider />
          <ButtonContainer>
            <TabButton to="/trending" isActive={true}>
              <FireIcon size={'1.25rem'} />
              Trending
            </TabButton>
            <TabButton to="/discover" isActive={false}>
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
                  <UnstyledLink to={'/inscription/' + inscription.inscriptions[0].number}>
                    <NumberText>#{addCommas(inscription.inscriptions[0].number)}</NumberText>
                  </UnstyledLink>
                  {inscription.inscriptions[0].spaced_rune && (
                    <Tag>
                      <CurrencyIcon size={'1rem'} color={theme.colors.background.purp} />
                      <TagSpan color={theme.colors.background.purp}>
                        {inscription.inscriptions[0].spaced_rune}
                      </TagSpan>
                    </Tag>
                  )}
                  {inscription.inscriptions[0].collection_name && (
                    <UnstyledLink to={'/collection/' + inscription.inscriptions[0].collection_symbol}>
                      <Tag>
                        <GalleryIcon size={'1rem'} color={theme.colors.background.verm} />
                        <TagSpan color={theme.colors.background.verm}>
                          {inscription.inscriptions[0].collection_name}
                        </TagSpan>
                      </Tag>
                    </UnstyledLink>
                  )}
                  {inscription.activity.children_count > 0 && (
                    <UnstyledLink to={'/children/' + formatParents(inscription.activity.ids)}>
                      <Tag>
                        <Person2Icon size={'1rem'} color={theme.colors.text.secondary} />
                        <TagSpan color={theme.colors.text.secondary}>
                          Parent
                        </TagSpan>
                        <TagSpan color={theme.colors.text.tertiary}>{" • " + addCommas(inscription.activity.children_count)}</TagSpan>
                      </Tag>
                    </UnstyledLink>
                  )}
                </TitleContainer>
                <DetailsContainer>
                  <CopyButton onClick={() => handleCopyClick(i, 'https://vermilion.place/inscription/' + inscription.inscriptions[0].number)} copied={copied}>
                    {copiedRowId === i ? <CheckIcon size={'1.25rem'} color={theme.colors.background.success} /> : <LinkIcon size={'1.25rem'} />}
                  </CopyButton>
                </DetailsContainer>
              </InfoContainer>
              <UnstyledLink to={'/inscription/' + inscription.inscriptions[0].number}>
                <InscriptionContainer>
                  <InscriptionContentWrapper>
                    <InnerInscriptionContent
                      contentType={getContentTypeProp(inscription.inscriptions[0].content_type)}
                      blobUrl={`/api/inscription_number/${inscription.inscriptions[0].number}`}
                      number={inscription.inscriptions[0].number}
                      metadata={{
                        id: inscription.inscriptions[0].id,
                        content_type: inscription.inscriptions[0].content_type,
                        is_recursive: inscription.inscriptions[0].is_recursive
                      }}
                      textContent={inscription.inscriptions[0].text}
                      useFeedStyles={true}
                    />
                    <ContentOverlay />
                  </InscriptionContentWrapper>
                </InscriptionContainer>
              </UnstyledLink>
              <ActionContainer>
                <SocialContainer>
                  <SocialButton onClick={() => toggleBoostsModal(inscription.inscriptions[0].id, inscription.activity.delegate_count)}>
                    <ChevronUpDuoIcon size={'1.25rem'} color={theme.colors.text.primary}></ChevronUpDuoIcon>
                    {addCommas(inscription.activity.delegate_count)}
                  </SocialButton>
                  <SocialButton onClick={() => toggleCommentsModal(inscription.inscriptions[0].id, inscription.activity.comment_count)}>
                    <CommentIcon size={'1.25rem'} color={theme.colors.text.primary}></CommentIcon>
                    {addCommas(inscription.activity.comment_count)}
                  </SocialButton>
                </SocialContainer>
                <BoostContainer>
                <BoostButton onClick={() => toggleCheckoutModal(inscription.inscriptions[0])}>
                  <ChevronUpDuoIcon size={'1.25rem'} color={theme.colors.background.white}></ChevronUpDuoIcon>
                    Boost
                  </BoostButton>
                </BoostContainer>
              </ActionContainer>
            </ContentContainer>
            {i < inscriptions.length - 1 && <Divider />}  
          </React.Fragment>
        ))}
        <LoadingContainer ref={loadMoreRef}>
          {isLoading && <Spinner />}
        </LoadingContainer>
      </FeedContainer>

      {/* Boosts Modal */}
      <BoostsModal
        boostsList={boostsList}
        onClose={() => toggleBoostsModal(null)}
        fetchMoreBoosts={() => fetchBoosts(selectedBoostId)}
        hasMoreBoosts={hasMoreBoosts}
        isBoostsLoading={isBoostsLoading}
        isBoostsModalOpen={isBoostsModalOpen}
      />

      {/* Comments Modal */}
      <CommentsModal
        commentsList={commentsList}
        onClose={() => toggleCommentsModal(null)}
        isCommentsModalOpen={isCommentsModalOpen}
      />

      {/* Checkout Modal */}
      <CheckoutModal
        onClose={() => toggleCheckoutModal(null)}
        isCheckoutModalOpen={isCheckoutModalOpen}
        delegateData={selectedDelegateData || ""}
      />
    </MainContainer>
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

const UnstyledLink = styled(Link)`
  color: unset;
  text-decoration: unset;
  display: inline-block;
  max-width: 100%;
`;

export default Trending;
