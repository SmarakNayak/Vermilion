import { useEffect } from 'react';

// Global counter to track open modals
let openModalCount = 0;

// This hook locks the scroll position of the body when a modal is open.
// It prevents the background from scrolling while the modal is active.
// Uses a counter to handle nested/overlapping modals correctly.
// Usage:
// const modalContentRef = useRef(null);
// useModalScrollLock(isOpen, modalContentRef);
export const useModalScrollLock = <T extends HTMLElement>(isOpen: boolean, modalContentRef?: React.RefObject<T|null>) => {
  useEffect(() => {
    if (isOpen) { // modal has opened - increment counter and lock scroll
      openModalCount++;
      document.body.style.overflow = 'hidden'; // disable scrolling
    } else {
      // Note: this runs when modal has switched from open to closed but 
      // after the cleanup function below AND on mount (if initially closed)
      // Redundant with the cleanup function, as we dont need the logic on mount
      // Have commented it out for now.

      // if (openModalCount === 0) {
      //   document.body.style.overflow = 'auto';
      // }
      // if (modalContentRef?.current) {
      //   modalContentRef.current.scrollTop = 0;
      // }
    }
    console.log("useModalScrollLock openModalCount:", openModalCount);
    return () => {
      // modal has switched from open to closed - decrement counter and unlock scroll if no modals remain open
      // this runs before useEffect[isOpen=false]
      if (isOpen) {
        openModalCount = Math.max(0, openModalCount - 1);
        if (openModalCount === 0) {
          document.body.style.overflow = 'auto'; // re-enable scrolling
        }
        if (modalContentRef?.current) {
          modalContentRef.current.scrollTop = 0; // reset scroll position of modal content
        }
        console.log("useModalScrollLock cleanup openModalCount:", openModalCount);
      }
    };
  }, [isOpen]);
};