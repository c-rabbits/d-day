import Link from "next/link";
import { Box, Button, Card, CardContent, Stack, Typography } from "@mui/material";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";

export default function Page() {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100dvh",
        p: 2.5,
        bgcolor: "grey.50",
      }}
    >
      <Card sx={{ width: "100%", maxWidth: 450 }}>
        <CardContent sx={{ p: { xs: 2.5, sm: 4 }, textAlign: "center" }}>
          <Box
            sx={{
              width: 64,
              height: 64,
              borderRadius: "50%",
              bgcolor: "primary.main",
              color: "primary.contrastText",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mx: "auto",
              mb: 2,
            }}
          >
            <CheckCircleRoundedIcon sx={{ fontSize: 36 }} />
          </Box>
          <Typography variant="h5" fontWeight={700} gutterBottom>
            가입 완료
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            이메일을 확인해 계정을 인증해 주세요. 인증 후 로그인할 수 있습니다.
          </Typography>
          <Link href="/auth/login" style={{ display: "block", width: "100%" }}>
            <Button variant="contained" fullWidth>
              로그인
            </Button>
          </Link>
        </CardContent>
      </Card>
    </Box>
  );
}
