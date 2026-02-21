"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import {
  alpha,
  Box,
  Card,
  CardContent,
  Chip,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import ChevronLeftRoundedIcon from "@mui/icons-material/ChevronLeftRounded";

type AuthShellMuiProps = {
  title: string;
  subtitle: string;
  badge?: string;
  backHref?: string;
  children: ReactNode;
};

export function AuthShellMui({
  title,
  subtitle,
  badge,
  backHref = "/",
  children,
}: AuthShellMuiProps) {
  return (
    <Box
      sx={{
        minHeight: "100svh",
        px: 2.2,
        py: 2.8,
        background:
          "radial-gradient(85% 70% at 0% 0%, rgba(233,120,26,.24), rgba(233,120,26,0) 55%), radial-gradient(75% 60% at 100% 60%, rgba(78,104,152,.2), rgba(78,104,152,0) 52%), linear-gradient(180deg, #222035 0%, #1A1828 42%, #171523 100%)",
      }}
    >
      <Box sx={{ mx: "auto", width: "100%", maxWidth: 430 }}>
        <Stack spacing={1.9}>
          <IconButton
            component={Link}
            href={backHref}
            aria-label="뒤로"
            sx={{
              width: 40,
              height: 40,
              bgcolor: alpha("#fff", 0.14),
              color: "#fff",
              "&:hover": { bgcolor: alpha("#fff", 0.22) },
            }}
          >
            <ChevronLeftRoundedIcon />
          </IconButton>

          <Box>
            {badge && (
              <Chip
                label={badge}
                size="small"
                sx={{
                  mb: 1.1,
                  color: "#fff",
                  bgcolor: alpha("#fff", 0.15),
                  fontWeight: 700,
                  letterSpacing: "0.04em",
                }}
              />
            )}
            <Typography
              variant="h4"
              sx={{ color: "#fff", fontSize: "2rem", fontWeight: 700, lineHeight: 1.18 }}
            >
              {title}
            </Typography>
            <Typography variant="body1" sx={{ mt: 1, color: alpha("#fff", 0.84), maxWidth: 338 }}>
              {subtitle}
            </Typography>
          </Box>

          <Card
            sx={{
              borderRadius: 4,
              p: 0.6,
              border: "1px solid",
              borderColor: alpha("#fff", 0.2),
              bgcolor: alpha("#fff", 0.08),
              backdropFilter: "blur(6px)",
              boxShadow: "none",
            }}
          >
            <CardContent sx={{ p: "14px !important" }}>
              <Box
                sx={{
                  height: 106,
                  borderRadius: 3,
                  background:
                    "radial-gradient(circle at 15% 20%, rgba(233,120,26,.35), rgba(233,120,26,0) 52%), radial-gradient(circle at 85% 80%, rgba(78,104,152,.38), rgba(78,104,152,0) 50%), linear-gradient(120deg, rgba(255,255,255,.08), rgba(255,255,255,.02))",
                  border: "1px solid",
                  borderColor: alpha("#fff", 0.2),
                }}
              />
            </CardContent>
          </Card>

          <Card
            variant="outlined"
            sx={{
              borderRadius: "30px 30px 22px 22px",
              borderColor: "divider",
              bgcolor: "background.paper",
            }}
          >
            <CardContent sx={{ p: 2.4, "&:last-child": { pb: 2.4 } }}>{children}</CardContent>
          </Card>
        </Stack>
      </Box>
    </Box>
  );
}
