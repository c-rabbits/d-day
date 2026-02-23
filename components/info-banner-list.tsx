"use client";

import { useRouter } from "next/navigation";
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CardMedia,
  Chip,
  Stack,
  Typography,
} from "@mui/material";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";

const INFO_ITEMS = [
  {
    title: "계약 등록 가이드",
    description: "계약을 빠르게 추가하고 만료일을 관리하는 기본 흐름을 확인하세요.",
    image: "/banners/contracts.svg",
    href: "/dashboard/contracts/new",
    buttonLabel: "등록하러 가기",
    category: "시작하기",
  },
  {
    title: "알림 설정 팁",
    description: "D-30, D-7, D-1 조합으로 실사용에 맞는 리마인더를 구성해보세요.",
    image: "/banners/notifications.svg",
    href: "/dashboard/settings",
    buttonLabel: "설정 보러가기",
    category: "알림",
  },
  {
    title: "계약 관리 전략",
    description: "카테고리별로 중요한 계약부터 우선 관리하는 방법을 정리했습니다.",
    image: "/banners/tips.svg",
    href: "/dashboard",
    buttonLabel: "대시보드 확인",
    category: "운영 팁",
  },
] as const;

export function InfoBannerList() {
  const router = useRouter();

  return (
    <Box sx={{ px: 2, pt: 3.5, pb: 14 }}>
      <Stack spacing={2.5}>
        <Box>
          <Typography variant="h5" fontWeight={700} gutterBottom>
            정보
          </Typography>
          <Typography variant="body2" color="text.secondary">
            자주 사용하는 기능을 카드로 모아뒀어요.
          </Typography>
        </Box>

        {INFO_ITEMS.map((item) => (
          <Card key={item.title} variant="outlined" sx={{ borderRadius: 2 }}>
            <CardMedia component="img" image={item.image} height="150" alt={item.title} />
            <CardContent sx={{ pb: 1.5 }}>
              <Chip
                label={item.category}
                size="small"
                color="primary"
                variant="outlined"
                sx={{ mb: 1 }}
              />
              <Typography variant="h6" sx={{ fontSize: "1.05rem", fontWeight: 700 }}>
                {item.title}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.8 }}>
                {item.description}
              </Typography>
            </CardContent>
            <CardActions sx={{ px: 2, pb: 2 }}>
              <Button
                variant="contained"
                endIcon={<ChevronRightRoundedIcon />}
                onClick={() => router.push(item.href)}
              >
                {item.buttonLabel}
              </Button>
            </CardActions>
          </Card>
        ))}
      </Stack>
    </Box>
  );
}
