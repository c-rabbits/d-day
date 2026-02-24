"use client";

import { useState, useEffect } from "react";
import { Box, LinearProgress, Typography } from "@mui/material";
import { getXP } from "@/lib/xp-store";
import { getLevelFromXP, getXPProgressInLevel, MAX_LEVEL } from "@/lib/level";

/** 프로필 카드 내 XP 게이지, 경험치 숫자, 현재 레벨 (0~9999999 표기, 실제 상한 999999) */
export function ProfileXpBlock() {
  const [xp, setXp] = useState(0);
  useEffect(() => {
    setXp(getXP());
    const onStorage = () => setXp(getXP());
    window.addEventListener("storage", onStorage);
    window.addEventListener("dday_xp_updated", onStorage);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("dday_xp_updated", onStorage);
    };
  }, []);

  const level = getLevelFromXP(xp);
  const progress = getXPProgressInLevel(xp);
  const displayXP = Math.min(xp, 9999999);

  return (
    <Box sx={{ flex: 1, minWidth: 0 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
        <LevelBadge level={level} />
        <Typography variant="body2" color="text.secondary">
          {displayXP.toLocaleString()} XP
        </Typography>
      </Box>
      <LinearProgress
        variant="determinate"
        value={level >= MAX_LEVEL ? 100 : (progress.current / progress.required) * 100}
        sx={{
          height: 8,
          borderRadius: 1,
          bgcolor: "action.hover",
          "& .MuiLinearProgress-bar": { bgcolor: "#FFC434" },
        }}
      />
    </Box>
  );
}

/** 레벨 1~100 뱃지 (레벨 디자인) */
function LevelBadge({ level }: { level: number }) {
  const l = Math.min(MAX_LEVEL, Math.max(1, level));
  const tier = l <= 20 ? "bronze" : l <= 40 ? "silver" : l <= 60 ? "gold" : l <= 80 ? "platinum" : "diamond";
  const colors: Record<string, { bg: string; color: string }> = {
    bronze: { bg: "#CD7F32", color: "#fff" },
    silver: { bg: "#C0C0C0", color: "#333" },
    gold: { bg: "#FFC434", color: "#333" },
    platinum: { bg: "#E5E4E2", color: "#333" },
    diamond: { bg: "#B9F2FF", color: "#111" },
  };
  const { bg, color } = colors[tier];

  return (
    <Box
      component="span"
      sx={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        minWidth: 40,
        px: 1,
        py: 0.25,
        borderRadius: 1,
        bgcolor: bg,
        color,
        fontWeight: 700,
        fontSize: "0.875rem",
      }}
    >
      Lv.{l}
    </Box>
  );
}
