import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    primary: {
      main: '#1B5E20',
      light: '#4C8C4A',
      dark: '#003D00',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#FFB300',
      light: '#FFE54C',
      dark: '#C68400',
      contrastText: '#000000',
    },
    error: {
      main: '#D32F2F',
    },
    success: {
      main: '#388E3C',
    },
    background: {
      default: '#F5F5F5',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#212121',
      secondary: '#757575',
      disabled: '#BDBDBD',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Arial", sans-serif',
    h1: {
      fontSize: '2rem',
      fontWeight: 700,
      '@media (min-width:600px)': {
        fontSize: '2.5rem',
      },
    },
    h2: {
      fontSize: '1.5rem',
      fontWeight: 700,
      '@media (min-width:600px)': {
        fontSize: '2rem',
      },
    },
    h3: {
      fontSize: '1.25rem',
      fontWeight: 600,
    },
    body1: {
      fontSize: '1rem',
    },
    button: {
      fontWeight: 500,
      textTransform: 'none',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '12px 24px',
          fontSize: '1rem',
          minHeight: 48,
        },
        sizeLarge: {
          padding: '16px 32px',
          fontSize: '1.125rem',
          minHeight: 56,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
          },
        },
      },
    },
  },
});
