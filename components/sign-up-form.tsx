"use client";

import { createClient } from "@/lib/supabase/client";
import { toUserFriendlyMessage } from "@/lib/error-messages";
import { AuthShellMui } from "@/components/auth-shell-mui";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Alert, Box, Button, Divider, Stack, TextField, Typography } from "@mui/material";

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
      setError(err instanceof Error ? toUserFriendlyMessage(err.message) : "회원가입에 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKakaoSignUp = async () => {
    const supabase = createClient();
    setError(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "kakao",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        scopes: "profile_nickname profile_image",
      },
    });
    if (error) setError(toUserFriendlyMessage(error.message));
  };

  return (
    <Box className={className} {...props}>
      <AuthShellMui
        title="회원가입"
        subtitle="계약 만료 알림을 받기 위한 계정을 만드세요."
        backHref="/"
        hideLogo
      >
        <Box component="form" noValidate autoComplete="off" onSubmit={handleSignUp}>
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
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <TextField
              fullWidth
              label="비밀번호 확인"
              type="password"
              value={repeatPassword}
              onChange={(e) => setRepeatPassword(e.target.value)}
              required
            />

            {error && <Alert severity="error">{error}</Alert>}

            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={isLoading}
              sx={{ justifyContent: "center", py: 1.75, minHeight: 48 }}
            >
              {isLoading ? "가입 중…" : "회원가입"}
            </Button>

            <Divider sx={{ my: 0.5 }}>또는</Divider>
            <Button
              type="button"
              variant="outlined"
              fullWidth
              onClick={handleKakaoSignUp}
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
              카카오로 시작하기
            </Button>

            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 0.5, flexWrap: "wrap" }}>
              <Typography variant="body2" color="text.secondary">
                이미 계정이 있으신가요?
              </Typography>
              <Typography component={Link} href="/auth/login" color="primary" fontWeight={600}>
                로그인
              </Typography>
            </Box>
          </Stack>
        </Box>
      </AuthShellMui>
    </Box>
  );
}
