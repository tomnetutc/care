import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * ScrollToTop component that scrolls to top of page on route change
 * Used with React Router to ensure page starts at top when navigating
 * Handles both window and document scrolling for reliability
 */
const ScrollToTop: React.FC = () => {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    // Disable browser's automatic scroll restoration
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }

    // Function to scroll to top
    const scrollToTop = () => {
      // Scroll both window and document for maximum compatibility
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
      
      // Also check for any scrollable root containers
      const root = document.getElementById('root');
      if (root) {
        root.scrollTop = 0;
      }
    };

    // If there's a hash, let the browser handle it (for anchor links)
    // Otherwise, scroll to top
    if (!hash) {
      // Use requestAnimationFrame to ensure DOM has updated
      requestAnimationFrame(() => {
        scrollToTop();
        
        // Fallback timeout to ensure scroll happens even if RAF is delayed
        setTimeout(scrollToTop, 0);
        // Additional fallback for slower renders
        setTimeout(scrollToTop, 10);
      });
    }
  }, [pathname, hash]);

  return null;
};

export default ScrollToTop;

