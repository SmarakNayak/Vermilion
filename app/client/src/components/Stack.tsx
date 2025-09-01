import React from 'react';
import styled from 'styled-components';

interface StackProps {
  /** Center align the items */
  center?: boolean
  /** Arrange items horizontally instead of vertically */
  horizontal?: boolean
  /** Gap between items, e.g., '1rem', '16px' */
  gap?: string
  /** Additional styles to apply to the container */
  style?: React.CSSProperties
  /** Child elements to be rendered inside the stack */
  children: React.ReactNode
}

const Stack = ({center, children, horizontal, gap, style }: StackProps) => {

  return (
    <StackContainer center={center} horizontal={horizontal} gap={gap} style={{...style}} >
      {children}
    </StackContainer>
  )
};

// has to be undefined to allow exact optional props in styled components
// didn't look too deep into why
interface StackContainerProps {
  center?: boolean | undefined
  horizontal?: boolean | undefined
  gap?: string | undefined
}

const StackContainer = styled.div<StackContainerProps>`
  display: flex;
  flex-direction: ${(props) => props.horizontal ? 'row' : 'column'};
  align-items: ${(props) => props.center ? 'center' : 'flex-start'};
  flex: 1;
  gap: ${(props) => props.gap};
`;

export default Stack;
