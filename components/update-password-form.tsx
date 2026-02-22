"use client";

import { createClient } from "@/lib/supabase/client";
import { AuthShellMui } from "@/components/auth-shell-mui";
import { useRouter } from "next/navigation";
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
import LockResetRoundedIcon from "@mui/icons-material/LockResetRounded";
import LockOutlineRoundedIcon from "@mui/icons-material/LockOutlineRounded";

export function UpdatePasswordForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      // Update this route to redirect to an authenticated route. The user already has an active session.
      router.push("/dashboard");
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box className={className} {...props}>
      <AuthShellMui
        title="새 비밀번호 설정"
        subtitle="안전한 비밀번호로 변경한 뒤 바로 서비스를 계속 사용할 수 있어요."
        backHref="/auth/login"
        badge="RESET PASSWORD"
      >
        <Box component="form" onSubmit={handleForgotPassword}>
          <Stack spacing={2.1}>
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
                <LockResetRoundedIcon fontSize="small" color="primary" />
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                  비밀번호 재설정
                </Typography>
              </Stack>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                새로운 비밀번호를 입력해 계정 보안을 유지하세요.
              </Typography>
            </Box>

            <TextField
                  id="password"
                  type="password"
                  label="새 비밀번호"
                  placeholder="새 비밀번호를 입력하세요"
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

            {error && <Alert severity="error">{error}</Alert>}

            <Button type="submit" variant="contained" size="large" disabled={isLoading}>
              {isLoading ? "저장 중…" : "새 비밀번호 저장"}
            </Button>
          </Stack>
        </Box>
      </AuthShellMui>
    </Box>
  );
}
