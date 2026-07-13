// src/main.tsx

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material'
import { colors } from '@/presentation/theme/colors'
import AppRouter from '@/presentation/router/AppRouter'
import './index.css'

const theme = createTheme({
  palette: {
    primary: {
      main: colors.primary,
      dark: colors.primaryDark,
      contrastText: colors.textOnPrimary,
    },
    secondary: {
      main: colors.accent,
      light: colors.accentLight,
      contrastText: colors.textOnAccent,
    },
    error: { main: colors.error },
    warning: { main: colors.warning },
    success: { main: colors.success },
    background: {
      default: colors.background,
      paper: colors.surface,
    },
    text: {
      primary: colors.textPrimary,
      secondary: colors.textSecondary,
    },
    divider: colors.border,
  },
  typography: {
    fontFamily: 'Roboto, sans-serif',
    h1: { fontSize: 28, fontWeight: 800, lineHeight: 1.2 },
    h2: { fontSize: 20, fontWeight: 700 },
    body1: { fontSize: 15 },
    body2: { fontSize: 14, color: colors.textSecondary },
    button: { fontSize: 16, fontWeight: 600 },
    caption: { fontSize: 12, fontWeight: 600, letterSpacing: 0.5 },
  },
  shape: {
    borderRadius: 14,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 28,
          paddingTop: 12,
          paddingBottom: 12,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          border: `1px solid ${colors.border}`,
          boxShadow: 'none',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 14,
          },
        },
      },
    },
  },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppRouter />
    </ThemeProvider>
  </StrictMode>,
)