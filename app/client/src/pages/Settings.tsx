import React, { useState, useEffect, useRef } from 'react';
import { Link } from "react-router-dom";
import styled, { keyframes } from 'styled-components';
import * as Toast from '@radix-ui/react-toast';
import Spinner from '../components/Spinner';
import InnerInscriptionContent from '../components/common/InnerInscriptionContent';
import { addCommas } from '../utils/format';
import { copyText } from '../utils/clipboard';
import { ImageIcon, SettingsIcon, CheckIcon, CheckCircleIcon, ErrorCircleIcon } from '../components/common/Icon';
import theme from '../styles/theme';
import CheckoutModal from '../components/modals/CheckoutModal';
import BoostsModal from '../components/modals/BoostsModal';
import CommentsModal from '../components/modals/CommentsModal';
import InscriptionModal from '../components/modals/InscriptionModal';
import useStore from '../store/zustand';
import type { 
  CreateProfileRequest, 
  UpdateProfileRequest, 
  ProfileResponse 
} from '../../../server/src/types/profile';

const Settings: React.FC = () => {
  const { wallet, authToken } = useStore();
  const bioTextareaRef = useRef<HTMLTextAreaElement>(null);
  
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
  const [initialLoading, setInitialLoading] = useState<boolean>(true);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>({});
  const [toastOpen, setToastOpen] = useState<boolean>(false);
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  const [toastMessage, setToastMessage] = useState<string>('');
  const [inscriptionModalOpen, setInscriptionModalOpen] = useState<boolean>(false);
  const [selectedInscription, setSelectedInscription] = useState<any>(null);
  
  // Check if there are any validation errors
  const hasErrors = Object.values(fieldErrors).some(error => error !== '');

  const validateField = (field: keyof CreateProfileRequest, value: string): string => {
    const errors: string[] = [];
    
    switch (field) {
      case 'user_handle':
        if (!value || value.length < 2) {
          errors.push('Must be at least 2 characters');
        }
        if (value.length > 17) {
          errors.push('Cannot be more than 17 characters');
        }
        if (value && !/^[a-z0-9_]*$/.test(value)) {
          errors.push('Can only contain lowercase letters, numbers, or underscores');
        }
        break;
        
      case 'user_name':
        if (!value || value.length < 1) {
          errors.push('Must be at least 1 character');
        }
        if (value.length > 30) {
          errors.push('Cannot be more than 30 characters');
        }
        break;
        
      case 'user_twitter':
        if (value.length > 15) {
          errors.push('Cannot be more than 15 characters');
        }
        if (value && value.includes(' ')) {
          errors.push('Cannot contain spaces');
        }
        break;
        
      case 'user_discord':
        if (value.length > 32) {
          errors.push('Cannot be more than 32 characters');
        }
        if (value && value.includes(' ')) {
          errors.push('Cannot contain spaces');
        }
        break;
        
      case 'user_website':
        if (value && value.trim() !== '') {
          try {
            new URL(value);
          } catch {
            errors.push('Must be a valid URL (e.g., https://example.com)');
          }
        }
        break;
        
      case 'user_bio':
        if (value.length > 280) {
          errors.push('Bio exceeds character limit');
        }
        break;
    }
    
    return errors.join('. ');
  };

  const handleInputChange = (field: keyof CreateProfileRequest, value: string) => {
    setProfile(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Validate field and update field-specific errors
    const fieldError = validateField(field, value);
    setFieldErrors(prev => ({
      ...prev,
      [field]: fieldError
    }));
    
  };

  const handleFieldBlur = (field: keyof CreateProfileRequest) => {
    setTouchedFields(prev => ({
      ...prev,
      [field]: true
    }));
  };

  const handleInscriptionSelect = (inscription: any) => {
    setSelectedInscription(inscription);
    if (inscription) {
      // Update profile with inscription ID
      setProfile(prev => ({
        ...prev,
        user_picture: inscription.id
      }));
      // Mark field as touched to trigger validation
      setTouchedFields(prev => ({
        ...prev,
        user_picture: true
      }));
    }
  };

  const loadProfile = async (): Promise<void> => {
    if (!wallet?.ordinalsAddress) {
      setInitialLoading(false);
      return;
    }

    try {
      const response = await fetch(`/effect/social/get_profile_by_address/${wallet.ordinalsAddress}`);
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
        setToastType('error');
        setToastMessage('Failed to load profile');
        setToastOpen(true);
      }
    } catch (err) {
      console.error('Failed to load profile:', err);
      setToastType('error');
      setToastMessage('Failed to load profile');
      setToastOpen(true);
    } finally {
      setInitialLoading(false);
    }
  };

  const handleSubmit = async (): Promise<void> => {
    if (!wallet?.ordinalsAddress) {
      setToastType('error');
      setToastMessage('Wallet not connected');
      setToastOpen(true);
      return;
    }

    if (!authToken) {
      setToastType('error');
      setToastMessage('Authentication required');
      setToastOpen(true);
      return;
    }

    // Basic validation
    if (!profile.user_handle.trim()) {
      setToastType('error');
      setToastMessage('User handle is required');
      setToastOpen(true);
      return;
    }

    if (!profile.user_name.trim()) {
      setToastType('error');
      setToastMessage('Display name is required');
      setToastOpen(true);
      return;
    }

    // Validate handle format
    const handleRegex = /^[a-zA-Z0-9_]{2,17}$/;
    if (!handleRegex.test(profile.user_handle)) {
      setToastType('error');
      setToastMessage('Handle must be 2-17 characters, letters, numbers, and underscores only');
      setToastOpen(true);
      return;
    }

    setLoading(true);

    try {
      const endpoint = existingProfile 
        ? `/effect/social/update_profile/${existingProfile.user_id}`
        : `/effect/social/create_profile`;

      const requestBody: CreateProfileRequest | UpdateProfileRequest = existingProfile 
        ? { ...profile, user_id: existingProfile.user_id }
        : profile;

      const response = await fetch(endpoint, {
        method: existingProfile ? 'PUT' : 'POST',
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
      setExistingProfile(result);
      setToastType('success');
      setToastMessage('Profile updated');
      setToastOpen(true);
      
    } catch (err: any) {
      console.error('Failed to save profile:', err);
      setToastType('error');
      setToastMessage(err.message || 'Failed to save profile');
      setToastOpen(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, [wallet?.ordinalsAddress]);

  useEffect(() => {
    if (bioTextareaRef.current) {
      bioTextareaRef.current.style.height = 'auto';
      bioTextareaRef.current.style.height = `${bioTextareaRef.current.scrollHeight + 2}px`;
    }
  }, [profile.user_bio]);
  
  if (initialLoading) {
    return (
      <MainContainer>
        <LoadingContainer>
          <Spinner isButton={false} />
        </LoadingContainer>
      </MainContainer>
    );
  }

  if (!wallet) {
    return (
      <MainContainer>
        <SettingsContainer>
          <UnauthorizedContainer>
            <UnauthorizedText>
              Wallet not connected.
              <UnauthorizedTextDetail> Please connect to edit your profile.</UnauthorizedTextDetail>
            </UnauthorizedText>
          </UnauthorizedContainer>
        </SettingsContainer>
      </MainContainer>
    );
  }

  return (
    <Toast.Provider swipeDirection="down">
      <MainContainer>
        <SettingsContainer>
          <PageText>Edit Profile</PageText>
        
        
        <SectionContainer>
          <ImageContainer>
            <ProfilePictureContainer>
              {(selectedInscription || profile.user_picture) && (
                <ProfilePicture 
                  src={`/content/${selectedInscription?.id || profile.user_picture}`} 
                  alt="Profile" 
                />
              )}
            </ProfilePictureContainer>
            <ImageButton onClick={() => setInscriptionModalOpen(true)}>
              <ImageIcon size="1.25rem" color={''} className={'ImageIcon'} />
              Change Image
            </ImageButton>
          </ImageContainer>
          
          <InputFieldDiv>
            <InputLabel>
              <PlainText>Username</PlainText>
              <PlainText color={theme.colors.text.secondary}>Required</PlainText>
            </InputLabel>
            <StyledInput
              placeholder="Enter your username"
              value={profile.user_handle}
              onChange={(e) => handleInputChange('user_handle', (e.target as any).value)}
              onBlur={() => handleFieldBlur('user_handle')}
              disabled={loading}
              isError={!!fieldErrors.user_handle && touchedFields.user_handle}
            />
            {fieldErrors.user_handle && touchedFields.user_handle && <FieldError>{fieldErrors.user_handle}</FieldError>}
          </InputFieldDiv>
          
          <InputFieldDiv>
            <InputLabel>
              <PlainText>Display Name</PlainText>
              <PlainText color={theme.colors.text.secondary}>Required</PlainText>
            </InputLabel>
            <StyledInput
              placeholder="Enter your display name"
              value={profile.user_name}
              onChange={(e) => handleInputChange('user_name', (e.target as any).value)}
              onBlur={() => handleFieldBlur('user_name')}
              disabled={loading}
              isError={!!fieldErrors.user_name && touchedFields.user_name}
            />
            {fieldErrors.user_name && touchedFields.user_name && <FieldError>{fieldErrors.user_name}</FieldError>}
          </InputFieldDiv>
          
          <InputFieldDiv>
            <InputLabel>
              <PlainText>Bio</PlainText>
              <PlainText color={theme.colors.text.secondary}>
                {profile.user_bio.length > 280 ? (
                  <>
                    <span style={{ color: theme.colors.text.errorSecondary }}>{profile.user_bio.length}</span>/280
                  </>
                ) : (
                  `${profile.user_bio.length}/280`
                )}
              </PlainText>
            </InputLabel>
            <StyledTextarea
              ref={bioTextareaRef}
              placeholder="Tell us about yourself"
              value={profile.user_bio}
              onChange={(e) => handleInputChange('user_bio', (e.target as any).value)}
              disabled={loading}
              rows={4}
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
              onBlur={() => handleFieldBlur('user_twitter')}
              disabled={loading}
              isError={!!fieldErrors.user_twitter && touchedFields.user_twitter}
            />
            {fieldErrors.user_twitter && touchedFields.user_twitter && <FieldError>{fieldErrors.user_twitter}</FieldError>}
          </InputFieldDiv>
          
          <InputFieldDiv>
            <InputLabel>
              <PlainText>Discord</PlainText>
            </InputLabel>
            <StyledInput
              placeholder="Enter your Discord username"
              value={profile.user_discord}
              onChange={(e) => handleInputChange('user_discord', (e.target as any).value)}
              onBlur={() => handleFieldBlur('user_discord')}
              disabled={loading}
              isError={!!fieldErrors.user_discord && touchedFields.user_discord}
            />
            {fieldErrors.user_discord && touchedFields.user_discord && <FieldError>{fieldErrors.user_discord}</FieldError>}
          </InputFieldDiv>
          
          <InputFieldDiv>
            <InputLabel>
              <PlainText>Website URL</PlainText>
            </InputLabel>
            <StyledInput
              placeholder="https://"
              value={profile.user_website}
              onChange={(e) => handleInputChange('user_website', (e.target as any).value)}
              onBlur={() => handleFieldBlur('user_website')}
              disabled={loading}
              isError={!!fieldErrors.user_website && touchedFields.user_website}
            />
            {fieldErrors.user_website && touchedFields.user_website && <FieldError>{fieldErrors.user_website}</FieldError>}
          </InputFieldDiv>
        </SectionContainer>
        
        <ButtonContainer>
          <SaveButton onClick={handleSubmit} disabled={loading || hasErrors}>
            {loading ? <Spinner isButton={true} /> : 'Save changes'}
          </SaveButton>
        </ButtonContainer>
        </SettingsContainer>
      </MainContainer>
      
      <StyledToastViewport />
      <StyledToastRoot open={toastOpen} onOpenChange={setToastOpen} duration={3000}>
        <StyledToastContent>
          {toastType === 'success' ? (
            <CheckCircleIcon size="1.25rem" color={theme.colors.text.white} />
          ) : (
            <ErrorCircleIcon size="1.25rem" color={theme.colors.text.white} />
          )}
          <ToastText>{toastMessage}</ToastText>
        </StyledToastContent>
      </StyledToastRoot>
      
      <InscriptionModal 
        isOpen={inscriptionModalOpen}
        onClose={() => setInscriptionModalOpen(false)}
        onSelect={handleInscriptionSelect}
        selectedInscription={selectedInscription || (profile.user_picture ? { id: profile.user_picture } : null)}
      />
    </Toast.Provider>
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
  max-width: 30rem;
  padding: 1.5rem 1rem 3rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const LoadingContainer = styled.div`
  width: 100%;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
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
  gap: 1.25rem;
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
  box-sizing: border-box;
  border: 2px solid ${theme.colors.border};
  overflow: hidden;
`;

const ProfilePicture = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
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
  justify-content: space-between;
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
  border: 2px solid ${props => (props.isError ? theme.colors.text.errorSecondary : 'transparent')};
  border-radius: 0.75rem;
  box-sizing: border-box;
  outline: none;
  transition: all 200ms ease;

  &:hover {
    border: 2px solid ${props => (props.isError ? theme.colors.text.errorSecondary : theme.colors.border)};
  }

  &:focus {
    border: 2px solid ${props => (props.isError ? theme.colors.text.errorSecondary : theme.colors.border)};
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

const StyledTextarea = styled.textarea.withConfig({
  shouldForwardProp: (prop) => prop !== 'isError',
})<{ isError?: boolean }>`
  width: 100%;
  max-width: 100%;
  min-height: 7rem;
  padding: 0.5rem 0.75rem;
  background-color: ${theme.colors.background.primary};
  font-family: ${theme.typography.fontFamilies.medium};
  font-size: 1rem;
  line-height: 1.5rem;
  color: ${theme.colors.text.primary};
  border: 2px solid ${props => (props.isError ? theme.colors.text.errorSecondary : 'transparent')};
  border-radius: 0.75rem;
  box-sizing: border-box;
  outline: none;
  transition: all 200ms ease;
  resize: none;
  overflow-y: hidden;

  &:hover {
    border: 2px solid ${props => (props.isError ? theme.colors.text.errorSecondary : theme.colors.border)};
  }

  &:focus {
    border: 2px solid ${props => (props.isError ? theme.colors.text.errorSecondary : theme.colors.border)};
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
  background-color: ${theme.colors.background.error};
  color: ${theme.colors.text.errorSecondary};
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
  border: none;
  font-family: ${theme.typography.fontFamilies.medium};
  font-size: 0.875rem;
  margin-bottom: 1rem;
`;

const FieldError = styled.div`
  background-color: ${theme.colors.background.error};
  color: ${theme.colors.text.errorSecondary};
  padding: 0.5rem 0.75rem;
  border-radius: 0.75rem;
  font-family: ${theme.typography.fontFamilies.medium};
  font-size: 0.875rem;
  line-height: 1.25rem;
  margin-top: 0.25rem;
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
    color: ${theme.colors.text.errorSecondary};
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

// Toast animations
const slideIn = keyframes`
  from {
    transform: translateY(100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
`;

const slideOut = keyframes`
  from {
    transform: translateY(0);
    opacity: 1;
  }
  to {
    transform: translateY(100%);
    opacity: 0;
  }
`;

const StyledToastViewport = styled(Toast.Viewport)`
  position: fixed;
  bottom: 0;
  right: 0;
  display: flex;
  flex-direction: column;
  padding: 1.5rem;
  gap: 0.625rem;
  max-width: 100vw;
  margin: 0;
  list-style: none;
  z-index: 2147483647;
  outline: none;
`;

const StyledToastRoot = styled(Toast.Root)`
  height: 2.75rem;
  width: auto;
  border-radius: 1.375rem;
  background-color: ${theme.colors.background.dark};
  box-shadow: rgba(10, 10, 10, 0.1) 0px 4px 8px 0px;
  padding: 0 1rem;
  display: flex;
  align-items: center;
  
  &[data-state='open'] {
    animation: ${slideIn} 200ms ease-out;
  }
  
  &[data-state='closed'] {
    animation: ${slideOut} 200ms ease-in;
  }
`;

const StyledToastContent = styled.div`
  display: flex;
  align-items: center;
  gap: 0.375rem;
`;

const ToastText = styled.span`
  font-family: ${theme.typography.fontFamilies.medium};
  font-size: 1rem;
  line-height: 1.25rem;
  color: ${theme.colors.text.white};
`;

const UnauthorizedContainer = styled.div`
  background-color: ${theme.colors.background.error};
  box-sizing: border-box;
  padding: 0.75rem;
  border-radius: 0.25rem;
  width: 100%;
  display: flex;
  margin: 0;
`;

const UnauthorizedText = styled.span`
  font-family: ${theme.typography.fontFamilies.bold};
  font-size: 1rem;
  line-height: 1.5rem;
  color: ${theme.colors.text.errorSecondary};
  margin: 0;
  padding: 0;
`;

const UnauthorizedTextDetail = styled.span`
  font-family: ${theme.typography.fontFamilies.medium};
  font-size: 1rem;
  line-height: 1.5rem;
  color: ${theme.colors.text.errorSecondary};
  margin: 0;
  padding: 0;
`;


export default Settings;
