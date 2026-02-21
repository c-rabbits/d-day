import Link from "next/link";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Stack,
  Typography,
} from "@mui/material";
import ErrorOutlineRoundedIcon from "@mui/icons-material/ErrorOutlineRounded";
import { Suspense } from "react";

async function ErrorContent({
  searchParams,
}: {
  searchParams: Promise<{ error: string }>;
}) {
  const params = await searchParams;

  return (
    <>
      {params?.error ? (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.8 }}>
          오류 코드: {params.error}
        </Typography>
      ) : (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.8 }}>
          확인되지 않은 오류가 발생했습니다.
        </Typography>
      )}
    </>
  );
}

export default function Page({
  searchParams,
}: {
  searchParams: Promise<{ error: string }>;
}) {
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
            <Stack spacing={2}>
              <Chip
                icon={<ErrorOutlineRoundedIcon />}
                label="AUTH ERROR"
                color="error"
                variant="outlined"
                sx={{ alignSelf: "flex-start", fontWeight: 700 }}
              />
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                인증 중 문제가 발생했어요
              </Typography>
              <Suspense
                fallback={
                  <Typography variant="body2" color="text.secondary">
                    오류 정보를 확인하는 중...
                  </Typography>
                }
              >
                <ErrorContent searchParams={searchParams} />
              </Suspense>
              <Button component={Link} href="/auth/login" variant="contained" size="large">
                로그인 화면으로 이동
              </Button>
            </Stack>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}
