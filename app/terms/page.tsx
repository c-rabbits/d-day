"use client";

import { useRouter } from "next/navigation";
import { Button, Container, Typography } from "@mui/material";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";

export default function TermsPage() {
  const router = useRouter();
  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Button
        startIcon={<ArrowBackRoundedIcon />}
        onClick={() => router.back()}
        sx={{ mb: 2 }}
      >
        이전으로
      </Button>
      <Typography variant="h5" fontWeight={700} gutterBottom>
        서비스 이용약관
      </Typography>
      <Typography color="text.secondary">
        서비스 이용약관 내용은 정식 오픈 시 제공될 예정입니다.
      </Typography>
    </Container>
  );
}
