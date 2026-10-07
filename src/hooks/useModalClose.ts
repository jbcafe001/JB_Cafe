import { useEffect } from 'react';

/**
 * Closes a modal on Escape key press.
 * @param onClose - the function to call to close the modal
 * @param isOpen - only attach listener when the modal is open
 */
export const useModalClose = (onClose: () => void, isOpen: boolean = true) => {
  useEffect(() => {
    if (!isOpen) return;
    
    // Prevent background scrolling
    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = 'hidden';
    
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    
    return () => {
      document.removeEventListener('keydown', handler);
      // Restore background scrolling
      document.body.style.overflow = originalStyle;
    };
  }, [onClose, isOpen]);
};
