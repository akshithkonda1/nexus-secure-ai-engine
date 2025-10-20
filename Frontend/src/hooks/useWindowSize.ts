import { useEffect, useState } from 'react';

interface WindowSize {
  width: number;
  height: number;
}

export function useWindowSize(): WindowSize {
  const [windowSize, setWindowSize] = useState<WindowSize>({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  });

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    
    // Call handler right away so state gets updated with initial window size
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return windowSize;
}

// Example usage in components:
/*
// Debounced search
const [search, setSearch] = useState('');
const debouncedSearch = useDebounce(search, 500);

// Media queries
const isMobile = useMediaQuery('(max-width: 768px)');

// Click outside
const modalRef = useRef<HTMLDivElement>(null);
useOnClickOutside(modalRef, () => setIsOpen(false), isOpen);

// Performance tracking
const metrics = usePerformance('ChatList');

// Intersection observer for lazy loading
const { ref, entry } = useIntersectionObserver({ threshold: 0.5 });
const isVisible = entry?.isIntersecting ?? false;

// Window size
const { width, height } = useWindowSize();
const isMobile = width < 768;
*/
