import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { theme } from '../../styles/theme';
import { Logo2 } from '../common/Logo2'; 

const Brand = () => {
  return (
    <Link to="/" style={{ textDecoration: 'none' }}>
      <BrandContainer>
        <Logo2
          size={'2.5rem'}
          colorInside={theme.colors.border}
          colorOutside={theme.colors.background.primary}
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

  .variable-color-inside {
    transition: fill 200ms ease-in-out;
  }
  
  &:hover {
    .variable-color-inside {
      fill: ${theme.colors.background.aqua};
    }
  }

  .variable-color-outside {
    transition: fill 200ms ease-in-out;
  }
  
  &:hover {
    .variable-color-outside {
      fill: ${theme.colors.background.aquaLight};
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
