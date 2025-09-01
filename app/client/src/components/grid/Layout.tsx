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

export const DetailsStack = styled.div`
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

export const ImageContainer = styled.div`
  width: 8rem;
  height: 8rem;
  background-color: ${theme.colors.background.primary};
  border-radius: .25rem;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const ProfileContainer = styled.div`
  width: 8rem;
  height: 8rem;
  background-color: ${theme.colors.background.primary};
  border-radius: 4rem;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const HorizontalDivider = styled.div`
  width: 100%;
  border-bottom: 1px solid ${theme.colors.border};
`;

export const HorizontalTabContainer = styled.div`
  display: flex;
  padding-top: 24px;
  flex-direction: row;
  align-items: flex-start;
  gap: 24px;
  align-self: stretch;
  border-top: 1px solid ${theme.colors.border};
`;

export const TabText = styled.div<{ isActive: boolean }>`
  display: flex;
  padding: 0 4px 12px 4px;
  justify-content: center;
  align-items: center;
  gap: 4px;
  //Text
  color: ${props => props.isActive ? theme.colors.background.verm : theme.colors.text.tertiary};
  font-family: ${theme.typography.fontFamilies.medium};
  font-size: 16px;
  font-style: normal;
  //font-weight: 700;
  line-height: 16px; /* 100% */
  cursor: pointer;
  ${props => props.isActive ? 'border-bottom: 2px solid ' + theme.colors.background.verm : ''};
  
  &:hover {
    color: ${theme.colors.background.verm};
    svg {
      fill: ${theme.colors.background.verm};
    }
  }
  &:active {
    transform: scale(0.96);
  }
`;