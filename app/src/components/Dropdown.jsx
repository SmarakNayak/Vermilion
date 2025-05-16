// Dropdown.js
import React, { useEffect, useState, useRef } from 'react';
import styled from 'styled-components';
import { CheckIcon, ChevronDownIcon, SortIcon } from './common/Icon';
import theme from '../styles/theme';

const SortbyDropdown = ({ onOptionSelect, initialOption, includeRelevance }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState(initialOption);
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

  let options = [
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

  // Insert relevance option if needed
  if (includeRelevance) {
    options = ['most_relevant', ...options];
  }

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
      <DropdownButton isActive={isOpen} onClick={handleToggle}>
        <LabelText>{labels[selectedOption]}</LabelText>
        <ChevronIcon size={'1rem'} color={theme.colors.text.primary} />
        <MobileIcon>
          <SortIcon size={'1.25rem'} color={theme.colors.text.primary} />
        </MobileIcon>
      </DropdownButton>
      {/* <DropdownButton onClick={handleToggle}>
        {selectedOption}
      </DropdownButton> */}
      {isOpen && (
        <DropdownMenu>
          {options.map((option) => (
            <DropdownItem 
              key={option} 
              onClick={() => handleOptionSelect(option)}
            >
              <span>{labels[option]}</span>
              {selectedOption === option && (
                <CheckIconWrapper>
                  <CheckIcon 
                    size={'1.25rem'} 
                    color={'currentColor'} 
                  />
                </CheckIconWrapper>
              )}
            </DropdownItem>
          ))}
        </DropdownMenu>
      )}
    </DropdownWrapper>
  );
};

const DropdownWrapper = styled.div`
  position: relative;
  display: inline-block;
`;

const DropdownButton = styled.button`
  height: 2.75rem;
  border-radius: 1.5rem;
  border: none;
  padding: 0 .875rem 0 1.25rem;
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  gap: .5rem;
  font-family: ${theme.typography.fontFamilies.medium};
  font-size: 1rem;
  color: ${theme.colors.text.primary};
  background-color: ${props => props.isActive ? theme.colors.border : theme.colors.background.primary}; 
  transition: all 200ms ease;
  transform-origin: center center;
  white-space: nowrap;  
  min-width: fit-content;

  @media (max-width: 480px) {
    padding: 0 .75rem;
    min-width: auto;
    aspect-ratio: 1/1;
  }

  &:hover {
    background-color: ${theme.colors.border};
  }

  &:active {
    transform: scale(0.96);
  }
`;

const LabelText = styled.span`
  @media (max-width: 480px) {
    display: none;
  }
`;

const ChevronIcon = styled(ChevronDownIcon)`
  @media (max-width: 480px) {
    display: none;
  }
`;

const MobileIcon = styled.div`
  display: none;
  
  @media (max-width: 480px) {
    display: flex;
  }
`;

const DropdownMenu = styled.ul`
  position: absolute;
  top: 100%;
  right: 0;
  background-color: white;
  // border: 1px solid ${theme.colors.border};
  box-shadow: ${theme.shadows.soft};
  padding: .25rem;
  list-style-type: none;
  margin-top: .5rem;
  border-radius: ${theme.borderRadius.large};
  z-index: 1;
`;

const DropdownItem = styled.li`
  padding: .5rem 2.5rem .5rem .75rem;
  cursor: pointer;
  font-family: ${theme.typography.fontFamilies.medium};
  font-size: 1rem;
  color: ${theme.colors.text.secondary};
  border-radius: ${theme.borderRadius.medium};
  transition: all 200ms ease;
  transform-origin: center center;
  text-wrap: nowrap;
  position: relative;
  display: flex;
  // justify-content: space-between;
  align-items: center;

  min-width: 6rem;

  &:hover {
    color: ${theme.colors.text.primary};
    background-color: ${theme.colors.background.primary};
  }
`;

const CheckIconWrapper = styled.div`
  position: absolute;
  right: .75rem; /* Fixed position from right */
  display: flex;
  align-items: center;
  justify-content: center;
`;

export default SortbyDropdown;
