import React, { useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { ChevronDownIcon, ChevronUpIcon, CrossIcon } from './common/Icon';

const MenuContainer = styled.div`
  display: ${props => (props.isOpen ? 'flex' : 'none')};;
  flex-direction: column;
  visibility: ${props => (props.isOpen ? 'visible' : 'hidden')};
  width: 100%;
  max-width: 18rem;
  transition: left 0.3s ease-in-out;
  margin-right: 2rem;
  gap: 1rem;

  @media (max-width: 630px) {
    background-color: #FFFFFF;
    max-width: calc(100% - 2rem);  
    max-height: calc(100% - 2rem);
    margin-right: 0;  
    width: 100%;     
    height: 100%;    
    position: fixed;  
    top: 0;          
    left: 0;          
    z-index: 1000;    
    padding: 1rem;
  }
`;

const MenuHeader = styled.div`
  display: none;

  @media (max-width: 630px) {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    width: 100%;
  }
`;

const MenuText = styled.p`
  font-family: Relative Trial Bold;
  font-size: 1rem;
  color: #000000;
  margin: 0;
  padding: 0;
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
  font-family: Relative Trial Bold;
  font-size: 1rem;
  height: 3rem;
  padding: 0 1rem;
  border-radius: 1.5rem;
  transition: 
    background-color 350ms ease;
  transform-origin: center center;

  &:hover {
    background-color: #F5F5F5;
  }
`;

const CategoryOptions = styled.div`
  display: ${props => (props.isOpen ? 'flex' : 'none')};
  flex-wrap: wrap;
  gap: .5rem;
  padding: 0 1rem;
`;

const Option = styled.button`
  display: flex;
  justify-content: flex-start;
  align-items: center;
  padding: .375rem .75rem;
  color: ${props => (props.isSelected ? 'white' : 'black')};
  background-color: ${props => (props.isSelected ? '#000' : '#f5f5f5')};
  text-align: left;
  border: none;
  cursor: pointer;
  border-radius: .5rem;
  font-family: Relative Trial Medium;
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

const CloseButton = styled.button`
  padding: .5rem 1rem;
  border-radius: .5rem;
  border: none;
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  gap: .375rem;
  font-family: Relative Trial Medium;
  font-size: 1rem;
  color: #959595;
  background-color: #F5F5F5;
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

const FilterMenu = ({ isOpen, onClose, onSelectionChange, initialSelection }) => {
  const [expandedCategories, setExpandedCategories] = useState({});
  const [selectedOptions, setSelectedOptions] = useState(initialSelection);

  const categories = [
    { name: 'Content Type', options: ["text", "image", "gif", "audio", "video", "html", "json"] },
    { name: 'Charms', options: ["coin", "uncommon", "rare", "epic", "legendary", "cursed", "lost", "nineball", "reinscription", "unbound", "vindicated"] },
    { name: 'Satributes', options: [
      "vintage", "nakamoto", "firsttransaction", "palindrome", "pizza", "block9", "block9_450", "block78", 
      "alpha", "omega", "uniform_palinception", "perfect_palinception", "block286", "jpeg", 
      "uncommon", "rare", "epic", "legendary", "mythic", 
      "black_uncommon", "black_rare", "black_epic", "black_legendary" 
    ] },
  ];

  //open close categories
  const toggleCategory = category => {
    setExpandedCategories({
      ...expandedCategories,
      [category]: !expandedCategories[category],
    });
  };

  //select deselect options
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
      <MenuHeader>
        <MenuText>Filters</MenuText>
        <CloseButton onClick={onClose}>
          Close
          <CrossIcon color={'#959595'} size={'1rem'} />
        </CloseButton>
      </MenuHeader>
      {categories.map(category => (
        <CategoryContainer key={category.name}>
          <CategoryHeader onClick={() => toggleCategory(category.name)}>
            {category.name}
            {expandedCategories[category.name] ? <ChevronUpIcon color={'#000000'} size={'1rem'} /> : <ChevronDownIcon color={'#000000'} size={'1rem'} />}
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
