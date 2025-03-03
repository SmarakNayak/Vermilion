import React from 'react';
import styled from 'styled-components';

const BlockRow = (props) => {

  return (
    <BlockContainer>
      <p>Test</p>
    </BlockContainer>
  )
};

const BlockContainer = styled.div`
  display: flex;
  flex-direction: row;
  transition: 
    background-color 350ms ease,
    transform 150ms ease;
  transform-origin: center center;

  &:hover {
    background-color: #F5F5F5;
  }
`;

export default BlockRow;