import React, { useState, useEffect, ChangeEvent } from 'react';
import { Link } from "react-router-dom";
import styled from 'styled-components';

const SideNav = (props) => {


  return (
    <NavContainer>
      <NavButton>{}</NavButton>
      <NavButton>{}</NavButton>
      <NavButton>{}</NavButton>
    </NavContainer>
  )
}

const NavContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: 0 2rem 0 0;
  margin: 0;
  gap: 1rem;
  position: sticky;
`

const NavButton = styled.button`
  width: 2.5rem;
  height: 2.5rem;
  border-radius: .375rem;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #F5F5F5;
`;

export default SideNav;