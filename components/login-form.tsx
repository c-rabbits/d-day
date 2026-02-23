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
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

export function LoginForm(props: React.ComponentPropsWithoutRef<"div">) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      router.push("/dashboard");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "로그인에 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKakaoLogin = async () => {
    const supabase = createClient();
    setError(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "kakao",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        // account_email 미요청(비즈앱 전용). 동의 항목은 profile_nickname, profile_image만 사용.
        scopes: "profile_nickname profile_image",
      },
    });
    if (error) setError(error.message);
  };

  const handleGoogleLogin = async () => {
    const supabase = createClient();
    setError(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) setError(error.message);
  };

  const socialButtonSx = {
    justifyContent: "center",
    py: 1.75,
    minHeight: 48,
    textTransform: "none" as const,
    fontWeight: 600,
    fontSize: "1rem",
  };

  return (
    <Box {...props}>
      <AuthShellMui
        title="로그인"
        subtitle="계정에 로그인하여 계약과 알림을 관리하세요."
        backHref="/"
      >
        <Box component="form" noValidate autoComplete="off" onSubmit={handleLogin}>
          <Stack spacing={2.5}>
            <TextField
              autoFocus
              fullWidth
              label="이메일"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <TextField
              fullWidth
              label="비밀번호"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      size="small"
                      edge="end"
                      onClick={() => setShowPassword((s) => !s)}
                      onMouseDown={(e) => e.preventDefault()}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
              <Typography component={Link} href="/auth/forgot-password" variant="body2" color="primary">
                비밀번호 찾기
              </Typography>
            </Box>
            {error && <Alert severity="error">{error}</Alert>}
            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={isLoading}
              sx={{ justifyContent: "center", py: 1.75, minHeight: 48 }}
            >
              {isLoading ? "로그인 중…" : "로그인"}
            </Button>
            <Divider sx={{ my: 0.5 }}>또는</Divider>
            <Stack spacing={1.5}>
              {/* Google 공식 가이드: Light theme, stroke #747775, "Google로 로그인" */}
              <Button
                variant="outlined"
                fullWidth
                onClick={handleGoogleLogin}
                disabled={isLoading}
                startIcon={
                  <Box component="span" sx={{ display: "flex", alignItems: "center" }}>
                    <svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <path d="M19.6 10.23c0-.82-.1-1.42-.25-2.05H10v3.72h5.5c-.15.96-.74 2.31-2.04 3.22v2.45h3.16c1.89-1.73 2.98-4.3 2.98-7.34z" fill="#4285F4" />
                      <path d="M13.25 17.92c-.25-.15-.78-.5-1.44-.5-1.22 0-2.15 1-2.49 2.5H7.03v2.32c1.71.85 3.89 1.34 5.22 1.34 1.3 0 2.4-.43 3.33-1.22l-2.33-2.32z" fill="#34A853" />
                      <path d="M10 18.75c1.7 0 3.13-.57 4.27-1.55l-2.33-2.32c-.62.42-1.42.7-2.44.7-1.88 0-3.48-1.27-4.05-3H2.6v2.4c1.18 2.34 3.6 3.9 6.4 3.9z" fill="#FBBC05" />
                      <path d="M5.95 13.58c-.18-.53-.28-1.1-.28-1.69 0-.6.1-1.17.28-1.69V9.2H2.6C2 10.23 1.67 11.4 1.67 12.69s.33 2.46.93 3.49l2.35-1.84z" fill="#EA4335" />
                    </svg>
                  </Box>
                }
                sx={{
                  ...socialButtonSx,
                  borderColor: "#dadce0",
                  color: "#3c4043",
                  backgroundColor: "#fff",
                  borderRadius: "12px",
                  "&:hover": {
                    borderColor: "#dadce0",
                    backgroundColor: "rgba(0,0,0,0.04)",
                  },
                }}
              >
                Google로 로그인
              </Button>
              {/* 카카오 공식 가이드: 배경 #FEE500, 심볼·텍스트 #000, radius 12px, 문구 "카카오 로그인" */}
              <Button
                variant="outlined"
                fullWidth
                onClick={handleKakaoLogin}
                disabled={isLoading}
                startIcon={
                  <Box component="span" sx={{ display: "flex", alignItems: "center" }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 3C6.48 3 2 6.58 2 10.9c0 3.45 2.26 6.47 5.57 8.12-.3.98-1.1 3.6-1.1 3.6-.13.48.18.46.34.34.13-.1 2.02-1.96 2.8-2.8.38.14.78.24 1.2.24 5.52 0 10-3.58 10-7.9S17.52 3 12 3z" fill="#000" />
                    </svg>
                  </Box>
                }
                sx={{
                  ...socialButtonSx,
                  border: "none",
                  borderColor: "#FEE500",
                  color: "rgba(0,0,0,0.85)",
                  backgroundColor: "#FEE500",
                  borderRadius: "12px",
                  "&:hover": {
                    backgroundColor: "#FDD835",
                  },
                }}
              >
                카카오 로그인
              </Button>
            </Stack>
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 0.5, flexWrap: "wrap" }}>
              <Typography variant="body2" color="text.secondary">
                처음이신가요?
              </Typography>
              <Typography component={Link} href="/auth/sign-up" color="primary" fontWeight={600}>
                회원가입
              </Typography>
            </Box>
          </Stack>
        </Box>
      </AuthShellMui>
    </Box>
  );
}
