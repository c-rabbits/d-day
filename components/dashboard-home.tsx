"use client";

import { Box, Card, Stack, Typography } from "@mui/material";
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
    <Box sx={{ px: 2, pt: 0, pb: 3.5 }}>
      <Stack spacing={2.4}>
        {/* 풀폭 배너: 슬라이더만 100vw, 위 빈공간 없음 */}
        <DashboardBanner />

        {/* 내 계약 현황 — 다크 카드 3열 + 프로그레스 바 */}
        <Box>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              fontSize: "1.02rem",
              mb: 1.5,
              color: "text.primary",
            }}
          >
            내 계약 현황
          </Typography>
          <ContractStatusCard
            total={contracts.length}
            soonCount={soonCount}
            expiredCount={expiredCount}
          />
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

/** 내 계약 현황 카드: 밝은 회색 배경, 짙은 회색 글씨, 슬림한 높이 */
function ContractStatusCard({
  total,
  soonCount,
  expiredCount,
}: {
  total: number;
  soonCount: number;
  expiredCount: number;
}) {
  return (
    <Card
      variant="outlined"
      sx={{
        borderRadius: 1.5,
        borderColor: "divider",
        bgcolor: "#e8e8e8",
        color: "#333",
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 0,
          py: 1.25,
          px: 1.5,
        }}
      >
        <StatusColumn value={total} unit="건" label="총 계약" />
        <StatusColumn value={soonCount} unit="건" label="30일 내 만료" />
        <StatusColumn value={expiredCount} unit="건" label="만료 지남" />
      </Box>
    </Card>
  );
}

function StatusColumn({
  value,
  unit,
  label,
}: {
  value: number;
  unit: string;
  label: string;
}) {
  return (
    <Box sx={{ px: 0.25, textAlign: "center" }}>
      <Box sx={{ display: "flex", alignItems: "baseline", justifyContent: "center", flexWrap: "wrap", gap: 0.2 }}>
        <Typography component="span" sx={{ fontSize: "1.1rem", fontWeight: 700, color: "#333" }}>
          {value}
        </Typography>
        <Typography component="span" sx={{ fontSize: "0.7rem", color: "#555" }}>
          {unit}
        </Typography>
      </Box>
      <Typography sx={{ fontSize: "0.65rem", color: "#666", mt: 0.2 }}>
        {label}
      </Typography>
    </Box>
  );
}
