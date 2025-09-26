import React, { useState } from "react"
import { DotsHorizontalIcon } from "./Icon"
import styled from "styled-components"
import { DropdownMenu, DropdownItem, DropdownWrapper } from "../Dropdown";
import { useClickOutside } from "../../hooks/useClickOutside";

const IconClickWrapper = styled.div`
  cursor: pointer;
`;

export const InlineActionDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = React.useRef<HTMLDivElement>(null);
  useClickOutside(wrapperRef, () => {
    if (isOpen) setIsOpen(false);
  });

  return (
    <DropdownWrapper ref={wrapperRef}>
      <IconClickWrapper onClick={() => setIsOpen(!isOpen)}>
        <DotsHorizontalIcon size={'1.25rem'} color="black" className={'inline-action-menu'} />
      </IconClickWrapper>
      {isOpen && (
        <DropdownMenu>
          <DropdownItem onClick={() => { alert('Action 1 clicked'); setIsOpen(false); }}>Action 1</DropdownItem>
          <DropdownItem onClick={() => { alert('Action 2 clicked'); setIsOpen(false); }}>Action 2</DropdownItem>
        </DropdownMenu>
      )}
    </DropdownWrapper>
  )
}