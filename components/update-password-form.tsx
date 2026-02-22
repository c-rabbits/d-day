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
        subtitle="새 비밀번호를 입력한 뒤 저장하세요."
        backHref="/auth/login"
      >
        <Box component="form" noValidate autoComplete="off" onSubmit={handleForgotPassword}>
          <Stack spacing={2.5}>
            <TextField
              autoFocus
              fullWidth
              label="새 비밀번호"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
