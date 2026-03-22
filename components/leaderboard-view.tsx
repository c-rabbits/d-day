"use client";

import { useState, useEffect } from "react";
import {
  Avatar,
  Box,
  Card,
  CardContent,
  Chip,
  Divider,
  Skeleton,
  Stack,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import EmojiEventsRoundedIcon from "@mui/icons-material/EmojiEventsRounded";
import { getLevelFromXP } from "@/lib/level";

type LeaderboardEntry = {
  rank: number;
  user_id: string;
  display_name: string;
  avatar_url: string;
  xp: number;
};

type LeaderboardData = {
  type: string;
  leaderboard: LeaderboardEntry[];
  myRank: { rank: number; xp: number } | null;
};

const RANK_COLORS: Record<number, string> = {
  1: "#FFC434",
  2: "#C0C0C0",
  3: "#CD7F32",
};

export function LeaderboardView() {
  const [tab, setTab] = useState<"all" | "weekly">("all");
  const [data, setData] = useState<LeaderboardData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchLeaderboard = (type: "all" | "weekly") => {
    setLoading(true);
    fetch(`/api/leaderboard?type=${type}`)
      .then((res) => res.json())
      .then((d) => setData(d))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchLeaderboard(tab);
  }, [tab]);

  return (
    <Box sx={{ px: 2, pt: 3.5, pb: 14 }}>
      <Stack spacing={2.5}>
        <Box>
          <Typography variant="h5" fontWeight={700} gutterBottom>
            리더보드
          </Typography>
        </Box>

        {/* 탭 */}
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          sx={{
            "& .MuiTab-root": { fontWeight: 700, fontSize: "0.9rem" },
          }}
        >
          <Tab label="전체 랭킹" value="all" />
          <Tab label="주간 랭킹" value="weekly" />
        </Tabs>

        {/* 리더보드 목록 */}
        {loading ? (
          <Stack spacing={1.5}>
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} variant="rounded" height={64} />
            ))}
          </Stack>
        ) : (
          <Stack spacing={1}>
            {data?.leaderboard.length === 0 && (
              <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ py: 4 }}>
                {tab === "weekly" ? "이번 주 활동한 유저가 없습니다." : "아직 데이터가 없습니다."}
              </Typography>
            )}

            {data?.leaderboard.map((entry) => (
              <RankCard key={entry.user_id} entry={entry} />
            ))}

            {/* 내 순위 */}
            {data?.myRank && (
              <>
                <Divider sx={{ my: 1 }}>
                  <Chip label="내 순위" size="small" />
                </Divider>
                <Card
                  variant="outlined"
                  sx={{
                    borderRadius: 2,
                    border: "2px solid",
                    borderColor: "primary.main",
                    bgcolor: "primary.50",
                  }}
                >
                  <CardContent sx={{ py: 1.5, px: 2 }}>
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <Typography
                        variant="h6"
                        fontWeight={700}
                        sx={{ minWidth: 36, textAlign: "center" }}
                      >
                        {data.myRank.rank}위
                      </Typography>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                          Lv.{getLevelFromXP(data.myRank.xp)}
                        </Typography>
                      </Box>
                      <Typography variant="subtitle2" fontWeight={700}>
                        {data.myRank.xp.toLocaleString()} XP
                      </Typography>
                    </Stack>
                  </CardContent>
                </Card>
              </>
            )}
          </Stack>
        )}
      </Stack>
    </Box>
  );
}

function RankCard({ entry }: { entry: LeaderboardEntry }) {
  const level = getLevelFromXP(entry.xp);
  const rankColor = RANK_COLORS[entry.rank];

  return (
    <Card variant="outlined" sx={{ borderRadius: 2 }}>
      <CardContent sx={{ py: 1.5, px: 2 }}>
        <Stack direction="row" alignItems="center" spacing={1.5}>
          {/* 순위 */}
          <Box sx={{ minWidth: 32, textAlign: "center" }}>
            {entry.rank <= 3 ? (
              <EmojiEventsRoundedIcon
                sx={{ fontSize: 24, color: rankColor }}
              />
            ) : (
              <Typography variant="body1" fontWeight={700} color="text.secondary">
                {entry.rank}
              </Typography>
            )}
          </Box>

          {/* 프로필 */}
          <Avatar
            src={entry.avatar_url || undefined}
            sx={{ width: 36, height: 36 }}
          >
            {entry.display_name[0]}
          </Avatar>

          {/* 이름 + 레벨 */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="body1" fontWeight={600} noWrap>
              {entry.display_name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Lv.{level}
            </Typography>
          </Box>

          {/* XP */}
          <Typography variant="subtitle2" fontWeight={700}>
            {entry.xp.toLocaleString()} XP
          </Typography>
        </Stack>
      </CardContent>
    </Card>
  );
}
