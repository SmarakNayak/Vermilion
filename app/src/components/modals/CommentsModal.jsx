import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import theme from '../../styles/theme';

// icons
import { 
  AvatarCircleIcon,
  CommentIcon,
  CrossIcon,
} from '../common/Icon';
import { addCommas, formatAddress, calcTimeAgo } from '../../utils';

const CommentsModal = ({ commentsList, onClose, isCommentsModalOpen }) => {
  const placeholderComments = [
    { id: 1, address: "bc1p3...hfr7e", text: "🔥🔥🔥", time: "3d" },
    { id: 2, address: "bc1p3...hfr7e", text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.", time: "23h" },
    { id: 3, address: "bc1qy...e83u2", text: "Yet another comment.", time: "56m" },
  ];

  const observer = useRef();
  const modalContentRef = useRef(); // Ref for the modal content

  useEffect(() => {
    if (isCommentsModalOpen) {
      document.body.style.overflow = 'hidden'; // Disable page scrolling
    } else {
      document.body.style.overflow = 'auto'; // Enable page scrolling

      // Reset scroll position when modal is closed
      if (modalContentRef.current) {
        modalContentRef.current.scrollTop = 0;
      }
    }

    return () => {
      document.body.style.overflow = 'auto'; // Cleanup on unmount
    };
  }, [isCommentsModalOpen]);

  return (
    <ModalOverlay isOpen={isCommentsModalOpen} onClick={onClose}>
      <ModalContainer isOpen={isCommentsModalOpen} onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <HeaderText>Comments</HeaderText>
          <CloseButton onClick={onClose}>
            <CrossIcon size={'1.25rem'} color={theme.colors.text.secondary} />
          </CloseButton>
        </ModalHeader>
        <ModalContent gap="1.5rem" ref={modalContentRef}>
          {commentsList.length === 0 ? (
            <EmptyStateContainer>
              <EmptyStateIconContainer>
                <CommentIcon size="1.25rem" color={theme.colors.text.secondary} />
              </EmptyStateIconContainer>
              <EmptyStateTextContainer>
                <EmptyStateTitle>No comments yet</EmptyStateTitle>
                <EmptyStateSubtitle>Boost this inscription to add an onchain comment.</EmptyStateSubtitle>
              </EmptyStateTextContainer>
            </EmptyStateContainer>
          ) : (
            commentsList.map((comment) => (
              <CommentEntry key={comment.comment_edition}>
                <DetailsRow>
                  <ProfileImage>
                    <AvatarCircleIcon size={'1rem'} color={theme.colors.background.verm} />
                  </ProfileImage>
                  <DetailsInfo>
                    <TextLink
                      to={`/address/${comment.address}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <BoostText>{formatAddress(comment.address)}</BoostText>
                    </TextLink>
                    <TimeText>{calcTimeAgo(comment.block_timestamp)} ago</TimeText>
                  </DetailsInfo>
                </DetailsRow>
                <CommentText>{comment.content}</CommentText>
                <ViewInscriptionLink
                  href={`/inscription/${comment.comment_number}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View inscription
                </ViewInscriptionLink>
              </CommentEntry>
            ))
          )}
        </ModalContent>
      </ModalContainer>
    </ModalOverlay>
  );
};


const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(0.125rem);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  opacity: ${props => (props.isOpen ? 1 : 0)};
  visibility: ${props => (props.isOpen ? 'visible' : 'hidden')};
  transition: opacity 200ms ease, visibility 200ms ease, backdrop-filter 200ms ease;
`;

const ModalContainer = styled.div`
  background: ${theme.colors.background.white};
  border-radius: 1rem;
  width: 90vw;
  max-width: 400px;
  height: auto;
  max-height: 95vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  opacity: ${props => (props.isOpen ? 1 : 0)};
  visibility: ${props => (props.isOpen ? 'visible' : 'hidden')};
  transform: ${props => (props.isOpen ? 'scale(1)' : 'scale(0.92)')};
  transition: opacity 200ms ease, visibility 200ms ease, transform 200ms ease;

  @media (max-width: 400px) {
    max-width: 90vw;
  }
`;

const ModalContent = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1; 
  gap: ${props => props.gap || '0'};
  overflow-y: auto;
  padding: 0.5rem 1.25rem 2.5rem;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem 1.5rem;
  background: ${theme.colors.background.white};
`;

const HeaderText = styled.p`
  font-family: ${theme.typography.fontFamilies.bold};
  font-size: 1.25rem;
  line-height: 2rem;
  color: ${theme.colors.text.primary};
  margin: 0;
`;

const CloseButton = styled.button`
  background-color: ${theme.colors.background.white};
  border: none;
  border-radius: 1rem;
  height: 2rem;
  width: 2rem;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0;
  font-size: 1.5rem;
  cursor: pointer;
  transition: all 200ms ease;

  &:hover {
    background-color: ${theme.colors.background.primary};
  }

  &:active {
    transform: scale(0.96);
  }
`;

const ProfileImage = styled.div`
  width: 1.75rem;
  height: 1.75rem;
  border-radius: 50%;
  background: ${theme.colors.background.primary};
  display: flex;
  justify-content: center;
  align-items: center;
`;

const TextLink = styled(Link)`
  color: unset;
  text-decoration: unset;
  display: block; 
`;

const BoostText = styled.p`
  font-size: 1rem;
  color: ${theme.colors.text.primary};
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.5rem;
  // width: 100%;
  text-decoration-line: underline;
  text-decoration-color: transparent;
  text-decoration-thickness: 2px;
  text-underline-offset: 2px;

  transition: all 200ms ease;
  transform-origin: center center;

  &:hover {
    text-decoration-color: ${theme.colors.text.primary};};
  }
`;

const CommentEntry = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

// const CommentDetails = styled.div`
//   display: flex;
//   flex-direction: column;
//   gap: 0.75rem;
// `;

const DetailsRow = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
`;

const DetailsInfo = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 0.5rem;
`;

const CommentText = styled.p`
  padding-left: 2.25rem;
  font-family: ${theme.typography.fontFamilies.medium};
  font-size: 1rem;
  line-height: 1.375rem;
  color: ${theme.colors.text.secondary};
  margin: 0;
  display: -webkit-box; 
  -webkit-line-clamp: 5; 
  -webkit-box-orient: vertical;
  overflow: hidden; 
  text-overflow: ellipsis;
`;

const TimeText = styled.p`
  font-family: ${theme.typography.fontFamilies.medium};
  font-size: 0.875rem;
  line-height: 1.25rem;
  color: ${theme.colors.text.tertiary};
  margin: 0;
  padding: 0;
`;

const ViewInscriptionLink = styled.a`
  font-family: ${theme.typography.fontFamilies.medium};
  font-size: 0.875rem;
  line-height: 1.25rem;
  color: ${theme.colors.text.tertiary};
  text-decoration: none;
  margin: 0;
  padding-left: 2.25rem;
  display: inline-block;
  text-decoration-line: underline;
  text-decoration-color: transparent;
  text-decoration-thickness: 2px;
  text-underline-offset: 2px;

  transition: all 200ms ease;

  &:hover {
    text-decoration-color: ${theme.colors.text.tertiary};
  }
`;

const EmptyStateContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 1rem 0 1.5rem 0;
`;

const EmptyStateIconContainer = styled.div`
  width: 2.75rem;
  height: 2.75rem;
  background-color: ${theme.colors.background.primary};
  border-radius: 1.375rem;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const EmptyStateTextContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.125rem;
`;

const EmptyStateTitle = styled.p`
  font-family: ${theme.typography.fontFamilies.medium};
  font-size: 1rem;
  line-height: 1.5rem;
  color: ${theme.colors.text.secondary};
  font-weight: bold;
  margin: 0;
`;

const EmptyStateSubtitle = styled.p`
  font-family: ${theme.typography.fontFamilies.medium};
  font-size: 0.875rem;
  line-height: 1.25rem;
  color: ${theme.colors.text.secondary};
  margin: 0;
`;

export default CommentsModal;
