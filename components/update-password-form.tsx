"use client";

import { createClient } from "@/lib/supabase/client";
import { AuthShellMui } from "@/components/auth-shell-mui";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Alert, Box, Button, Stack, TextField } from "@mui/material";

export function UpdatePasswordForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password !== passwordConfirm) {
      setError("새 비밀번호가 일치하지 않습니다.");
      return;
    }
    if (password.length < 6) {
      setError("새 비밀번호는 6자 이상이어야 합니다.");
      return;
    }

    const supabase = createClient();
    setIsLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.email) {
        throw new Error("로그인 정보를 찾을 수 없습니다.");
      }
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword,
      });
      if (signInError) {
        throw new Error("현재 비밀번호가 올바르지 않습니다.");
      }
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) throw updateError;
      router.push("/dashboard");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "비밀번호 변경에 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box className={className} {...props}>
      <AuthShellMui
        title="비밀번호 변경"
        subtitle="현재 비밀번호를 입력한 뒤 새 비밀번호로 변경하세요."
        backHref="/dashboard/settings"
        hideLogo
      >
        <Box component="form" noValidate autoComplete="off" onSubmit={handleSubmit}>
          <Stack spacing={2.5}>
            <TextField
              autoFocus
              fullWidth
              label="현재 비밀번호"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
            <TextField
              fullWidth
              label="새 비밀번호"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <TextField
              fullWidth
              label="비밀번호 확인"
              type="password"
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
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
              {isLoading ? "저장 중…" : "저장"}
            </Button>
          </Stack>
        </Box>
      </AuthShellMui>
    </Box>
  );
}
