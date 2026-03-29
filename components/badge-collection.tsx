"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Card,
  CardContent,
  IconButton,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import LockRoundedIcon from "@mui/icons-material/LockRounded";
import { BADGES, type Badge } from "@/lib/badge";
import { getXP } from "@/lib/xp-store";
import { getLevelFromXP } from "@/lib/level";
import { useXpSync } from "@/lib/hooks/use-xp-sync";

type UnlockedBadge = {
  badge_id: string;
  unlocked_at: string;
};

export function BadgeCollection() {
  const router = useRouter();
  useXpSync();

  const [unlockedBadges, setUnlockedBadges] = useState<UnlockedBadge[]>([]);
  const [loading, setLoading] = useState(true);
  const [level, setLevel] = useState(1);

  useEffect(() => {
    setLevel(getLevelFromXP(getXP()));

    fetch("/api/badges")
      .then((res) => res.json())
      .then((data) => {
        setUnlockedBadges(data.badges ?? []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // XP 업데이트 시 레벨 갱신
  useEffect(() => {
    const onXpUpdated = () => setLevel(getLevelFromXP(getXP()));
    window.addEventListener("dday_xp_updated", onXpUpdated);
    return () => window.removeEventListener("dday_xp_updated", onXpUpdated);
  }, []);

  const isUnlocked = (badgeId: string) =>
    unlockedBadges.some((b) => b.badge_id === badgeId);

  const getUnlockedAt = (badgeId: string) => {
    const badge = unlockedBadges.find((b) => b.badge_id === badgeId);
    if (!badge) return null;
    return new Date(badge.unlocked_at).toLocaleDateString("ko-KR");
  };

  if (loading) {
    return (
      <Box sx={{ px: 2, pt: 3.5, pb: 14 }}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <IconButton onClick={() => router.back()} size="small">
            <ArrowBackRoundedIcon />
          </IconButton>
          <Typography variant="h5" fontWeight={700}>
            업적
          </Typography>
        </Stack>
        <Stack spacing={1.5}>
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} variant="rounded" height={100} />
          ))}
        </Stack>
      </Box>
    );
  }

  return (
    <Box sx={{ px: 2, pt: 3.5, pb: 14 }}>
      <Stack spacing={2.5}>
        <Box>
          <Typography variant="h5" fontWeight={700} gutterBottom>
            업적
          </Typography>
          <Typography variant="body2" color="text.secondary">
            현재 레벨: Lv.{level}
          </Typography>
        </Box>

        <Stack spacing={1.5}>
          {BADGES.map((badge) => {
            const unlocked = isUnlocked(badge.id);
            return (
              <BadgeCard
                key={badge.id}
                badge={badge}
                unlocked={unlocked}
                unlockedAt={getUnlockedAt(badge.id)}
                currentLevel={level}
              />
            );
          })}
        </Stack>
      </Stack>
    </Box>
  );
}

function BadgeCard({
  badge,
  unlocked,
  unlockedAt,
  currentLevel,
}: {
  badge: Badge;
  unlocked: boolean;
  unlockedAt: string | null;
  currentLevel: number;
}) {
  return (
    <Card
      variant="outlined"
      sx={{
        borderRadius: 2,
        opacity: unlocked ? 1 : 0.5,
        border: unlocked ? `2px solid ${badge.bgColor}` : undefined,
      }}
    >
      <CardContent sx={{ py: 2, px: 2 }}>
        <Stack direction="row" alignItems="center" spacing={2}>
          {/* 뱃지 아이콘 */}
          <Box
            sx={{
              width: 56,
              height: 56,
              borderRadius: 2,
              bgcolor: unlocked ? badge.bgColor : "grey.300",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 28,
              flexShrink: 0,
            }}
          >
            {unlocked ? badge.icon : <LockRoundedIcon sx={{ color: "grey.500", fontSize: 28 }} />}
          </Box>

          {/* 뱃지 정보 */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="subtitle1" fontWeight={700}>
              {badge.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {badge.description}
            </Typography>
            {unlocked && unlockedAt ? (
              <Typography variant="caption" color="success.main" sx={{ mt: 0.5 }}>
                {unlockedAt} 달성
              </Typography>
            ) : (
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                Lv.{currentLevel} / Lv.{badge.requiredLevel}
              </Typography>
            )}
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}
