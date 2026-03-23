"use client";

import { Avatar, Box, Card, CardContent, Stack, Typography } from "@mui/material";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import { ProfileXpBlock } from "@/components/profile-xp-block";
import { ProfileStats } from "@/components/profile-stats";

type ProfileOverviewProps = {
  email: string;
  createdAt: string | null;
};

export function ProfileOverview({ email, createdAt }: ProfileOverviewProps) {
  const formattedCreatedAt = createdAt
    ? new Date(createdAt).toLocaleDateString("ko-KR", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "정보 없음";

  return (
    <Box sx={{ px: 2, pt: 3.5, pb: 14 }}>
      <Stack spacing={2.5}>
        <Typography variant="h5" fontWeight={700}>
          프로필
        </Typography>

        {/* 유저 정보 카드 */}
        <Card variant="outlined" sx={{ borderRadius: 2 }}>
          <CardContent sx={{ p: 3 }}>
            <Stack direction="row" spacing={2} alignItems="center">
              <Avatar
                sx={{
                  width: 56,
                  height: 56,
                  bgcolor: "grey.300",
                  color: "text.secondary",
                }}
              >
                <PersonRoundedIcon sx={{ fontSize: 30 }} />
              </Avatar>
              <ProfileXpBlock />
            </Stack>
          </CardContent>
          <CardContent sx={{ pt: 0 }}>
            <Stack spacing={2}>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  이메일
                </Typography>
                <Typography variant="body1" sx={{ mt: 0.25 }}>
                  {email || "정보 없음"}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  가입일
                </Typography>
                <Typography variant="body1" sx={{ mt: 0.25 }}>
                  {formattedCreatedAt}
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>

        {/* 통계/차트 */}
        <Typography variant="h6" fontWeight={700}>
          내 지출 리포트
        </Typography>
        <ProfileStats />
      </Stack>
    </Box>
  );
}
