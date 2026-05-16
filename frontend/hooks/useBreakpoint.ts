import { useMediaQuery } from './useMediaQuery';

export const useBreakpoint = (breakpoint: 'sm' | 'md' | 'lg') => {
  const breakpoints = { sm: '640px', md: '768px', lg: '1024px' };
  return useMediaQuery(`(max-width: ${breakpoints[breakpoint]})`);
};
