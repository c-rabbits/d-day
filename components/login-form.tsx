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
            <Button type="submit" variant="contained" fullWidth disabled={isLoading}>
              {isLoading ? "로그인 중…" : "로그인"}
            </Button>
            <Divider sx={{ my: 0.5 }}>또는</Divider>
            <Stack direction="row" spacing={1}>
              <Button variant="outlined" fullWidth disabled sx={{ textTransform: "none" }}>
                Google (준비 중)
              </Button>
              <Button
                variant="outlined"
                fullWidth
                disabled
                sx={{ textTransform: "none", borderColor: "#FEE500", color: "#191919", "&:disabled": { borderColor: "#FEE500", color: "#666" } }}
              >
                카카오 (준비 중)
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
