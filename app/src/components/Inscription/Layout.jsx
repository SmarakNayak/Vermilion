import React from 'react';
import styled from 'styled-components';
import theme from '../../styles/theme';

export const MainContainer = styled.div`
  width: 100%;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: row;
  align-items: flex-start;

  @media (max-width: 864px) {
    flex-direction: column;
    align-items: center;
    width: calc(100% - 2rem);
    padding: 1rem 1rem 2.5rem 1rem;
    gap: 2rem;
  }
`;

export const ContentContainer = styled.div`
  background-color: ${theme.colors.background.primary};
  position: sticky;
  top: 4.5rem;
  max-height: 100vh;
  overflow-y: scroll;
  display: flex;
  flex-direction: column;
  flex-wrap: nowrap;
  justify-content: center;
  align-items: center;
  width: calc(100% - 27rem);
  height: calc(100vh - 4.5rem);
  flex: 1;
  overflow: hidden;
  margin: 0;
  padding: 0 1.5rem;
  min-width: 20rem;

  @media (max-width: 864px) {
    position: static;
    background-color: ${theme.colors.background.white};
    width: 100%;
    min-width: unset;
  }
`;

export const MediaContainer = styled.div`
  background-color: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  max-width: 32rem;
  height: auto;
  aspect-ratio: 1/1;
`;

export const InfoContainer = styled.div`
  padding: 3rem 2rem;
  width: 100%;
  max-width: 27rem;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  position: relative;

  @media (max-width: 864px) {
    padding: 1rem 0 0 0;
    max-width: 100%; 
  }
`;

export const DataContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${(props) => props.gapsize || '1rem'};

  @media (max-width: 768px) {
    align-items: ${(props) => props.info ? 'center' : ''};
  }
`;

export const SectionPadding = styled.div`
  width: 100%;
  box-sizing: border-box;
  padding: ${props => props.isLast ? '0 1rem' : '0 1rem 2.5rem 1rem'};
  display: flex;
  flex-direction: column;
  gap: ${(props) => props.gap || '0'};
`;

export const SimilarContentContainer = styled.div`
  width: calc(100% - 6rem);
  padding: 1.5rem 3rem;
  display: block;

  @media (max-width: 864px) {
    width: calc(100% - 2rem);
    padding: 1.5rem 1rem;
  }
`;

export const SectionContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin: 0 0 1.5rem 0;
`;

export const SectionHeaderContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: .5rem;
`;

export const SimilarText = styled.p`
  font-family: ${theme.typography.fontFamilies.bold};
  font-size: 1.25rem;
  line-height: 1.75rem;
  margin: 0;
  padding: 0;
`;

export const BorderedTagSection = styled.div`
  display: flex;
  position: relative;
  padding-left: calc(2px + 0.75rem);
  
  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 2px;
    background-color: ${theme.colors.background.primary};
    border-radius: 1px;
  }
`;
