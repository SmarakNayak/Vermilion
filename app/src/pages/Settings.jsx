import React, { useState, useEffect, useRef } from 'react';
import { Link } from "react-router-dom";
import styled from 'styled-components';
import Spinner from '../components/Spinner';
import InnerInscriptionContent from '../components/common/InnerInscriptionContent';
import { addCommas } from '../utils/format';
import { copyText } from '../utils/clipboard';
import { ImageIcon } from '../components/common/Icon';
import theme from '../styles/theme';
import CheckoutModal from '../components/modals/CheckoutModal';
import BoostsModal from '../components/modals/BoostsModal';
import CommentsModal from '../components/modals/CommentsModal';

const Settings = () => {
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [website, setWebsite] = useState('');
  const [twitter, setTwitter] = useState('');
  const [discord, setDiscord] = useState('');
  
  return (
    <MainContainer>
      <SettingsContainer>
        <PageText>Edit Profile</PageText>
        <SectionContainer>
          <ImageContainer>
            <ProfilePictureContainer>
            </ProfilePictureContainer>
            <ImageButton>
              <ImageIcon size="1.25rem" />
              Change Image
            </ImageButton>
          </ImageContainer>
          <InputFieldDiv>
            <InputLabel>
              <PlainText>Display Name</PlainText>
            </InputLabel>
            <StyledInput
              placeholder="Enter your display name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)} // Update displayName
            />
          </InputFieldDiv>
          <InputFieldDiv>
            <InputLabel>
              <PlainText>Bio</PlainText>
            </InputLabel>
            <StyledInput
              placeholder="Tell us about yourself"
              value={bio}
              onChange={(e) => setBio(e.target.value)} // Update bio
            />
          </InputFieldDiv>
        </SectionContainer>
        <SectionContainer>
          <SectionText>Social Links</SectionText>
          <InputFieldDiv>
            <InputLabel>
              <PlainText>X (Twitter)</PlainText>
            </InputLabel>
            <StyledInput
              placeholder="Enter your X (Twitter) username"
              value={twitter}
              onChange={(e) => setTwitter(e.target.value)} // Update twitter
            />
          </InputFieldDiv>
          <InputFieldDiv>
            <InputLabel>
              <PlainText>Discord</PlainText>
            </InputLabel>
            <StyledInput
              placeholder="Enter your Discord username"
              value={discord}
              onChange={(e) => setDiscord(e.target.value)} // Update discord
            />
          </InputFieldDiv>
          <InputFieldDiv>
            <InputLabel>
              <PlainText>Website URL</PlainText>
            </InputLabel>
            <StyledInput
              placeholder="https://"
              value={website}
              onChange={(e) => setWebsite(e.target.value)} // Update website
            />
          </InputFieldDiv>
        </SectionContainer>
          <ButtonContainer>
            <SaveButton>
              Save changes
            </SaveButton>
          </ButtonContainer>
      </SettingsContainer>
    </MainContainer>
  );
};

const MainContainer = styled.div`
  width: 100%;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const SettingsContainer = styled.div`
  width: calc(100% - 2rem);
  max-width: 40rem;
  padding: 1.5rem 1rem 3rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const PageText = styled.p`
  font-family: ${theme.typography.fontFamilies.bold};
  font-size: 1.5rem;
  line-height: 2rem;
  color: ${theme.colors.text.primary};
  margin: 0;
`;

const SectionContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const SectionText = styled.p`
  font-family: ${theme.typography.fontFamilies.bold};
  font-size: 1.25rem;
  line-height: 1.625rem;
  color: ${theme.colors.text.primary};
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const ImageContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 0.75rem;
`;

const ProfilePictureContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 8rem;
  min-width: 8rem;
  height: 8rem;
  min-height: 8rem;
  border-radius: 4rem;
  background-color: ${theme.colors.background.primary};
