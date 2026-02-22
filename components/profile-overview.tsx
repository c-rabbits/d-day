"use client";

import { Avatar, Box, Card, CardContent, Grid, Stack, Typography } from "@mui/material";
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
      <Stack spacing={2.5}>
        <Box>
          <Typography variant="h5" fontWeight={700} gutterBottom>
            프로필
          </Typography>
          <Typography variant="body2" color="text.secondary">
            계정 기본 정보
          </Typography>
        </Box>

        <Card variant="outlined" sx={{ borderRadius: 2 }}>
          <CardContent sx={{ p: 3 }}>
            <Grid container spacing={3} alignItems="center">
              <Grid item>
                <Avatar
                  sx={{
                    width: 100,
                    height: 100,
                    bgcolor: "grey.300",
                    color: "text.secondary",
                  }}
                >
                  <PersonRoundedIcon sx={{ fontSize: 48 }} />
                </Avatar>
              </Grid>
              <Grid item xs>
                <Typography variant="h6" fontWeight={700}>
                  내 계정
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  이메일·가입일·상태
                </Typography>
              </Grid>
            </Grid>
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
              <Box>
                <Typography variant="caption" color="text.secondary">
                  사용 상태
                </Typography>
                <Typography variant="body1" sx={{ mt: 0.25 }}>
                  정상
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Stack>
    </Box>
  );
}
