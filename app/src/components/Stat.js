import React from 'react';
import styled from 'styled-components';

const Stat = ({ value, category }) => (
  <StatsContainer>
    {/* <StatsWrapper>
      <StatsText>{value}</StatsText>
    </StatsWrapper> */}
    <CategoryText>{category}</CategoryText>
    <StatsText>{value}</StatsText>
  </StatsContainer>
);

const StatsContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: .75rem;
`;

const CategoryText = styled.p`
  font-size: .75rem;
  color: #959595;
  margin: 0;
`;

const StatsText = styled.p`
  font-size: .875rem;
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

  &:hover {
    background-color: #E9E9E9;
  }
`;

export default Stat;