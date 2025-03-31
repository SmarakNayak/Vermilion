import React from 'react';
import styled, { keyframes } from 'styled-components';

const LoadingSkeleton = () => {
  return (
    <SkeletonContainer gap={'2.5rem'}>
      <SkeletonGroup gap={'.5rem'}>
        <SkeletonElement width={'12.5rem'} height={'1.625rem'} />
        <SkeletonElement width={'10rem'} height={'2.5rem'} />
        <SkeletonElement width={'7.5rem'} height={'1.625rem'} />
      </SkeletonGroup>
      
      <SkeletonGroup gap={'1.5rem'}>
        <SkeletonElement width={'100%'} height={'3rem'} />
        <SkeletonElement width={'100%'} height={'1.125rem'} />
        <SkeletonElement width={'100%'} height={'1.125rem'} />
        <SkeletonElement width={'100%'} height={'1.125rem'} />
        <SkeletonElement width={'100%'} height={'1.125rem'} />
        <SkeletonElement width={'100%'} height={'1.125rem'} />
        <SkeletonElement width={'100%'} height={'1.125rem'} />
        <SkeletonElement width={'100%'} height={'1.125rem'} />
        <SkeletonElement width={'100%'} height={'1.125rem'} />
      </SkeletonGroup>
    </SkeletonContainer>
  );
};

const pulse = keyframes`
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: .5;
  }
`;

const SkeletonContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${(props) => props.gap};
  width: 100%;
  max-width: 23rem;
  padding: 0 1rem;
`;

const SkeletonGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${(props) => props.gap};
  width: 100%;
`;

const SkeletonElement = styled.div`
  background-color: #F5F5F5;
  animation: ${pulse} 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  border-radius: .5rem;
  height: ${(props) => props.height};
  width: ${(props) => props.width};
`;

export default LoadingSkeleton;