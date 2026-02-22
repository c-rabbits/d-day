"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Box } from "@mui/material";

const BANNER_COUNT = 3;
const ROTATE_INTERVAL_MS = 5000;
const SWIPE_THRESHOLD_PX = 50;

const BANNER_SLIDES: { src: string | null; alt: string }[] = [
  { src: null, alt: "배너 1" },
  { src: null, alt: "배너 2" },
  { src: null, alt: "배너 3" },
];

const PEEK_PERCENT = 12;
const TRACK_ORDER = [0, 1, 2, 0, 1, 2, 0];
const TRACK_SLIDES = TRACK_ORDER.length;

export function DashboardBanner() {
  const [index, setIndex] = useState(0);
  const [noTransition, setNoTransition] = useState(false);
  const touchStartX = useRef<number | null>(null);

  const displayIndex = TRACK_ORDER[index];

  const goTo = useCallback((next: number) => {
    if (next < 0) {
      setIndex((i) => (i === 0 ? TRACK_SLIDES - 1 : i - 1));
      return;
    }
    if (next >= TRACK_SLIDES) {
      setNoTransition(true);
      setIndex(0);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setNoTransition(false));
      });
      return;
    }
    setIndex(next);
  }, []);

  const goNext = useCallback(() => {
    setIndex((i) => (i >= TRACK_SLIDES - 1 ? i : i + 1));
  }, []);

  useEffect(() => {
    const id = setInterval(goNext, ROTATE_INTERVAL_MS);
    return () => clearInterval(id);
  }, [goNext]);

  useEffect(() => {
    if (index !== TRACK_SLIDES - 1) return;
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

  const slideWidthPercent = 100 / TRACK_SLIDES;
  const translatePercent = index * slideWidthPercent;

  return (
    <Box sx={{ width: "100%" }}>
      <Box
        sx={{
          position: "relative",
          width: "100%",
          aspectRatio: "2.5 / 1",
          overflow: "hidden",
          paddingLeft: `${PEEK_PERCENT}%`,
          paddingRight: `${PEEK_PERCENT}%`,
          boxSizing: "border-box",
        }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <Box sx={{ width: "100%", height: "100%", overflow: "hidden" }}>
          <Box
            sx={{
              display: "flex",
              width: `${TRACK_SLIDES * 100}%`,
              height: "100%",
              transform: `translateX(-${translatePercent}%)`,
              transition: noTransition ? "none" : "transform 0.5s ease",
            }}
          >
            {TRACK_ORDER.map((slideIdx, i) => {
              const slide = BANNER_SLIDES[slideIdx];
              return (
                <Box
                  key={i}
                  sx={{
                    flex: `0 0 ${slideWidthPercent}%`,
                    minWidth: 0,
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
                        배너 {slideIdx + 1} (이미지 추가 예정)
                      </Box>
                    )}
                  </Box>
                </Box>
              );
            })}
          </Box>
        </Box>
      </Box>

      <Box
        sx={{
          width: "100%",
          display: "flex",
          flexDirection: "row",
          justifyContent: "center",
          alignItems: "center",
          gap: 0.75,
          mt: 1.25,
        }}
      >
        {BANNER_SLIDES.map((_, i) => (
          <Box
            key={i}
            onClick={() => setIndex(i)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") setIndex(i);
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
