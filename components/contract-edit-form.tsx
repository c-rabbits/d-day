"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { clearContractNotifications } from "@/app/dashboard/actions";
import { toUserFriendlyMessage } from "@/lib/error-messages";
import {
  getDisplayMemo,
  parseMonthlyNotifyFromMemo,
  parsePaymentDayFromMemo,
} from "@/lib/contract-memo";
import { isSubscriptionContract } from "@/lib/dday";
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
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import NotificationsActiveRoundedIcon from "@mui/icons-material/NotificationsActiveRounded";

const ACTION_BUTTON_SX = {
  justifyContent: "center",
  py: 1.75,
  minHeight: 48,
  flex: 1,
};

type ContractRow = {
  id: string;
  title: string;
  category: ContractCategory;
  start_date: string;
  end_date: string;
  amount: number | null;
  memo: string | null;
};

const SUBSCRIPTION_END_DATE = "9999-12-31";

export function ContractEditForm({
  contract,
  initialNotifyDays = [],
}: {
  contract: ContractRow;
  initialNotifyDays?: number[];
}) {
  const router = useRouter();
  const isSubscription = isSubscriptionContract(contract.end_date);
  const [title, setTitle] = useState(contract.title);
  const [category, setCategory] = useState<ContractCategory>(contract.category);
  const [startDate, setStartDate] = useState(contract.start_date);
  const [endDate, setEndDate] = useState(contract.end_date);
  const [amount, setAmount] = useState(contract.amount?.toString() ?? "");
  const [memo, setMemo] = useState(
    isSubscription ? (getDisplayMemo(contract.memo) ?? "") : (contract.memo ?? ""),
  );
  const subscriptionNotifyOptions = (NOTIFY_DAYS_OPTIONS.filter((d) => d !== 30) as NotifyDaysBefore[]);
  const [notifyDays, setNotifyDays] = useState<NotifyDaysBefore[]>(() => {
    if (isSubscription) {
      const fromDb = initialNotifyDays.filter((d) => d !== 30) as NotifyDaysBefore[];
      if (fromDb.length > 0) return fromDb;
      const fromMemo = parseMonthlyNotifyFromMemo(contract.memo) as NotifyDaysBefore[];
      return fromMemo;
    }
    return initialNotifyDays.filter((d) => [30, 7, 1].includes(d)) as NotifyDaysBefore[];
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleNotify = (d: NotifyDaysBefore) => {
    setNotifyDays((prev) =>
      prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d],
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const effectiveEndDate = isSubscription ? SUBSCRIPTION_END_DATE : endDate;
    if (!title.trim() || !startDate) {
      setError("계약명, 시작일을 입력해 주세요.");
      return;
    }
    if (!isSubscription && !endDate) {
      setError("만료일을 입력해 주세요.");
      return;
    }
    setIsSubmitting(true);
    try {
      const supabase = createClient();
      let finalMemo: string | null = memo.trim() || null;
      if (isSubscription) {
        const paymentDay = parsePaymentDayFromMemo(contract.memo) ?? 1;
        const parts: string[] = [];
        if (finalMemo) parts.push(finalMemo);
        parts.push(`월구독|지출일=${paymentDay}`);
        if (notifyDays.length > 0) {
          parts.push(`알림=${notifyDays.join(",")}일전`);
        }
        finalMemo = parts.join(" / ");
      }
      const { error: updateError } = await supabase
        .from("contracts")
        .update({
          title: title.trim(),
          category,
          start_date: startDate,
          end_date: effectiveEndDate,
          amount: amount ? parseFloat(amount.replace(/,/g, "")) || null : null,
          memo: finalMemo,
        })
        .eq("id", contract.id);

      if (updateError) throw updateError;

      const { error: clearErr } = await clearContractNotifications(contract.id);
      if (clearErr) throw new Error(clearErr);

      const end = new Date(effectiveEndDate);
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
        const { error: insertErr } = await supabase.from("notifications").insert(notificationsToInsert);
        if (insertErr) throw insertErr;
      }
      router.push(`/dashboard/contracts/${contract.id}`);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? toUserFriendlyMessage(e.message) : "저장에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card variant="outlined" sx={{ borderRadius: 2 }}>
      <CardContent sx={{ p: 2.4 }}>
        <Box component="form" onSubmit={handleSubmit}>
          <Stack spacing={1.9}>
              <Typography
                variant="caption"
                sx={{
                  display: "inline-block",
                  alignSelf: "flex-start",
                  px: 1,
                  py: 0.35,
                  borderRadius: 1,
                  bgcolor: isSubscription ? "primary.main" : "grey.700",
                  color: "white",
                  fontWeight: 700,
                  letterSpacing: "0.06em",
                }}
              >
                {isSubscription ? "월구독 계약 수정" : "장기계약 수정"}
              </Typography>
              <TextField
                label="계약명 *"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                required
                fullWidth
              />

              <Stack spacing={0.8}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: "0.9rem" }}>
                  카테고리
                </Typography>
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3, 1fr)",
                    gap: 1,
                  }}
                >
                  {CONTRACT_CATEGORIES.map((targetCategory) => (
                    <Button
                      key={targetCategory}
                      type="button"
                      variant={category === targetCategory ? "contained" : "outlined"}
                      color={category === targetCategory ? "primary" : "inherit"}
                      onClick={() => setCategory(targetCategory)}
                      sx={{ py: 1.5, minHeight: 44, fontSize: "0.8rem" }}
                    >
                      {CATEGORY_LABELS[targetCategory]}
                    </Button>
                  ))}
                </Box>
              </Stack>

              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: isSubscription ? "1fr" : { xs: "1fr", sm: "1fr 1fr" },
                  gap: 1.1,
                }}
              >
                <TextField
                  label="시작일 *"
                  type="date"
                  value={startDate}
                  onChange={(event) => setStartDate(event.target.value)}
                  InputLabelProps={{ shrink: true }}
                  required
                  fullWidth
                />
                {!isSubscription && (
                  <TextField
                    label="만료일 *"
                    type="date"
                    value={endDate}
                    onChange={(event) => setEndDate(event.target.value)}
                    InputLabelProps={{ shrink: true }}
                    required
                    fullWidth
                  />
                )}
              </Box>

              <TextField
                label="금액 (선택)"
                value={amount}
                onChange={(event) =>
                  setAmount(event.target.value.replace(/[^0-9,]/g, ""))
                }
                fullWidth
              />

              <TextField
                label="메모 (선택)"
                value={memo}
                onChange={(event) => setMemo(event.target.value)}
                multiline
                minRows={3}
                fullWidth
              />

              <Stack spacing={0.8}>
                <Stack direction="row" spacing={0.7} alignItems="center">
                  <NotificationsActiveRoundedIcon sx={{ fontSize: 20 }} color="primary" />
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: "0.9rem" }}>
                    알림
                  </Typography>
                </Stack>
                <Stack direction="row" spacing={0.75} useFlexGap sx={{ flexWrap: "wrap" }}>
                  {(isSubscription ? subscriptionNotifyOptions : NOTIFY_DAYS_OPTIONS).map((targetDay) => (
                    <Chip
                      key={targetDay}
                      label={`D-${targetDay}`}
                      onClick={() => toggleNotify(targetDay)}
                      color={notifyDays.includes(targetDay) ? "primary" : "default"}
                      variant={notifyDays.includes(targetDay) ? "filled" : "outlined"}
                      sx={{
                        flex: "0 0 auto",
                        minWidth: 52,
                        fontSize: "0.8rem",
                        py: 1,
                        px: 0.75,
                        minHeight: 40,
                      }}
                    />
                  ))}
                  <Chip
                    label="알림 없음"
                    onClick={() => setNotifyDays([])}
                    color={notifyDays.length === 0 ? "primary" : "default"}
                    variant={notifyDays.length === 0 ? "filled" : "outlined"}
                    sx={{
                      flex: "1 1 0",
                      minWidth: 88,
                      fontSize: "0.875rem",
                      py: 1.25,
                      px: 1,
                      minHeight: 44,
                      whiteSpace: "nowrap",
                    }}
                  />
                </Stack>
              </Stack>

              {error && <Alert severity="error">{error}</Alert>}

              <Stack direction="row" spacing={1.5}>
                <Button
                  type="button"
                  variant="outlined"
                  onClick={() => router.push(`/dashboard/contracts/${contract.id}`)}
                  sx={ACTION_BUTTON_SX}
                >
                  취소
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={isSubmitting}
                  sx={ACTION_BUTTON_SX}
                >
                  {isSubmitting ? "저장 중…" : "저장"}
                </Button>
              </Stack>
          </Stack>
        </Box>
      </CardContent>
    </Card>
  );
}
