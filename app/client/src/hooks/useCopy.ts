import { useState } from 'react';
import { copyText } from '../utils/clipboard';

interface UseCopyReturn {
  /** Whether text was recently copied (true for 2 seconds after copy) */
  copied: boolean;
  /** Function to copy text to clipboard */
  copy: (text: string) => void;
}

/**
 * Hook to handle copying text to clipboard with temporary success state
 * 
 * @param resetDelay - How long to show 'copied' state in milliseconds (default: 2000)
 * @returns Object with `copied` state and `copy` function
 * 
 * @example
 * ```tsx
 * const { copied, copy } = useCopy();
 * 
 * return (
 *   <button onClick={() => copy('Hello World')}>
 *     {copied ? 'Copied!' : 'Copy'}
 *   </button>
 * );
 * ```
 */
export const useCopy = (resetDelay: number = 2000): UseCopyReturn => {
  const [copied, setCopied] = useState(false);

  const copy = (text: string) => {
    copyText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), resetDelay);
  };

  return { copied, copy };
};