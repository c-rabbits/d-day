import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Suspense } from "react";

async function HomeContent() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-6 p-6 bg-gradient-to-b from-background to-[hsl(var(--gradient-end))]">
        <p className="text-muted-foreground text-sm opacity-0 animate-fade-in">이미 로그인되었습니다.</p>
        <Button asChild className="opacity-0 animate-fade-in-up [animation-delay:0.1s] [animation-fill-mode:forwards] transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98]">
          <Link href="/dashboard">대시보드로 이동</Link>
        </Button>
      </main>
    );
  }
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 p-6 bg-gradient-to-b from-background to-[hsl(var(--gradient-end))]">
      <div className="text-center opacity-0 animate-fade-in-up">
        <h1 className="text-3xl font-bold tracking-tight">디데이</h1>
        <p className="text-muted-foreground mt-2">
          내가 맺은 계약의 끝을 대신 기억해주는 앱
        </p>
      </div>
      <div className="flex gap-3 opacity-0 animate-fade-in-up [animation-delay:0.15s] [animation-fill-mode:forwards]">
        <Button asChild className="transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98]">
          <Link href="/auth/login">로그인</Link>
        </Button>
        <Button asChild variant="outline" className="transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98]">
          <Link href="/auth/sign-up">회원가입</Link>
        </Button>
      </div>
    </main>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={<main className="flex min-h-screen items-center justify-center p-6">로딩 중…</main>}>
      <HomeContent />
    </Suspense>
  );
}
