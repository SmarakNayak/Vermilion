import { useState, useRef } from 'react';
import { useModalScrollLock } from './useModalScrollLock';

interface UseModalReturn {
  /** Whether the modal is currently open */
  isOpen: boolean;
  /** Function to open the modal */
  open: () => void;
  /** Function to close the modal */
  close: () => void;
  /** Function to toggle modal state */
  toggle: () => void;
  /** Ref for modal content element (used for scroll lock) */
  modalRef: React.RefObject<HTMLDivElement | null>;
}

/**
 * Hook to manage modal state with automatic scroll locking
 * 
 * Combines modal open/close state management with the existing useModalScrollLock
 * hook to prevent background scrolling when modal is open.
 * 
 * @param initialState - Initial open state (default: false)
 * @returns Object with modal state and control functions
 * 
 * @example
 * ```tsx
 * const MyComponent = () => {
 *   const { isOpen, open, close, modalRef } = useModal();
 *   
 *   return (
 *     <>
 *       <button onClick={open}>Open Modal</button>
 *       {isOpen && (
 *         <Modal>
 *           <ModalContent ref={modalRef}>
 *             <button onClick={close}>Close</button>
 *           </ModalContent>
 *         </Modal>
 *       )}
 *     </>
 *   );
 * };
 * ```
 */
export const useModal = (initialState: boolean = false): UseModalReturn => {
  const [isOpen, setIsOpen] = useState(initialState);
  const modalRef = useRef<HTMLDivElement>(null);

  // Automatically handle scroll locking
  useModalScrollLock(isOpen, modalRef);

  const open = () => setIsOpen(true);
  const close = () => setIsOpen(false);
  const toggle = () => setIsOpen(prev => !prev);

  return {
    isOpen,
    open,
    close,
    toggle,
    modalRef
  };
};