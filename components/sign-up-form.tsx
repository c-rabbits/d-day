"use client";

import { createClient } from "@/lib/supabase/client";
import { AuthShellMui } from "@/components/auth-shell-mui";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  Divider,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import MailOutlineRoundedIcon from "@mui/icons-material/MailOutlineRounded";
import LockOutlineRoundedIcon from "@mui/icons-material/LockOutlineRounded";
import ShieldRoundedIcon from "@mui/icons-material/ShieldRounded";

export function SignUpForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    if (password !== repeatPassword) {
      setError("비밀번호가 일치하지 않습니다.");
      setIsLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/protected`,
        },
      });
      if (error) throw error;
      router.push("/auth/sign-up-success");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "회원가입에 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box className={className} {...props}>
      <AuthShellMui
        title="회원가입"
        subtitle="계약 만료 알림을 받기 위한 개인 계정을 생성하세요."
        backHref="/"
        badge="CREATE ACCOUNT"
      >
        <Box component="form" onSubmit={handleSignUp}>
          <Stack spacing={2}>
            <Box
              sx={{
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 3,
                bgcolor: "background.default",
                p: 1.8,
              }}
            >
              <Stack direction="row" spacing={0.8} alignItems="center">
                <ShieldRoundedIcon fontSize="small" color="primary" />
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                  안전한 계정 생성
                </Typography>
              </Stack>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                인증 메일 확인 후 바로 로그인할 수 있습니다.
              </Typography>
            </Box>

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

            <TextField
                id="password"
                type="password"
                label="비밀번호"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockOutlineRoundedIcon fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              />

            <TextField
                id="repeat-password"
                type="password"
                label="비밀번호 확인"
                required
                value={repeatPassword}
                onChange={(e) => setRepeatPassword(e.target.value)}
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockOutlineRoundedIcon fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              />

            {error && <Alert severity="error">{error}</Alert>}

            <Button type="submit" variant="contained" size="large" disabled={isLoading}>
              {isLoading ? "가입 중…" : "회원가입"}
            </Button>

            <Divider sx={{ my: 0.2 }}>
              <Typography variant="caption" color="text.secondary">
                이미 계정이 있으신가요?
              </Typography>
            </Divider>

            <Button component={Link} href="/auth/login" variant="outlined" size="large">
              로그인
            </Button>
          </Stack>
        </Box>
      </AuthShellMui>
    </Box>
  );
}
