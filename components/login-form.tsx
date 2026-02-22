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

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      // Update this route to redirect to an authenticated route. The user already has an active session.
      router.push("/dashboard");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "로그인에 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box className={className} {...props}>
      <AuthShellMui
        title="로그인"
        subtitle="등록해 둔 계약과 알림 내역을 계속 관리하려면 로그인하세요."
        backHref="/"
        badge="WELCOME BACK"
      >
        <Box component="form" onSubmit={handleLogin}>
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
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                빠르게 시작하기
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                기존에 등록한 이메일과 비밀번호를 입력하면 바로 대시보드로 이동합니다.
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

            <Stack spacing={0.6}>
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                  비밀번호
                </Typography>
              <Link
                href="/auth/forgot-password"
                style={{ fontSize: 13, fontWeight: 600 }}
              >
                비밀번호 찾기
              </Link>
              </Box>

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
            </Stack>

            {error && <Alert severity="error">{error}</Alert>}

            <Button type="submit" variant="contained" size="large" disabled={isLoading}>
              {isLoading ? "로그인 중…" : "로그인"}
            </Button>

            <Divider sx={{ my: 0.2 }}>
              <Typography variant="caption" color="text.secondary">
                또는
              </Typography>
            </Divider>

            <Stack direction="row" spacing={1}>
              <Button
                variant="outlined"
                size="large"
                fullWidth
                disabled
                sx={{ textTransform: "none" }}
              >
                Google 로그인 (준비 중)
              </Button>
              <Button
                variant="outlined"
                size="large"
                fullWidth
                disabled
                sx={{
                  textTransform: "none",
                  borderColor: "#FEE500",
                  color: "#191919",
                  "&:disabled": { borderColor: "#FEE500", color: "#666" },
                }}
              >
                카카오 로그인 (준비 중)
              </Button>
            </Stack>

            <Divider sx={{ my: 0.2 }}>
              <Typography variant="caption" color="text.secondary">
                처음 방문하셨나요?
              </Typography>
            </Divider>

            <Button component={Link} href="/auth/sign-up" variant="outlined" size="large">
              회원가입
            </Button>
          </Stack>
        </Box>
      </AuthShellMui>
    </Box>
  );
}
