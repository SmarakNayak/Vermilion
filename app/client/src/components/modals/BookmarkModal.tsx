import React, { useEffect, useRef } from 'react';
import { useAtomSet, useAtomValue, Result } from '@effect-atom/atom-react';
import { Exit, Cause } from 'effect';
import { useForm, type FieldErrors } from 'react-hook-form';
import { effectTsResolver } from '@hookform/resolvers/effect-ts';
import { toast } from 'sonner';
import { toastifyInvalidFields } from '../../utils/toastifyInvalidFields';

import { useModalScrollLock } from '../../hooks/useModalScrollLock';
import { 
  Modal,
  ModalHeader,
  ModalForm,
  ModalSection,
  ModalSectionTitle,
} from './common/ModalComponents';
import { StyledInput } from '../common/forms/StyledInput';
import { StyledTextarea } from '../common/forms/StyledTextarea';
import { FieldError } from '../common/forms/FieldError';
import { SaveButton } from '../common/buttons/SaveButton';
import AuthGuardSaveButton from '../common/buttons/AuthGuardSaveButton';

import { AuthSocialClient, getErrorMessage } from '../../api/EffectApi';
import { PlaylistTable } from '../../../../shared/types/playlist';
import { useAuth } from '../../hooks/useAuth';

export const BookmarkModal = ({isOpen, onClose}: {
  isOpen: boolean, 
  onClose: () => void
}) => {
  const modalFormRef = useRef<HTMLFormElement>(null);
  useModalScrollLock(isOpen, modalFormRef);
  
  const { isSignedIn, userProfile, profileErrorMessage } = useAuth();
  const createBookmarkFolder = useAtomSet(AuthSocialClient.mutation("playlists", "createPlaylist"), { mode: 'promiseExit' });

  const { register, handleSubmit, formState: { errors, isSubmitting, isValid }, setValue } = useForm({
    resolver: effectTsResolver(PlaylistTable.jsonCreate),
    mode: 'onChange',
  });
  useEffect(() => {
    if (isSignedIn && userProfile._tag === 'Success') {
      setValue('user_id', userProfile.value.user_id, { shouldValidate: true });
    }
  }, [userProfile, setValue]);

  const onValidSubmit = async (data: typeof PlaylistTable.jsonCreate.Type) => {
    const result = await createBookmarkFolder({ payload: data });
    Exit.match(result, {
      onSuccess: (x) => {
        toast.success(`Bookmark folder "${data.playlist_name}" created successfully!`);
        onClose();
      },
      onFailure: (cause) => {
        toast.error(`Failed to create bookmark folder "${data.playlist_name}"${getErrorMessage(cause)}`);
      },
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalHeader title='Create bookmark folder' onClose={onClose}/>
      <ModalForm ref={modalFormRef} onSubmit={handleSubmit(onValidSubmit, toastifyInvalidFields )}>
        <ModalSection>
          <ModalSectionTitle>Folder Name</ModalSectionTitle>
          <StyledInput {...register('playlist_name')} type="text" placeholder="Enter folder name" $isError={!!errors.playlist_name} />
          {errors.playlist_name && (<FieldError>{errors.playlist_name.message}</FieldError>)}
        </ModalSection>

        <ModalSection>
          <ModalSectionTitle>Description (optional)</ModalSectionTitle>
          <StyledTextarea {...register('playlist_description')} placeholder="Enter folder description" $isError={!!errors.playlist_description} />
          {errors.playlist_description && (<FieldError>{errors.playlist_description.message}</FieldError>)}
        </ModalSection>

        <ModalSection>
          <AuthGuardSaveButton actionLabel="bookmark">
            <SaveButton type="submit" disabled={isSubmitting || !isValid}>
              {isSubmitting ? 'Creating folder...' : 'Create folder'}
            </SaveButton>
          </AuthGuardSaveButton>
        </ModalSection>
        {profileErrorMessage && (<FieldError>{profileErrorMessage}</FieldError>)}
      </ModalForm>
    </Modal>
  );
};