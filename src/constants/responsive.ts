import type { SxProps, Theme } from '@mui/material';

/** Shared page shell — use on list/detail pages */
export const pageContainerSx: SxProps<Theme> = {
  maxWidth: 1440,
  mx: 'auto',
  pt: { xs: 1, sm: 2 },
  pb: { xs: 3, sm: 4 },
  width: '100%',
  minWidth: 0,
};

/** Title row with optional action button */
export const pageHeaderSx: SxProps<Theme> = {
  mb: { xs: 2, sm: 4 },
  display: 'flex',
  flexDirection: { xs: 'column', sm: 'row' },
  alignItems: { xs: 'stretch', sm: 'center' },
  justifyContent: 'space-between',
  gap: 2,
};

export const pageTitleSx: SxProps<Theme> = {
  fontWeight: 700,
  fontSize: { xs: '1.35rem', sm: '1.75rem', md: '2.125rem' },
  lineHeight: 1.2,
};

/** Filter toolbars */
export const filterRowSx: SxProps<Theme> = {
  display: 'flex',
  gap: 2,
  flexWrap: 'wrap',
  '& .MuiFormControl-root, & .MuiTextField-root': {
    minWidth: { xs: '100%', sm: 180 },
    flex: { xs: '1 1 100%', sm: '1 1 auto' },
  },
};

/** Scrollable data tables on small screens */
export const responsiveTablePaperSx: SxProps<Theme> = {
  overflow: 'hidden',
  '& .MuiTableContainer-root': {
    overflowX: 'auto',
    WebkitOverflowScrolling: 'touch',
  },
};
