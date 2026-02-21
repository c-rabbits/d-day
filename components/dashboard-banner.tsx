"use client";

import { useState, useEffect } from "react";
import { Box } from "@mui/material";

const BANNER_COUNT = 3;
const ROTATE_INTERVAL_MS = 5000;

/** 2:1 비율 라운드 배너 3개, 5초 간격 로테이션. 이미지 src는 나중에 교체 */
const BANNER_SLIDES: { src: string | null; alt: string }[] = [
  { src: null, alt: "배너 1" },
  { src: null, alt: "배너 2" },
  { src: null, alt: "배너 3" },
];

export function DashboardBanner() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % BANNER_COUNT);
    }, ROTATE_INTERVAL_MS);
    return () => clearInterval(id);
  }, []);

  return (
    <Box
      sx={{
        position: "relative",
        width: "100%",
        aspectRatio: "2 / 1",
        borderRadius: 2.5,
        overflow: "hidden",
        bgcolor: "grey.200",
      }}
    >
      {BANNER_SLIDES.map((slide, i) => (
        <Box
          key={i}
          sx={{
            position: "absolute",
            inset: 0,
            opacity: i === index ? 1 : 0,
            transition: "opacity 0.5s ease",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: slide.src ? undefined : "grey.300",
          }}
        >
          {slide.src ? (
            <Box
              component="img"
              src={slide.src}
              alt={slide.alt}
              sx={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
          ) : (
            <Box
              sx={{
                color: "text.secondary",
                fontSize: "0.875rem",
              }}
            >
              배너 {i + 1} (이미지 추가 예정)
            </Box>
          )}
        </Box>
      ))}
    </Box>
  );
}
