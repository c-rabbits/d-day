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
import { LockKeyhole, Mail, ShieldCheck } from "lucide-react";

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
      setError(err instanceof Error ? err.message : "회원가입에 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("w-full max-w-[430px]", className)} {...props}>
      <AuthScreen
        title="회원가입"
        subtitle="계약 만료 알림을 받기 위한 개인 계정을 생성하세요."
        backHref="/"
        badge="CREATE ACCOUNT"
      >
        <form onSubmit={handleSignUp} className="flex flex-col gap-5">
          <div className="rounded-2xl border border-outline-variant/70 bg-surface-container-low/70 p-4">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <ShieldCheck className="h-4 w-4 text-primary" />
              안전한 계정 생성
            </div>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              인증 메일 확인 후 바로 로그인할 수 있습니다.
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
            <Label htmlFor="password" className="text-sm font-medium text-foreground">
              비밀번호
            </Label>
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

          <div className="grid gap-2.5">
            <Label htmlFor="repeat-password" className="text-sm font-medium text-foreground">
              비밀번호 확인
            </Label>
            <div className="relative">
              <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="repeat-password"
                type="password"
                required
                value={repeatPassword}
                onChange={(e) => setRepeatPassword(e.target.value)}
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
            {isLoading ? "가입 중…" : "회원가입"}
          </Button>

          <div className="relative my-1">
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-surface px-2 text-xs text-muted-foreground">
              이미 계정이 있으신가요?
            </span>
            <hr className="border-outline-variant" />
          </div>

          <Button asChild size="lg" variant="outline" className="w-full">
            <Link href="/auth/login">로그인</Link>
          </Button>
        </form>
      </AuthScreen>
    </div>
  );
}
