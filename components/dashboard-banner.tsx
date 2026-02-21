"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Box } from "@mui/material";

const BANNER_COUNT = 3;
const ROTATE_INTERVAL_MS = 5000;
const SLIDE_WIDTH = 78;
const GAP = 4;
const PEEK = 6;
const TRACK_SLIDES = BANNER_COUNT + 1;
const TRACK_WIDTH = PEEK + SLIDE_WIDTH * TRACK_SLIDES + GAP * (TRACK_SLIDES - 1) + PEEK;
const SWIPE_THRESHOLD_PX = 50;

const BANNER_SLIDES: { src: string | null; alt: string }[] = [
  { src: null, alt: "배너 1" },
  { src: null, alt: "배너 2" },
  { src: null, alt: "배너 3" },
];

export function DashboardBanner() {
  const [index, setIndex] = useState(0);
  const [noTransition, setNoTransition] = useState(false);
  const touchStartX = useRef<number | null>(null);

  const goTo = useCallback((next: number) => {
    if (next < 0) {
      setIndex(0);
      return;
    }
    if (next >= BANNER_COUNT) {
      setIndex(BANNER_COUNT);
      return;
    }
    setIndex(next);
  }, []);

  const goNext = useCallback(() => {
    setIndex((i) => {
      if (i >= BANNER_COUNT - 1) return BANNER_COUNT;
      return i + 1;
    });
  }, []);

  useEffect(() => {
    const id = setInterval(goNext, ROTATE_INTERVAL_MS);
    return () => clearInterval(id);
  }, [goNext]);

  useEffect(() => {
    if (index !== BANNER_COUNT) return;
    const t = setTimeout(() => {
      setNoTransition(true);
      setIndex(0);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setNoTransition(false));
      });
    }, 500);
    return () => clearTimeout(t);
  }, [index]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current == null) return;
    const endX = e.changedTouches[0].clientX;
    const diff = touchStartX.current - endX;
    if (diff > SWIPE_THRESHOLD_PX) goTo(index + 1);
    else if (diff < -SWIPE_THRESHOLD_PX) goTo(index - 1);
    touchStartX.current = null;
  };

  const translatePercent =
    (PEEK + index * (SLIDE_WIDTH + GAP)) / TRACK_WIDTH * 100;

  const displayIndex = index === BANNER_COUNT ? 0 : index;

  return (
    <Box sx={{ width: "100%" }}>
      <Box
        sx={{
          position: "relative",
          width: "100%",
          aspectRatio: "2.5 / 1",
          overflow: "hidden",
        }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <Box
          sx={{
            display: "flex",
            width: `${TRACK_WIDTH}%`,
            height: "100%",
            transform: `translateX(-${translatePercent}%)`,
            transition: noTransition ? "none" : "transform 0.5s ease",
          }}
        >
          <Box sx={{ flex: `0 0 ${(PEEK / TRACK_WIDTH) * 100}%` }} />
          {[...BANNER_SLIDES, BANNER_SLIDES[0]].map((slide, i) => (
            <Box
              key={i}
              sx={{
                flex: `0 0 ${(SLIDE_WIDTH / TRACK_WIDTH) * 100}%`,
                minWidth: 0,
                marginRight: i < TRACK_SLIDES - 1 ? `${(GAP / TRACK_WIDTH) * 100}%` : 0,
                borderRadius: 2.5,
                overflow: "hidden",
                boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
              }}
            >
              <Box
                sx={{
                  width: "100%",
                  height: "100%",
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
                  <Box sx={{ color: "text.secondary", fontSize: "0.875rem" }}>
                    배너 {(i % BANNER_COUNT) + 1} (이미지 추가 예정)
                  </Box>
                )}
              </Box>
            </Box>
          ))}
          <Box sx={{ flex: `0 0 ${(PEEK / TRACK_WIDTH) * 100}%` }} />
        </Box>
      </Box>

      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          gap: 0.75,
          mt: 1.25,
        }}
      >
        {BANNER_SLIDES.map((_, i) => (
          <Box
            key={i}
            onClick={() => goTo(i)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") goTo(i);
            }}
            sx={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              bgcolor: i === displayIndex ? "primary.main" : "grey.400",
              cursor: "pointer",
              transition: "background-color 0.2s",
              "&:hover": { bgcolor: i === displayIndex ? "primary.dark" : "grey.500" },
            }}
            aria-label={`배너 ${i + 1}`}
          />
        ))}
      </Box>
    </Box>
  );
}
