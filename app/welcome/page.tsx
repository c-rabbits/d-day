import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CalendarClock } from "lucide-react";

export default function WelcomePage() {
  return (
    <main className="flex min-h-svh flex-col bg-gradient-to-b from-background to-[hsl(var(--gradient-end))]">
      <div className="flex flex-1 flex-col items-center justify-center px-8 py-12">
        <div className="mb-8 flex h-32 w-32 items-center justify-center rounded-full bg-primary/10">
          <CalendarClock className="h-16 w-16 text-primary" />
        </div>
        <h1 className="text-center text-2xl font-bold tracking-tight text-foreground">
          계약 만료를 한곳에서
        </h1>
        <p className="mt-3 max-w-[280px] text-center text-sm leading-relaxed text-muted-foreground">
          넷플릭스, 보험, gym까지. 만료일을 등록하고 알림 받으세요.
        </p>
        <div className="mt-10 flex w-full max-w-[320px] flex-col gap-3">
          <Button asChild size="lg" className="w-full font-semibold uppercase">
            <Link href="/auth/login">시작하기</Link>
          </Button>
          <Link
            href="/auth/login"
            className="text-center text-sm text-muted-foreground hover:text-foreground"
          >
            건너뛰기
          </Link>
        </div>
      </div>
    </main>
  );
}
