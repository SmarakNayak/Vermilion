// Dropdown.js
import React, { useEffect, useState, useRef } from 'react';
import styled from 'styled-components';
import ChevronDownIcon from '../assets/icons/ChevronDownIcon';

const DropdownWrapper = styled.div`
  position: relative;
  display: inline-block;
  //z-index: 1;

  @media (max-width: 480px) {
    display: none;
  }
`;

const FilterButton = styled.button`
  height: 3rem;
  border-radius: 1.5rem;
  border: none;
  padding: .5rem 1rem .5rem 1.375rem;
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  gap: .5rem;
  font-family: Relative Trial Medium;
  font-size: 1rem;
  color: #000000;
  background-color: ${props => props.isActive ? '#E9E9E9' : '#F5F5F5'}; 
  transition: 
    background-color 350ms ease,
    transform 150ms ease;
  transform-origin: center center;

  &:hover {
    background-color: #E9E9E9;
  }

  &:active {
    transform: scale(0.96);
  }
`;

const DropdownMenu = styled.ul`
  position: absolute;
  top: 100%;
  right: 0;
  background-color: white;
  border: 1px solid #F5F5F5;
  box-shadow: 0px 1px 6px 0px rgba(0, 0, 0, 0.09);
  padding: .5rem;
  list-style-type: none;
  margin-top: .5rem;
  // min-width: 200px;
  border-radius: .5rem;
  z-index: 1;
`;

const DropdownItem = styled.li`
  padding: .5rem 1rem;
  cursor: pointer;
  font-family: Relative Trial Medium;
  font-size: 1rem;
  color: #000000;
  border-radius: .5rem;
  transition: 
    background-color 350ms ease,
    transform 150ms ease;
  transform-origin: center center;
  text-wrap: nowrap;

  &:hover {
    background-color: #F5F5F5;
  }
`;

const SearchDropdown = ({ onOptionSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState('most_relevant');
  const wrapperRef = useRef(null); // Create a ref for the dropdown wrapper


  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleOptionSelect = (option) => {
    setSelectedOption(option);
    setIsOpen(false);
    onOptionSelect(option); // Call the callback function with the selected option
  };

  const useOutsideClick = (ref, callback) => {
    useEffect(() => {
      const handleClickOutside = (event) => {
        if (ref.current && !ref.current.contains(event.target)) {
          callback();
        }
      };
  
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, [ref, callback]);
  };

  useOutsideClick(wrapperRef, () => {
    if (isOpen) setIsOpen(false); // Set isOpen to false on outside click
  });

  const options = [
    'most_relevant',
    'newest',
    'oldest',
    'newest_sat',
    'oldest_sat',
    // 'rarest_sat',
    // 'commonest_sat',
    'biggest',
    'smallest',
    'highest_fee',
    'lowest_fee',
  ];

  const labels = {
    most_relevant: 'Relevance',
    newest: 'Newest',
    oldest: 'Oldest',
    newest_sat: 'Newest Sat',
    oldest_sat: 'Oldest Sat',
    // rarest_sat: 'Rarest Sat',
    // commonest_sat: 'Most Common Sat',
    biggest: 'Largest File',
    smallest: 'Smallest File',
    highest_fee: 'Highest Fee',
    lowest_fee: 'Lowest Fee',
  };

  return (
    <DropdownWrapper ref={wrapperRef}>
      <FilterButton isActive={isOpen} onClick={handleToggle}>
        {labels[selectedOption]}
        <ChevronDownIcon svgSize={'1rem'} svgColor={'#000000'}></ChevronDownIcon>
      </FilterButton>
      {/* <DropdownButton onClick={handleToggle}>
        {selectedOption}
      </DropdownButton> */}
      {isOpen && (
        <DropdownMenu>
          {options.map((option) => (
            <DropdownItem key={option} onClick={() => handleOptionSelect(option)}>
              {labels[option]}
            </DropdownItem>
          ))}
        </DropdownMenu>
      )}
    </DropdownWrapper>
  );
};

export default SearchDropdown;