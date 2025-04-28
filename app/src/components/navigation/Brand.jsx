import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { theme } from '../../styles/theme';
import { Logo2 } from '../common/Logo2'; 
import { Logo } from '../common/Logo';

const Brand = () => {
  return (
    <Link to="/" style={{ textDecoration: 'none' }}>
      <BrandContainer>
        <Logo
          size={'2.5rem'}
          colorOuter1={theme.colors.border}
          colorOuter2={theme.colors.background.primary}
          colorOuter3={theme.colors.background.tertiary}
        />
        <BrandText>Vermilion</BrandText>
      </BrandContainer>
    </Link>
  );
};

const BrandContainer = styled.div`
  display: flex;
  align-items: center;
  height: 2.5rem;
  gap: .5rem;
  cursor: pointer;

  .variable-color-outer-1 {
    transition: fill 200ms ease-in-out;
  }
  
  &:hover {
    .variable-color-outer-1 {
      fill: ${theme.colors.background.aqua};
    }
  }

  .variable-color-outer-2 {
    transition: fill 200ms ease-in-out;
  }
  
  &:hover {
    .variable-color-outer-2 {
      fill: ${theme.colors.background.aquaLight};
    }
  }
   
  .variable-color-outer-3 {
    transition: fill 200ms ease-in-out;
  }

  &:hover {
    .variable-color-outer-3 {
      fill: ${theme.colors.background.acquaExtraLight};
    }
  }
`;

const BrandText = styled.span`
  font-family: ${theme.typography.fontFamilies.bold};
  font-size: 1.375rem;
  letter-spacing: -.075rem;
  line-height: 1.75rem;
  color: ${theme.colors.primary};
  cursor: pointer;
  margin: 0;
`;

export default Brand;
