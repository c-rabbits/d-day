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
    <Box sx={{ px: 2, py: 3.5 }}>
      <Stack spacing={2.4}>
        {/* 풀폭 배너: 화면 가득, 가로 2.5:1, 가운데 정렬, 무한 오른쪽 흐름 */}
        <Box sx={{ mx: -2, width: "calc(100% + 32px)" }}>
          <DashboardBanner />
        </Box>

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

/** 다크 카드 3열: 값 + 단위, 라벨 (프로그레스 바 없음) */
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
      sx={{
        borderRadius: 2.5,
        bgcolor: "#2d2d2d",
        color: "#fff",
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 0,
          p: 2,
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
      <Box sx={{ display: "flex", alignItems: "baseline", justifyContent: "center", flexWrap: "wrap", gap: 0.25 }}>
        <Typography component="span" sx={{ fontSize: "1.25rem", fontWeight: 700, color: "#fff" }}>
          {value}
        </Typography>
        <Typography component="span" sx={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.9)" }}>
          {unit}
        </Typography>
      </Box>
      <Typography sx={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.6)", mt: 0.25 }}>
        {label}
      </Typography>
    </Box>
  );
}
