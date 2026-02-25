"use client";

import { createClient } from "@/lib/supabase/client";
import { toUserFriendlyMessage } from "@/lib/error-messages";
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
      setError(err instanceof Error ? toUserFriendlyMessage(err.message) : "로그인에 실패했습니다.");
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
    if (error) setError(toUserFriendlyMessage(error.message));
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
    if (error) setError(toUserFriendlyMessage(error.message));
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
        hideLogo
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
              {/* Google GSI Material Button: 공식 SVG 로고 + "Google로 로그인" */}
              <Box
                component="button"
                type="button"
                className="gsi-material-button"
                onClick={handleGoogleLogin}
                disabled={isLoading}
                sx={{ position: "relative" }}
              >
                <div className="gsi-material-button-state" aria-hidden />
                <div className="gsi-material-button-content-wrapper">
                  <div className="gsi-material-button-icon">
                    <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" style={{ display: "block" }}>
                      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                    </svg>
                  </div>
                  <span className="gsi-material-button-contents">Google로 로그인</span>
                </div>
              </Box>
              {/* 카카오 디자인 가이드: 컨테이너 #FEE500, 심볼 #000000, 레이블 #000 85%, radius 12px, 심볼+레이블 중앙 정렬 */}
              <Box
                component="button"
                type="button"
                className="kakao-login-button"
                onClick={handleKakaoLogin}
                disabled={isLoading}
                sx={{ position: "relative" }}
              >
                <div className="kakao-login-button-content-wrapper">
                  <div className="kakao-login-button-icon">
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: "block" }}>
                      <path
                        fill="#000000"
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M12 3C6.48 3 2 6.58 2 10.9c0 3.45 2.26 6.47 5.57 8.12-.3.98-1.1 3.6-1.1 3.6-.13.48.18.46.34.34.13-.1 2.02-1.96 2.8-2.8.38.14.78.24 1.2.24 5.52 0 10-3.58 10-7.9S17.52 3 12 3z"
                      />
                    </svg>
                  </div>
                  <span className="kakao-login-button-contents">카카오 로그인</span>
                </div>
              </Box>
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
