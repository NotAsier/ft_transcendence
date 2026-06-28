import { useEffect, useState } from 'react';

// Breakpoint definitions
export const BREAKPOINTS = {
  mobile: 640,      // < 640px
  tablet: 1024,     // 640px - 1024px
  desktop: 1025,    // >= 1025px
};

/**
 * Hook para detectar si el dispositivo es móvil (< 640px)
 * Se actualiza al cambiar el tamaño de la ventana
 */
export const useIsMobile = (): boolean => {
  const [isMobile, setIsMobile] = useState<boolean>(() => {
    // SSR check - supone desktop por defecto
    if (typeof window === 'undefined') return false;
    return window.innerWidth < BREAKPOINTS.mobile;
  });

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < BREAKPOINTS.mobile);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return isMobile;
};

/**
 * Hook para detectar si está en tablet (640px - 1024px)
 */
export const useIsTablet = (): boolean => {
  const [isTablet, setIsTablet] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return (
      window.innerWidth >= BREAKPOINTS.mobile &&
      window.innerWidth < BREAKPOINTS.tablet
    );
  });

  useEffect(() => {
    const handleResize = () => {
      setIsTablet(
        window.innerWidth >= BREAKPOINTS.mobile &&
        window.innerWidth < BREAKPOINTS.tablet
      );
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return isTablet;
};

/**
 * Hook para detectar si está en desktop (>= 1025px)
 */
export const useIsDesktop = (): boolean => {
  const [isDesktop, setIsDesktop] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth >= BREAKPOINTS.tablet;
  });

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= BREAKPOINTS.tablet);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return isDesktop;
};
