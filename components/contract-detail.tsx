"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  getDday,
  getDdayLabel,
  getDdayForPaymentDay,
  getDdayLabelForPaymentDay,
  isSubscriptionContract,
} from "@/lib/dday";
import { parsePaymentDayFromMemo, getDisplayMemo } from "@/lib/contract-memo";
import { CATEGORY_LABELS, type ContractCategory } from "@/lib/types";
import { softDeleteContract } from "@/app/dashboard/actions";
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Stack,
  Typography,
} from "@mui/material";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";

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

type ContractDetailProps = {
  contract: ContractRow;
  notifyDays?: number[];
};

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <Stack direction="row" justifyContent="space-between" alignItems="baseline" sx={{ py: 0.75 }}>
      <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.8125rem" }}>
        {label}
      </Typography>
      <Typography variant="body2" sx={{ fontWeight: 600, fontSize: "0.9375rem" }}>
        {value}
      </Typography>
    </Stack>
  );
}

export function ContractDetail({ contract, notifyDays = [] }: ContractDetailProps) {
  const router = useRouter();
  const isSubscription = isSubscriptionContract(contract.end_date);
  const paymentDay = parsePaymentDayFromMemo(contract.memo);
  const dday =
    isSubscription && paymentDay != null
      ? getDdayForPaymentDay(paymentDay)
      : getDday(contract.end_date);
  const ddayColor = dday <= 7 ? "error" : dday <= 30 ? "warning" : "default";
  const ddayLabel =
    isSubscription && paymentDay != null
      ? getDdayLabelForPaymentDay(paymentDay)
      : getDdayLabel(contract.end_date);
  const displayMemo = getDisplayMemo(contract.memo);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleDeleteConfirm = async () => {
    setIsDeleting(true);
    setDeleteError(null);
    const { error } = await softDeleteContract(contract.id);
    setIsDeleting(false);
    if (error) {
      setDeleteError(error);
      return;
    }
    setDeleteOpen(false);
    router.push("/dashboard");
    router.refresh();
  };

  return (
    <Box sx={{ px: 2, pt: 3.5, pb: 14 }}>
      <Stack spacing={2}>
        <Button
          variant="text"
          startIcon={<ArrowBackRoundedIcon />}
          onClick={() => router.push("/dashboard")}
          sx={{ alignSelf: "flex-start", color: "text.secondary" }}
        >
          목록으로
        </Button>

        {/* 제목 + 카테고리(왼쪽) / D-day(오른쪽) */}
        <Stack direction="row" alignItems="flex-start" justifyContent="space-between" spacing={1}>
          <Stack spacing={0.5} sx={{ minWidth: 0, flex: 1 }}>
            <Typography variant="h5" sx={{ fontWeight: 700, fontSize: "1.35rem", lineHeight: 1.3 }}>
              {contract.title}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.875rem" }}>
              {CATEGORY_LABELS[contract.category]}
              {isSubscription ? " · 월구독" : " · 장기계약"}
            </Typography>
          </Stack>
          <Chip
            label={ddayLabel}
            color={ddayColor}
            sx={{ fontWeight: 700, fontSize: "0.9375rem", py: 1, px: 1.5, flexShrink: 0 }}
          />
        </Stack>

        {/* 한 카드: 시작일, 만료일, 금액, 알림, 메모 */}
        <Box
          sx={{
            py: 2,
            px: 2,
            borderRadius: 2,
            bgcolor: "#fff",
            border: "1px solid",
            borderColor: "divider",
          }}
        >
          <Stack spacing={0} divider={<Divider sx={{ borderColor: "divider" }} />}>
            {isSubscription && paymentDay != null ? (
              <InfoRow label="월 지출일" value={`매월 ${paymentDay}일`} />
            ) : (
              <>
                <InfoRow label="시작일" value={contract.start_date} />
                <InfoRow label="만료일" value={contract.end_date} />
                {!isSubscription && paymentDay != null && (
                  <InfoRow label="월 지출일" value={`매월 ${paymentDay}일`} />
                )}
              </>
            )}
            {contract.amount != null && (
              <InfoRow label="금액" value={`${contract.amount.toLocaleString()}원`} />
            )}
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ py: 0.75 }}>
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.8125rem" }}>
                알림
              </Typography>
              {notifyDays.length > 0 ? (
                <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap justifyContent="flex-end">
                  {[...notifyDays].sort((a, b) => b - a).map((d) => (
                    <Chip
                      key={d}
                      label={`D-${d}`}
                      size="small"
                      variant="outlined"
                      sx={{ fontWeight: 600, fontSize: "0.8125rem", borderRadius: 1.5 }}
                    />
                  ))}
                </Stack>
              ) : (
                <Typography variant="body2" sx={{ fontWeight: 600, fontSize: "0.9375rem" }}>
                  알림 없음
                </Typography>
              )}
            </Stack>
          </Stack>
          {displayMemo && (
            <>
              <Divider sx={{ borderColor: "divider" }} />
              <Box sx={{ pt: 1.5 }}>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ display: "block", mb: 0.5, fontSize: "0.75rem" }}
                >
                  메모
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    fontSize: "0.9375rem",
                    lineHeight: 1.6,
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word",
                  }}
                >
                  {displayMemo}
                </Typography>
              </Box>
            </>
          )}
        </Box>

        {/* 삭제(왼쪽 흰색) / 수정(오른쪽 검정) */}
        <Stack direction="row" spacing={1.5} sx={{ pt: 0.5 }}>
          <Button
            variant="outlined"
            onClick={() => setDeleteOpen(true)}
            sx={ACTION_BUTTON_SX}
          >
            삭제
          </Button>
          <Button
            variant="contained"
            onClick={() => router.push(`/dashboard/contracts/${contract.id}/edit`)}
            sx={ACTION_BUTTON_SX}
          >
            수정
          </Button>
        </Stack>
      </Stack>

      <Dialog
        open={deleteOpen}
        onClose={() => !isDeleting && setDeleteOpen(false)}
        PaperProps={{
          sx: { maxWidth: 520, width: "100%", borderRadius: 2 },
        }}
      >
        <DialogTitle sx={{ textAlign: "center", fontWeight: 700, pt: 2.5 }}>
          삭제 확인
        </DialogTitle>
        <DialogContent sx={{ textAlign: "center", pb: 1 }}>
          <Typography>이 계약을 삭제할까요?</Typography>
          {deleteError && (
            <Typography color="error" sx={{ mt: 1.5 }}>
              {deleteError}
            </Typography>
          )}
        </DialogContent>
        <DialogActions sx={{ justifyContent: "center", gap: 1.5, pb: 2.5, px: 2.5, mt: 2 }}>
          <Button
            variant="outlined"
            onClick={() => setDeleteOpen(false)}
            disabled={isDeleting}
            sx={{
              minHeight: 48,
              px: 3,
              borderColor: "#262626",
              color: "#262626",
              "&:hover": { borderColor: "#262626", backgroundColor: "rgba(0,0,0,0.04)" },
            }}
          >
            취소
          </Button>
          <Button
            variant="contained"
            onClick={handleDeleteConfirm}
            disabled={isDeleting}
            sx={{
              minHeight: 48,
              px: 3,
              backgroundColor: "#262626",
              "&:hover": { backgroundColor: "#404040" },
            }}
          >
            {isDeleting ? "삭제 중…" : "삭제"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
