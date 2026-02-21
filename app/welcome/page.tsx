import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CalendarClock, CheckCircle2, Sparkles } from "lucide-react";
import { VectorHero } from "@/components/vector-hero";

export default function WelcomePage() {
  return (
    <main className="relative min-h-svh overflow-hidden px-6 py-10">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_0%_20%,hsl(var(--primary)/0.16),transparent_42%),radial-gradient(circle_at_100%_100%,hsl(var(--secondary)/0.13),transparent_35%)]" />
      <div className="relative mx-auto flex w-full max-w-mobile flex-col gap-7">
        <div className="inline-flex w-fit items-center gap-2 rounded-full border border-outline-variant bg-surface/80 px-3 py-1 text-xs text-muted-foreground">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          한 번 등록하면 끝까지 챙겨주는 디데이
        </div>

        <div>
          <h1 className="text-[2.1rem] font-bold tracking-tight text-foreground">
            계약 만료를,
            <br />
            한곳에서 보기 쉽게
          </h1>
          <p className="mt-3 text-[0.95rem] leading-relaxed text-muted-foreground">
            넷플릭스, 보험, 헬스장 멤버십까지. 만료일을 모아보고 필요한 시점에
            알림을 받아보세요.
          </p>
        </div>

        <VectorHero />

        <div className="grid gap-3 rounded-2xl border border-outline-variant/70 bg-surface/80 p-5">
          {[
            "카테고리별로 계약을 정리해 한눈에 확인",
            "D-day 중심으로 만료 임박 계약 자동 정렬",
            "원하는 시점(D-30, D-7, D-1) 알림 설정",
          ].map((item) => (
            <div key={item} className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 h-4 w-4 text-primary" />
              <p className="text-[0.95rem] text-muted-foreground">{item}</p>
            </div>
          ))}
        </div>

        <div className="mt-1 flex flex-col gap-3.5 pb-6">
          <Button asChild size="lg" className="w-full">
            <Link href="/auth/login">
              <CalendarClock className="h-4 w-4" />
              시작하기
            </Link>
          </Button>
          <Link href="/" className="text-center text-sm text-muted-foreground hover:text-foreground">
            홈으로 돌아가기
          </Link>
        </div>
      </div>
    </main>
  );
}
