import React, { useState } from 'react';
import styled, { keyframes } from 'styled-components';
import theme from '../styles/theme';
import { ChevronDownIcon, ChevronUpIcon, CrossIcon } from './common/Icon';

const MenuContainer = styled.div`
  display: ${props => (props.isOpen ? 'flex' : 'none')};;
  flex-direction: column;
  visibility: ${props => (props.isOpen ? 'visible' : 'hidden')};
  width: 100%;
  max-width: 18rem;
  transition: all 200ms ease;
  margin-right: 2rem;
  gap: 1rem;

  @media (max-width: 630px) {
    background-color: ${theme.colors.background.white};
    max-width: calc(100% - 2rem);  
    max-height: calc(100% - 1.5rem);
    margin-right: 0;  
    width: 100%;     
    height: 100%;    
    position: fixed;  
    top: 0;          
    left: 0;          
    z-index: 1000;    
    padding: .75rem 1rem;
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
  font-family: ${theme.typography.fontFamilies.bold};
  font-size: 1.125rem;
  line-height: 1.5rem;
  color: ${theme.colors.text.primary};
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
  font-family: ${theme.typography.fontFamilies.bold};
  font-size: 1rem;
  height: 3rem;
  padding: 0 1rem;
  border-radius: 1.5rem;
  transition: all 200ms ease;
  transform-origin: center center;

  &:hover {
    background-color: ${theme.colors.background.primary};
  }
`;

const CategoryOptions = styled.div`
  display: ${props => (props.isOpen ? 'flex' : 'none')};
  flex-wrap: wrap;
  gap: .375rem;
  padding: 0 1rem;
`;

const Option = styled.button`
  display: flex;
  justify-content: flex-start;
  align-items: center;
  padding: .25rem .5rem;
  color: ${props => (props.isSelected ? theme.colors.text.white : theme.colors.text.primary)};
  background-color: ${props => (props.isSelected ? theme.colors.background.dark : theme.colors.background.primary)};
  text-align: left;
  border: none;
  cursor: pointer;
  border-radius: .25rem;
  font-family: ${theme.typography.fontFamilies.medium};
  font-size: .875rem;
  transition: all 200ms ease;
  transform-origin: center center;

  &:active {
    transform: scale(0.96);
  }

  &:hover {
    background-color: ${props => (props.isSelected ? theme.colors.background.dark : theme.colors.border)};
  }
`;

const CloseButton = styled.button`
  width: 2.5rem;
  min-width: 2.5rem;
  height: 2.5rem;
  min-height: 2.5rem;
  border-radius: 1.25rem;
  border: none;
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  gap: .375rem;
  font-family: ${theme.typography.fontFamilies.medium};
  font-size: 1rem;
  background-color: ${theme.colors.background.white};
  transition: all 200ms ease;
  transform-origin: center center;

  &:hover {
    background-color: ${theme.colors.background.primary};
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
      "uncommon", "rare", "epic", "legendary", "mythic", "hitman",
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
          <CrossIcon color={theme.colors.text.secondary} size={'1.25rem'} />
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
