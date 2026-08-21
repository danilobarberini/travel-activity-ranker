import { useEffect, useRef } from 'react';

/**
 * Attaches click-and-drag horizontal scrolling to a container. Tracks mouse
 * movement on `window` (not just the element) so a fast drag that briefly
 * leaves the element's bounds doesn't interrupt the gesture — it only ends
 * on mouseup, wherever that happens.
 */
export function useDragScroll<T extends HTMLElement>() {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let isDragging = false;
    let startX = 0;
    let startScrollLeft = 0;

    function onMouseDown(event: MouseEvent) {
      isDragging = true;
      startX = event.pageX;
      startScrollLeft = el!.scrollLeft;
    }

    function onMouseMove(event: MouseEvent) {
      if (!isDragging) return;
      event.preventDefault();
      const delta = event.pageX - startX;
      el!.scrollLeft = startScrollLeft - delta;
    }

    function onMouseUp() {
      isDragging = false;
    }

    el.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    return () => {
      el.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, []);

  return ref;
}
