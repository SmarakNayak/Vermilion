import React, { useState } from 'react';
import styled, { keyframes } from 'styled-components';
import theme from '../styles/theme';
import { AnimateIcon, AudioIcon, ChevronDownIcon, ChevronUpIcon, CodeBlockIcon, CodeBracketsIcon, CrossIcon, ImageIcon, TextFontIcon, VideoIcon } from './common/Icon';

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
  padding-bottom: 1rem;
  border-bottom: 1px solid ${theme.colors.border};

  &:last-child {
    border-bottom: none;
  }
`;

const CategoryHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  font-family: ${theme.typography.fontFamilies.bold};
  font-size: 1rem;
  line-height: 1.5rem;
  height: 2.5rem;
  // padding: 0 1rem;
  // border-radius: 1.5rem;
  transition: all 200ms ease;
  transform-origin: center center;
`;

const CategoryOptions = styled.div`
  display: ${props => (props.isOpen ? 'flex' : 'none')};
  flex-wrap: wrap;
  gap: .375rem;
  padding-bottom: 0.5rem;
`;

const Option = styled.button`
  display: flex;
  justify-content: flex-start;
  align-items: center;
  padding: .375rem .875rem;
  gap: .375rem;
  color: ${props => (props.isSelected ? theme.colors.text.white : theme.colors.text.primary)};
  background-color: ${props => (props.isSelected ? theme.colors.background.dark : theme.colors.background.primary)};
  text-align: left;
  border: none;
  cursor: pointer;
  border-radius: 2rem;
  font-family: ${theme.typography.fontFamilies.medium};
  font-size: 0.875rem;
  line-height: 1.25rem;
  transition: all 200ms ease;
  transform-origin: center center;

  svg {
    fill: ${props => (props.isSelected ? theme.colors.text.white : theme.colors.text.primary)};
    transition: fill 200ms ease;
  }

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

const contentTypeIcons = {
  text: <TextFontIcon size={'1.125rem'} />, 
  image: <ImageIcon size={'1.125rem'} />,
  gif: <AnimateIcon size={'1.125rem'} />,
  audio: <AudioIcon size={'1.125rem'} />,
  video: <VideoIcon size={'1.125rem'} />,
  html: <CodeBracketsIcon size={'1.125rem'} />,
  json: <CodeBlockIcon size={'1.125rem'} />,
};

const contentTypeLabels = {
  text: "Text",
  image: "Image",
  gif: "GIF",
  audio: "Audio",
  video: "Video",
  html: "HTML",
  json: "JSON",
};

// const satributeIcons = {
//   uncommon: <ImageIcon size={'1rem'} />,
//   rare: <ImageIcon size={'1rem'} />,
//   epic: <ImageIcon size={'1rem'} />,
//   legendary: <ImageIcon size={'1rem'} />,
//   mythic: <ImageIcon size={'1rem'} />,
//   vintage: <ImageIcon size={'1rem'} />,
//   nakamoto: <ImageIcon size={'1rem'} />,
//   firsttransaction: <ImageIcon size={'1rem'} />,
//   palindrome: <ImageIcon size={'1rem'} />,
//   pizza: <ImageIcon size={'1rem'} />,
//   block9: <ImageIcon size={'1rem'} />,
//   block9_450: <ImageIcon size={'1rem'} />,
//   block78: <ImageIcon size={'1rem'} />,
//   alpha: <ImageIcon size={'1rem'} />,
//   omega: <ImageIcon size={'1rem'} />,
//   uniform_palinception: <ImageIcon size={'1rem'} />,
//   perfect_palinception: <ImageIcon size={'1rem'} />,
//   block286: <ImageIcon size={'1rem'} />,
//   jpeg: <ImageIcon size={'1rem'} />,
//   hitman: <ImageIcon size={'1rem'} />,
//   black_uncommon: <ImageIcon size={'1rem'} />,
//   black_rare: <ImageIcon size={'1rem'} />,
//   black_epic: <ImageIcon size={'1rem'} />,
//   black_legendary: <ImageIcon size={'1rem'} />,
// };

const satributeLabels = {
  uncommon: "Uncommon",
  rare: "Rare",
  epic: "Epic",
  legendary: "Legendary",
  mythic: "Mythic",
  vintage: "Vintage",
  nakamoto: "Nakamoto",
  firsttransaction: "First Transaction",
  palindrome: "Palindrome",
  pizza: "Pizza",
  block9: "Block 9",
  block9_450: "Block 9 450x",
  block78: "Block 78",
  alpha: "Alpha",
  omega: "Omega",
  uniform_palinception: "Uniform Palinception",
  perfect_palinception: "Perfect Palinception",
  block286: "Block 286",
  jpeg: "JPEG",
  hitman: "Hitman",
  black_uncommon: "Black Uncommon",
  black_rare: "Black Rare",
  black_epic: "Black Epic",
  black_legendary: "Black Legendary",
};

const charmEmojis = {
  coin: "🪙",
  uncommon: "🌱",
  rare: "🧿",
  epic: "🪻",
  legendary: "🌝",
  cursed: "👹",
  lost: "🤔",
  nineball: "9️⃣",
  reinscription: "♻️",
  unbound: "🔓",
  vindicated: "❤️‍🔥",
};

const charmLabels = {
  coin: "Coin",
  uncommon: "Uncommon",
  rare: "Rare",
  epic: "Epic",
  legendary: "Legendary",
  cursed: "Cursed",
  lost: "Lost",
  nineball: "Nineball",
  reinscription: "Reinscription",
  unbound: "Unbound",
  vindicated: "Vindicated",
};

const OptionRow = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: .375rem;
`;

