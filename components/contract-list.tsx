"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Avatar,
  Box,
  Button,
  Card,
  CardActionArea,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Typography,
} from "@mui/material";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import DescriptionIcon from "@mui/icons-material/Description";
import HomeIcon from "@mui/icons-material/Home";
import SmartphoneIcon from "@mui/icons-material/Smartphone";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import FitnessCenterIcon from "@mui/icons-material/FitnessCenter";
import InventoryIcon from "@mui/icons-material/Inventory";
import PlayCircleIcon from "@mui/icons-material/PlayCircle";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import SchoolIcon from "@mui/icons-material/School";
import {
  getDday,
  getDdayLabel,
  getDdayForPaymentDay,
  getDdayLabelForPaymentDay,
  isSubscriptionContract,
} from "@/lib/dday";
import { parsePaymentDayFromMemo } from "@/lib/contract-memo";
import { CATEGORY_LABELS, CATEGORY_PASTEL, type ContractCategory } from "@/lib/types";
import { softDeleteContract } from "@/app/dashboard/actions";

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

type ContractRow = {
  id: string;
  title: string;
  category: ContractCategory;
  end_date: string;
  amount: number | null;
  memo: string | null;
};

export function ContractList({ contracts }: { contracts: ContractRow[] }) {
  const router = useRouter();
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleDeleteConfirm = async () => {
    if (!deleteTargetId) return;
    setIsDeleting(true);
    const { error } = await softDeleteContract(deleteTargetId);
    setIsDeleting(false);
    if (error) {
      setDeleteError(error);
      return;
    }
    setDeleteTargetId(null);
    setDeleteError(null);
    router.refresh();
  };

  if (contracts.length === 0) {
    return (
      <Box
        sx={{
          py: 6,
          border: (theme) => `1px dashed ${theme.palette.divider}`,
          borderRadius: 2,
          bgcolor: "background.paper",
          textAlign: "center",
        }}
      >
        <DescriptionIcon sx={{ fontSize: 40, color: "text.secondary", mb: 1 }} />
        <Typography variant="body1" color="text.secondary">
          등록된 계약이 없어요
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          아래 + 버튼으로 첫 계약을 추가해 보세요
        </Typography>
      </Box>
    );
  }

  return (
    <>
      <Stack spacing={1.5}>
        {contracts.map((c) => {
          const isSubscription = isSubscriptionContract(c.end_date);
          const paymentDay = parsePaymentDayFromMemo(c.memo);
          const dday = isSubscription && paymentDay != null
            ? getDdayForPaymentDay(paymentDay)
            : getDday(c.end_date);
          const ddayColor = dday <= 7 ? "error" : dday <= 30 ? "warning" : "default";
          const isExpired = !isSubscription && dday < 0;
          const dateLabel = isSubscription && paymentDay != null
            ? `매월 ${paymentDay}일`
            : `만료 ${c.end_date}`;
          const ddayLabel = isSubscription && paymentDay != null
            ? getDdayLabelForPaymentDay(paymentDay)
            : getDdayLabel(c.end_date);

          return (
            <Card
              key={c.id}
              variant="outlined"
              sx={{
                borderRadius: 2,
                borderColor: "divider",
                transition: "box-shadow .2s ease",
                "&:hover": {
                  boxShadow: 1,
                },
              }}
            >
              <CardActionArea onClick={() => router.push(`/dashboard/contracts/${c.id}`)}>
                <Stack spacing={1.5} sx={{ p: 2.5 }}>
                  {/* 상단: 아이콘 + 제목/카테고리·유형 + D-day */}
                  <Stack
                    direction="row"
                    alignItems="center"
                    spacing={1.25}
                    sx={{ minWidth: 0 }}
                  >
                    <Avatar
                      variant="rounded"
                      sx={{
                        width: 44,
                        height: 44,
                        flexShrink: 0,
                        bgcolor: CATEGORY_PASTEL[c.category],
                        color: "#fff",
                      }}
                    >
                      {(() => {
                        const Icon = CATEGORY_ICONS[c.category];
                        return <Icon sx={{ fontSize: 24 }} />;
                      })()}
                    </Avatar>
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                      <Typography noWrap variant="subtitle1" fontWeight={700} sx={{ lineHeight: 1.3 }}>
                        {c.title}
                      </Typography>
                      <Stack direction="row" spacing={0.5} alignItems="center" flexWrap="wrap" sx={{ mt: 0.25 }}>
                        <Typography variant="caption" color="text.secondary">
                          {CATEGORY_LABELS[c.category]}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          ·
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {isSubscription ? "월구독" : "장기계약"}
                        </Typography>
                      </Stack>
                    </Box>
                    <Chip
                      label={ddayLabel}
                      color={ddayColor}
                      size="small"
                      sx={{ flexShrink: 0, fontWeight: 700 }}
                    />
                  </Stack>

                  {/* 하단: 월 지출일 또는 만료일 / 금액 / 만료 시 삭제 버튼 */}
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    flexWrap="wrap"
                    gap={0.5}
                    sx={{
                      pt: 0.5,
                      borderTop: 1,
                      borderColor: "divider",
                    }}
                  >
                    <Stack direction="row" spacing={0.5} alignItems="center" sx={{ minWidth: 0 }}>
                      <CalendarTodayIcon sx={{ fontSize: 16, color: "text.secondary", flexShrink: 0 }} />
                      <Typography variant="body2" color="text.secondary">
                        {dateLabel}
                      </Typography>
                    </Stack>
                    <Stack direction="row" alignItems="center" spacing={0.75}>
                      {c.amount != null ? (
                        <Typography variant="body2" fontWeight={600} sx={{ flexShrink: 0 }}>
                          {c.amount.toLocaleString()}원
                        </Typography>
                      ) : (
                        <Typography variant="body2" color="text.secondary" sx={{ flexShrink: 0 }}>
                          금액 없음
                        </Typography>
                      )}
                      {isExpired && (
                        <Button
                          size="small"
                          color="error"
                          startIcon={<DeleteOutlinedIcon />}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setDeleteTargetId(c.id);
                          }}
                          sx={{ minWidth: 0, py: 0.25, px: 0.75 }}
                        >
                          삭제
                        </Button>
                      )}
                    </Stack>
                  </Stack>
                </Stack>
              </CardActionArea>
            </Card>
          );
        })}
      </Stack>

      <Dialog
        open={!!deleteTargetId}
        onClose={() => {
          setDeleteTargetId(null);
          setDeleteError(null);
        }}
      >
        <DialogTitle>삭제 확인</DialogTitle>
        <DialogContent>
          <Typography>만료된 계약을 삭제하시겠습니까?</Typography>
          {deleteError && (
            <Typography color="error" sx={{ mt: 1.5 }}>
              {deleteError}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setDeleteTargetId(null);
              setDeleteError(null);
            }}
          >
            취소
          </Button>
          <Button variant="contained" color="error" onClick={handleDeleteConfirm} disabled={isDeleting}>
            {isDeleting ? "삭제 중…" : "삭제"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
