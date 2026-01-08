import { useState, useEffect, useRef, useCallback } from 'react';

interface UseScrollSpyOptions {
  sectionIds: string[];
  offset?: number; // Offset from top (navbar height + contenthead::before offset)
  threshold?: number; // Intersection threshold (0.0 to 1.0)
  rootMargin?: string; // Root margin for intersection observer
  defaultActiveId?: string; // Default active section ID
}

/**
 * Custom hook for tracking active section based on scroll position
 * Uses Intersection Observer API for better performance and accuracy
 * Handles edge cases like top/bottom of page and fast scrolling
 */
export function useScrollSpy({
  sectionIds,
  offset = 137, // Navbar (57px) + contenthead::before (80px) = 137px
  threshold = 0.3,
  rootMargin = '0px',
  defaultActiveId = '',
}: UseScrollSpyOptions): [string, (id: string) => void] {
  const [activeId, setActiveId] = useState<string>(defaultActiveId || sectionIds[0] || '');
  const userClickedRef = useRef<boolean>(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const sectionsRef = useRef<Map<string, HTMLElement>>(new Map());
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const manualScrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const rafRef = useRef<number | null>(null);

  // Update active section manually (e.g., on click)
  const setActiveSection = useCallback((id: string) => {
    setActiveId(id);
    userClickedRef.current = true;
    
    // Clear any existing timeout
    if (manualScrollTimeoutRef.current) {
      clearTimeout(manualScrollTimeoutRef.current);
    }
    
    // Reset user clicked flag after scroll completes
    manualScrollTimeoutRef.current = setTimeout(() => {
      userClickedRef.current = false;
    }, 1000); // Wait for smooth scroll to complete
  }, []);

  // Scroll-based spy: minimal + robust.
  // Uses getBoundingClientRect() so it works even when the scroll container is not window.
  useEffect(() => {
    const thresholdPx = offset + 1; // small buffer to avoid flicker at exact boundary

    const computeActive = () => {
      if (userClickedRef.current) return;
      if (!sectionIds.length) return;

      let nextActive = sectionIds[0];

      // Pick the last section whose top is above the "spy line" (offset from top).
      for (let i = sectionIds.length - 1; i >= 0; i--) {
        const el = document.getElementById(sectionIds[i]);
        if (!el) continue;
        const top = el.getBoundingClientRect().top;
        if (top <= thresholdPx) {
          nextActive = sectionIds[i];
          break;
        }
      }

      setActiveId((current) => (current === nextActive ? current : nextActive));
    };

    const onScroll = () => {
      if (rafRef.current != null) return;
      rafRef.current = window.requestAnimationFrame(() => {
        rafRef.current = null;
        computeActive();
      });
    };

    // Initial sync
    computeActive();

    // Listen broadly: window + capture on document catches scroll from #root/containers too.
    window.addEventListener('scroll', onScroll, { passive: true });
    document.addEventListener('scroll', onScroll, { passive: true, capture: true });

    return () => {
      window.removeEventListener('scroll', onScroll);
      document.removeEventListener('scroll', onScroll, { capture: true } as AddEventListenerOptions);
      if (rafRef.current != null) {
        window.cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [sectionIds.join(','), offset]);

  // Old Intersection Observer code (keeping for reference but not using)
  /*
  useEffect(() => {
    // Build rootMargin string with offset
    const rootMarginTop = `-${offset}px`;
    const finalRootMargin = `${rootMarginTop} 0px -50% ${rootMargin}`;

    // Create observer with proper root margin
    observerRef.current = new IntersectionObserver(
      (entries) => {
        // Don't update if user just clicked (allow some time for scroll to settle)
        if (userClickedRef.current) {
          return;
        }

        // Find the most visible section
        const visibleEntries = entries.filter((entry) => entry.isIntersecting);
        
        if (visibleEntries.length === 0) {
          // No sections visible - handle edge cases
          const scrollY = window.scrollY;
          
  */

  return [activeId, setActiveSection];
}
