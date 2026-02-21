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
        {/* 2:1 라운드 배너 3개, 5초 로테이션 */}
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

/** 다크 카드 3열: 값 + 단위, 라벨, 프로그레스 바 (첨부 참고) */
function ContractStatusCard({
  total,
  soonCount,
  expiredCount,
}: {
  total: number;
  soonCount: number;
  expiredCount: number;
}) {
  const max = Math.max(total, 1);
  const soonPct = Math.min(100, (soonCount / max) * 100);
  const expiredPct = Math.min(100, (expiredCount / max) * 100);

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
        <StatusColumn
          value={total}
          unit="건"
          label="총 계약"
          progress={100}
        />
        <StatusColumn
          value={soonCount}
          unit="건"
          label="30일 내 만료"
          progress={soonPct}
        />
        <StatusColumn
          value={expiredCount}
          unit="건"
          label="만료 지남"
          progress={expiredPct}
        />
      </Box>
    </Card>
  );
}

function StatusColumn({
  value,
  unit,
  label,
  progress,
}: {
  value: number;
  unit: string;
  label: string;
  progress: number;
}) {
  return (
    <Box sx={{ px: 0.5 }}>
      <Box sx={{ display: "flex", alignItems: "baseline", flexWrap: "wrap", gap: 0.25 }}>
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
      <Box
        sx={{
          mt: 1,
          height: 4,
          borderRadius: 2,
          bgcolor: "rgba(255,255,255,0.2)",
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            width: `${progress}%`,
            height: "100%",
            borderRadius: 2,
            bgcolor: "#fff",
            transition: "width 0.4s ease",
          }}
        />
      </Box>
    </Box>
  );
}
