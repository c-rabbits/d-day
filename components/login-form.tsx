"use client";

import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthScreen } from "@/components/auth-screen";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { LockKeyhole, Mail } from "lucide-react";

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
    <div className={cn("w-full max-w-[430px]", className)} {...props}>
      <AuthScreen
        title="로그인"
        subtitle="등록해 둔 계약과 알림 내역을 계속 관리하려면 로그인하세요."
        backHref="/"
        badge="WELCOME BACK"
      >
        <form onSubmit={handleLogin} className="flex flex-col gap-5">
          <div className="rounded-2xl border border-outline-variant/70 bg-surface-container-low/70 p-4">
            <p className="text-sm font-medium text-foreground">빠르게 시작하기</p>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              기존에 등록한 이메일과 비밀번호를 입력하면 바로 대시보드로 이동합니다.
            </p>
          </div>

          <div className="grid gap-2.5">
            <Label htmlFor="email" className="text-sm font-medium text-foreground">
              이메일
            </Label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="example@gmail.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="grid gap-2.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-sm font-medium text-foreground">
                비밀번호
              </Label>
              <Link
                href="/auth/forgot-password"
                className="text-xs font-medium text-primary hover:underline"
              >
                비밀번호 찾기
              </Link>
            </div>
            <div className="relative">
              <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {error && (
            <p className="rounded-xl border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          )}

          <Button
            type="submit"
            size="lg"
            className="w-full font-semibold"
            disabled={isLoading}
          >
            {isLoading ? "로그인 중…" : "로그인"}
          </Button>

          <div className="relative my-1">
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-surface px-2 text-xs text-muted-foreground">
              처음 방문하셨나요?
            </span>
            <hr className="border-outline-variant" />
          </div>

          <Button asChild size="lg" variant="outline" className="w-full">
            <Link href="/auth/sign-up">회원가입</Link>
          </Button>
        </form>
      </AuthScreen>
    </div>
  );
}
