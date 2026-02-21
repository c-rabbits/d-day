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
import EditNoteRoundedIcon from "@mui/icons-material/EditNoteRounded";
import SaveRoundedIcon from "@mui/icons-material/SaveRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import NotificationsActiveRoundedIcon from "@mui/icons-material/NotificationsActiveRounded";

type ContractRow = {
  id: string;
  title: string;
  category: ContractCategory;
  start_date: string;
  end_date: string;
  amount: number | null;
  memo: string | null;
};

export function ContractEditForm({ contract }: { contract: ContractRow }) {
  const router = useRouter();
  const [title, setTitle] = useState(contract.title);
  const [category, setCategory] = useState<ContractCategory>(contract.category);
  const [startDate, setStartDate] = useState(contract.start_date);
  const [endDate, setEndDate] = useState(contract.end_date);
  const [amount, setAmount] = useState(contract.amount?.toString() ?? "");
  const [memo, setMemo] = useState(contract.memo ?? "");
  const [notifyDays, setNotifyDays] = useState<NotifyDaysBefore[]>([]);
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
    if (!title.trim() || !startDate || !endDate) {
      setError("계약명, 시작일, 만료일을 입력해 주세요.");
      return;
    }
    setIsSubmitting(true);
    try {
      const supabase = createClient();
      const { error: updateError } = await supabase
        .from("contracts")
        .update({
          title: title.trim(),
          category,
          start_date: startDate,
          end_date: endDate,
          amount: amount ? parseFloat(amount.replace(/,/g, "")) || null : null,
          memo: memo.trim() || null,
        })
        .eq("id", contract.id);

      if (updateError) throw updateError;

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
      router.push(`/dashboard/contracts/${contract.id}`);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "저장에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card variant="outlined" sx={{ borderRadius: 3.2 }}>
      <CardContent sx={{ p: 2.4 }}>
        <Stack spacing={2.1}>
          <Box
            sx={{
              p: 1.7,
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 3,
              bgcolor: "background.default",
            }}
          >
            <Stack direction="row" spacing={0.8} alignItems="center">
              <EditNoteRoundedIcon color="primary" fontSize="small" />
              <Typography
                variant="caption"
                sx={{ color: "primary.main", fontWeight: 700, letterSpacing: "0.08em" }}
              >
                EDIT MODE
              </Typography>
            </Stack>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.6 }}>
              필수 항목(계약명, 시작일, 만료일)을 확인한 뒤 저장해 주세요.
            </Typography>
          </Box>

          <Box component="form" onSubmit={handleSubmit}>
            <Stack spacing={1.7}>
              <TextField
                label="계약명 *"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                required
                fullWidth
              />

              <Stack spacing={0.9}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                  카테고리
                </Typography>
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0,1fr))" },
                    gap: 0.9,
                  }}
                >
                  {CONTRACT_CATEGORIES.map((targetCategory) => (
                    <Button
                      key={targetCategory}
                      type="button"
                      variant={category === targetCategory ? "contained" : "outlined"}
                      color={category === targetCategory ? "primary" : "inherit"}
                      onClick={() => setCategory(targetCategory)}
                      sx={{ justifyContent: "flex-start", py: 1.1 }}
                    >
                      {CATEGORY_LABELS[targetCategory]}
                    </Button>
                  ))}
                </Box>
              </Stack>

              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
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
                <TextField
                  label="만료일 *"
                  type="date"
                  value={endDate}
                  onChange={(event) => setEndDate(event.target.value)}
                  InputLabelProps={{ shrink: true }}
                  required
                  fullWidth
                />
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
                  <NotificationsActiveRoundedIcon fontSize="small" color="primary" />
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                    알림 (추가 설정)
                  </Typography>
                </Stack>
                <Stack direction="row" spacing={0.8} flexWrap="wrap" useFlexGap>
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

              {error && <Alert severity="error">{error}</Alert>}

              <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={<SaveRoundedIcon />}
                  disabled={isSubmitting}
                  sx={{ width: { xs: "100%", sm: "auto" } }}
                >
                  {isSubmitting ? "저장 중…" : "저장"}
                </Button>
                <Button
                  type="button"
                  variant="outlined"
                  startIcon={<CloseRoundedIcon />}
                  onClick={() => router.push(`/dashboard/contracts/${contract.id}`)}
                  sx={{ width: { xs: "100%", sm: "auto" } }}
                >
                  취소
                </Button>
              </Stack>
            </Stack>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}
