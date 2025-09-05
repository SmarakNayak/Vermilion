import { Toaster } from 'sonner';
import theme from '../../styles/theme';
import { CheckCircleIcon, ErrorCircleIcon } from '../common/Icon';


// Styled to match our Radix UI custom toasts
export const CustomToaster = () => (
  <Toaster 
    position="bottom-right"
    expand={false}
    richColors={false}
    toastOptions={{
      style: {
        height: '2.75rem',
        minHeight: '2.75rem',
        width: 'fit-content',
        borderRadius: '1.375rem',
        backgroundColor: theme.colors.background.dark,
        color: theme.colors.text.white,
        border: 'none',
        boxShadow: 'rgba(10, 10, 10, 0.1) 0px 4px 8px 0px',
        padding: '0 1rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.375rem',
        fontFamily: theme.typography.fontFamilies.medium,
        fontSize: '1rem',
        lineHeight: '1.25rem',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
      },
      duration: 3000,
    }}
    icons={{
      success: <CheckCircleIcon size="1.25rem" color={theme.colors.text.white} />,
      error: <ErrorCircleIcon size="1.25rem" color={theme.colors.text.white} />,
    }}
  />
);