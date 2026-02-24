"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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

type MissionListProps = {
  contractCount: number;
  hasNotification: boolean;
};

export function MissionList({ contractCount, hasNotification }: MissionListProps) {
  const router = useRouter();
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

  useEffect(() => refresh(), [todayKey, contractCount, hasNotification]);

  const completeAndGrantXP = (mission: Mission) => {
    if (mission.type === "daily") {
      if (isDailyDone(todayKey)) return;
      setDailyDone(todayKey);
    } else {
      if (isOnetimeDone(mission.id)) return;
      setOnetimeDone(mission.id);
    }
    addXP(mission.xpReward);
    setXp(getXP());
    refresh();
  };

  const handleStart = (mission: Mission) => {
    if (mission.type === "daily") {
      completeAndGrantXP(mission);
      return;
    }
    if (isOnetimeDone(mission.id)) return;
    if (mission.id === "first_contract") {
      if (contractCount >= 1) completeAndGrantXP(mission);
      else router.push("/dashboard/contracts/new");
      return;
    }
    if (mission.id === "three_contracts") {
      if (contractCount >= 3) completeAndGrantXP(mission);
      else router.push("/dashboard/contracts/new");
      return;
    }
    if (mission.id === "set_notification") {
      if (hasNotification) completeAndGrantXP(mission);
      else router.push("/dashboard");
      return;
    }
    completeAndGrantXP(mission);
  };

  const level = getLevelFromXP(xp);
  const progress = getXPProgressInLevel(xp);
  const dailyMissions = MISSIONS.filter((m) => m.type === "daily");
  const oneTimeMissions = MISSIONS.filter((m) => m.type === "one_time");

  const isConditionMet = (m: Mission) => {
    if (m.type === "daily") return true;
    if (m.id === "first_contract") return contractCount >= 1;
    if (m.id === "three_contracts") return contractCount >= 3;
    if (m.id === "set_notification") return hasNotification;
    return false;
  };

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
                  canClaim={false}
                  onStart={() => handleStart(m)}
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
              const canClaim = !done && isConditionMet(m);
              return (
                <MissionCard
                  key={m.id}
                  mission={m}
                  done={done}
                  canClaim={canClaim}
                  onStart={() => handleStart(m)}
                />
              );
            })}
          </Stack>
        </Box>
      </Stack>
    </Box>
  );
}

const SKY_BLUE = "#44B2FF";

function MissionCard({
  mission,
  done,
  canClaim,
  onStart,
}: {
  mission: Mission;
  done: boolean;
  canClaim: boolean;
  onStart: () => void;
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
          ) : canClaim ? (
            <Button
              variant="contained"
              size="small"
              onClick={onStart}
              sx={{
                bgcolor: SKY_BLUE,
                color: "#fff",
                "&:hover": { bgcolor: "#3692d9" },
                flexShrink: 0,
              }}
            >
              받기
            </Button>
          ) : (
            <Button
              variant="contained"
              size="small"
              onClick={onStart}
              sx={{
                bgcolor: "#262626",
                "&:hover": { bgcolor: "#404040" },
                flexShrink: 0,
              }}
            >
              시작
            </Button>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}
