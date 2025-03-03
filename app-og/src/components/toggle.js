import styled from "styled-components";
import { useEffect, useState } from "react";

const Label = styled.label`
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
`;

const Switch = styled.div`
  position: relative;
  width: 30px;
  height: 13px;
  background: #b3b3b3;
  border-radius: 32px;
  padding: 4px;
  transition: 300ms all;

  &:before {
    transition: 300ms all;
    content: "";
    position: absolute;
    width: 14px;
    height: 14px;
    border-radius: 35px;
    top: 50%;
    left: 4px;
    background: white;
    transform: translate(0, -50%);
  }
`;

const Input = styled.input`
  opacity: 0;
  position: absolute;

  &:checked + ${Switch} {
    background: green;

    &:before {
      transform: translate(15px, -50%);
    }
  }
`;

const ToggleSwitch = (props) => {
  return (
    <Label>
      <span>{props.text}</span>
      <Input checked={props.checked} type="checkbox" onChange={(e) => {props.onChange(e)}} />
      <Switch />
    </Label>
  );
};

export default ToggleSwitch;
