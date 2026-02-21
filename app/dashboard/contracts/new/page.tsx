import { ContractNewFlow } from "@/components/contract-new-flow";
import { Sparkles } from "lucide-react";

export default function NewContractPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-6">
      <section className="mb-6 rounded-2xl border border-outline-variant/70 bg-surface/80 p-5 backdrop-blur">
        <p className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.14em] text-primary">
          <Sparkles className="h-3.5 w-3.5" />
          NEW CONTRACT
        </p>
        <h1 className="mt-2 text-3xl font-bold leading-tight text-foreground">
          계약을 단계별로 등록해보세요
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          카테고리 선택 → 정보 입력 → 알림 설정 순서로 진행됩니다. 필요한 정보만
          큼직하게 보여드려서 빠르게 등록할 수 있어요.
        </p>
      </section>
      <ContractNewFlow />
    </div>
  );
}
