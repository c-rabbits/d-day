"use client";

import { ReactNode } from "react";
import { ThemeProvider as MuiThemeProvider, createTheme, CssBaseline } from "@mui/material";

export function MuiProvider({ children }: { children: ReactNode }) {
  return (
    <MuiThemeProvider theme={muiTheme}>
      <CssBaseline enableColorScheme />
      {children}
    </MuiThemeProvider>
  );
}

const muiTheme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#E9781A" },
    secondary: { main: "#4E6898" },
    background: {
      default: "#FBF7F2",
      paper: "#FFFFFF",
    },
  },
  shape: {
    borderRadius: 18,
  },
  typography: {
    fontFamily:
      'var(--font-noto-sans-kr), "Noto Sans KR", "Apple SD Gothic Neo", "Segoe UI", sans-serif',
    h4: { fontWeight: 700, letterSpacing: -0.2 },
    h5: { fontWeight: 700, letterSpacing: -0.2 },
    h6: { fontWeight: 700, letterSpacing: -0.1 },
    body1: { lineHeight: 1.7 },
    body2: { lineHeight: 1.65 },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 20,
        },
      },
    },
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        root: {
          borderRadius: 14,
          textTransform: "none",
          fontWeight: 600,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        rounded: {
          borderRadius: 18,
        },
      },
    },
  },
});
