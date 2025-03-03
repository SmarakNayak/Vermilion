import React from 'react';
import styled from 'styled-components';

export const Stack = ({center, children, horizontal, gap, style }) => {

  return (
    <StackContainer center={center} horizontal={horizontal} gap={gap} style={{...style}} >
      {children}
    </StackContainer>
  )
};

const StackContainer = styled.div`
  display: flex;
  flex-direction: ${(props) => props.horizontal ? 'row' : 'column'};
  align-items: ${(props) => props.center ? 'center' : 'flex-start'};
  flex: 1;
  gap: ${(props) => props.gap};
`;
