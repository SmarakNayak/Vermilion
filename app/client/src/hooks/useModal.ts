import { useState } from 'react';

interface UseModalReturn {
  /** Whether the modal is currently open */
  isOpen: boolean;
  /** Function to open the modal */
  open: () => void;
  /** Function to close the modal */
  close: () => void;
  /** Function to toggle modal state */
  toggle: () => void;
}

/**
 * Hook to manage modal state
 * 
 * @param initialState - Initial open state (default: false)
 * @returns Object with modal state and control functions
 * 
 * @example
 * ```tsx
 * const MyComponent = () => {
 *   const { isOpen, open, close } = useModal();
 *   
 *   return (
 *     <>
 *       <button onClick={open}>Open Modal</button>
 *       <SomeModal isOpen={isOpen} onClose={close} />
 *     </>
 *   );
 * };
 * ```
 */
export const useModal = (initialState: boolean = false): UseModalReturn => {
  const [isOpen, setIsOpen] = useState(initialState);

  const open = () => setIsOpen(true);
  const close = () => setIsOpen(false);
  const toggle = () => setIsOpen(prev => !prev);

  return {
    isOpen,
    open,
    close,
    toggle
  };
};