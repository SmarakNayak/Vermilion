import React, { useState, useRef } from 'react';
import styled from 'styled-components';
import { CheckIcon, ChevronDownIcon, SortIcon } from './common/Icon';
import { theme } from '../styles/theme';
import { useClickOutside } from '../hooks/useClickOutside';

interface SortbyDropdownProps {
  onOptionSelect: (option: string) => void;
  initialOption: string;
  includeRelevance: boolean;
}

const SortbyDropdown = ({ onOptionSelect, initialOption, includeRelevance }: SortbyDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState(initialOption);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleOptionSelect = (option: string) => {
    setSelectedOption(option);
    setIsOpen(false);
    onOptionSelect(option);
  };

  useClickOutside(wrapperRef, () => {
    if (isOpen) setIsOpen(false);
  });

  let options = [
    'newest',
    'oldest',
    'newest_sat',
    'oldest_sat',
    'biggest',
    'smallest',
    'highest_fee',
    'lowest_fee',
  ];

  if (includeRelevance) {
    options = ['most_relevant', ...options];
  }

  const labels: Record<string, string> = {
    most_relevant: 'Relevance',
    newest: 'Newest',
    oldest: 'Oldest',
    newest_sat: 'Newest Sat',
    oldest_sat: 'Oldest Sat',
    biggest: 'Largest File',
    smallest: 'Smallest File',
    highest_fee: 'Highest Fee',
    lowest_fee: 'Lowest Fee',
  };

  return (
    <DropdownWrapper ref={wrapperRef}>
      <DropdownButton isActive={isOpen} onClick={handleToggle}>
        <LabelText>Sort by:</LabelText>
        <SortText>{labels[selectedOption]}</SortText>
        <ChevronIcon size={'1rem'} color={theme.colors.text.secondary} className="" />
        <MobileIcon>
          <SortIcon size={'1.125rem'} color={theme.colors.text.primary} className="" />
        </MobileIcon>
      </DropdownButton>
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
                    className=""
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

export const DropdownWrapper = styled.div`
  position: relative;
  display: inline-block;
`;

export const DropdownButton = styled.button<{ isActive: boolean }>`
  height: 2.75rem;
  border-radius: 1.5rem;
  border: none;
  padding: 0 0.625rem 0 0.875rem;
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  gap: .375rem;
  font-family: ${theme.typography.fontFamilies.medium};
  font-size: 1rem;
  line-height: 1.5rem;
  color: ${theme.colors.text.secondary};
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
    transform: scale(0.98);
  }
`;

export const LabelText = styled.span`
  color: ${theme.colors.text.secondary};
  @media (max-width: 630px) {
    display: none;
  }
`;

export const SortText = styled.span`
  color: ${theme.colors.text.primary};
  @media (max-width: 480px) {
    display: none;
  }
`;

export const ChevronIcon = styled(ChevronDownIcon)`
  @media (max-width: 480px) {
    display: none;
  }
`;

export const MobileIcon = styled.div`
  display: none;

  @media (max-width: 480px) {
    display: flex;
  }
`;

export const DropdownMenu = styled.ul`
  position: absolute;
  top: 100%;
  right: 0;
  background-color: white;
  box-shadow: ${theme.shadows.soft};
  padding: .25rem;
  list-style-type: none;
  margin-top: .5rem;
  border-radius: ${theme.borderRadius.large};
  z-index: 1;
`;

export const DropdownItem = styled.li`
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
  align-items: center;
  min-width: 6rem;

  &:hover {
    color: ${theme.colors.text.primary};
    background-color: ${theme.colors.background.primary};
  }
`;

export const CheckIconWrapper = styled.div`
  position: absolute;
  right: .75rem;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export default SortbyDropdown;