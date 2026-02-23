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
      },
    });
    if (error) setError(error.message);
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
            <Stack direction="row" spacing={1}>
              <Button
                variant="outlined"
                fullWidth
                disabled
                sx={{ textTransform: "none", justifyContent: "center", py: 1.75, minHeight: 48 }}
              >
                Google (준비 중)
              </Button>
              <Button
                variant="outlined"
                fullWidth
                onClick={handleKakaoLogin}
                disabled={isLoading}
                sx={{
                  textTransform: "none",
                  borderColor: "#FEE500",
                  color: "#191919",
                  backgroundColor: "#FEE500",
                  "&:hover": {
                    borderColor: "#FDD835",
                    backgroundColor: "#FDD835",
                  },
                  justifyContent: "center",
                  py: 1.75,
                  minHeight: 48,
                }}
              >
                카카오로 로그인
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
