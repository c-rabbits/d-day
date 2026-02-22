"use client";

import { useRouter } from "next/navigation";
import {
  Avatar,
  Box,
  Card,
  CardActionArea,
  Chip,
  Stack,
  Typography,
} from "@mui/material";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import DescriptionIcon from "@mui/icons-material/Description";
import HomeIcon from "@mui/icons-material/Home";
import SmartphoneIcon from "@mui/icons-material/Smartphone";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import FitnessCenterIcon from "@mui/icons-material/FitnessCenter";
import InventoryIcon from "@mui/icons-material/Inventory";
import PlayCircleIcon from "@mui/icons-material/PlayCircle";
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

  if (contracts.length === 0) {
    return (
      <Box
        sx={{
          py: 8,
          border: (theme) => `1px dashed ${theme.palette.divider}`,
          borderRadius: 1.5,
          bgcolor: "background.paper",
          textAlign: "center",
        }}
      >
        <DescriptionIcon sx={{ fontSize: 44, color: "text.secondary", mb: 1 }} />
        <Typography variant="body1" color="text.secondary">
          등록된 계약이 없어요
        </Typography>
        <Typography variant="body2" color="text.secondary">
          아래 + 버튼으로 첫 계약을 추가해 보세요
        </Typography>
      </Box>
    );
  }

  return (
    <Stack spacing={1.5}>
      {contracts.map((c) => {
        const dday = getDday(c.end_date);
        const ddayColor = dday <= 7 ? "error" : dday <= 30 ? "warning" : "default";

        return (
          <Card
            key={c.id}
            variant="outlined"
            sx={{
              borderRadius: 1.5,
              borderColor: "divider",
              transition: "transform .25s ease, box-shadow .25s ease, background-color .25s ease",
              "&:hover": {
                transform: "translateY(-2px)",
                boxShadow: 2,
              },
            }}
          >
            <CardActionArea onClick={() => router.push(`/dashboard/contracts/${c.id}`)}>
              <Stack spacing={1.5} sx={{ p: 2 }}>
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
                      color: "rgba(0,0,0,0.65)",
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

                {/* 하단: 만료일 / 금액 한 줄 정렬 */}
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
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
                  {c.amount != null ? (
                    <Typography variant="body2" fontWeight={600} sx={{ flexShrink: 0 }}>
                      {c.amount.toLocaleString()}원
                    </Typography>
                  ) : (
                    <Typography variant="body2" color="text.secondary" sx={{ flexShrink: 0 }}>
                      금액 없음
                    </Typography>
                  )}
                </Stack>
              </Stack>
            </CardActionArea>
          </Card>
        );
      })}
    </Stack>
  );
}
