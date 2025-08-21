import { useEffect } from 'react';

// This hook locks the scroll position of the body when a modal is open.
// It prevents the background from scrolling while the modal is active.
// Usage:
// const modalContentRef = useRef(null);
// useModalScrollLock(isOpen, modalContentRef);
export const useModalScrollLock = <T extends HTMLElement>(isOpen: boolean, modalContentRef: React.RefObject<T|null>) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
      if (modalContentRef?.current) {
        modalContentRef.current.scrollTop = 0;
      }
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);
};