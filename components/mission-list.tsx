"use client";

import { useState, useEffect } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  LinearProgress,
  Stack,
  Typography,
} from "@mui/material";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import StarRoundedIcon from "@mui/icons-material/StarRounded";
import { getXP, addXP, isDailyDone, setDailyDone, isOnetimeDone, setOnetimeDone, getTodayKey } from "@/lib/xp-store";
import { getLevelFromXP, getXPProgressInLevel, MAX_LEVEL } from "@/lib/level";
import { MISSIONS, type Mission } from "@/lib/mission";

export function MissionList() {
  const [xp, setXp] = useState(0);
  const [dailyDone, setDailyDoneState] = useState(false);
  const [doneIds, setDoneIds] = useState<string[]>([]);

  const todayKey = getTodayKey();

  const refresh = () => {
    setXp(getXP());
    setDailyDoneState(isDailyDone(todayKey));
    setDoneIds(
      MISSIONS.filter((m) => m.type === "one_time" && isOnetimeDone(m.id)).map((m) => m.id),
    );
  };

  useEffect(() => refresh(), [todayKey]);

  const handleComplete = (mission: Mission) => {
    if (mission.type === "daily") {
      if (isDailyDone(todayKey)) return;
      setDailyDone(todayKey);
    } else {
      if (isOnetimeDone(mission.id)) return;
      setOnetimeDone(mission.id);
    }
    const newXP = addXP(mission.xpReward);
    setXp(newXP);
    refresh();
  };

  const level = getLevelFromXP(xp);
  const progress = getXPProgressInLevel(xp);
  const dailyMissions = MISSIONS.filter((m) => m.type === "daily");
  const oneTimeMissions = MISSIONS.filter((m) => m.type === "one_time");

  return (
    <Box sx={{ px: 2, pt: 3.5, pb: 14 }}>
      <Stack spacing={2.5}>
        <Box>
          <Typography variant="h5" fontWeight={700} gutterBottom>
            미션
          </Typography>
        </Box>

        {/* 레벨 & XP 요약 */}
        <Card variant="outlined" sx={{ borderRadius: 2 }}>
          <CardContent sx={{ py: 2, px: 2 }}>
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <StarRoundedIcon sx={{ fontSize: 28, color: "#FFC434" }} />
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="body2" color="text.secondary">
                  Lv.{level} {level >= MAX_LEVEL ? "(MAX)" : ""}
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={level >= MAX_LEVEL ? 100 : (progress.current / progress.required) * 100}
                  sx={{
                    mt: 0.5,
                    height: 8,
                    borderRadius: 1,
                    bgcolor: "action.hover",
                    "& .MuiLinearProgress-bar": { bgcolor: "#FFC434" },
                  }}
                />
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                  {xp.toLocaleString()} XP
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>

        {/* 데일리 미션 */}
        <Box>
          <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1 }}>
            데일리 미션
          </Typography>
          <Stack spacing={1.5}>
            {dailyMissions.map((m) => {
              const done = m.type === "daily" && dailyDone;
              return (
                <MissionCard
                  key={m.id}
                  mission={m}
                  done={done}
                  onComplete={() => handleComplete(m)}
                />
              );
            })}
          </Stack>
        </Box>

        {/* 1회성 미션 */}
        <Box>
          <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1 }}>
            1회성 미션
          </Typography>
          <Stack spacing={1.5}>
            {oneTimeMissions.map((m) => {
              const done = doneIds.includes(m.id);
              return (
                <MissionCard
                  key={m.id}
                  mission={m}
                  done={done}
                  onComplete={() => handleComplete(m)}
                />
              );
            })}
          </Stack>
        </Box>
      </Stack>
    </Box>
  );
}

function MissionCard({
  mission,
  done,
  onComplete,
}: {
  mission: Mission;
  done: boolean;
  onComplete: () => void;
}) {
  return (
    <Card variant="outlined" sx={{ borderRadius: 2 }}>
      <CardContent sx={{ py: 1.5, px: 2 }}>
        <Stack direction="row" alignItems="flex-start" justifyContent="space-between" spacing={1}>
          <Box sx={{ minWidth: 0 }}>
            <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap">
              <Typography variant="subtitle1" fontWeight={700}>
                {mission.title}
              </Typography>
              <Chip
                label={`+${mission.xpReward} XP`}
                size="small"
                sx={{ bgcolor: "#FFC43433", color: "#b38600", fontWeight: 700 }}
              />
            </Stack>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {mission.description}
            </Typography>
          </Box>
          {done ? (
            <Chip
              icon={<CheckCircleRoundedIcon />}
              label="완료"
              size="small"
              color="success"
              variant="outlined"
            />
          ) : (
            <Button
              variant="contained"
              size="small"
              onClick={onComplete}
              sx={{
                bgcolor: "#262626",
                "&:hover": { bgcolor: "#404040" },
                flexShrink: 0,
              }}
            >
              수행
            </Button>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}
