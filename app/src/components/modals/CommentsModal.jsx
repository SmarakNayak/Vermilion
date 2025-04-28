import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import theme from '../../styles/theme';

// icons
import { 
  CrossIcon,
} from '../common/Icon';

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
          {placeholderComments.map((comment) => (
            <CommentEntry key={comment.id}>
              {/* <CommentDetails> */}
                <DetailsRow>
                  <ProfileImage />
                  <DetailsInfo>
                    <TextLink
                      to={`/address/${comment.address}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <BoostText>{comment.address}</BoostText>
                    </TextLink>
                    <TimeText>{comment.time}</TimeText>
                  </DetailsInfo>
                </DetailsRow>
                <CommentText>{comment.text}</CommentText>
              {/* </CommentDetails> */}
            </CommentEntry>
          ))}
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
  max-width: 400px;
  max-height: 630px;
  width: 90vw;
  height: 90vh;
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
  @media (max-height: 630px) {
    max-height: 90vh;
  }
`;

const ModalContent = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1; 
  gap: ${props => props.gap || '0'};
  overflow-y: auto;
  padding: 0.5rem 1.25rem 1.5rem;
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
  // border: 0.125rem solid ${theme.colors.border};
  background: linear-gradient(180deg, ${theme.colors.background.white}, ${theme.colors.background.verm});
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
`;

const TimeText = styled.p`
  font-family: ${theme.typography.fontFamilies.medium};
  font-size: 0.875rem;
  line-height: 1.25rem;
  color: ${theme.colors.text.tertiary};
  margin: 0;
`;

export default CommentsModal;