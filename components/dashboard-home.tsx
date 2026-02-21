"use client";

import { Box, Card, CardContent, Stack, Typography } from "@mui/material";
import { ContractList } from "@/components/contract-list";
import { DashboardBanner } from "@/components/dashboard-banner";
import type { ContractCategory } from "@/lib/types";

type ContractRow = {
  id: string;
  title: string;
  category: ContractCategory;
  end_date: string;
  amount: number | null;
};

type DashboardHomeProps = {
  contracts: ContractRow[];
  soonCount: number;
  expiredCount: number;
};

export function DashboardHome({
  contracts,
  soonCount,
  expiredCount,
}: DashboardHomeProps) {
  return (
    <Box sx={{ px: 2, py: 3.5 }}>
      <Stack spacing={2.4}>
        {/* 2:1 라운드 배너 3개, 5초 로테이션 */}
        <DashboardBanner />

        {/* 내 계약 현황 — 작은 라운드 네모 3개, 파스텔톤 */}
        <Box>
          <Typography
            variant="subtitle1"
            sx={{
              fontWeight: 700,
              fontSize: "0.875rem",
              mb: 1.5,
              color: "text.primary",
            }}
          >
            내 계약 현황
          </Typography>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(3, minmax(0,1fr))",
              gap: 1.5,
            }}
          >
            <SummaryCard label="총 계약" value={contracts.length} variant="default" />
            <SummaryCard label="30일 내 만료" value={soonCount} highlight variant="soon" />
            <SummaryCard label="만료 지남" value={expiredCount} variant="expired" />
          </Box>
        </Box>

        <Stack spacing={1.2}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h6" sx={{ fontSize: "1.02rem", fontWeight: 700 }}>
              계약 목록
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {contracts.length}건
            </Typography>
          </Stack>
          <ContractList contracts={contracts} />
        </Stack>
      </Stack>
    </Box>
  );
}

/** 파스텔톤 배색 */
const PASTEL = {
  default: { bg: "#e3f2fd", text: "#1565c0" },
  soon: { bg: "#bbdefb", text: "#0d47a1" },
  expired: { bg: "#ffe0b2", text: "#e65100" },
};

function SummaryCard({
  label,
  value,
  highlight = false,
  variant = "default",
}: {
  label: string;
  value: number;
  highlight?: boolean;
  variant?: "default" | "soon" | "expired";
}) {
  const { bg, text } = PASTEL[variant];
  const textColor = highlight ? "#fff" : text;
  const bgColor = highlight ? "#64b5f6" : bg;

  return (
    <Card
      variant="outlined"
      sx={{
        borderRadius: 2,
        border: "none",
        bgcolor: bgColor,
        color: textColor,
      }}
    >
      <CardContent sx={{ p: 1.5, "&:last-child": { pb: 1.5 } }}>
        <Typography
          variant="body2"
          sx={{
            fontWeight: 600,
            fontSize: "0.8125rem",
            opacity: highlight ? 0.95 : 0.9,
          }}
        >
          {label}
        </Typography>
        <Typography variant="h5" sx={{ mt: 0.4, fontWeight: 700, lineHeight: 1.2 }}>
          {value}
        </Typography>
      </CardContent>
    </Card>
  );
}
