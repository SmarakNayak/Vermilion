import React, { useState, useEffect, ChangeEvent } from 'react';
import styled from 'styled-components';
import theme from '../styles/theme';
import MainText from '../components/common/text/MainText';
import InfoText from '../components/common/text/InfoText';

const NotFound = (props) => {

  return(
    <MainContainer>
      <TextContainer>
        <MainText>404</MainText>
        <Divider />
        <InfoText islarge>Page Not Found</InfoText>
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
  top: 4.5rem;
  max-height: 100vh;
  height: calc(100vh - 4.5rem);
`;

const TextContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 1.5rem;
`;

const Divider = styled.div`
  height: 2rem;  
  width: 1px;
  background-color: ${theme.colors.border};
`;

export default NotFound;
