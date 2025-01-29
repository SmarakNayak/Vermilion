// components/ImageSkeleton.js
import React from 'react';
import styled, { keyframes } from 'styled-components';

const shimmer = keyframes`
  0% {
    background-position: -1000px 0;
  }
  100% {
    background-position: 1000px 0;
  }
`;

const SkeletonImage = styled.div`
  width: 32rem;
  height: 32rem;
  max-width: 32rem;
  background: linear-gradient(90deg, #F0F0F0 25%, #F8F8F8 50%, #F0F0F0 75%);
  background-size: 1000px 100%;
  animation: ${shimmer} 2s infinite linear;
  border-radius: .5rem;
  border: .0625rem solid #E9E9E9;

  @media (max-width: 544px) {
    width: 100%;
    max-width: 100%;
    height: 100vw;
  }
`;

export default SkeletonImage;
