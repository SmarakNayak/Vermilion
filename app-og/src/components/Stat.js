import React from 'react';
import styled from 'styled-components';
import { addCommas } from '../helpers/utils';

const Stat = ({ value, category }) => (
  <StatsContainer>
    <StatsWrapper>
      <StatsText>{addCommas(value)}</StatsText>
    </StatsWrapper>
    {/* <StatsText>{value}</StatsText> */}
    <CategoryText>{category}</CategoryText>
  </StatsContainer>
);

const StatsContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: .5rem;
`;

const CategoryText = styled.p`
  font-size: .875rem;
  color: #959595;
  margin: 0;
`;

const StatsText = styled.p`
  font-size: 1rem;
  margin: 0;
`;

const StatsWrapper = styled.div`
  display: flex;
  justify-content: center;
  width: calc(100% - 2rem);
  padding: .5rem 1rem;
  border-radius: .5rem;
  background-color: #F5F5F5;
  transition: all 350ms ease;
  cursor: pointer;

  &:hover {
    background-color: #E9E9E9;
  }
`;

export default Stat;