"use client";

import { useEffect, useState, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import {
  CATEGORY_LABELS,
  CONTRACT_CATEGORIES,
  NOTIFY_DAYS_OPTIONS,
  type ContractCategory,
  type NotifyDaysBefore,
} from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import AddPhotoAlternateRoundedIcon from "@mui/icons-material/AddPhotoAlternateRounded";
import DashboardRoundedIcon from "@mui/icons-material/DashboardRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import NotificationsActiveRoundedIcon from "@mui/icons-material/NotificationsActiveRounded";

const STEPS = [
  {
    title: "카테고리 선택",
    description: "어떤 종류의 계약인지 먼저 고르면 이후 입력이 더 쉬워집니다.",
  },
  {
    title: "세부 정보 입력",
    description: "계약명, 기간, 금액을 큼직한 입력칸으로 채워 주세요.",
  },
  {
    title: "알림 시점 설정",
    description: "만료 전에 받고 싶은 알림 시점을 선택해 마무리합니다.",
  },
] as const;

const STEP_ICONS = [DashboardRoundedIcon, EditRoundedIcon, NotificationsActiveRoundedIcon] as const;

const CATEGORY_META: Record<ContractCategory, { emoji: string; hint: string }> = {
  RENT: { emoji: "🏠", hint: "월세·전세, 관리비 계약" },
  PHONE: { emoji: "📱", hint: "휴대폰 약정, 통신 요금제" },
  CAR_INSURANCE: { emoji: "🚗", hint: "자동차 보험, 특약 갱신" },
  GYM: { emoji: "💪", hint: "헬스장·필라테스·수강권" },
  RENTAL: { emoji: "📦", hint: "정수기·가전 렌탈 계약" },
  STREAMING: { emoji: "▶️", hint: "OTT·음악·콘텐츠 구독" },
  OTHER: { emoji: "📄", hint: "기타 정기 결제/계약" },
};

type InputMode = "direct" | "photo";

/** Google Vision API 기반 OCR (서버 /api/ocr 호출) */
async function extractFromImage(file: File): Promise<{
  title: string;
  start_date: string;
  end_date: string;
  amount: string;
}> {
  const formData = new FormData();
  formData.append("image", file);
  const res = await fetch("/api/ocr", {
    method: "POST",
    body: formData,
  });
  const data = await res.json();
  // API 호출 확인용 (개발 시 브라우저 콘솔에서 확인)
  console.log("[OCR] status:", res.status, "response:", data);
  if (!res.ok) {
    throw new Error(data.error ?? "OCR 요청 실패");
  }
  return {
    title: data.title ?? "",
    start_date: data.start_date ?? "",
    end_date: data.end_date ?? "",
    amount: data.amount ?? "",
  };
}

export function ContractNewFlow() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [category, setCategory] = useState<ContractCategory | null>(null);
  const [title, setTitle] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [amount, setAmount] = useState("");
  const [memo, setMemo] = useState("");
  const [notifyDays, setNotifyDays] = useState<NotifyDaysBefore[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [inputMode, setInputMode] = useState<InputMode>("direct");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const progress = ((step + 1) / STEPS.length) * 100;

  const canMoveNextStepOne = Boolean(category);
  const canMoveNextStepTwo = Boolean(title.trim() && startDate && endDate);
  const canMoveNext =
    step === 0 ? canMoveNextStepOne : step === 1 ? canMoveNextStepTwo : true;

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const toggleNotify = (d: NotifyDaysBefore) => {
    setNotifyDays((prev) =>
      prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d],
    );
  };

  const handleNext = () => {
    if (step === 0 && !category) {
      setError("카테고리를 먼저 선택해 주세요.");
      return;
    }
    if (step === 1 && !canMoveNextStepTwo) {
      setError("계약명, 시작일, 만료일은 필수입니다.");
      return;
    }
    setError(null);
    if (step < 2) setStep(step + 1);
  };

  const handleBack = () => {
    setError(null);
    if (step > 0) setStep(step - 1);
  };

  const handlePhotoChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPhotoFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setError(null);
  };

  const handleExtract = async () => {
    if (!photoFile) return;
    setIsExtracting(true);
    setError(null);
    try {
      const result = await extractFromImage(photoFile);
      console.log("[OCR] 폼에 넣을 값:", result);
      setTitle(result.title);
      setStartDate(result.start_date);
      setEndDate(result.end_date);
      setAmount(result.amount);
    } catch (e) {
      console.error("[OCR] 실패:", e);
      setError("추출에 실패했습니다. 직접 입력해 주세요.");
    } finally {
      setIsExtracting(false);
    }
  };

  const handleSubmit = async () => {
    setError(null);
    if (!category || !title.trim() || !startDate || !endDate) {
      setError("계약명, 시작일, 만료일을 입력해 주세요.");
      return;
    }
    setIsSubmitting(true);
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/auth/login");
        return;
      }
      const { data: contract, error: insertError } = await supabase
        .from("contracts")
        .insert({
          user_id: user.id,
          title: title.trim(),
          category,
          start_date: startDate,
          end_date: endDate,
          amount: amount ? parseFloat(amount.replace(/,/g, "")) || null : null,
          memo: memo.trim() || null,
        })
        .select("id")
        .single();

      if (insertError) throw insertError;
      if (!contract) throw new Error("계약 생성 실패");

      const end = new Date(endDate);
      const notificationsToInsert = notifyDays.map((d) => {
        const dte = new Date(end);
        dte.setDate(dte.getDate() - d);
        return {
          contract_id: contract.id,
          notify_days_before: d,
          scheduled_date: dte.toISOString().slice(0, 10),
        };
      });
      if (notificationsToInsert.length > 0) {
        await supabase.from("notifications").insert(notificationsToInsert);
      }
      router.push("/dashboard");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "저장에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="overflow-hidden border-outline-variant/70 bg-surface shadow-[0_20px_46px_-34px_rgba(15,23,42,0.42)]">
      <CardHeader className="space-y-6 border-b border-outline-variant/70 bg-surface-container-low/75 pb-7">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <p className="text-xs font-semibold tracking-[0.16em] text-primary">
              STEP {step + 1}
            </p>
            <CardTitle className="text-[1.85rem] leading-tight">
              {STEPS[step].title}
            </CardTitle>
            <p className="max-w-[440px] text-[0.95rem] leading-relaxed text-muted-foreground">
              {STEPS[step].description}
            </p>
          </div>
          <span className="inline-flex rounded-full border border-outline-variant bg-surface px-3 py-1 text-xs font-medium text-muted-foreground">
            {step + 1} / {STEPS.length}
          </span>
        </div>

        <div className="h-2 w-full overflow-hidden rounded-full bg-surface-container-high">
          <div
            className="h-full rounded-full bg-primary transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="grid grid-cols-3 gap-2.5">
          {STEPS.map((stepItem, i) => {
            const Icon = STEP_ICONS[i];
            return (
              <div
                key={stepItem.title}
                className={cn(
                  "flex items-center gap-2 rounded-lg border px-3 py-2.5 text-xs transition-colors",
                  i <= step
                    ? "border-primary/40 bg-primary/10 text-foreground"
                    : "border-outline-variant bg-surface text-muted-foreground",
                )}
              >
                <Icon sx={{ fontSize: 14 }} />
                <span className="truncate">{stepItem.title}</span>
              </div>
            );
          })}
        </div>
      </CardHeader>

      <CardContent className="space-y-7 pb-8 pt-8">
        {step === 0 && (
          <div className="space-y-5">
            <p className="text-[0.95rem] text-muted-foreground">
              자주 쓰는 유형을 기준으로 분류해두면 목록에서 찾기 쉬워집니다.
            </p>
            <div className="grid gap-3.5 sm:grid-cols-2">
              {CONTRACT_CATEGORIES.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCategory(c)}
                  className={cn(
                    "flex min-h-[96px] items-start justify-between gap-3 rounded-2xl border px-5 py-4 text-left transition-all",
                    category === c
                      ? "border-primary bg-primary/10 shadow-[0_12px_24px_-20px_hsl(var(--primary)/0.55)]"
                      : "border-outline-variant bg-surface hover:bg-surface-container-low",
                  )}
                >
                  <div>
                    <p className="text-[1.02rem] font-semibold text-foreground">
                      {CATEGORY_LABELS[c]}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {CATEGORY_META[c].hint}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className="text-xl leading-none" aria-hidden>
                      {CATEGORY_META[c].emoji}
                    </span>
                    {category === c && (
                      <span className="inline-flex items-center rounded-full bg-primary px-2 py-0.5 text-[11px] font-semibold text-primary-foreground">
                        선택됨
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-6">
            <div className="grid gap-2.5">
              <Label className="text-sm font-medium">입력 방식</Label>
              <div className="grid gap-2.5 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => setInputMode("direct")}
                  className={cn(
                    "flex min-h-[74px] items-center justify-center gap-2 rounded-md border px-4 py-3.5 text-[0.95rem] transition-colors",
                    inputMode === "direct"
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-outline-variant bg-surface hover:bg-surface-container-low",
                  )}
                >
                  <EditRoundedIcon sx={{ fontSize: 20 }} />
                  직접 입력
                </button>
                <button
                  type="button"
                  onClick={() => setInputMode("photo")}
                  className={cn(
                    "flex min-h-[74px] items-center justify-center gap-2 rounded-md border px-4 py-3.5 text-[0.95rem] transition-colors",
                    inputMode === "photo"
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-outline-variant bg-surface hover:bg-surface-container-low",
                  )}
                >
                  <AddPhotoAlternateRoundedIcon sx={{ fontSize: 20 }} /> 사진에서 추출
                </button>
              </div>
            </div>

            {inputMode === "photo" && (
              <div className="space-y-3.5 rounded-lg border border-outline-variant bg-surface-container-low/70 p-5">
                <Label className="text-xs font-medium text-muted-foreground">
                  계약서/영수증 사진 업로드
                </Label>
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handlePhotoChange}
                  className="w-full text-sm text-muted-foreground file:mr-2 file:rounded-lg file:border-0 file:bg-primary file:px-3 file:py-1.5 file:text-sm file:text-primary-foreground"
                />
                {previewUrl && (
                  <div className="flex flex-col gap-2">
                    <Image
                      src={previewUrl}
                      alt="미리보기"
                      width={1200}
                      height={800}
                      unoptimized
                      className="max-h-48 w-full rounded-md border border-outline-variant bg-surface object-contain"
                    />
                    <Button
                      type="button"
                      variant="secondary"
                      size="default"
                      onClick={handleExtract}
                      disabled={isExtracting}
                    >
                      {isExtracting ? "추출 중…" : "텍스트 추출해서 채우기"}
                    </Button>
                  </div>
                )}
                <p className="text-sm text-muted-foreground">
                  OCR 결과는 아래 입력칸에 자동 입력됩니다. 저장 전 꼭 확인해 주세요.
                </p>
              </div>
            )}

            <div className="grid gap-2.5">
              <Label htmlFor="title">계약명 *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="예: 넷플릭스 스탠다드"
                required
              />
            </div>
            <div className="grid gap-4.5 sm:grid-cols-2">
              <div className="grid gap-2.5">
                <Label htmlFor="start_date">시작일 *</Label>
                <Input
                  id="start_date"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                />
              </div>
              <div className="grid gap-2.5">
                <Label htmlFor="end_date">만료일 *</Label>
                <Input
                  id="end_date"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  required
                />
              </div>
            </div>

            {startDate && endDate && (
              <p className="rounded-md border border-outline-variant bg-surface-container-low/60 px-4 py-2.5 text-sm text-muted-foreground">
                계약 기간 {getDurationText(startDate, endDate)}
              </p>
            )}

            <div className="grid gap-2.5">
              <Label htmlFor="amount">금액 (선택)</Label>
              <Input
                id="amount"
                type="text"
                inputMode="numeric"
                value={amount}
                onChange={(e) => setAmount(e.target.value.replace(/[^0-9,]/g, ""))}
                placeholder="예: 13500"
              />
            </div>

            <div className="grid gap-2.5">
              <Label htmlFor="memo">메모 (선택)</Label>
              <textarea
                id="memo"
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
                placeholder="예: 카드 자동결제일은 매월 3일"
                className="min-h-[104px] w-full rounded-md border border-outline-variant bg-surface px-4 py-3 text-[0.95rem] leading-relaxed shadow-sm transition-[border-color,box-shadow] placeholder:text-muted-foreground/90 focus-visible:border-primary focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/15"
              />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5">
            <div className="rounded-lg border border-outline-variant bg-surface-container-low/70 p-5">
              <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-foreground">
                <AutoAwesomeRoundedIcon sx={{ fontSize: 20, color: "primary.main" }} />
                추천 설정
              </div>
              <p className="text-sm leading-relaxed text-muted-foreground">
                일반적으로 D-7 + D-1 조합이 가장 많이 사용됩니다. 필요하면 D-30도
                함께 체크해 주세요.
              </p>
            </div>

            <p className="text-[0.95rem] text-muted-foreground">
              만료 전 언제 알림 받을지 선택하세요 (복수 선택 가능)
            </p>
            <div className="flex flex-wrap gap-2">
              {NOTIFY_DAYS_OPTIONS.map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => toggleNotify(d)}
                  className={cn(
                    "rounded-md border px-4 py-2.5 text-[0.95rem] transition-colors",
                    notifyDays.includes(d)
                      ? "border-primary bg-primary/10 font-semibold text-primary"
                      : "border-outline-variant bg-surface hover:bg-surface-container-low",
                  )}
                >
                  D-{d}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="rounded-lg border border-outline-variant bg-surface-container-low/60 p-5">
          <p className="text-xs font-semibold tracking-wide text-muted-foreground">
            현재 입력 요약
          </p>
          <div className="mt-2.5 grid gap-2 text-[0.95rem]">
            <p>
              <span className="text-muted-foreground">카테고리:</span>{" "}
              <span className="font-medium text-foreground">
                {category ? CATEGORY_LABELS[category] : "미선택"}
              </span>
            </p>
            <p>
              <span className="text-muted-foreground">계약명:</span>{" "}
              <span className="font-medium text-foreground">
                {title.trim() || "미입력"}
              </span>
            </p>
            <p>
              <span className="text-muted-foreground">만료일:</span>{" "}
              <span className="font-medium text-foreground">
                {endDate || "미입력"}
              </span>
            </p>
            <p>
              <span className="text-muted-foreground">알림:</span>{" "}
              <span className="font-medium text-foreground">
                {notifyDays.length > 0
                  ? notifyDays
                      .slice()
                      .sort((a, b) => b - a)
                      .map((d) => `D-${d}`)
                      .join(", ")
                  : "미설정"}
              </span>
            </p>
          </div>
        </div>

        {error && (
          <p className="rounded-md border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        )}

        <div className="flex flex-col-reverse gap-3.5 pt-2 sm:flex-row sm:items-center sm:justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={handleBack}
            disabled={step === 0}
            className="w-full sm:w-auto"
          >
            이전
          </Button>

          {step < 2 ? (
            <Button
              type="button"
              onClick={handleNext}
              disabled={!canMoveNext}
              className="w-full sm:w-auto"
            >
              다음
              <ChevronRightRoundedIcon sx={{ fontSize: 20 }} />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full sm:w-auto"
            >
              {isSubmitting ? "저장 중…" : "완료하고 저장"}
              {!isSubmitting && <CheckRoundedIcon sx={{ fontSize: 20 }} />}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function getDurationText(startDate: string, endDate: string): string {
  const start = new Date(startDate);
  const end = new Date(endDate);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return "계산 불가";

  const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  if (days < 0) return "만료일이 시작일보다 이전입니다.";
  return `${days.toLocaleString()}일`;
}
