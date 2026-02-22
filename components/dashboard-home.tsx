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

        {/* 내 계약 현황 — 프로필/설정과 동일 카드 컨셉 */}
        <Box>
          <Typography variant="h5" fontWeight={700} gutterBottom>
            내 계약 현황
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
            총 계약·만료 예정·만료 지남
          </Typography>
          <ContractStatusCard
            total={contracts.length}
            soonCount={soonCount}
            expiredCount={expiredCount}
          />
        </Box>

        <Stack spacing={1.5}>
          <Box>
            <Typography variant="h5" fontWeight={700} gutterBottom>
              계약 목록
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {contracts.length}건
            </Typography>
          </Box>
          <ContractList contracts={contracts} />
        </Stack>
      </Stack>
    </Box>
  );
}

/** 내 계약 현황 카드: 프로필/설정과 동일 컨셉 (outlined, borderRadius 2) */
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
    <Card variant="outlined" sx={{ borderRadius: 2, borderColor: "divider" }}>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 0,
          py: 2,
          px: 2,
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
    <Box sx={{ px: 0.5, textAlign: "center" }}>
      <Typography variant="h6" fontWeight={700} color="text.primary">
        {value}
        <Typography component="span" variant="body2" color="text.secondary" sx={{ ml: 0.25 }}>
          {unit}
        </Typography>
      </Typography>
      <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.25 }}>
        {label}
      </Typography>
    </Box>
  );
}
