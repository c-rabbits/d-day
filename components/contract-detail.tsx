"use client";

import { useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { getDday, getDdayLabel } from "@/lib/dday";
import { CATEGORY_LABELS, type ContractCategory } from "@/lib/types";
import { softDeleteContract } from "@/app/dashboard/actions";
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
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
import CategoryRoundedIcon from "@mui/icons-material/CategoryRounded";
import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import PaymentsRoundedIcon from "@mui/icons-material/PaymentsRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import NotesRoundedIcon from "@mui/icons-material/NotesRounded";

type ContractRow = {
  id: string;
  title: string;
  category: ContractCategory;
  start_date: string;
  end_date: string;
  amount: number | null;
  memo: string | null;
};

export function ContractDetail({ contract }: { contract: ContractRow }) {
  const router = useRouter();
  const dday = getDday(contract.end_date);
  const ddayColor = dday <= 7 ? "error" : dday <= 30 ? "warning" : "default";
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
    <Box sx={{ px: 2, py: 3.5 }}>
      <Stack spacing={1.5}>
        <Button
          variant="text"
          startIcon={<ArrowBackRoundedIcon />}
          onClick={() => router.push("/dashboard")}
          sx={{ alignSelf: "flex-start" }}
        >
          목록으로
        </Button>

        <Card variant="outlined" sx={{ borderRadius: 3.2 }}>
          <CardHeader
            title={contract.title}
            subheader={
              <Stack direction="row" spacing={0.8} alignItems="center" sx={{ mt: 0.7 }}>
                <CategoryRoundedIcon sx={{ fontSize: 16, color: "text.secondary" }} />
                <Typography variant="body2" color="text.secondary">
                  {CATEGORY_LABELS[contract.category]}
                </Typography>
              </Stack>
            }
            action={
              <Chip
                label={getDdayLabel(contract.end_date)}
                color={ddayColor}
                sx={{ fontWeight: 700 }}
              />
            }
            sx={{ pb: 1.4 }}
          />
          <Divider />

          <CardContent sx={{ p: 2.2 }}>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", sm: "repeat(2,minmax(0,1fr))" },
                gap: 1.2,
              }}
            >
              <InfoCard
                icon={<CalendarMonthRoundedIcon sx={{ fontSize: 16 }} />}
                label="시작일"
                value={contract.start_date}
              />
              <InfoCard
                icon={<CalendarMonthRoundedIcon sx={{ fontSize: 16 }} />}
                label="만료일"
                value={contract.end_date}
              />
              {contract.amount != null && (
                <InfoCard
                  icon={<PaymentsRoundedIcon sx={{ fontSize: 16 }} />}
                  label="금액"
                  value={`${contract.amount.toLocaleString()}원`}
                />
              )}
              {contract.memo && (
                <InfoCard
                  wide
                  icon={<NotesRoundedIcon sx={{ fontSize: 16 }} />}
                  label="메모"
                  value={contract.memo}
                />
              )}
            </Box>
          </CardContent>

          <Divider />
          <CardActions sx={{ p: 2, gap: 1, flexDirection: { xs: "column", sm: "row" } }}>
            <Button
              variant="outlined"
              startIcon={<EditRoundedIcon />}
              onClick={() => router.push(`/dashboard/contracts/${contract.id}/edit`)}
              sx={{ width: { xs: "100%", sm: "auto" } }}
            >
              수정
            </Button>
            <Button
              variant="contained"
              color="error"
              startIcon={<DeleteOutlineRoundedIcon />}
              onClick={() => setDeleteOpen(true)}
              sx={{ width: { xs: "100%", sm: "auto" } }}
            >
              삭제
            </Button>
          </CardActions>
        </Card>

        <Dialog
          open={deleteOpen}
          onClose={() => !isDeleting && setDeleteOpen(false)}
        >
          <DialogTitle>삭제 확인</DialogTitle>
          <DialogContent>
            <Typography>이 계약을 삭제할까요?</Typography>
            {deleteError && (
              <Typography color="error" sx={{ mt: 1.5 }}>
                {deleteError}
              </Typography>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteOpen(false)} disabled={isDeleting}>
              취소
            </Button>
            <Button variant="contained" color="error" onClick={handleDeleteConfirm} disabled={isDeleting}>
              {isDeleting ? "삭제 중…" : "삭제"}
            </Button>
          </DialogActions>
        </Dialog>
      </Stack>
    </Box>
  );
}

function InfoCard({
  label,
  value,
  icon,
  wide = false,
}: {
  label: string;
  value: string;
  icon: ReactNode;
  wide?: boolean;
}) {
  return (
    <Box
      sx={{
        p: 1.6,
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 2.4,
        bgcolor: "background.default",
        gridColumn: wide ? { xs: "1 / -1", sm: "1 / -1" } : undefined,
      }}
    >
      <Stack direction="row" spacing={0.7} alignItems="center">
        <Box sx={{ color: "text.secondary", display: "flex", alignItems: "center" }}>{icon}</Box>
        <Typography variant="caption" color="text.secondary">
          {label}
        </Typography>
      </Stack>
      <Typography
        variant="body2"
        sx={{
          mt: 0.7,
          fontWeight: 600,
          whiteSpace: wide ? "pre-wrap" : "normal",
          wordBreak: "break-word",
        }}
      >
        {value}
      </Typography>
    </Box>
  );
}
