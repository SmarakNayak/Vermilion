import React, { useState } from 'react';
import styled from 'styled-components';

const MenuContainer = styled.div`
  display: flex;
  flex-flow: column;
  visibility: ${props => (props.isOpen ? 'visible' : 'hidden')};
  width: ${props => (props.isOpen ? '250px' : '0px')};
  background-color: white;
  transition: left 0.3s ease-in-out;
  padding: 20px;
`;

const CategoryContainer = styled.div`
  margin-bottom: 10px;
`;

const CategoryHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  padding: 10px 0;
`;

const CategoryOptions = styled.div`
  display: ${props => (props.isOpen ? 'block' : 'none')};
  margin-left: 20px;
`;

const Option = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 5px 0;
`;

const Checkbox = styled.input`
  margin-left: 5px;
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
            <span>{expandedCategories[category.name] ? '-' : '+'}</span>
          </CategoryHeader>
          <CategoryOptions isOpen={expandedCategories[category.name]}>
            {category.options.map(option => (
              <Option key={option}>
                {option}
                <Checkbox
                  type="checkbox"
                  checked={selectedOptions[category.name]?.includes(option) || false}
                  onChange={() => toggleOption(category.name, option)}
                />
              </Option>
            ))}
          </CategoryOptions>
        </CategoryContainer>
      ))}
    </MenuContainer>
  );
};

export default FilterMenu;