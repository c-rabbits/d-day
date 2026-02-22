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
import { createClient } from "@/lib/supabase/client";
import { getDday, getDdayLabel } from "@/lib/dday";
import { CATEGORY_LABELS, type ContractCategory } from "@/lib/types";

const CATEGORY_ICONS: Record<ContractCategory, React.ComponentType<{ sx?: object }>> = {
  RENT: HomeIcon,
  PHONE: SmartphoneIcon,
  CAR_INSURANCE: DirectionsCarIcon,
  GYM: FitnessCenterIcon,
  RENTAL: InventoryIcon,
  STREAMING: PlayCircleIcon,
  OTHER: DescriptionIcon,
};

/** 카테고리별 파스텔 배경색 (아이콘 네모 배경) */
const CATEGORY_PASTEL: Record<ContractCategory, string> = {
  RENT: "#B8D4E3",      // 연한 하늘
  PHONE: "#B5EAD7",      // 연한 민트
  CAR_INSURANCE: "#FFDAC1", // 연한 복숭아
  GYM: "#E2BEF1",        // 연한 라벤더
  RENTAL: "#C7CEEA",     // 연한 퍼플
  STREAMING: "#ACE7FF",  // 연한 스카이
  OTHER: "#D4C5B9",      // 연한 베이지
};

type ContractRow = {
  id: string;
  title: string;
  category: ContractCategory;
  end_date: string;
  amount: number | null;
};

export function ContractList({ contracts }: { contracts: ContractRow[] }) {
  const router = useRouter();
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteConfirm = async () => {
    if (!deleteTargetId) return;
    setIsDeleting(true);
    const supabase = createClient();
    const { error } = await supabase
      .from("contracts")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", deleteTargetId);
    setIsDeleting(false);
    setDeleteTargetId(null);
    if (error) {
      alert("삭제에 실패했습니다.");
      return;
    }
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
          const dday = getDday(c.end_date);
          const ddayColor = dday <= 7 ? "error" : dday <= 30 ? "warning" : "default";
          const isExpired = dday < 0;

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
                  {/* 상단: 아이콘 + 제목/카테고리 + D-day */}
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
                      <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.25 }}>
                        {CATEGORY_LABELS[c.category]}
                      </Typography>
                    </Box>
                    <Chip
                      label={getDdayLabel(c.end_date)}
                      color={ddayColor}
                      size="small"
                      sx={{ flexShrink: 0, fontWeight: 700 }}
                    />
                  </Stack>

                  {/* 하단: 만료일 / 금액 / 만료 시 삭제 버튼 */}
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
                        만료 {c.end_date}
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

      <Dialog open={!!deleteTargetId} onClose={() => setDeleteTargetId(null)}>
        <DialogTitle>삭제 확인</DialogTitle>
        <DialogContent>
          <Typography>만료된 계약을 삭제하시겠습니까?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteTargetId(null)}>취소</Button>
          <Button variant="contained" color="error" onClick={handleDeleteConfirm} disabled={isDeleting}>
            {isDeleting ? "삭제 중…" : "삭제"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
