"use client";

import { Avatar, Box, Card, CardContent, Stack, Typography } from "@mui/material";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";

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
    <Box sx={{ px: 2, py: 3.5 }}>
      <Stack spacing={2}>
        <Typography
          variant="caption"
          sx={{ color: "primary.main", fontWeight: 700, letterSpacing: "0.08em" }}
        >
          PROFILE
        </Typography>

        <Card variant="outlined" sx={{ borderRadius: 3 }}>
          <CardContent sx={{ p: 2.4 }}>
            <Stack direction="row" spacing={1.6} alignItems="center">
              <Avatar
                sx={{
                  width: 56,
                  height: 56,
                  bgcolor: "primary.main",
                  color: "primary.contrastText",
                }}
              >
                <PersonRoundedIcon />
              </Avatar>
              <Box>
                <Typography variant="h6" sx={{ fontSize: "1.08rem", fontWeight: 700 }}>
                  내 계정
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  계정 기본 정보와 활동 상태
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>

        <Card variant="outlined" sx={{ borderRadius: 3 }}>
          <CardContent sx={{ p: 2.3 }}>
            <InfoRow label="이메일" value={email || "정보 없음"} />
            <InfoRow label="가입일" value={formattedCreatedAt} />
            <InfoRow label="사용 상태" value="정상" isLast />
          </CardContent>
        </Card>
      </Stack>
    </Box>
  );
}

function InfoRow({
  label,
  value,
  isLast = false,
}: {
  label: string;
  value: string;
  isLast?: boolean;
}) {
  return (
    <Box
      sx={{
        py: 1.3,
        borderBottom: isLast ? "none" : (theme) => `1px solid ${theme.palette.divider}`,
      }}
    >
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="body1" sx={{ mt: 0.35 }}>
        {value}
      </Typography>
    </Box>
  );
}
