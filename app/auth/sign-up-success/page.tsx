import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";

export default function Page() {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center bg-gradient-to-b from-background to-[hsl(var(--gradient-end))] px-6">
      <div className="flex w-full max-w-[360px] flex-col items-center">
        <div className="relative">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary">
            <CheckCircle2 className="h-10 w-10 text-primary-foreground" />
          </div>
          <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-primary/60" />
          <span className="absolute -bottom-1 -left-2 h-2 w-2 rounded-full bg-primary/40" />
        </div>
        <h1 className="mt-6 text-xl font-bold text-foreground">
          가입 완료!
        </h1>
        <p className="mt-2 text-center text-sm leading-relaxed text-muted-foreground">
          이메일을 확인해 계정을 인증해 주세요.
          <br />
          인증 후 로그인할 수 있습니다.
        </p>
        <Button asChild size="lg" className="mt-8 w-full font-semibold uppercase">
          <Link href="/auth/login">로그인하기</Link>
        </Button>
      </div>
    </main>
  );
}
