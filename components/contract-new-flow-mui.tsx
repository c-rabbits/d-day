"use client";

import { useEffect, useState, type ChangeEvent } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  CATEGORY_LABELS,
  CONTRACT_CATEGORIES,
  NOTIFY_DAYS_OPTIONS,
  type ContractCategory,
  type NotifyDaysBefore,
} from "@/lib/types";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  LinearProgress,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import ChevronLeftRoundedIcon from "@mui/icons-material/ChevronLeftRounded";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import DescriptionIcon from "@mui/icons-material/Description";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import FitnessCenterIcon from "@mui/icons-material/FitnessCenter";
import HomeIcon from "@mui/icons-material/Home";
import ImageRoundedIcon from "@mui/icons-material/ImageRounded";
import InventoryIcon from "@mui/icons-material/Inventory";
import PlayCircleIcon from "@mui/icons-material/PlayCircle";
import SmartphoneIcon from "@mui/icons-material/Smartphone";
import TaskAltRoundedIcon from "@mui/icons-material/TaskAltRounded";

const STEPS = [
  { title: "카테고리 선택" },
  { title: "세부정보 입력" },
  { title: "알림 시점 설정" },
] as const;

const CATEGORY_ICONS: Record<ContractCategory, React.ComponentType<{ sx?: object }>> = {
  RENT: HomeIcon,
  PHONE: SmartphoneIcon,
  CAR_INSURANCE: DirectionsCarIcon,
  GYM: FitnessCenterIcon,
  RENTAL: InventoryIcon,
  STREAMING: PlayCircleIcon,
  OTHER: DescriptionIcon,
};

const CATEGORY_PASTEL: Record<ContractCategory, string> = {
  RENT: "#B8D4E3",
  PHONE: "#B5EAD7",
  CAR_INSURANCE: "#FFDAC1",
  GYM: "#E2BEF1",
  RENTAL: "#C7CEEA",
  STREAMING: "#ACE7FF",
  OTHER: "#D4C5B9",
};

type InputMode = "direct" | "photo";

async function extractFromImage(file: File): Promise<{
  title: string;
  start_date: string;
  end_date: string;
  amount: string;
}> {
  const formData = new FormData();
  formData.append("image", file);
  const res = await fetch("/api/ocr", { method: "POST", body: formData });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "OCR 요청 실패");
  return {
    title: data.title ?? "",
    start_date: data.start_date ?? "",
    end_date: data.end_date ?? "",
    amount: data.amount ?? "",
  };
}

