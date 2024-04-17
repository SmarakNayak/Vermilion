// Dropdown.js
import React, { useState } from 'react';
import styled from 'styled-components';

const DropdownWrapper = styled.div`
  position: relative;
  display: inline-block;
  z-index: 9999;
`;

const DropdownButton = styled.button`
  background-color: white;
  color: #333;
  border: 1px solid #ccc;
  padding: 8px 16px;
  font-size: 14px;
  cursor: pointer;
  border-radius: 4px;
  display: flex;
  align-items: center;

  &::after {
    content: '▼';
    margin-left: 8px;
    font-size: 12px;
  }
`;

const DropdownMenu = styled.ul`
  position: absolute;
  top: 100%;
  left: 0;
  background-color: white;
  border: 1px solid #ccc;
  padding: 8px 0;
  list-style-type: none;
  margin: 0;
  min-width: 120px;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  z-index: 9999;
`;

const DropdownItem = styled.li`
  padding: 8px 16px;
  cursor: pointer;

  &:hover {
    background-color: #f5f5f5;
  }
`;

const SortbyDropdown = ({ onOptionSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState('newest');

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleOptionSelect = (option) => {
    setSelectedOption(option);
    setIsOpen(false);
    onOptionSelect(option); // Call the callback function with the selected option
  };

  const options = [
    'newest',
    'oldest',
    'newest_sat',
    'oldest_sat',
    'rarest_sat',
    'commonest_sat',
    'biggest',
    'smallest',
    'highest_fee',
    'lowest_fee',
  ];

  return (
    <DropdownWrapper>
      <DropdownButton onClick={handleToggle}>
        {selectedOption}
      </DropdownButton>
      {isOpen && (
        <DropdownMenu>
          {options.map((option) => (
            <DropdownItem key={option} onClick={() => handleOptionSelect(option)}>
              {option}
            </DropdownItem>
          ))}
        </DropdownMenu>
      )}
    </DropdownWrapper>
  );
};

export default SortbyDropdown;