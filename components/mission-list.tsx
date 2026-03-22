"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  LinearProgress,
  Stack,
  Typography,
} from "@mui/material";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import StarRoundedIcon from "@mui/icons-material/StarRounded";
import EmojiEventsRoundedIcon from "@mui/icons-material/EmojiEventsRounded";
import LeaderboardRoundedIcon from "@mui/icons-material/LeaderboardRounded";
import { getXP, isDailyDone, isOnetimeDone, getTodayKey, completeMission } from "@/lib/xp-store";
import { getLevelFromXP, getXPProgressInLevel, MAX_LEVEL } from "@/lib/level";
import { MISSIONS, type Mission } from "@/lib/mission";
import { useXpSync } from "@/lib/hooks/use-xp-sync";

type MissionListProps = {
  contractCount?: number;
  hasNotification?: boolean;
};

export function MissionList({ contractCount: initialContractCount, hasNotification: initialHasNotification }: MissionListProps = {}) {
  const router = useRouter();

  // DB -> localStorage 동기화
  useXpSync();

  const [xp, setXp] = useState(0);
  const [dailyDone, setDailyDoneState] = useState(false);
  const [doneIds, setDoneIds] = useState<string[]>([]);
  const [contractCount, setContractCount] = useState(initialContractCount ?? 0);
  const [hasNotification, setHasNotification] = useState(initialHasNotification ?? false);
  const [inviteCount, setInviteCount] = useState(0);
  const [statusLoaded, setStatusLoaded] = useState(false);
  const [loadingMission, setLoadingMission] = useState<string | null>(null);

  const [todayKey, setTodayKey] = useState(() => getTodayKey());

  const refresh = () => {
    const key = getTodayKey();
    setTodayKey(key);
    setXp(getXP());
    setDailyDoneState(isDailyDone(key));
    setDoneIds(
      MISSIONS.filter((m) => m.type === "one_time" && isOnetimeDone(m.id)).map((m) => m.id),
    );
  };

  // XP 업데이트 이벤트 리스너 (syncFromServer 완료 시 갱신)
  useEffect(() => {
    const onXpUpdated = () => refresh();
    window.addEventListener("dday_xp_updated", onXpUpdated);
    return () => window.removeEventListener("dday_xp_updated", onXpUpdated);
  }, []);

  // 1회성 미션 조건 확인 API 호출
  useEffect(() => {
    const completedOneTime = MISSIONS.filter((m) => m.type === "one_time" && isOnetimeDone(m.id)).map((m) => m.id);
    const oneTimeIdsNeedStatus = ["first_contract", "three_contracts", "set_notification", "invite_1", "invite_3", "invite_5", "invite_10", "invite_20", "invite_30"];
    const needStatus = oneTimeIdsNeedStatus.some((id) => !completedOneTime.includes(id));
    if (!needStatus) {
      setStatusLoaded(true);
      refresh();
      return;
    }
    let cancelled = false;
    fetch("/api/missions/status")
      .then((res) => {
        if (!res.ok) throw new Error("status failed");
        return res.json();
      })
      .then((data: { contractCount: number; hasNotification: boolean; inviteCount: number }) => {
        if (!cancelled) {
          setContractCount(data.contractCount);
          setHasNotification(data.hasNotification);
          setInviteCount(data.inviteCount ?? 0);
          setStatusLoaded(true);
        }
      })
      .catch(() => setStatusLoaded(true))
      .finally(() => {
        if (!cancelled) refresh();
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (statusLoaded) refresh();
  }, [contractCount, hasNotification, statusLoaded]);

  // 탭 복귀 시 날짜 확인 (자정 리셋)
  useEffect(() => {
    const onVisible = () => {
      const key = getTodayKey();
      setTodayKey((prev) => {
        if (prev !== key) setDailyDoneState(isDailyDone(key));
        return key;
      });
    };
    if (typeof document !== "undefined") {
      document.addEventListener("visibilitychange", onVisible);
      return () => document.removeEventListener("visibilitychange", onVisible);
    }
  }, []);

  const handleStart = async (mission: Mission) => {
    // 이미 로딩 중이면 무시
    if (loadingMission) return;

    if (mission.type === "daily") {
      if (isDailyDone(todayKey)) return;
      setLoadingMission(mission.id);
      const result = await completeMission(mission.id);
      setLoadingMission(null);
      if (result.success) {
        setXp(result.totalXp);
        refresh();
      }
      return;
    }

    if (isOnetimeDone(mission.id)) return;

    // 조건 미충족 시 해당 페이지로 이동
    if (mission.id === "first_contract" && contractCount < 1) {
      router.push("/dashboard/contracts/new");
      return;
    }
    if (mission.id === "three_contracts" && contractCount < 3) {
      router.push("/dashboard/contracts/new");
      return;
    }
    if (mission.id === "set_notification" && !hasNotification) {
      router.push("/dashboard");
      return;
    }

    // 초대 미션: 조건 미충족 시 설정(공유) 페이지로
    const inviteMatch = mission.id.match(/^invite_(\d+)$/);
    if (inviteMatch) {
      const required = parseInt(inviteMatch[1], 10);
      if (inviteCount < required) {
        router.push("/dashboard/settings");
        return;
      }
    }

    // 조건 충족 → 서버에 완료 요청
    setLoadingMission(mission.id);
    const result = await completeMission(mission.id);
    setLoadingMission(null);
    if (result.success) {
      setXp(result.totalXp);
      refresh();
    }
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
    const inviteMatch = m.id.match(/^invite_(\d+)$/);
    if (inviteMatch) return inviteCount >= parseInt(inviteMatch[1], 10);
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

        {/* 업적 & 리더보드 바로가기 */}
        <Stack direction="row" spacing={1.5}>
          <Button
            variant="outlined"
            fullWidth
            startIcon={<EmojiEventsRoundedIcon />}
            onClick={() => router.push("/dashboard/achievements")}
            sx={{ borderRadius: 2, fontWeight: 700, py: 1.2 }}
          >
            업적
          </Button>
          <Button
            variant="outlined"
            fullWidth
            startIcon={<LeaderboardRoundedIcon />}
            onClick={() => router.push("/dashboard/leaderboard")}
            sx={{ borderRadius: 2, fontWeight: 700, py: 1.2 }}
          >
            리더보드
          </Button>
        </Stack>

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
                  loading={loadingMission === m.id}
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
                  loading={loadingMission === m.id}
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
  loading,
  onStart,
}: {
  mission: Mission;
  done: boolean;
  canClaim: boolean;
  loading: boolean;
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
          ) : loading ? (
            <CircularProgress size={24} sx={{ color: SKY_BLUE, flexShrink: 0 }} />
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
