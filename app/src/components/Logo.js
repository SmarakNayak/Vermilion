import React from 'react';
import styled from 'styled-components';
import LogoImage from '../assets/templogo.png';



const Logo = ({size}) => {

  return (
    <LogoElement size={size} src={LogoImage} alt='Temporary logo' />
  )
};

const LogoElement = styled.img`
  height: ${(props) => props.size};
`;

export default Logo;