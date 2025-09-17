import React, { useState, useRef } from 'react';
import { CheckIcon, SortIcon } from './common/Icon';
import { theme } from '../styles/theme';
import { useClickOutside } from '../hooks/useClickOutside';
import {
  DropdownWrapper,
  DropdownButton,
  LabelText,
  SortText,
  ChevronIcon,
  MobileIcon,
  DropdownMenu,
  DropdownItem,
  CheckIconWrapper
} from './Dropdown';

interface DropdownCustomProps<T extends string> {
  onOptionSelect: (option: T) => void;
  initialOption: T;
  options: T[];
  labels: Record<T, string>;
  placeholder?: string;
}

const DropdownCustom = <T extends string>({
  onOptionSelect,
  initialOption,
  options,
  labels,
  placeholder = "Sort by:"
}: DropdownCustomProps<T>) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState<T>(initialOption);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleOptionSelect = (option: T) => {
    setSelectedOption(option);
    setIsOpen(false);
    onOptionSelect(option);
  };

  useClickOutside(wrapperRef, () => {
    if (isOpen) setIsOpen(false);
  });

  return (
    <DropdownWrapper ref={wrapperRef}>
      <DropdownButton isActive={isOpen} onClick={handleToggle}>
        <LabelText>{placeholder}</LabelText>
        <SortText>{labels[selectedOption]}</SortText>
        <ChevronIcon size={'1rem'} color={theme.colors.text.secondary} />
        <MobileIcon>
          <SortIcon size={'1.125rem'} color={theme.colors.text.primary} />
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

export default DropdownCustom;