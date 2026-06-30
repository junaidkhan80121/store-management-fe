import { useTheme } from '@mui/material';
import useMediaQuery from '@mui/material/useMediaQuery';

/** Phone + tablet: sidebar overlays content (below md / 900px) */
export function useLayoutBreakpoints() {
  const theme = useTheme();
  const isOverlay = useMediaQuery(theme.breakpoints.down('md'));
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));

  return { isOverlay, isMobile, isTablet, isDesktop };
}
