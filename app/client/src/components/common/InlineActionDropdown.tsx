import React, { useState } from "react"
import { DotsHorizontalIcon } from "./Icon"
import styled from "styled-components"
import { theme } from "../../styles/theme"
import { DropdownMenu, DropdownWrapper, DropdownItem } from "../Dropdown";
import { useClickOutside } from "../../hooks/useClickOutside";

const IconClickWrapper = styled.div`
  cursor: pointer;
`;

export const ActionDropdownItem = styled(DropdownItem)`
  svg {
    color: ${theme.colors.text.secondary};
    fill: ${theme.colors.text.secondary};
    transition: all 200ms ease;
  }

  &:hover {
    background-color: ${theme.colors.background.primary};
    color: ${theme.colors.text.primary};

    svg {
      color: ${theme.colors.text.primary};
      fill: ${theme.colors.text.primary};
    }
  }
`;

export const InlineActionDropdown: React.FC<{
  children: React.ReactNode, 
  isOpen: boolean, 
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>
}> = ({
  children,
  isOpen,
  setIsOpen
}) => {
  const wrapperRef = React.useRef<HTMLDivElement>(null);

  useClickOutside(wrapperRef, () => {
    if (isOpen) setIsOpen(false);
  });

  if (!children || React.Children.count(children) === 0) {
    return null;
  }

  return (
    <DropdownWrapper ref={wrapperRef} className={`inline-action-menu ${isOpen ? 'open' : ''}`}>
      <IconClickWrapper onClick={() => setIsOpen(!isOpen)}>
        <DotsHorizontalIcon size={'1.25rem'} color="black" />
      </IconClickWrapper>
      {isOpen && (
        <DropdownMenu>
          {children}
        </DropdownMenu>
      )}
    </DropdownWrapper>
  )
}