export function ContractNewFlowMui() {
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
  const canMoveNext = step === 0 ? canMoveNextStepOne : step === 1 ? canMoveNextStepTwo : true;

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const toggleNotify = (targetDay: NotifyDaysBefore) => {
    setNotifyDays((prev) =>
      prev.includes(targetDay)
        ? prev.filter((day) => day !== targetDay)
        : [...prev, targetDay],
    );
  };

  const handlePhotoChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
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
      setTitle(result.title);
      setStartDate(result.start_date);
      setEndDate(result.end_date);
      setAmount(result.amount);
    } catch {
      setError("추출에 실패했습니다. 직접 입력해 주세요.");
    } finally {
      setIsExtracting(false);
    }
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
    if (step < 2) setStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setError(null);
    if (step > 0) setStep((prev) => prev - 1);
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
      const notificationsToInsert = notifyDays.map((day) => {
        const targetDate = new Date(end);
        targetDate.setDate(targetDate.getDate() - day);
        return {
          contract_id: contract.id,
          notify_days_before: day,
          scheduled_date: targetDate.toISOString().slice(0, 10),
        };
      });
      if (notificationsToInsert.length > 0) {
        await supabase.from("notifications").insert(notificationsToInsert);
      }

      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "저장에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card variant="outlined" sx={{ borderRadius: 3.2, borderColor: "divider" }}>
      <CardContent sx={{ p: 2.4 }}>
        <Stack spacing={2.3}>
          <Box>
            <Typography variant="caption" sx={{ color: "primary.main", fontWeight: 700, letterSpacing: "0.08em" }}>
              STEP {step + 1}
            </Typography>
            <Typography variant="h5" sx={{ mt: 0.5, fontSize: "1.4rem", fontWeight: 700 }}>
              {STEPS[step].title}
            </Typography>
          </Box>

          <LinearProgress variant="determinate" value={progress} sx={{ height: 7, borderRadius: 999 }} />

          {step === 0 && (
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "repeat(2, 1fr)",
                gap: 1.2,
              }}
            >
              {CONTRACT_CATEGORIES.map((targetCategory) => {
                const Icon = CATEGORY_ICONS[targetCategory];
                const bg = CATEGORY_PASTEL[targetCategory];
                const selected = category === targetCategory;
                return (
                  <Box
                    key={targetCategory}
                    component="button"
                    type="button"
                    onClick={() => setCategory(targetCategory)}
                    sx={{
                      aspectRatio: "1",
                      borderRadius: 1.5,
                      border: (theme) =>
                        `2px solid ${selected ? theme.palette.primary.main : "transparent"}`,
                      backgroundColor: bg,
                      cursor: "pointer",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      font: "inherit",
                      boxShadow: selected ? 2 : 0,
                    }}
                  >
                    <Icon sx={{ fontSize: 32, color: "#fff", mb: 0.5 }} />
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#333" }}>
                      {CATEGORY_LABELS[targetCategory]}
                    </Typography>
                  </Box>
                );
              })}
            </Box>
          )}

          {step === 1 && (
            <Stack spacing={1.7}>
              <Stack spacing={1}>
                <Typography variant="subtitle2">입력 방식</Typography>
                <ToggleButtonGroup
                  exclusive
                  value={inputMode}
                  onChange={(_event, nextValue: InputMode | null) => {
                    if (nextValue) setInputMode(nextValue);
                  }}
                  size="small"
                  fullWidth
                >
                  <ToggleButton value="direct">직접 입력</ToggleButton>
                  <ToggleButton value="photo">사진에서 추출</ToggleButton>
                </ToggleButtonGroup>
              </Stack>

              {inputMode === "photo" && (
                <Card variant="outlined" sx={{ p: 1.6, borderRadius: 2.6 }}>
                  <Stack spacing={1.2}>
                    <Button
                      component="label"
                      variant="outlined"
                      startIcon={<ImageRoundedIcon />}
                    >
                      이미지 선택
                      <input
                        hidden
                        type="file"
                        accept="image/*"
                        capture="environment"
                        onChange={handlePhotoChange}
                      />
                    </Button>

                    {previewUrl && (
                      <Box sx={{ borderRadius: 2.2, overflow: "hidden", border: "1px solid", borderColor: "divider" }}>
                        <Image
                          src={previewUrl}
                          alt="계약 이미지 미리보기"
                          width={1200}
                          height={750}
                          unoptimized
                          style={{ width: "100%", height: 190, objectFit: "contain", background: "#F5F5F5" }}
                        />
                      </Box>
                    )}

                    {previewUrl && (
                      <Button onClick={handleExtract} disabled={isExtracting} variant="contained">
                        {isExtracting ? "텍스트 추출 중..." : "텍스트 자동 추출"}
                      </Button>
                    )}
                    <Typography variant="caption" color="text.secondary">
                      추출된 결과는 아래 입력칸에 자동 반영됩니다.
                    </Typography>
                  </Stack>
                </Card>
              )}

              <TextField
                label="계약명 *"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="예: 넷플릭스 스탠다드"
                fullWidth
              />

              <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 1.2 }}>
                <TextField
                  label="시작일 *"
                  type="date"
                  value={startDate}
                  onChange={(event) => setStartDate(event.target.value)}
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                />
                <TextField
                  label="만료일 *"
                  type="date"
                  value={endDate}
                  onChange={(event) => setEndDate(event.target.value)}
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                />
              </Box>

              {startDate && endDate && (
                <Chip
                  icon={<TaskAltRoundedIcon />}
                  label={`계약 기간 ${getDurationText(startDate, endDate)}`}
                  variant="outlined"
                />
              )}

              <TextField
                label="금액 (선택)"
                value={amount}
                onChange={(event) => setAmount(event.target.value.replace(/[^0-9,]/g, ""))}
                placeholder="예: 13500"
                fullWidth
              />

              <TextField
                label="메모 (선택)"
                value={memo}
                onChange={(event) => setMemo(event.target.value)}
                multiline
                minRows={3}
                placeholder="예: 카드 자동결제일은 매월 3일"
                fullWidth
              />
            </Stack>
          )}

          {step === 2 && (
            <Stack spacing={1.7}>
              <Alert icon={<AutoAwesomeRoundedIcon />} severity="info">
                일반적으로 D-7 + D-1 조합이 가장 많이 사용됩니다.
              </Alert>
              <Typography variant="body2" color="text.secondary">
                만료 전에 받고 싶은 알림 시점을 선택하세요.
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {NOTIFY_DAYS_OPTIONS.map((targetDay) => (
                  <Chip
                    key={targetDay}
                    label={`D-${targetDay}`}
                    onClick={() => toggleNotify(targetDay)}
                    color={notifyDays.includes(targetDay) ? "primary" : "default"}
                    variant={notifyDays.includes(targetDay) ? "filled" : "outlined"}
                  />
                ))}
              </Stack>
            </Stack>
          )}

          {error && <Alert severity="error">{error}</Alert>}

          <Stack direction="row" justifyContent="center" spacing={1.2}>
            <Button
              variant="outlined"
              startIcon={<ChevronLeftRoundedIcon />}
              onClick={handleBack}
              disabled={step === 0}
            >
              이전
            </Button>

            {step < 2 ? (
              <Button
                variant="contained"
                endIcon={<ChevronRightRoundedIcon />}
                onClick={handleNext}
                disabled={!canMoveNext}
              >
                다음
              </Button>
            ) : (
              <Button
                variant="contained"
                endIcon={<TaskAltRoundedIcon />}
                onClick={handleSubmit}
                disabled={
                  isSubmitting ||
                  !category ||
                  !title.trim() ||
                  !startDate ||
                  !endDate
                }
              >
                {isSubmitting ? "저장 중..." : "완료하고 저장"}
              </Button>
            )}
          </Stack>
        </Stack>
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
