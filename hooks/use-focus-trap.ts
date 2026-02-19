import { useEffect, useRef } from 'react';

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea, input:not([disabled]):not([type="hidden"]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Traps focus within a container when active.
 * Optionally calls onEscape when Escape key is pressed.
 * Restores focus to previously focused element on cleanup.
 */
export function useFocusTrap(isActive: boolean, onEscape?: () => void) {
  const containerRef = useRef<HTMLDivElement>(null);
  const escapeRef = useRef(onEscape);
  escapeRef.current = onEscape;

  useEffect(() => {
    if (!isActive) return;
    const el = containerRef.current;
    if (!el) return;

    const previouslyFocused = document.activeElement as HTMLElement;

    const getFocusable = () =>
      el.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);

    // Focus the first focusable element after render
    requestAnimationFrame(() => {
      const elems = getFocusable();
      elems[0]?.focus();
    });

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        escapeRef.current?.();
        return;
      }
      if (e.key !== 'Tab') return;

      const elems = getFocusable();
      if (elems.length === 0) return;

      const first = elems[0];
      const last = elems[elems.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      previouslyFocused?.focus?.();
    };
  }, [isActive]);

  return containerRef;
}
