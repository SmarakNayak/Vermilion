import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

const StyledLink = styled(Link)`
  color: unset;
  text-decoration: unset;
`;

const UnstyledLink = ({ to, children, ...props }) => {
  return (
    <StyledLink to={to} {...props}>
      {children}
    </StyledLink>
  );
};

export default UnstyledLink;
