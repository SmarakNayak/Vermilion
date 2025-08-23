import React, { useEffect, useRef } from 'react';
import { useAtomSet, useAtomValue } from '@effect-atom/atom-react';
import { useForm } from 'react-hook-form';
import { effectTsResolver } from '@hookform/resolvers/effect-ts';

import { useModalScrollLock } from '../../hooks/useModalScrollLock';
import { 
  Modal,
  ModalHeader, 
  ModalContent,
  ModalForm,
  ModalSection,
  ModalSectionTitle,
} from './common/ModalComponents';
import { StyledInput } from '../common/forms/StyledInput';
import { StyledTextarea } from '../common/forms/StyledTextarea';
import { FieldError } from '../common/forms/FieldError';
import { SaveButton } from '../common/buttons/SaveButton';

import { SocialClient } from '../../api/EffectApi';
import useStore from '../../store/zustand';
import { PlaylistTable } from '../../../../shared/types/playlist';

export const BookmarkModal = ({isOpen, onClose}: {
  isOpen: boolean, 
  onClose: () => void
}) => {
  const modalContentRef = useRef<HTMLFormElement>(null);
  useModalScrollLock(isOpen, modalContentRef);
  
  const wallet = useStore((state) => state.wallet);
  const userId = useAtomValue(SocialClient.query("profiles", "getProfileByAddress", {
    urlParams: { user_address: wallet.ordinalsAddress },
  }));
  const createBookmarkFolder = useAtomSet(SocialClient.mutation("playlists", "createPlaylist"));

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: effectTsResolver(PlaylistTable.jsonCreate),
    mode: 'onChange'
  });
  const onFormSubmit = (data: typeof PlaylistTable.jsonCreate.Type) => {
    createBookmarkFolder({ payload: data });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalHeader title='Create bookmark folder' onClose={onClose}/>
      <ModalForm ref={modalContentRef} onSubmit={handleSubmit(onFormSubmit)}>
          <ModalSection>
            <ModalSectionTitle>Folder Name</ModalSectionTitle>
            <StyledInput
              {...register('playlist_name')}
              type="text"
              placeholder="Enter folder name"
              $isError={!!errors.playlist_name}
            />
            {errors.playlist_name && (<FieldError>{errors.playlist_name.message}</FieldError>)}
          </ModalSection>

          <ModalSection>
            <ModalSectionTitle>Description</ModalSectionTitle>
            <StyledTextarea
              {...register('playlist_description')}
              placeholder="Enter folder description"
              $isError={!!errors.playlist_description}
            />
            {errors.playlist_description && (<FieldError>{errors.playlist_description.message}</FieldError>)}
          </ModalSection>

          <ModalSection>
            <SaveButton onClick={onClose}>
              Create folder
            </SaveButton>
          </ModalSection>
      </ModalForm>
    </Modal>
  );
};