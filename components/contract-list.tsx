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
              <Stack spacing={1.2} sx={{ p: 1.5 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1.2}>
                  <Stack direction="row" spacing={1.2} sx={{ minWidth: 0 }}>
                    <Avatar
                      variant="rounded"
                      sx={{
                        width: 40,
                        height: 40,
                        bgcolor: "primary.main",
                        color: "primary.contrastText",
                      }}
                    >
                      {(() => {
                        const Icon = CATEGORY_ICONS[c.category];
                        return <Icon sx={{ fontSize: 22 }} />;
                      })()}
                    </Avatar>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography noWrap variant="subtitle1" fontWeight={700}>
                        {c.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {CATEGORY_LABELS[c.category]}
                      </Typography>
                    </Box>
                  </Stack>

                  <Chip
                    label={getDdayLabel(c.end_date)}
                    color={ddayColor}
                    size="small"
                    sx={{ fontWeight: 700 }}
                  />
                </Stack>

                <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1.2}>
                  <Stack direction="row" spacing={0.6} alignItems="center">
                    <CalendarTodayIcon sx={{ fontSize: 14, color: "text.secondary" }} />
                    <Typography variant="body2" color="text.secondary">
                      만료일 {c.end_date}
                    </Typography>
                  </Stack>
                  {c.amount != null && (
                    <Typography variant="subtitle2" fontWeight={700}>
                      {c.amount.toLocaleString()}원
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
