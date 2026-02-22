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

/* M3 shape: 4/8/12/16/28dp → 4/8/12/16/28px 균형 */
const shape = {
  radiusXs: 4,
  radiusSm: 8,
  radiusMd: 12,
  radiusLg: 16,
  radiusXl: 28,
};

/* 테마: 검정·회색·흰색. primary = 진한 회색, contrastText = 흰색 */
const muiTheme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#262626",
      light: "#404040",
      dark: "#171717",
      contrastText: "#fff",
    },
    secondary: {
      main: "hsl(var(--secondary))",
      contrastText: "hsl(var(--secondary-foreground))",
    },
    background: {
      default: "hsl(var(--background))",
      paper: "hsl(var(--surface))",
    },
  },
  shape: {
    borderRadius: shape.radiusMd,
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
          borderRadius: shape.radiusMd,
        },
      },
    },
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        root: {
          borderRadius: shape.radiusSm,
          textTransform: "none",
          fontWeight: 600,
        },
        contained: {
          backgroundColor: "#262626",
          color: "#fff",
          "&:hover": {
            backgroundColor: "#404040",
            color: "#fff",
          },
        },
        outlined: {
          borderColor: "#262626",
          color: "#262626",
          "&:hover": {
            borderColor: "#171717",
            backgroundColor: "rgba(0,0,0,0.04)",
            color: "#171717",
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: shape.radiusSm,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        rounded: {
          borderRadius: shape.radiusLg,
        },
      },
    },
  },
});
