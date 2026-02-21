import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Suspense } from "react";
import { BellRing, LayoutDashboard, Sparkles } from "lucide-react";
import { VectorHero } from "@/components/vector-hero";

async function HomeContent() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    return (
      <main className="relative min-h-screen overflow-hidden px-6 py-10">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_10%_0%,hsl(var(--primary)/0.14),transparent_40%),radial-gradient(circle_at_100%_50%,hsl(var(--secondary)/0.12),transparent_35%)]" />
        <div className="relative mx-auto flex w-full max-w-mobile flex-col gap-5">
          <section className="glass-panel rounded-[1.75rem] p-6">
            <p className="text-sm text-muted-foreground">이미 로그인되어 있어요</p>
            <h1 className="mt-2 text-2xl font-bold">바로 대시보드로 이동할까요?</h1>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              오늘 기준 만료 임박 계약과 등록 내역을 한 번에 확인할 수 있습니다.
            </p>
            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <Button asChild className="w-full sm:w-auto">
                <Link href="/dashboard">
                  대시보드로 이동
                  <LayoutDashboard className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full sm:w-auto">
                <Link href="/welcome">앱 소개 보기</Link>
              </Button>
            </div>
          </section>
          <VectorHero variant="compact" />
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden px-6 py-8">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_0%_0%,hsl(var(--primary)/0.14),transparent_38%),radial-gradient(circle_at_100%_100%,hsl(var(--secondary)/0.15),transparent_32%)]" />
      <div className="relative mx-auto flex w-full max-w-mobile flex-col gap-6">
        <section className="space-y-4 pt-2">
          <span className="inline-flex items-center gap-2 rounded-full border border-outline-variant bg-surface/80 px-3 py-1 text-xs font-medium text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            계약 만료 알림을 더 똑똑하게
          </span>
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-foreground">
              디데이
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              내가 맺은 계약의 끝을 대신 기억해주는 앱. 등록부터 알림까지, 중요한
              날짜를 놓치지 않게 도와드려요.
            </p>
          </div>
        </section>

        <VectorHero />

        <div className="grid gap-2.5">
          <Button asChild size="lg" className="w-full">
            <Link href="/auth/login">
              로그인하고 시작하기
              <ArrowRightIcon />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="w-full">
            <Link href="/auth/sign-up">회원가입</Link>
          </Button>
          <Link
            href="/welcome"
            className="text-center text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            먼저 앱 소개 보기
          </Link>
        </div>

        <section className="grid gap-2.5 pb-8">
          {[
            {
              title: "등록은 간단하게",
              desc: "계약 종류를 고르고 필수 정보만 입력하면 끝나요.",
              icon: <LayoutDashboard className="h-4 w-4 text-primary" />,
            },
            {
              title: "만료일 리마인드",
              desc: "D-30, D-7, D-1 등 원하는 시점에 알림을 설정할 수 있어요.",
              icon: <BellRing className="h-4 w-4 text-primary" />,
            },
          ].map((item) => (
            <article
              key={item.title}
              className="rounded-2xl border border-outline-variant/70 bg-surface/80 p-4 backdrop-blur"
            >
              <div className="mb-2 flex items-center gap-2 text-sm font-semibold">
                {item.icon}
                {item.title}
              </div>
              <p className="text-xs leading-relaxed text-muted-foreground">{item.desc}</p>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}

export default function HomePage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center p-6">
          로딩 중…
        </main>
      }
    >
      <HomeContent />
    </Suspense>
  );
}

function ArrowRightIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </svg>
  );
}
