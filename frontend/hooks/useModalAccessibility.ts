import { useEffect, useRef } from 'react';

/**
 * Custom hook for managing modal accessibility features.
 * - Handles Escape key to close the modal.
 * - Manages focus: focuses the modal on open, restores focus on close.
 * - Provides ARIA attributes helper.
 */
export const useModalAccessibility = (isOpen: boolean, onClose: () => void) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  // Handle Escape Key
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  // Manage Focus
  useEffect(() => {
    if (isOpen) {
      // Store currently focused element
      previousFocusRef.current = document.activeElement as HTMLElement;

      // Focus the modal container
      if (modalRef.current) {
        modalRef.current.focus();
      }
    } else {
      // Restore focus
      if (previousFocusRef.current) {
        previousFocusRef.current.focus();
      }
    }
  }, [isOpen]);

  // Accessibility props for the modal container
  const modalProps = {
    ref: modalRef,
    role: 'dialog',
    'aria-modal': true,
    tabIndex: -1, // Make it focusable programmatically
  };

  return { modalRef, modalProps };
};
