import React, { useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { effectTsResolver } from '@hookform/resolvers/effect-ts';
import { toast } from 'sonner';
import { Exit } from 'effect';
import { useAtomSet } from '@effect-atom/atom-react';

import { useModalScrollLock } from '../../hooks/useModalScrollLock';
import { 
  PortalModal,
  ModalHeader,
  ModalForm,
  ModalSection,
  ModalSectionTitle,
} from './common/ModalComponents';
import { StyledInput } from '../common/forms/StyledInput';
import { StyledTextarea } from '../common/forms/StyledTextarea';
import { FieldError } from '../common/forms/FieldError';
import { SaveButton } from '../common/buttons/SaveButton';

import { AuthSocialClient, getErrorMessage } from '../../api/EffectApi';
import { ProfileTable } from '../../../../shared/types/effectProfile';
import { useAuth } from '../../hooks/useAuth';
import { cleanErrorExit } from '../../atoms/atomHelpers';
import { toastifyInvalidFields } from '../../utils/toastifyInvalidFields';
import { rhfEmptyStringToNull } from '../../utils/formHelpers';
import theme from '../../styles/theme';
import styled from 'styled-components';

type ProfileCreationModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export const ProfileCreationModal = ({ isOpen, onClose }: ProfileCreationModalProps) => {
  const modalFormRef = useRef<HTMLFormElement>(null);
  useModalScrollLock(isOpen, modalFormRef);

  const auth = useAuth();
  const createProfile = useAtomSet(AuthSocialClient.mutation("profiles", "createProfile"), { mode: 'promiseExit' });
  
  const { register, handleSubmit, formState: { errors, isSubmitting, isValid }, watch } = useForm({
    resolver: effectTsResolver(ProfileTable.jsonCreate),
    mode: 'onChange',
  });
  
  const watchedBio = watch('user_bio') || '';
  const bioLength = watchedBio.length;

  const onValidSubmit = async (data: any) => {
    const result = await createProfile({ 
      payload: data, 
      reactivityKeys: ['userProfile'] 
    });
    result.pipe(
      cleanErrorExit,
      Exit.match({
        onSuccess: () => {
          toast.success(`Profile created successfully!`);
          onClose();
        },
        onFailure: (cause) => {
          toast.error(`Failed to create profile${getErrorMessage(cause)}`);
        },
      })
    );
  };

  return (
    <PortalModal isOpen={isOpen} onClose={onClose}>
      <ModalHeader title="Create Profile" onClose={onClose}/>
      <ModalForm ref={modalFormRef} onSubmit={(e) => {
        e.stopPropagation();
        handleSubmit(onValidSubmit, toastifyInvalidFields)(e);
      }}>
        <ModalSection>
          <ModalSectionTitle>Username</ModalSectionTitle>
          <StyledInput
            {...register('user_handle')}
            placeholder="Enter your username"
            disabled={isSubmitting}
            $isError={!!errors.user_handle}
          />
          {errors.user_handle && <FieldError>{errors.user_handle.message}</FieldError>}
        </ModalSection>
        
        <ModalSection>
          <ModalSectionTitle>Display Name</ModalSectionTitle>
          <StyledInput
            {...register('user_name')}
            placeholder="Enter your display name"
            disabled={isSubmitting}
            $isError={!!errors.user_name}
          />
          {errors.user_name && <FieldError>{errors.user_name.message}</FieldError>}
        </ModalSection>
        
        <ModalSection>
          <BioHeader>
            <ModalSectionTitle>Bio (optional)</ModalSectionTitle>
            <CharCounter>
              {bioLength > 280 ? (
                <>
                  <span style={{ color: theme.colors.text.errorSecondary }}>{bioLength}</span>/280
                </>
              ) : (
                `${bioLength}/280`
              )}
            </CharCounter>
          </BioHeader>
          <StyledTextarea
            {...register('user_bio', { setValueAs: rhfEmptyStringToNull })}
            placeholder="Tell us about yourself"
            disabled={isSubmitting}
            rows={3}
            $isError={!!errors.user_bio}
          />
          {errors.user_bio && <FieldError>{errors.user_bio.message}</FieldError>}
        </ModalSection>

        <ModalSection>
          <SaveButton type="submit" disabled={isSubmitting || !isValid}>
            {isSubmitting ? 'Creating profile...' : 'Create profile'}
          </SaveButton>
        </ModalSection>
        {auth.state === 'signed-in-profile-error' && <FieldError>{auth.errorMessage}</FieldError>}
      </ModalForm>
    </PortalModal>
  );
};

const BioHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.25rem;
`;

const CharCounter = styled.p`
  font-family: ${theme.typography.fontFamilies.medium};
  font-size: 0.875rem;
  line-height: 1.25rem;
  color: ${theme.colors.text.secondary};
  margin: 0;
  white-space: nowrap;
`;