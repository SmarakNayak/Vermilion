import { SaveButton } from '../common/buttons/SaveButton';
import { 
  ModalHeader,
  ModalContent,
  MiniModal,
  ModalText,
} from './common/ModalComponents';

export const DeleteConfirmModal = ({ 
  isOpen, 
  onClose,
  onDelete,
  modalText = "Deleting this is permanent and irreversible.",
  buttonText = "Delete",
} : { 
  isOpen: boolean;
  onClose: () => void;
  onDelete: any;
  modalText?: string;
  buttonText?: string;
}) => {
  return (
    <MiniModal isOpen={isOpen} onClose={onClose}>
      <ModalHeader title="Are you sure?" onClose={onClose}/>
      <ModalContent>
        <ModalText>{modalText}</ModalText>
        <SaveButton onClick={onDelete}>
          {buttonText}
        </SaveButton>
      </ModalContent>
    </MiniModal>
  );
};