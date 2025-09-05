import { useEffect } from 'react';

// This attaches a click outside event listener to the provided ref.
// When a click occurs outside the element referenced by `ref`, the `callback` function is invoked.
// This is useful for closing modals, dropdowns, or any component that should close when clicked outside of it.
// Usage: 
// const modalRef = useRef(null);
// useClickOutside(modalRef, () => { setIsModalOpen(false) });
// <modal ref={modalRef} isOpen={isModalOpen} />

export const useClickOutside = <T extends HTMLElement>(ref: React.RefObject<T|null>, callback: (event: Event) => void) => {
  useEffect(() => {
    const handleClickOutside = (event: Event) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        callback(event);
      }
    };
    // Attach the listener to the root element to ensure it doesn't capture clicks inside nested portals/modals
    // (which are attached to document.body)
    const root = document.getElementById('root') || document;
    root.addEventListener('mousedown', handleClickOutside);
    return () => root.removeEventListener('mousedown', handleClickOutside);
  }, [ref, callback]);
};