`;

const ImageButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  height: 2.5rem;
  min-height: 2.5rem;
  border-radius: 0.75rem; 
  border: none;
  font-family: ${theme.typography.fontFamilies.medium};
  font-size: 1rem;
  line-height: 1.25rem;
  color: ${theme.colors.text.tertiary};
  padding: 1rem;
  margin: 0;
  cursor: pointer;
  background-color: ${theme.colors.background.primary};
  transition: all 200ms ease;
  transform-origin: center center;

  svg {
    fill: ${theme.colors.text.tertiary};
    transition: all 200ms ease;
  }

  &:hover {
    background-color: ${theme.colors.background.secondary};
    color: ${theme.colors.text.secondary};
    svg {
      fill: ${theme.colors.text.secondary};
    }
  }

  &:active {
    transform: scale(0.98);
  }
`;

const InputFieldDiv = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
`;

const InputLabel = styled.div`
  display: flex;
  align-items: center;
  gap: 0.25rem;
`;

const StyledInput = styled.input`
  height: 2.5rem;
  width: 100%;
  max-width: 100%;
  padding: 0 0.75rem;
  background-color: ${theme.colors.background.primary};
  font-family: ${theme.typography.fontFamilies.medium};
  font-size: 1rem;
  line-height: 1.5rem;
  color: ${theme.colors.text.primary};
  border: 2px solid ${props => (props.isError ? theme.colors.text.error : 'transparent')};
  border-radius: 0.75rem;
  box-sizing: border-box;
  outline: none;
  transition: all 200ms ease;

  &:hover {
    border: 2px solid ${props => (props.isError ? theme.colors.text.error : theme.colors.border)};
  }

  &:focus {
    border: 2px solid ${props => (props.isError ? theme.colors.text.error : theme.colors.border)};
  }

  &::placeholder { /* Chrome, Firefox, Opera, Safari 10.1+ */
    color: ${theme.colors.text.tertiary};
  }
  
  &:-ms-input-placeholder { /* Internet Explorer 10-11 */
    color: ${theme.colors.text.tertiary};
  }
  
  &::-ms-input-placeholder { /* Microsoft Edge */
    color: ${theme.colors.text.tertiary};
  }
`;

const PlainText = styled.p`
  font-family: ${theme.typography.fontFamilies.medium};
  font-size: 1rem;
  line-height: 1.5rem;
  color: ${props => props.color || theme.colors.text.primary};
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const ButtonContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  width: 100%;
`;

const SaveButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  height: 2.5rem;
  min-height: 2.5rem;
  border-radius: 0.75rem; 
  border: none;
  font-family: ${theme.typography.fontFamilies.medium};
  font-size: 1rem;
  line-height: 1.25rem;
  color: ${theme.colors.background.white};
  padding: 1rem;
  margin: 0;
  cursor: pointer;
  background-color: ${theme.colors.background.dark};
  transition: all 200ms ease;
  transform-origin: center center;

  &:hover {
    opacity: 0.75;
  }

  &:active {
    transform: scale(0.98);
  }
`;

const CancelButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  height: 2.5rem;
  min-height: 2.5rem;
  border-radius: 0.75rem; 
  border: none;
  font-family: ${theme.typography.fontFamilies.medium};
  font-size: 1rem;
  line-height: 1.25rem;
  color: ${theme.colors.text.secondary};
  padding: 1rem;
  margin: 0;
  cursor: pointer;
  background-color: ${theme.colors.background.primary};
  transition: all 200ms ease;
  transform-origin: center center;

  &:hover {
    background-color: ${theme.colors.background.secondary};
    color: ${theme.colors.text.error};
  }

  &:active {
    transform: scale(0.98);
  }
`;

const Divider = styled.div`
  width: 100%;
  border-bottom: 1px solid ${theme.colors.border};
`;

const UnstyledLink = styled(Link)`
  color: unset;
  text-decoration: unset;
  display: inline-block;
  max-width: 100%;
`;

export default Settings;
