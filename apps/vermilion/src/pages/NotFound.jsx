import React, { useState, useEffect, ChangeEvent } from 'react';
import styled from 'styled-components';

const NotFound = (props) => {

  return(
    <MainContainer>
      <TextContainer>
        <ErrorTitle>404</ErrorTitle>
        <Divider />
        <ErrorText>Page Not Found</ErrorText>
      </TextContainer>
    </MainContainer>
  )
}

const MainContainer = styled.div`
  width: 100%;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  top: 5rem;
  max-height: 100vh;
  height: calc(100vh - 5rem);
`;

const TextContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 1.5rem;
`;

const ErrorTitle = styled.h1`
  font-family: Relative Trial Bold;
  font-size: 2rem;
  margin: 0;
`;

const ErrorText = styled.p`
  font-family: Relative Trial Bold;
  font-size: 1rem;
  margin: 0;
`;

const Divider = styled.div`
  height: 2rem;  // Adjust this value to match your desired height
  width: 1px;
  background-color: #E9E9E9;
`;

export default NotFound;
