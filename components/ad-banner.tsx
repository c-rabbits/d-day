"use client";

import { Box, Button, Chip, Stack, Typography } from "@mui/material";
import OpenInNewRoundedIcon from "@mui/icons-material/OpenInNewRounded";
import LocalFireDepartmentRoundedIcon from "@mui/icons-material/LocalFireDepartmentRounded";
import { type AdBanner } from "@/lib/ad-banners";
import { CATEGORY_PASTEL } from "@/lib/types";

type AdBannerCardProps = {
  banner: AdBanner;
  dDay: number; // 남은 일수
};

export function AdBannerCard({ banner, dDay }: AdBannerCardProps) {
  const isUrgent = dDay >= 0 && dDay <= 7;
  const categoryColor = CATEGORY_PASTEL[banner.category];

  if (isUrgent) {
    return (
      <Box
        sx={{
          borderRadius: 2,
          overflow: "hidden",
          border: "1.5px solid",
          borderColor: "#FF4444",
          bgcolor: "#fff",
        }}
      >
        <Box sx={{ px: 2, py: 1.5 }}>
          <Stack spacing={1}>
            <Stack direction="row" alignItems="center" spacing={0.75}>
              <LocalFireDepartmentRoundedIcon sx={{ fontSize: 18, color: "#FF4444" }} />
              <Chip
                label={`D-${dDay}`}
                size="small"
                sx={{
                  bgcolor: "#FF4444",
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: "0.75rem",
                  height: 22,
                }}
              />
            </Stack>
            <Typography variant="subtitle2" fontWeight={700} sx={{ color: "#CC0000" }}>
              {banner.urgentTitle}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {banner.description}
            </Typography>
            <Button
              variant="contained"
              fullWidth
              endIcon={<OpenInNewRoundedIcon sx={{ fontSize: 16 }} />}
              href={banner.url}
              target="_blank"
              rel="noopener noreferrer"
              sx={{
                textTransform: "none",
                fontWeight: 700,
                fontSize: "0.9rem",
                py: 1.3,
                minHeight: 44,
                bgcolor: "#FF4444",
                color: "#fff",
                "&:hover": { bgcolor: "#CC3333" },
                borderRadius: 1.5,
              }}
            >
              {banner.ctaText}
            </Button>
          </Stack>
        </Box>
      </Box>
    );
  }

  // 일반 배너 - 화이트 + 하단 컬러 라인
  return (
    <Box
      sx={{
        borderRadius: 2,
        overflow: "hidden",
        bgcolor: "#fff",
        border: "1.5px solid",
        borderColor: categoryColor,
      }}
    >
      <Box sx={{ px: 2, py: 1.5 }}>
        <Stack spacing={1}>
          <Typography variant="caption" sx={{ color: categoryColor, fontWeight: 700 }}>
            제휴
          </Typography>
          <Typography variant="subtitle2" fontWeight={700}>
            {banner.title}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {banner.description}
          </Typography>
          <Button
            variant="contained"
            fullWidth
            endIcon={<OpenInNewRoundedIcon sx={{ fontSize: 16 }} />}
            href={banner.url}
            target="_blank"
            rel="noopener noreferrer"
            sx={{
              textTransform: "none",
              fontWeight: 700,
              fontSize: "0.9rem",
              py: 1.3,
              minHeight: 44,
              bgcolor: categoryColor,
              color: "#fff",
              "&:hover": { bgcolor: `${categoryColor}DD` },
              borderRadius: 1.5,
            }}
          >
            {banner.ctaText}
          </Button>
        </Stack>
      </Box>
    </Box>
  );
}
