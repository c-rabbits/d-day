"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
import { Check, ImagePlus } from "lucide-react";

const STEPS = ["카테고리", "정보 입력", "알림 설정"] as const;

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

  const toggleNotify = (d: NotifyDaysBefore) => {
    setNotifyDays((prev) =>
      prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d],
    );
  };

  const handleNext = () => {
    if (step < 2) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 0) setStep(step - 1);
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
    <Card>
      <CardHeader className="pb-2">
        <div className="flex gap-2">
          {STEPS.map((s, i) => (
            <span
              key={s}
              className={cn(
                "text-sm",
                i === step ? "font-semibold text-foreground" : "text-muted-foreground",
              )}
            >
              {i + 1}. {s}
            </span>
          ))}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {step === 0 && (
          <div className="space-y-3">
            <p className="text-muted-foreground text-sm">계약 종류를 선택하세요</p>
            <div className="grid grid-cols-2 gap-2">
              {CONTRACT_CATEGORIES.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCategory(c)}
                  className={cn(
                    "flex items-center justify-between rounded-lg border px-4 py-3 text-left transition-colors",
                    category === c
                      ? "border-primary bg-primary/10"
                      : "border-border hover:bg-muted/50",
                  )}
                >
                  <span>{CATEGORY_LABELS[c]}</span>
                  {category === c && <Check className="h-4 w-4 text-primary" />}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <div className="grid gap-2">
              <Label>입력 방식</Label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setInputMode("direct")}
                  className={cn(
                    "flex flex-1 items-center justify-center gap-2 rounded-lg border py-2.5 text-sm",
                    inputMode === "direct"
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border hover:bg-muted/50",
                  )}
                >
                  직접 입력
                </button>
                <button
                  type="button"
                  onClick={() => setInputMode("photo")}
                  className={cn(
                    "flex flex-1 items-center justify-center gap-2 rounded-lg border py-2.5 text-sm",
                    inputMode === "photo"
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border hover:bg-muted/50",
                  )}
                >
                  <ImagePlus className="h-4 w-4" /> 사진에서 추출
                </button>
              </div>
            </div>

            {inputMode === "photo" && (
              <div className="space-y-2 rounded-lg border border-border bg-muted/30 p-3">
                <Label className="text-muted-foreground text-xs">계약서/영수증 사진</Label>
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handlePhotoChange}
                  className="text-muted-foreground w-full text-sm file:mr-2 file:rounded file:border-0 file:bg-primary file:px-3 file:py-1.5 file:text-primary-foreground file:text-sm"
                />
                {previewUrl && (
                  <div className="flex flex-col gap-2">
                    <img
                      src={previewUrl}
                      alt="미리보기"
                      className="max-h-40 w-full rounded-md object-contain bg-muted"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleExtract}
                      disabled={isExtracting}
                    >
                      {isExtracting ? "추출 중…" : "텍스트 추출 (확인 후 수정)"}
                    </Button>
                  </div>
                )}
                <p className="text-muted-foreground text-xs">
                  추출된 내용은 아래 칸에 채워집니다. 반드시 확인 후 수정해 주세요.
                </p>
              </div>
            )}

            <div className="grid gap-2">
              <Label htmlFor="title">계약명 *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="예: 넷플릭스 스탠다드"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="start_date">시작일 *</Label>
                <Input
                  id="start_date"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                />
              </div>
              <div className="grid gap-2">
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
            <div className="grid gap-2">
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
            <div className="grid gap-2">
              <Label htmlFor="memo">메모 (선택)</Label>
              <Input
                id="memo"
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
                placeholder="추가 메모"
              />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-3">
            <p className="text-muted-foreground text-sm">만료 전 언제 알림 받을지 선택하세요 (복수 선택 가능)</p>
            <div className="flex flex-wrap gap-2">
              {NOTIFY_DAYS_OPTIONS.map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => toggleNotify(d)}
                  className={cn(
                    "rounded-lg border px-4 py-2 text-sm transition-colors",
                    notifyDays.includes(d)
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border hover:bg-muted/50",
                  )}
                >
                  D-{d}
                </button>
              ))}
            </div>
          </div>
        )}

        {error && <p className="text-destructive text-sm">{error}</p>}

        <div className="flex justify-between pt-2">
          <Button type="button" variant="outline" onClick={handleBack} disabled={step === 0}>
            이전
          </Button>
          {step < 2 ? (
            <Button
              type="button"
              onClick={handleNext}
              disabled={step === 0 && !category}
            >
              다음
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? "저장 중…" : "완료"}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
