"use client";

import { Box, CircularProgress } from "@mui/material";

export function LoadingSpinner() {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "40vh",
        width: "100%",
      }}
    >
      <CircularProgress size={40} />
    </Box>
  );
}
