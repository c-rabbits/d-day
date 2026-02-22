"use client";

import { useMemo, useState } from "react";
import { Box, Card, FormControl, InputLabel, MenuItem, Select, Stack, Typography } from "@mui/material";
import { ContractList } from "@/components/contract-list";
import { DashboardBanner } from "@/components/dashboard-banner";
import { CONTRACT_CATEGORIES, type ContractCategory } from "@/lib/types";

export type ListSort = "end_date" | "category" | "amount";

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

const SORT_OPTIONS: { value: ListSort; label: string }[] = [
  { value: "end_date", label: "만료일" },
  { value: "category", label: "카테고리" },
  { value: "amount", label: "금액" },
];

function sortContracts(list: ContractRow[], sortBy: ListSort): ContractRow[] {
  const arr = [...list];
  if (sortBy === "end_date") {
    arr.sort((a, b) => (a.end_date < b.end_date ? -1 : a.end_date > b.end_date ? 1 : 0));
  } else if (sortBy === "category") {
    const order = CONTRACT_CATEGORIES as unknown as string[];
    arr.sort((a, b) => order.indexOf(a.category) - order.indexOf(b.category));
  } else {
    arr.sort((a, b) => {
      const va = a.amount ?? -1;
      const vb = b.amount ?? -1;
      return vb - va;
    });
  }
  return arr;
}

export function DashboardHome({
  contracts,
  soonCount,
  expiredCount,
}: DashboardHomeProps) {
  const [sortBy, setSortBy] = useState<ListSort>("end_date");
  const sortedContracts = useMemo(() => sortContracts(contracts, sortBy), [contracts, sortBy]);

  return (
    <Box sx={{ px: 2, pt: 0, pb: 3.5 }}>
      <Stack spacing={2.4}>
        <DashboardBanner />

        <Box>
          <Typography variant="h5" fontWeight={700} gutterBottom>
            내 계약 현황
          </Typography>
          <ContractStatusCard
            total={contracts.length}
            soonCount={soonCount}
            expiredCount={expiredCount}
          />
        </Box>

        <Stack spacing={1.5}>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 1 }}>
            <Typography variant="h5" fontWeight={700}>
              계약 목록
            </Typography>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel id="list-sort-label">필터</InputLabel>
              <Select
                labelId="list-sort-label"
                label="필터"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as ListSort)}
              >
                {SORT_OPTIONS.map((opt) => (
                  <MenuItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
          <ContractList contracts={sortedContracts} />
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
