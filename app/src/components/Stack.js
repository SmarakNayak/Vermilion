import React from 'react';
import styled from 'styled-components';

const Stack = ({center, horizontal, children, style }) => {

  return (
    <StackContainer center={center} horizontal={horizontal} style={{...style}} >
      {children}
    </StackContainer>
  )
};

const StackContainer = styled.div`
  display: flex;
  flex-direction: ${(props) => props.horizontal ? 'row' : 'column'};
  align-items: ${(props) => props.center ? 'center' : 'flex-start'};
  flex: 1;
`;

export default Stack;