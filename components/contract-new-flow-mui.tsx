"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  CATEGORY_LABELS,
  CATEGORY_PASTEL,
  CATEGORY_SUBTITLES,
  CONTRACT_CATEGORIES,
  MONTHLY_NOTIFY_DAYS_OPTIONS,
  NOTIFY_DAYS_OPTIONS,
  type ContractCategory,
  type NotifyDaysBefore,
} from "@/lib/types";
import {
  Alert,
  Box,
  Button,
  Chip,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import ChevronLeftRoundedIcon from "@mui/icons-material/ChevronLeftRounded";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import TaskAltRoundedIcon from "@mui/icons-material/TaskAltRounded";
import HomeIcon from "@mui/icons-material/Home";
import SmartphoneIcon from "@mui/icons-material/Smartphone";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import FitnessCenterIcon from "@mui/icons-material/FitnessCenter";
import InventoryIcon from "@mui/icons-material/Inventory";
import PlayCircleIcon from "@mui/icons-material/PlayCircle";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import SchoolIcon from "@mui/icons-material/School";
import DescriptionIcon from "@mui/icons-material/Description";

type ContractType = "subscription" | "longterm";

const CATEGORY_ICONS: Record<ContractCategory, React.ComponentType<{ sx?: object }>> = {
  RENT: HomeIcon,
  PHONE: SmartphoneIcon,
  CAR_INSURANCE: DirectionsCarIcon,
  GYM: FitnessCenterIcon,
  RENTAL: InventoryIcon,
  STREAMING: PlayCircleIcon,
  FINANCE: AccountBalanceIcon,
  EDUCATION: SchoolIcon,
  OTHER: DescriptionIcon,
};

const STEPS = [
  { title: "카테고리 선택" },
  { title: "세부정보 입력" },
  { title: "알림 시점 설정" },
] as const;

/** 날짜 입력 필드 캘린더(아래방향 화살표) 위치를 왼쪽으로 */
const dateInputSx = {
  "& input[type='date']": {
    position: "relative",
    paddingLeft: "36px",
    paddingRight: "12px",
  },
  "& input[type='date']::-webkit-calendar-picker-indicator": {
    position: "absolute",
    left: "6px",
    right: "auto",
    margin: 0,
    padding: 0,
    cursor: "pointer",
  },
};

/** (+) 버튼으로 진입할 때마다 1단계부터 시작하도록 key로 리마운트 */
export function ContractNewFlowWithReset() {
  const pathname = usePathname();
  const prevPath = useRef<string | null>(null);
  const [mountKey, setMountKey] = useState(0);
  useEffect(() => {
    const isNewPage = pathname === "/dashboard/contracts/new";
    if (isNewPage && prevPath.current != null && prevPath.current !== "/dashboard/contracts/new") {
      setMountKey((k) => k + 1);
    }
    prevPath.current = pathname;
  }, [pathname]);
  return <ContractNewFlowMui key={mountKey} />;
}

export function ContractNewFlowMui() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [category, setCategory] = useState<ContractCategory | null>(null);
  const [contractType, setContractType] = useState<ContractType>("subscription");
  const [title, setTitle] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [paymentDay, setPaymentDay] = useState(""); // 1–31, 월 지출일
  const [amount, setAmount] = useState("");
  const [memo, setMemo] = useState("");
  const [notifyDays, setNotifyDays] = useState<NotifyDaysBefore[]>([]); // 장기계약 만료일 알림
  const [monthlyNotifyDays, setMonthlyNotifyDays] = useState<number[]>([]); // 7, 1 (월구독 또는 장기 월지출 알림)
  const [step2AlertChosen, setStep2AlertChosen] = useState(false); // step2에서 알림/알림없음 한 번이라도 선택했는지
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canMoveNextStepOne = Boolean(category);
  const canMoveNextStepTwo =
    contractType === "subscription"
      ? Boolean(title.trim() && startDate && paymentDay)
      : Boolean(title.trim() && startDate && endDate);
  const canGoBack = step > 0;
  const canGoNext =
    step < 2 && (step === 0 ? canMoveNextStepOne : step === 1 ? canMoveNextStepTwo : false);
  const isCompleteDisabled =
    isSubmitting ||
    !step2AlertChosen ||
    !category ||
    !title.trim() ||
    !startDate ||
    (contractType === "longterm" && !endDate) ||
    (contractType === "subscription" && !paymentDay);

  const toggleNotify = (targetDay: NotifyDaysBefore) => {
    setStep2AlertChosen(true);
    setNotifyDays((prev) =>
      prev.includes(targetDay)
        ? prev.filter((day) => day !== targetDay)
        : [...prev, targetDay],
    );
  };

  const toggleMonthlyNotify = (targetDay: number) => {
    setStep2AlertChosen(true);
    setMonthlyNotifyDays((prev) =>
      prev.includes(targetDay)
        ? prev.filter((d) => d !== targetDay)
        : [...prev, targetDay],
    );
  };

  const setNoExpiryAlert = () => {
    setStep2AlertChosen(true);
    setNotifyDays([]);
  };
  const setNoMonthlyAlert = () => {
    setStep2AlertChosen(true);
    setMonthlyNotifyDays([]);
  };

  const handleNext = () => {
    if (step === 0 && !category) {
      setError("카테고리를 먼저 선택해 주세요.");
      return;
    }
    if (step === 1 && !canMoveNextStepTwo) {
      setError(
        contractType === "subscription"
          ? "계약명, 시작일, 월 지출일을 입력해 주세요."
          : "계약명, 시작일, 만료일을 입력해 주세요.",
      );
      return;
    }
    setError(null);
    if (step === 1) {
      setStep2AlertChosen(false);
      setNotifyDays([]);
      setMonthlyNotifyDays([]);
    }
    if (step < 2) setStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setError(null);
    if (step > 0) setStep((prev) => prev - 1);
  };

  const handleSubmit = async () => {
    setError(null);
    const needEndDate = contractType === "longterm";
    if (!category || !title.trim() || !startDate) {
      setError("계약명, 시작일을 입력해 주세요.");
      return;
    }
    if (needEndDate && !endDate) {
      setError("만료일을 입력해 주세요.");
      return;
    }
    if (contractType === "subscription" && !paymentDay) {
      setError("월 지출일을 입력해 주세요.");
      return;
    }
    setIsSubmitting(true);

    const effectiveEndDate = contractType === "subscription" ? "9999-12-31" : endDate;
    const memoParts: string[] = [];
    if (memo.trim()) memoParts.push(memo.trim());
    if (contractType === "subscription") {
      memoParts.push(`월구독|지출일=${paymentDay}`);
      if (monthlyNotifyDays.length) memoParts.push(`알림=${monthlyNotifyDays.join(",")}일전`);
    } else {
      if (paymentDay) memoParts.push(`월지출일=${paymentDay}`);
      if (monthlyNotifyDays.length) memoParts.push(`월지출알림=${monthlyNotifyDays.join(",")}일전`);
    }
    const finalMemo = memoParts.length ? memoParts.join(" / ") : null;

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
          end_date: effectiveEndDate,
          amount: amount ? parseFloat(amount.replace(/,/g, "")) || null : null,
          memo: finalMemo,
        })
        .select("id")
        .single();

      if (insertError) throw insertError;
      if (!contract) throw new Error("계약 생성 실패");

      if (contractType === "longterm" && notifyDays.length > 0) {
        const end = new Date(effectiveEndDate);
        const notificationsToInsert = notifyDays.map((day) => {
          const targetDate = new Date(end);
          targetDate.setDate(targetDate.getDate() - day);
          return {
            contract_id: contract.id,
            notify_days_before: day,
            scheduled_date: targetDate.toISOString().slice(0, 10),
          };
        });
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
    <Box sx={{ px: 1.5, py: 2 }}>
      <Stack spacing={2.3} sx={{ width: "100%", maxWidth: "100%" }}>
        <Box>
          <Typography variant="caption" sx={{ color: "#000", fontWeight: 700, letterSpacing: "0.08em" }}>
            {step + 1}단계
          </Typography>
          <Typography variant="h5" sx={{ mt: 0.5, fontSize: "1.4rem", fontWeight: 700, color: "#000" }}>
            {STEPS[step].title}
          </Typography>
        </Box>

        {step === 0 && (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 1,
              alignItems: "stretch",
              width: "100%",
              maxWidth: "100%",
              mx: "auto",
              justifyItems: "stretch",
            }}
          >
            {CONTRACT_CATEGORIES.map((targetCategory) => {
              const Icon = CATEGORY_ICONS[targetCategory];
              const iconBg = CATEGORY_PASTEL[targetCategory];
              const selected = category === targetCategory;
              return (
                <Box
                  key={targetCategory}
                  component="button"
                  type="button"
                  onClick={() => setCategory(targetCategory)}
                  sx={{
                    height: 140,
                    borderRadius: 2,
                    border: "1px solid",
                    borderColor: selected ? "#262626" : "divider",
                    backgroundColor: "#fff",
                    cursor: "pointer",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-start",
                    justifyContent: "flex-start",
                    textAlign: "left",
                    font: "inherit",
                    p: 1.2,
                    transition: "border-color 0.2s ease, outline-color 0.2s ease",
                    boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
                  }}
                >
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: "50%",
                      bgcolor: iconBg,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      mb: 0.75,
                    }}
                  >
                    <Icon sx={{ fontSize: 22, color: "#fff" }} />
                  </Box>
                  <Typography
                    variant="subtitle2"
                    sx={{ fontWeight: 700, color: "#000", pl: 0, fontSize: "1rem" }}
                  >
                    {CATEGORY_LABELS[targetCategory]}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      color: "#555",
                      mt: 0.25,
                      lineHeight: 1.35,
                      whiteSpace: "pre-line",
                      pl: 0,
                      fontSize: "0.7rem",
                    }}
                  >
                    {CATEGORY_SUBTITLES[targetCategory]}
                  </Typography>
                </Box>
              );
            })}
          </Box>
        )}

          {step === 1 && (
            <Stack spacing={1.7}>
              <Stack spacing={0.8}>
                <Typography variant="subtitle2">계약 유형</Typography>
                <ToggleButtonGroup
                  exclusive
                  value={contractType}
                  onChange={(_event, next: ContractType | null) => {
                    if (next) setContractType(next);
                  }}
                  size="small"
                  fullWidth
                  sx={{
                    "& .MuiToggleButtonGroup-grouped": {
                      "&.Mui-selected": {
                        backgroundColor: "#262626",
                        color: "#fff",
                        "&:hover": {
                          backgroundColor: "#404040",
                          color: "#fff",
                        },
                      },
                    },
                  }}
                >
                  <ToggleButton value="subscription">월구독</ToggleButton>
                  <ToggleButton value="longterm">장기계약</ToggleButton>
                </ToggleButtonGroup>
              </Stack>

              <TextField
                label="계약명 *"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="예: 넷플릭스 스탠다드"
                fullWidth
              />

              <TextField
                label="시작일 *"
                type="date"
                value={startDate}
                onChange={(event) => setStartDate(event.target.value)}
                InputLabelProps={{ shrink: true }}
                fullWidth
                sx={dateInputSx}
              />

              {contractType === "longterm" && (
                <TextField
                  label="만료일 *"
                  type="date"
                  value={endDate}
                  onChange={(event) => setEndDate(event.target.value)}
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                  sx={dateInputSx}
                />
              )}

              <TextField
                label={contractType === "subscription" ? "매월 지출일 (일) *" : "월 지출일 (일, 선택)"}
                type="number"
                inputProps={{ min: 1, max: 31 }}
                value={paymentDay}
                onChange={(event) => {
                  const v = event.target.value.replace(/\D/g, "");
                  if (v === "" || (Number(v) >= 1 && Number(v) <= 31)) setPaymentDay(v);
                }}
                placeholder="1–31"
                fullWidth
              />

              {contractType === "longterm" && startDate && endDate && (
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
                minRows={2}
                placeholder="예: 카드 자동결제일은 매월 3일"
                fullWidth
              />
            </Stack>
          )}

          {step === 2 && (
            <Stack spacing={1.7}>
              {contractType === "subscription" ? (
                <>
                  <Typography variant="body2" color="text.secondary">
                    매월 지출일 전 알림을 선택하세요.
                  </Typography>
                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    {MONTHLY_NOTIFY_DAYS_OPTIONS.map((d) => (
                      <Chip
                        key={d}
                        label={`${d}일 전`}
                        onClick={() => toggleMonthlyNotify(d)}
                        color={monthlyNotifyDays.includes(d) ? "primary" : "default"}
                        variant={monthlyNotifyDays.includes(d) ? "filled" : "outlined"}
                        sx={{ py: 1.25, px: 1.5, minHeight: 44 }}
                      />
                    ))}
                    <Chip
                      label="알림 없음"
                      onClick={setNoMonthlyAlert}
                      color={monthlyNotifyDays.length === 0 ? "primary" : "default"}
                      variant={monthlyNotifyDays.length === 0 ? "filled" : "outlined"}
                      sx={{ py: 1.25, px: 1.5, minHeight: 44 }}
                    />
                  </Stack>
                </>
              ) : (
                <>
                  <Alert icon={<AutoAwesomeRoundedIcon />} severity="info">
                    만료일 알림은 D-30, D-7, D-1 중 선택할 수 있습니다.
                  </Alert>
                  <Typography variant="body2" color="text.secondary">
                    만료일 전 알림
                  </Typography>
                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    {NOTIFY_DAYS_OPTIONS.map((targetDay) => (
                      <Chip
                        key={targetDay}
                        label={`D-${targetDay}`}
                        onClick={() => toggleNotify(targetDay)}
                        color={notifyDays.includes(targetDay) ? "primary" : "default"}
                        variant={notifyDays.includes(targetDay) ? "filled" : "outlined"}
                        sx={{ py: 1.25, px: 1.5, minHeight: 44 }}
                      />
                    ))}
                    <Chip
                      label="알림 없음"
                      onClick={setNoExpiryAlert}
                      color={notifyDays.length === 0 ? "primary" : "default"}
                      variant={notifyDays.length === 0 ? "filled" : "outlined"}
                      sx={{ py: 1.25, px: 1.5, minHeight: 44 }}
                    />
                  </Stack>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    월 지출일 알림
                  </Typography>
                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    {MONTHLY_NOTIFY_DAYS_OPTIONS.map((d) => (
                      <Chip
                        key={d}
                        label={`${d}일 전`}
                        onClick={() => toggleMonthlyNotify(d)}
                        color={monthlyNotifyDays.includes(d) ? "primary" : "default"}
                        variant={monthlyNotifyDays.includes(d) ? "filled" : "outlined"}
                        sx={{ py: 1.25, px: 1.5, minHeight: 44 }}
                      />
                    ))}
                    <Chip
                      label="알림 없음"
                      onClick={setNoMonthlyAlert}
                      color={monthlyNotifyDays.length === 0 ? "primary" : "default"}
                      variant={monthlyNotifyDays.length === 0 ? "filled" : "outlined"}
                      sx={{ py: 1.25, px: 1.5, minHeight: 44 }}
                    />
                  </Stack>
                </>
              )}
            </Stack>
          )}

          {error && <Alert severity="error">{error}</Alert>}

          <Stack direction="row" justifyContent="center" spacing={1.2} sx={{ mt: 2.5 }}>
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
                disabled={!canGoNext}
              >
                다음
              </Button>
            ) : (
              <Button
                variant="contained"
                onClick={handleSubmit}
                disabled={isCompleteDisabled}
              >
                {isSubmitting ? "등록 중..." : "등록"}
              </Button>
            )}
          </Stack>
        </Stack>
    </Box>
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
