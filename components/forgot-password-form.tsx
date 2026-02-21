"use client";

import { createClient } from "@/lib/supabase/client";
import { AuthShellMui } from "@/components/auth-shell-mui";
import Link from "next/link";
import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import MailOutlineRoundedIcon from "@mui/icons-material/MailOutlineRounded";

export function ForgotPasswordForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/update-password`,
      });
      if (error) throw error;
      setSuccess(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "요청에 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box className={className} {...props}>
      <AuthShellMui
        title="비밀번호 찾기"
        subtitle="가입한 이메일로 재설정 링크를 보내드립니다"
        backHref="/auth/login"
        badge="RECOVERY"
      >
        {success ? (
          <Stack spacing={2.2} alignItems="center" sx={{ py: 1.5 }}>
            <Box
              sx={{
                width: 68,
                height: 68,
                borderRadius: "999px",
                bgcolor: "primary.main",
                color: "primary.contrastText",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <CheckCircleRoundedIcon sx={{ fontSize: 36 }} />
            </Box>
            <Box sx={{ textAlign: "center" }}>
              <Typography variant="h6" sx={{ fontWeight: 700, fontSize: "1.15rem" }}>
                이메일을 확인하세요
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.8 }}>
                비밀번호 재설정 링크를 보냈습니다. 이메일을 확인해 주세요.
              </Typography>
            </Box>
            <Button component={Link} href="/auth/login" variant="contained" size="large" fullWidth>
              로그인으로 돌아가기
            </Button>
          </Stack>
        ) : (
          <Box component="form" onSubmit={handleForgotPassword}>
            <Stack spacing={2}>
              <Typography variant="body2" color="text.secondary">
                가입한 이메일을 입력하면 비밀번호 재설정 링크를 보내드려요.
              </Typography>

              <TextField
                id="email"
                type="email"
                label="이메일"
                placeholder="example@gmail.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <MailOutlineRoundedIcon fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              />

              {error && <Alert severity="error">{error}</Alert>}

              <Button type="submit" variant="contained" size="large" disabled={isLoading}>
                {isLoading ? "전송 중…" : "재설정 링크 보내기"}
              </Button>

              <Typography variant="body2" color="text.secondary" textAlign="center">
                계정이 있으신가요?{" "}
                <Link href="/auth/login" style={{ fontWeight: 700 }}>
                  로그인
                </Link>
              </Typography>
            </Stack>
          </Box>
        )}
      </AuthShellMui>
    </Box>
  );
}
