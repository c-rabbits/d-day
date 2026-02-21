"use client";

import { Box, Card, CardContent, Stack, Typography } from "@mui/material";
import { ContractList } from "@/components/contract-list";
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
        <Box>
          <Typography
            variant="caption"
            sx={{ color: "primary.main", fontWeight: 700, letterSpacing: "0.08em" }}
          >
            DASHBOARD
          </Typography>
          <Typography variant="h5" sx={{ mt: 0.4, fontWeight: 700 }}>
            내 계약 현황
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.8 }}>
            만료 임박 건수를 먼저 확인하고 필요한 계약을 바로 관리하세요.
          </Typography>
        </Box>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(3, minmax(0,1fr))",
            gap: 1.2,
          }}
        >
          <SummaryCard label="총 계약" value={contracts.length} />
          <SummaryCard label="30일 내 만료" value={soonCount} highlight />
          <SummaryCard label="만료 지남" value={expiredCount} />
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

function SummaryCard({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: number;
  highlight?: boolean;
}) {
  return (
    <Card
      variant="outlined"
      sx={{
        borderRadius: 3,
        borderColor: "divider",
        bgcolor: highlight ? "primary.main" : "background.paper",
        color: highlight ? "primary.contrastText" : "text.primary",
      }}
    >
      <CardContent sx={{ p: 1.4, "&:last-child": { pb: 1.4 } }}>
        <Typography variant="caption" sx={{ opacity: highlight ? 0.86 : 0.8 }}>
          {label}
        </Typography>
        <Typography variant="h6" sx={{ mt: 0.2, fontWeight: 700 }}>
          {value}
        </Typography>
      </CardContent>
    </Card>
  );
}
