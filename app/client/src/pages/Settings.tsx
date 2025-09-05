import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { effectTsResolver } from '@hookform/resolvers/effect-ts';
import { toast } from 'sonner';
import { Exit, Option, Schema } from 'effect';
import { useAtomSet } from '@effect-atom/atom-react';

import styled from 'styled-components';
import { ImageIcon } from '../components/common/Icon';
import theme from '../styles/theme';
import Spinner from '../components/Spinner';
import InscriptionModal from '../components/modals/InscriptionModal';
import { StyledInput } from '../components/common/forms/StyledInput';
import { StyledTextarea } from '../components/common/forms/StyledTextarea';
import { FieldError } from '../components/common/forms/FieldError';
import { SaveButton } from '../components/common/buttons/SaveButton';

import { useAuth } from '../hooks/useAuth';
import { useModal } from '../hooks/useModal';
import { AuthSocialClient, getErrorMessage } from '../api/EffectApi';
import { cleanErrorExit } from '../atoms/atomHelpers';
import { ProfileTable } from '../../../shared/types/effectProfile';
import { toastifyInvalidFields } from '../utils/toastifyInvalidFields';
import { rhfEmptyStringToNull } from '../utils/formHelpers';

const Settings: React.FC = () => {
  const auth = useAuth();
  const { isOpen: isInscriptionModalOpen, open: openInscriptionModal, close: closeInscriptionModal } = useModal();
  
  const createProfile = useAtomSet(AuthSocialClient.mutation("profiles", "createProfile"), { mode: 'promiseExit' });
  const updateProfile = useAtomSet(AuthSocialClient.mutation("profiles", "updateProfile"), { mode: 'promiseExit' });
  
  const { register, handleSubmit, formState: { errors, isSubmitting, isValid }, setValue, watch } = useForm({
    resolver: effectTsResolver(ProfileTable.jsonCreate),
    mode: 'onChange',
  });
  
  const watchedBio = watch('user_bio') || '';
  const bioLength = watchedBio.length;

  const handleInscriptionSelect = (inscription: any) => {
    if (inscription) {
      setValue('user_picture', inscription.id, { shouldValidate: true });
    }
  };

  // Load profile data into form when available
  useEffect(() => {
    if (auth.state === 'signed-in-with-profile') {
      const profile = auth.profile;
      setValue('user_handle', profile.user_handle);
      setValue('user_name', profile.user_name);
      setValue('user_bio', Option.getOrNull(profile.user_bio));
      setValue('user_website', Option.getOrNull(profile.user_website));
      setValue('user_twitter', Option.getOrNull(profile.user_twitter));
      setValue('user_discord', Option.getOrNull(profile.user_discord));
      setValue('user_picture', Option.getOrNull(profile.user_picture));
    }
  }, [auth, setValue]);

  const onValidSubmit = async (data: Schema.Schema.Type<typeof ProfileTable.jsonCreate>) => {
    const isUpdate = auth.state === 'signed-in-with-profile';
    if (isUpdate) {
      const result = await updateProfile({
        path: { user_id: auth.profile.user_id },
        payload: data,
        reactivityKeys: ['userProfile']
      });
      result.pipe(
        cleanErrorExit,
        Exit.match({
          onSuccess: () => {
            toast.success(`Profile updated successfully!`);
          },
          onFailure: (cause) => {
            toast.error(`Failed to update profile${getErrorMessage(cause)}`);
          },
        })
      );
    } else {
      const result = await createProfile({ 
        payload: data, 
        reactivityKeys: ['userProfile'] 
      });
      result.pipe(
        cleanErrorExit,
        Exit.match({
          onSuccess: () => {
            toast.success(`Profile created successfully!`);
          },
          onFailure: (cause) => {
            toast.error(`Failed to create profile${getErrorMessage(cause)}`);
          },
        })
      );
    }
  };
  
  if (auth.state === 'signed-in-loading-profile') {
    return (
      <MainContainer>
        <LoadingContainer>
          <Spinner isButton={false} />
        </LoadingContainer>
      </MainContainer>
    );
  }

  if (auth.state === 'not-signed-in') {
    return (
      <MainContainer>
        <SettingsContainer>
          <UnauthorizedContainer>
            <UnauthorizedText>
              Authentication required.
              <UnauthorizedTextDetail> Please sign in to edit your profile.</UnauthorizedTextDetail>
            </UnauthorizedText>
          </UnauthorizedContainer>
        </SettingsContainer>
      </MainContainer>
    );
  }

  return (
    <MainContainer>
      <SettingsContainer>
        <PageText>Edit Profile</PageText>
        
        <StyledForm onSubmit={handleSubmit(onValidSubmit, toastifyInvalidFields)}>
          <SectionContainer>
            <ImageContainer>
              <ProfilePictureContainer>
                {watch('user_picture') && (
                  <ProfilePicture 
                    src={`/content/${watch('user_picture')}`} 
                    alt="Profile" 
                  />
                )}
              </ProfilePictureContainer>
              <ImageButton onClick={openInscriptionModal} type='button'>
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
                {...register('user_handle')}
                placeholder="Enter your username"
                disabled={isSubmitting}
                $isError={!!errors.user_handle}
              />
              {errors.user_handle && <FieldError>{errors.user_handle.message}</FieldError>}
            </InputFieldDiv>
            
            <InputFieldDiv>
              <InputLabel>
                <PlainText>Display Name</PlainText>
                <PlainText color={theme.colors.text.secondary}>Required</PlainText>
              </InputLabel>
              <StyledInput
                {...register('user_name')}
                placeholder="Enter your display name"
                disabled={isSubmitting}
                $isError={!!errors.user_name}
              />
              {errors.user_name && <FieldError>{errors.user_name.message}</FieldError>}
            </InputFieldDiv>
            
            <InputFieldDiv>
              <InputLabel>
                <PlainText>Bio</PlainText>
                <PlainText color={theme.colors.text.secondary}>
                  {bioLength > 280 ? (
                    <>
                      <span style={{ color: theme.colors.text.errorSecondary }}>{bioLength}</span>/280
                    </>
                  ) : (
                    `${bioLength}/280`
                  )}
                </PlainText>
              </InputLabel>
              <StyledTextarea
                {...register('user_bio', { setValueAs: rhfEmptyStringToNull })}
                placeholder="Tell us about yourself"
                disabled={isSubmitting}
                rows={4}
                $isError={!!errors.user_bio}
              />
              {errors.user_bio && <FieldError>{errors.user_bio.message}</FieldError>}
            </InputFieldDiv>
          </SectionContainer>
          
          <SectionContainer>
            <SectionText>Social Links</SectionText>
            
            <InputFieldDiv>
              <InputLabel>
                <PlainText>X (Twitter)</PlainText>
              </InputLabel>
              <StyledInput
                {...register('user_twitter', { setValueAs: rhfEmptyStringToNull })}
                placeholder="Enter your X (Twitter) username"
                disabled={isSubmitting}
                $isError={!!errors.user_twitter}
              />
              {errors.user_twitter && <FieldError>{errors.user_twitter.message}</FieldError>}
            </InputFieldDiv>
            
            <InputFieldDiv>
              <InputLabel>
                <PlainText>Discord</PlainText>
              </InputLabel>
              <StyledInput
                {...register('user_discord', { setValueAs: rhfEmptyStringToNull })}
                placeholder="Enter your Discord username"
                disabled={isSubmitting}
                $isError={!!errors.user_discord}
              />
              {errors.user_discord && <FieldError>{errors.user_discord.message}</FieldError>}
            </InputFieldDiv>
            
            <InputFieldDiv>
              <InputLabel>
                <PlainText>Website URL</PlainText>
              </InputLabel>
              <StyledInput
                {...register('user_website', { setValueAs: rhfEmptyStringToNull })}
                placeholder="https://"
                disabled={isSubmitting}
                $isError={!!errors.user_website}
              />
              {errors.user_website && <FieldError>{errors.user_website.message}</FieldError>}
            </InputFieldDiv>
          </SectionContainer>
          <ButtonContainer>
            <SaveButton type="submit" disabled={isSubmitting || !isValid}>
              {isSubmitting ? <Spinner isButton={true} /> : 'Save changes'}
            </SaveButton>
          </ButtonContainer>
        </StyledForm>
        {auth.state === 'signed-in-profile-error' && <FieldError>{auth.errorMessage}</FieldError>}
        </SettingsContainer>
        
        <InscriptionModal 
          isOpen={isInscriptionModalOpen}
          onClose={closeInscriptionModal}
          onSelect={handleInscriptionSelect}
          selectedInscription={watch('user_picture') ? { id: watch('user_picture') } : null}
        />
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

const StyledForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
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