const OptionLabel = styled.span`
  font-size: 0.875rem;
  line-height: 1.25rem;
`;

const OptionEmoji = styled.span`
  font-size: 0.875rem;
`;

const FilterMenu = ({ isOpen, onClose, onSelectionChange, initialSelection }) => {
  const [expandedCategories, setExpandedCategories] = useState({});
  const [selectedOptions, setSelectedOptions] = useState(initialSelection);

  const categories = [
    { name: 'Content Type', options: ["text", "image", "gif", "audio", "video", "html", "json"] },
    { name: 'Charms', options: ["coin", "uncommon", "rare", "epic", "legendary", "cursed", "lost", "nineball", "reinscription", "unbound", "vindicated"] },
    { name: 'Satributes', options: [
      "uncommon", "rare", "epic", "legendary", "mythic", "vintage", "nakamoto",
      "firsttransaction", "palindrome", "pizza", "block9", "block9_450", "block78", 
      "alpha", "omega", "uniform_palinception", "perfect_palinception", "block286", "jpeg", 
       "hitman", "black_uncommon", "black_rare", "black_epic", "black_legendary"
    ] },
  ];

  // { name: 'Charms', options: ["🪙  Coin", "🌱  Uncommon", "🧿  Rare", "🪻  Epic", "🌝  Legendary", "👹  Cursed", "🤔  Lost", "9️⃣  Nineball", "♻️  Reinscription", "🔓  Unbound", "❤️‍🔥  Vindicated"] },

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
                <OptionRow>
                  {category.name === "Charms" ? (
                    <>
                      <OptionEmoji>{charmEmojis[option]}</OptionEmoji>
                      <OptionLabel>{charmLabels[option]}</OptionLabel>
                    </>
                  ) : category.name === "Content Type" ? (
                    <>
                      {contentTypeIcons[option]}
                      <OptionLabel>{contentTypeLabels[option]}</OptionLabel>
                    </>
                  ) : category.name === "Satributes" ? (
                    <>
                      {/* {satributeIcons[option]} */}
                      <OptionLabel>{satributeLabels[option]}</OptionLabel>
                    </>
                  ) : (
                    <OptionLabel>{option}</OptionLabel>
                  )}
                </OptionRow>
              </Option>
            ))}
          </CategoryOptions>
        </CategoryContainer>
      ))}
    </MenuContainer>
  );
};

export default FilterMenu;
