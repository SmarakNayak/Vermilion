import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import ChevronDownSmallIcon from '../assets/icons/ChevronDownSmallIcon';
import PlayIcon from '../assets/icons/PlayIcon';
import BlockIcon from '../assets/icons/BlockIcon';
import GridIcon from '../assets/icons/GridIcon';

const ExploreDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <DropdownContainer ref={dropdownRef}>
      <ExploreButton onClick={() => setIsOpen(!isOpen)} isOpen={isOpen}>
        Explore
        <ChevronDownSmallIcon svgSize={'1.25rem'} svgColor={isOpen ? '#FFFFFF' : '#000000'} />
      </ExploreButton>
      {isOpen && (
        <DropdownMenu>
          <DropdownItem to="/explore/inscriptions" onClick={() => setIsOpen(false)}>
            <GridIcon svgSize={'1.25rem'} svgColor={'#000000'} />
            Inscriptions
          </DropdownItem>
          <DropdownItem to="/explore/blocks" onClick={() => setIsOpen(false)}>
            <BlockIcon svgSize={'1.25rem'} svgColor={'#000000'} />
            Blocks
          </DropdownItem>
          <DropdownItem to="/explore/collections" onClick={() => setIsOpen(false)}>
            <PlayIcon svgSize={'1.25rem'} svgColor={'#000000'} />
            Collections
          </DropdownItem>
        </DropdownMenu>
      )}
    </DropdownContainer>
  );
};

const DropdownContainer = styled.div`
  position: relative;
`;

const ExploreButton = styled.button`
  height: 3rem;
  border-radius: 1.5rem;
  border: none;
  margin: 0;
  padding: 0 .75rem 0 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: .125rem;
  cursor: pointer;
  font-family: Relative Trial Bold;
  font-size: 1rem;
  background-color: ${props => props.isOpen ? '#000000' : '#FFFFFF'};
  color: ${props => props.isOpen ? '#FFFFFF' : '#000000'};
  transition: 
    background-color 350ms ease,
    transform 150ms ease;
  transform-origin: center center;

  &:hover {
    background-color: ${props => props.isOpen ? '#000000' : '#F5F5F5'};
  }
`;

const DropdownMenu = styled.div`
  position: absolute;
  top: 3.5rem;
  left: -1rem;
  width: 12.5rem;
  background-color: #FFFFFF;
  border: 1px solid #E9E9E9;
  box-shadow: 0px 1px 6px 0px rgba(0, 0, 0, 0.09);
  border-radius: .75rem;
  padding: 1rem;
  z-index: 1000;
`;

const DropdownItem = styled(Link)`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: .75rem;
  border-radius: .75rem;
  padding: .75rem 1rem;
  text-decoration: none;
  font-family: Relative Trial Bold;
  font-size: 1rem;
  color: #000000;
  transition: 
    background-color 350ms ease,
    transform 150ms ease;
  transform-origin: center center;

  &:hover {
    background-color: #f0f0f0;
  }
`;

export default ExploreDropdown;