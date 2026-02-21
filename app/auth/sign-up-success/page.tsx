import Link from "next/link";
import { Box, Button, Card, CardContent, Chip, Stack, Typography } from "@mui/material";
import MarkEmailReadRoundedIcon from "@mui/icons-material/MarkEmailReadRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";

export default function Page() {
  return (
    <Box
      sx={{
        minHeight: "100svh",
        px: 2.2,
        py: 3.2,
        background:
          "radial-gradient(85% 70% at 0% 0%, rgba(233,120,26,.22), rgba(233,120,26,0) 55%), radial-gradient(75% 60% at 100% 60%, rgba(78,104,152,.2), rgba(78,104,152,0) 52%), linear-gradient(180deg, #222035 0%, #1A1828 42%, #171523 100%)",
      }}
    >
      <Box sx={{ mx: "auto", width: "100%", maxWidth: 430 }}>
        <Card variant="outlined" sx={{ borderRadius: 4 }}>
          <CardContent sx={{ p: 2.6 }}>
            <Stack spacing={2.1} alignItems="center" textAlign="center">
              <Chip
                icon={<MarkEmailReadRoundedIcon />}
                label="SIGN UP SUCCESS"
                color="primary"
                variant="outlined"
                sx={{ fontWeight: 700 }}
              />

              <Box
                sx={{
                  width: 74,
                  height: 74,
                  borderRadius: "999px",
                  bgcolor: "primary.main",
                  color: "primary.contrastText",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <CheckCircleRoundedIcon sx={{ fontSize: 40 }} />
              </Box>

              <Box>
                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                  가입 완료!
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.8 }}>
                  이메일을 확인해 계정을 인증해 주세요.
                  <br />
                  인증 후 로그인할 수 있습니다.
                </Typography>
              </Box>

              <Button
                component={Link}
                href="/auth/login"
                variant="contained"
                size="large"
                fullWidth
              >
                로그인하기
              </Button>
            </Stack>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}
