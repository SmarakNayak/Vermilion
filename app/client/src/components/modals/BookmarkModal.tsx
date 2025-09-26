import { useEffect, useRef } from 'react';
import { useAtomSet, useAtomValue } from '@effect-atom/atom-react';
import { Exit } from 'effect';
import { useForm, type Resolver } from 'react-hook-form';
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
import { cleanErrorExit } from '../../atoms/atomHelpers';
import { userFoldersAtom } from '../../atoms/userAtoms';
import { folderAtomFamily } from '../../atoms/familyAtomics';
import { Option } from 'effect';

type FolderModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
} & ({
  mode: 'create';
} | {
  mode: 'edit';
  folderId: string;
});

export const BookmarkModal = (props: FolderModalProps) => {
  const { isOpen, onClose, onSuccess, mode } = props;
  const modalFormRef = useRef<HTMLFormElement>(null);
  useModalScrollLock(isOpen, modalFormRef);

  const auth = useAuth();
  const createBookmarkFolder = useAtomSet(AuthSocialClient.mutation("playlists", "createPlaylist"), { mode: 'promiseExit' });
  const updateBookmarkFolder = useAtomSet(AuthSocialClient.mutation("playlists", "updatePlaylist"), { mode: 'promiseExit' });

  const userFolders = useAtomValue(userFoldersAtom);
  const existingFolder = useAtomValue(folderAtomFamily(mode === 'edit' ? props.folderId : undefined));

  const dupeValidator: Resolver<typeof PlaylistTable.jsonCreate.Encoded, unknown, typeof PlaylistTable.jsonCreate.Type> = async (values, context, options) => {
    const baseValidator = effectTsResolver(PlaylistTable.jsonCreate);
    const result = await baseValidator(values, context, options);
    let isDuplicate = userFolders._tag === 'Success' && 
      userFolders.value.some(folder => folder.playlist_name === values.playlist_name);
    // If editing, allow the same name as the existing folder
    if (mode === 'edit' && existingFolder._tag === 'Success' && existingFolder.value.playlist_name === values.playlist_name) {
      isDuplicate = false;
    }
    if (isDuplicate) {
      return {
        ...result,
        errors: { 
          ...result.errors, 
          playlist_name: { type: 'duplicate', message: 'You already have a folder with this name' } 
        },
      };
    }
    return result;
  };

  const { register, handleSubmit, formState: { errors, isSubmitting, isValid, dirtyFields }, setValue, trigger } = useForm({
    resolver: dupeValidator,
    mode: 'onChange',
  });
  useEffect(() => { //Manually set user_id when auth state changes
    if (auth.state === 'signed-in-with-profile') {
      setValue('user_id', auth.profile.user_id, { shouldValidate: true });
    }
  }, [auth.state]);
  useEffect(() => {// validate dirty playlist_name on userFolders success (to catch duplicates)
    if (userFolders._tag === 'Success' && dirtyFields.playlist_name) trigger('playlist_name');
  }, [userFolders]);

  useEffect(() => { // Set form values when editing and folder data loads
    if (mode === 'edit' && existingFolder._tag === 'Success') {
      setValue('playlist_name', existingFolder.value.playlist_name);
      setValue('playlist_description', Option.getOrNull(existingFolder.value.playlist_description));
    }
  }, [mode, existingFolder, setValue]);

  const onValidSubmit = async (data: any) => {
    if (mode ==='create') {
      const result = await createBookmarkFolder({ payload: data, reactivityKeys: ['userFolders'] })
      result.pipe(
        cleanErrorExit,
        Exit.match({
          onSuccess: () => {
            toast.success(`Bookmark folder "${data.playlist_name}" created successfully!`);
            onSuccess();
          },
          onFailure: (cause) => {
            toast.error(`Failed to create bookmark folder "${data.playlist_name}"${getErrorMessage(cause)}`);
          },
        })
      );
    } else if (mode === 'edit') {
      const result = await updateBookmarkFolder({
        path: { playlist_id: props.folderId },
        payload: data, 
        reactivityKeys: ['userFolders', `${props.folderId}`]
      });
      result.pipe(
        cleanErrorExit,
        Exit.match({
          onSuccess: () => {
            toast.success(`Bookmark folder "${data.playlist_name}" updated successfully!`);
            onSuccess();
          },
          onFailure: (cause) => {
            toast.error(`Failed to update bookmark folder "${data.playlist_name}"${getErrorMessage(cause)}`);
          },
        })
      );
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalHeader title={mode === 'create' ? 'Create bookmark folder' : 'Edit bookmark folder'} onClose={onClose}/>
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
              {isSubmitting ? `${mode === 'create' ? 'Creating' : 'Updating'} folder...` : `${mode === 'create' ? 'Create' : 'Update'} folder`}
            </SaveButton>
          </AuthGuardSaveButton>
        </ModalSection>
        {auth.state === 'signed-in-profile-error' && (<FieldError>{auth.errorMessage}</FieldError>)}
      </ModalForm>
    </Modal>
  );
};