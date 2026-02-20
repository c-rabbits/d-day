"use client";

import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthScreen } from "@/components/auth-screen";
import Link from "next/link";
import { useState } from "react";
import { CheckCircle2 } from "lucide-react";

export function ForgotPasswordForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/update-password`,
      });
      if (error) throw error;
      setSuccess(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "요청에 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("w-full max-w-[430px]", className)} {...props}>
      <AuthScreen
        title="비밀번호 찾기"
        subtitle="가입한 이메일로 재설정 링크를 보내드립니다"
        backHref="/auth/login"
      >
        {success ? (
          <div className="flex flex-col items-center gap-6 py-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <CheckCircle2 className="h-10 w-10 text-primary" />
            </div>
            <div className="text-center">
              <h2 className="font-semibold text-foreground">이메일을 확인하세요</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                비밀번호 재설정 링크를 보냈습니다. 이메일을 확인해 주세요.
              </p>
            </div>
            <Button asChild className="w-full font-semibold uppercase">
              <Link href="/auth/login">로그인으로 돌아가기</Link>
            </Button>
          </div>
        ) : (
          <form onSubmit={handleForgotPassword} className="flex flex-col gap-5">
            <div className="grid gap-2">
              <Label
                htmlFor="email"
                className="text-xs font-medium uppercase tracking-wide text-muted-foreground"
              >
                이메일
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="example@gmail.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-[hsl(var(--input))] border-0"
              />
            </div>
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
            <Button
              type="submit"
              className="w-full font-semibold uppercase tracking-wide"
              disabled={isLoading}
            >
              {isLoading ? "전송 중…" : "재설정 링크 보내기"}
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              계정이 있으신가요?{" "}
              <Link
                href="/auth/login"
                className="font-medium text-primary hover:underline"
              >
                로그인
              </Link>
            </p>
          </form>
        )}
      </AuthScreen>
    </div>
  );
}
