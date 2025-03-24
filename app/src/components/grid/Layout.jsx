import styled from 'styled-components';
import { Link } from "react-router-dom";
import { theme } from '../../styles/theme';

export const HeaderContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  width: 100%;

  @media (max-width: 864px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 1.5rem;
  }
`;

export const MainContentStack = styled.div`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  max-width: calc(100% - 10.5rem);
  gap: .5rem;

  @media (max-width: 864px) {
    max-width: 100%;
  }
`;

export const CollectionStack = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 1rem;

  @media (max-width: 480px) {
    flex-direction: column;
    align-items: flex-start;
  }
`;

export const SocialStack = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: .75rem;
  flex-shrink: 0;
`;

export const RowContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  width: 100%;
`;

export const GalleryContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

export const CollectionImageContainer = styled.div`
  width: 8rem;
  height: 8rem;
  background-color: ${theme.colors.background.primary};
  border-radius: .25rem;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const HorizontalDivider = styled.div`
  width: 100%;
  border-bottom: 1px solid ${theme.colors.border};
`;
