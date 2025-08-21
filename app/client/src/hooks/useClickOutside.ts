import { useEffect } from 'react';

// This attaches a click outside event listener to the provided ref.
// When a click occurs outside the element referenced by `ref`, the `callback` function is invoked.
// This is useful for closing modals, dropdowns, or any component that should close when clicked outside of it.
// Usage: 
// const modalRef = useRef(null);
// useClickOutside(modalRef, () => { setIsModalOpen(false) });
// <modal ref={modalRef} isOpen={isModalOpen} />

export const useClickOutside = <T extends HTMLElement>(ref: React.RefObject<T|null>, callback: (event: MouseEvent) => void) => {
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        callback(event);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [ref, callback]);
};