import React, { useState } from 'react';
import styled, { keyframes } from 'styled-components';
import CheckIcon from '../assets/icons/CheckIcon';
import ChevronUpIcon from '../assets/icons/ChevronUpIcon'; 
import ChevronDownIcon from '../assets/icons/ChevronDownIcon';

const MenuContainer = styled.div`
  display: ${props => (props.isOpen ? 'flex' : 'none')};;
  flex-direction: column;
  visibility: ${props => (props.isOpen ? 'visible' : 'hidden')};
  width: 100%;
  max-width: 240px;
  transition: left 0.3s ease-in-out;
  margin-right: 3rem;
  gap: 2rem;
`;

const CategoryContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const CategoryHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  font-family: ABC Camera Plain Unlicensed Trial Medium;
  font-size: 1rem;
`;

const CategoryOptions = styled.div`
  display: ${props => (props.isOpen ? 'flex' : 'none')};
  flex-wrap: wrap;
  gap: .5rem;

  font-family: ABC Camera Plain Unlicensed Trial Regular;
  font-size: .875rem;
  color: #959595;
`;

const Option = styled.button`
  display: flex;
  justify-content: flex-start;
  align-items: center;
  padding: .375rem .75rem;
  font-size: .875rem;
  color: ${props => (props.isSelected ? 'white' : 'black')};
  background-color: ${props => (props.isSelected ? '#000' : '#f5f5f5')};
  text-align: left;
  border: none;
  cursor: pointer;
  border-radius: .5rem;
  font-family: 'ABC Camera Plain Unlicensed Trial Medium';
  font-size: .875rem;
  transition: 
    transform 150ms ease;
  transform-origin: center center;

  &:active {
    transform: scale(0.96);
  }

  &:hover {
    background-color: ${props => (props.isSelected ? '#000' : '#e0e0e0')};
  }
`;

const FilterMenu = ({ isOpen, onSelectionChange }) => {
  const [expandedCategories, setExpandedCategories] = useState({});
  const [selectedOptions, setSelectedOptions] = useState({'Content Type': ["image"]});

  const categories = [
    { name: 'Content Type', options: ["text", "image", "gif", "audio", "video", "html", "json"] },
    { name: 'Charms', options: ["coin", "uncommon", "rare", "epic", "legendary", "cursed", "lost", "nineball", "reinscription", "unbound", "vindicated"] },
    { name: 'Satributes', options: [
      "vintage", "nakamoto", "firsttransaction", "palindrome", "pizza", "block9", "block9_450", "block78", 
      "alpha", "omega", "uniform_palinception", "perfect_palinception", "block286", "jpeg", 
      "uncommon", "rare", "epic", "legendary", "mythic", "black_uncommon", "black_rare", "black_epic", "black_legendary"
    ] },
  ];

  const toggleCategory = category => {
    setExpandedCategories({
      ...expandedCategories,
      [category]: !expandedCategories[category],
    });
  };

  const toggleOption = (category, option) => {
    setSelectedOptions(prevSelectedOptions => {
      const newSelectedOptions = {
        ...prevSelectedOptions,
        [category]: prevSelectedOptions[category]?.includes(option)
          ? prevSelectedOptions[category].filter(item => item !== option)
          : [...(prevSelectedOptions[category] || []), option],
      };
      onSelectionChange(newSelectedOptions);
      return newSelectedOptions;
    });
  };

  return (
    <MenuContainer isOpen={isOpen}>
      {categories.map(category => (
        <CategoryContainer key={category.name}>
          <CategoryHeader onClick={() => toggleCategory(category.name)}>
            {category.name}
            {expandedCategories[category.name] ? <ChevronUpIcon svgColor={'#000000'} svgSize={'1rem'} /> : <ChevronDownIcon svgColor={'#000000'} svgSize={'1rem'} />}
          </CategoryHeader>
          <CategoryOptions isOpen={expandedCategories[category.name]}>
            {category.options.map(option => (
              <Option
                key={option}
                isSelected={selectedOptions[category.name]?.includes(option)}
                onClick={() => toggleOption(category.name, option)}
              >
                {option}
              </Option>
            ))}
          </CategoryOptions>
        </CategoryContainer>
      ))}
    </MenuContainer>
  );
};

export default FilterMenu;