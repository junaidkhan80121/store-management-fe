import React from 'react';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { Calendar } from 'lucide-react';
import dayjs, { type Dayjs } from 'dayjs';
import type { SxProps, Theme } from '@mui/material';

interface FilterDateFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  sx?: SxProps<Theme>;
}

const CalendarPickerIcon = React.forwardRef<SVGSVGElement, React.SVGProps<SVGSVGElement>>(
  function CalendarPickerIcon(props, ref) {
    return <Calendar ref={ref} size={18} strokeWidth={1.75} {...props} />;
  }
);

export default function FilterDateField({ label, value, onChange, sx }: FilterDateFieldProps) {
  const parsed = value ? dayjs(value) : null;
  const pickerValue = parsed?.isValid() ? parsed : null;

  const handleChange = (newValue: Dayjs | null) => {
    onChange(newValue?.isValid() ? newValue.format('YYYY-MM-DD') : '');
  };

  return (
    <DatePicker
      label={label}
      value={pickerValue}
      onChange={handleChange}
      format="DD MMM YYYY"
      slots={{ openPickerIcon: CalendarPickerIcon }}
      slotProps={{
        textField: {
          size: 'small',
          sx: [{ minWidth: { xs: '100%', sm: 150 } }, ...(Array.isArray(sx) ? sx : sx ? [sx] : [])],
        },
        openPickerButton: {
          sx: (theme) => ({
            color: theme.palette.mode === 'dark' ? theme.palette.grey[400] : theme.palette.text.secondary,
            '&:hover': {
              color: theme.palette.mode === 'dark' ? theme.palette.common.white : theme.palette.text.primary,
              backgroundColor:
                theme.palette.mode === 'dark'
                  ? 'rgba(145, 158, 171, 0.16)'
                  : 'rgba(145, 158, 171, 0.08)',
            },
          }),
        },
        desktopPaper: {
          elevation: 0,
          sx: (theme) => ({
            borderRadius: 2,
            border: `1px solid ${theme.palette.divider}`,
            boxShadow:
              theme.palette.mode === 'light'
                ? '0 0 2px 0 rgba(145, 158, 171, 0.2), 0 12px 24px -4px rgba(145, 158, 171, 0.12)'
                : '0 0 2px 0 rgba(0, 0, 0, 0.2), 0 12px 24px -4px rgba(0, 0, 0, 0.12)',
          }),
        },
        mobilePaper: {
          elevation: 0,
          sx: (theme) => ({
            borderRadius: 2,
            border: `1px solid ${theme.palette.divider}`,
          }),
        },
      }}
    />
  );
}
