"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { Box, Card, CardContent, Typography } from "@mui/material";

type AuthShellMuiProps = {
  title: string;
  subtitle: string;
  backHref?: string;
  children: ReactNode;
};

/** Materio 스타일: 중앙 카드, 밝은 배경, 로고+제목+설명 */
export function AuthShellMui({
  title,
  subtitle,
  backHref = "/",
  children,
}: AuthShellMuiProps) {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100dvh",
        position: "relative",
        p: 2.5,
        bgcolor: "grey.50",
      }}
    >
      <Card sx={{ width: "100%", maxWidth: 450 }}>
        <CardContent sx={{ p: { xs: 2.5, sm: 4 } }}>
          <Link
            href={backHref}
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              marginBottom: 24,
              textDecoration: "none",
              color: "inherit",
            }}
          >
            <Typography variant="h6" fontWeight={700}>
              디데이
            </Typography>
          </Link>
          <Typography variant="h5" fontWeight={700} gutterBottom>
            {title}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
            {subtitle}
          </Typography>
          {children}
        </CardContent>
      </Card>
    </Box>
  );
}
