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
import useStore from '../store/zustand';
import type { 
  CreateProfileRequest, 
  UpdateProfileRequest, 
  ProfileResponse 
} from '../../../server/src/types/profile';

const Settings: React.FC = () => {
  const { wallet, authToken } = useStore();
  
  const [profile, setProfile] = useState<CreateProfileRequest>({
    user_handle: '',
    user_name: '',
    user_bio: '',
    user_website: '',
    user_twitter: '',
    user_discord: '',
    user_picture: ''
  });
  
  const [existingProfile, setExistingProfile] = useState<ProfileResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [initialLoading, setInitialLoading] = useState<boolean>(true);

  const handleInputChange = (field: keyof CreateProfileRequest, value: string) => {
    setProfile(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear any existing error/success messages when user starts typing
    setError('');
    setSuccess('');
  };

  const loadProfile = async (): Promise<void> => {
    if (!wallet?.ordinalsAddress) {
      setInitialLoading(false);
      return;
    }

    try {
      const response = await fetch(`/bun/social/get_profile_by_address/${wallet.ordinalsAddress}`);
      if (response.ok) {
        const profileData: ProfileResponse = await response.json() as ProfileResponse;
        setProfile({
          user_handle: profileData.user_handle || '',
          user_name: profileData.user_name || '',
          user_bio: profileData.user_bio || '',
          user_website: profileData.user_website || '',
          user_twitter: profileData.user_twitter || '',
          user_discord: profileData.user_discord || '',
          user_picture: profileData.user_picture || ''
        });
        setExistingProfile(profileData);
      } else if (response.status === 404) {
        // Profile doesn't exist yet - this is fine for new users
        setExistingProfile(null);
      } else {
        setError('Failed to load profile');
      }
    } catch (err) {
      console.error('Failed to load profile:', err);
      setError('Failed to load profile');
    } finally {
      setInitialLoading(false);
    }
  };

  const handleSubmit = async (): Promise<void> => {
    if (!wallet?.ordinalsAddress) {
      setError('Wallet not connected');
      return;
    }

    if (!authToken) {
      setError('Authentication required');
      return;
    }

    // Basic validation
    if (!profile.user_handle.trim()) {
      setError('User handle is required');
      return;
    }

    if (!profile.user_name.trim()) {
      setError('Display name is required');
      return;
    }

    // Validate handle format
    const handleRegex = /^[a-zA-Z0-9_]{2,17}$/;
    if (!handleRegex.test(profile.user_handle)) {
      setError('Handle must be 2-17 characters, letters, numbers, and underscores only');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const endpoint = existingProfile 
        ? `/bun/social/update_profile/${wallet.ordinalsAddress}`
        : `/bun/social/create_profile/${wallet.ordinalsAddress}`;

      const requestBody: CreateProfileRequest | UpdateProfileRequest = existingProfile 
        ? { ...profile, user_id: existingProfile.user_id }
        : profile;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `HTTP error! status: ${response.status}`);
      }

      const result: ProfileResponse = await response.json() as ProfileResponse;
      setSuccess(existingProfile ? 'Profile updated successfully!' : 'Profile created successfully!');
      setExistingProfile(result);
      
    } catch (err: any) {
      console.error('Failed to save profile:', err);
      setError(err.message || 'Failed to save profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, [wallet?.ordinalsAddress]);
  
  if (initialLoading) {
    return (
      <MainContainer>
        <SettingsContainer>
          <Spinner isButton={false} />
        </SettingsContainer>
      </MainContainer>
    );
  }

  if (!wallet) {
    return (
      <MainContainer>
        <SettingsContainer>
          <PageText>Connect Wallet</PageText>
          <PlainText>Please connect your wallet to edit your profile.</PlainText>
        </SettingsContainer>
      </MainContainer>
    );
  }

  return (
    <MainContainer>
      <SettingsContainer>
        <PageText>Edit Profile</PageText>
        
        {error && (
          <ErrorMessage>{error}</ErrorMessage>
        )}
        
        {success && (
          <SuccessMessage>{success}</SuccessMessage>
        )}
        
        <SectionContainer>
          <ImageContainer>
            <ProfilePictureContainer>
            </ProfilePictureContainer>
            <ImageButton>
              <ImageIcon size="1.25rem" color='red' className={'SettingIcon'} />
              Change Image
            </ImageButton>
          </ImageContainer>
          
          <InputFieldDiv>
            <InputLabel>
              <PlainText>Handle *</PlainText>
            </InputLabel>
            <StyledInput
              placeholder="username (2-17 chars, letters, numbers, _ only)"
              value={profile.user_handle}
              onChange={(e) => handleInputChange('user_handle', (e.target as any).value)}
              disabled={loading}
            />
          </InputFieldDiv>
          
          <InputFieldDiv>
            <InputLabel>
              <PlainText>Display Name *</PlainText>
            </InputLabel>
            <StyledInput
              placeholder="Enter your display name"
              value={profile.user_name}
              onChange={(e) => handleInputChange('user_name', (e.target as any).value)}
              disabled={loading}
            />
          </InputFieldDiv>
          
          <InputFieldDiv>
            <InputLabel>
              <PlainText>Bio</PlainText>
            </InputLabel>
            <StyledInput
              placeholder="Tell us about yourself"
              value={profile.user_bio}
              onChange={(e) => handleInputChange('user_bio', (e.target as any).value)}
              disabled={loading}
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
              value={profile.user_twitter}
              onChange={(e) => handleInputChange('user_twitter', (e.target as any).value)}
              disabled={loading}
            />
          </InputFieldDiv>
          
          <InputFieldDiv>
            <InputLabel>
              <PlainText>Discord</PlainText>
            </InputLabel>
            <StyledInput
              placeholder="Enter your Discord username"
              value={profile.user_discord}
              onChange={(e) => handleInputChange('user_discord', (e.target as any).value)}
              disabled={loading}
            />
          </InputFieldDiv>
          
          <InputFieldDiv>
            <InputLabel>
              <PlainText>Website URL</PlainText>
            </InputLabel>
            <StyledInput
              placeholder="https://"
              value={profile.user_website}
              onChange={(e) => handleInputChange('user_website', (e.target as any).value)}
              disabled={loading}
            />
          </InputFieldDiv>
        </SectionContainer>
        
        <ButtonContainer>
          <SaveButton onClick={handleSubmit} disabled={loading}>
            {loading ? <Spinner isButton={true} /> : 'Save changes'}
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

const StyledInput = styled.input.withConfig({
  shouldForwardProp: (prop) => prop !== 'isError',
})<{ isError?: boolean }>`
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

  &:hover:not(:disabled) {
    opacity: 0.75;
  }

  &:active:not(:disabled) {
    transform: scale(0.98);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.div`
  background-color: ${theme.colors.text.error}20;
  color: ${theme.colors.text.error};
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
  border: 1px solid ${theme.colors.text.error}40;
  font-family: ${theme.typography.fontFamilies.medium};
  font-size: 0.875rem;
  margin-bottom: 1rem;
`;

const SuccessMessage = styled.div`
  background-color: #10b98120;
  color: #10b981;
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
  border: 1px solid #10b98140;
  font-family: ${theme.typography.fontFamilies.medium};
  font-size: 0.875rem;
  margin-bottom: 1rem;
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
