import { useEffect } from 'react';

const useDocumentTitle = (titleOrFn) => {
  useEffect(() => {
    const prevTitle = document.title;
    const updateTitle = () => {
      const newTitle = typeof titleOrFn === 'function' ? titleOrFn() : titleOrFn;
      document.title = `${newTitle} | Vermilion`;
    };

    updateTitle();

    return () => {
      document.title = prevTitle;
    };
  }, [titleOrFn]);
};

export default useDocumentTitle;
