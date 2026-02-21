"use client";

import { ReactNode, useMemo } from "react";
import { ThemeProvider as MuiThemeProvider, createTheme, CssBaseline } from "@mui/material";
import { useTheme } from "next-themes";

export function MuiProvider({ children }: { children: ReactNode }) {
  const { resolvedTheme } = useTheme();
  const mode = resolvedTheme === "dark" ? "dark" : "light";

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          primary: { main: mode === "dark" ? "#FF9C54" : "#E9781A" },
          secondary: { main: mode === "dark" ? "#8DA4D7" : "#4E6898" },
          background: {
            default: mode === "dark" ? "#141319" : "#FBF7F2",
            paper: mode === "dark" ? "#1E1D24" : "#FFFFFF",
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
      }),
    [mode],
  );

  return (
    <MuiThemeProvider theme={theme}>
      <CssBaseline enableColorScheme />
      {children}
    </MuiThemeProvider>
  );
}
