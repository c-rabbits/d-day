"use client";

import { Box, CircularProgress } from "@mui/material";

export function LoadingSpinner() {
  return (
    <Box
      sx={{
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1,
      }}
    >
      <CircularProgress size={40} />
    </Box>
  );
}
