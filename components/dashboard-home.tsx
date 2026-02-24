"use client";

import { useMemo, useState } from "react";
import { Box, Card, FormControl, InputLabel, MenuItem, Select, Stack, Typography } from "@mui/material";
import { ContractList } from "@/components/contract-list";
import { DashboardBanner } from "@/components/dashboard-banner";
import { isSubscriptionContract } from "@/lib/dday";
import { CONTRACT_CATEGORIES, type ContractCategory } from "@/lib/types";

export type ListSort = "end_date" | "category" | "amount" | "contract_type";

export type ListFilter = "all" | "subscription" | "longterm";

type ContractRow = {
  id: string;
  title: string;
  category: ContractCategory;
  end_date: string;
  amount: number | null;
  memo: string | null;
};

type DashboardHomeProps = {
  contracts: ContractRow[];
  subscriptionTotal: number;
  subscriptionSoon7: number;
  subscriptionSoon1: number;
  longtermTotal: number;
  longtermSoon30: number;
  longtermExpired: number;
};

const SORT_OPTIONS: { value: ListSort; label: string }[] = [
  { value: "end_date", label: "만료일" },
  { value: "category", label: "카테고리" },
  { value: "amount", label: "금액" },
  { value: "contract_type", label: "월/장기" },
];

function sortContracts(list: ContractRow[], sortBy: ListSort): ContractRow[] {
  const arr = [...list];
  if (sortBy === "end_date") {
    arr.sort((a, b) => (a.end_date < b.end_date ? -1 : a.end_date > b.end_date ? 1 : 0));
  } else if (sortBy === "category") {
    const order = CONTRACT_CATEGORIES as unknown as string[];
    arr.sort((a, b) => order.indexOf(a.category) - order.indexOf(b.category));
  } else if (sortBy === "amount") {
    arr.sort((a, b) => {
      const va = a.amount ?? -1;
      const vb = b.amount ?? -1;
      return vb - va;
    });
  } else {
    arr.sort((a, b) => {
      const aSub = isSubscriptionContract(a.end_date) ? 0 : 1;
      const bSub = isSubscriptionContract(b.end_date) ? 0 : 1;
      return aSub - bSub;
    });
  }
  return arr;
}

const FILTER_OPTIONS: { value: ListFilter; label: string }[] = [
  { value: "all", label: "전체보기" },
  { value: "subscription", label: "월구독" },
  { value: "longterm", label: "정기계약" },
];

function filterContracts(list: ContractRow[], filter: ListFilter): ContractRow[] {
  if (filter === "all") return list;
  if (filter === "subscription") return list.filter((c) => isSubscriptionContract(c.end_date));
  return list.filter((c) => !isSubscriptionContract(c.end_date));
}

export function DashboardHome({
  contracts,
  subscriptionTotal,
  subscriptionSoon7,
  subscriptionSoon1,
  longtermTotal,
  longtermSoon30,
  longtermExpired,
}: DashboardHomeProps) {
  const [filter, setFilter] = useState<ListFilter>("all");
  const [sortBy, setSortBy] = useState<ListSort>("end_date");
  const filteredContracts = useMemo(() => filterContracts(contracts, filter), [contracts, filter]);
  const sortedContracts = useMemo(() => sortContracts(filteredContracts, sortBy), [filteredContracts, sortBy]);

  return (
    <Box sx={{ px: 2, pt: 0, pb: 14 }}>
      <Stack spacing={2.4}>
        <DashboardBanner />

        <Box>
          <Typography variant="h5" fontWeight={700} gutterBottom>
            내 계약 현황
          </Typography>
          <ContractStatusCard
            subscriptionTotal={subscriptionTotal}
            subscriptionSoon7={subscriptionSoon7}
            subscriptionSoon1={subscriptionSoon1}
            longtermTotal={longtermTotal}
            longtermSoon30={longtermSoon30}
            longtermExpired={longtermExpired}
          />
        </Box>

        <Stack spacing={1.5}>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 1 }}>
            <Typography variant="h5" fontWeight={700}>
              계약 목록
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <FormControl size="small" sx={{ minWidth: 92 }} variant="outlined">
                <InputLabel id="list-filter-label">구독</InputLabel>
                <Select
                  labelId="list-filter-label"
                  label="구독"
                  value={filter}
                  onChange={(e) => setFilter(e.target.value as ListFilter)}
                  sx={{ fontSize: "0.875rem", py: 0.5 }}
                >
                  {FILTER_OPTIONS.map((opt) => (
                    <MenuItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl size="small" sx={{ minWidth: 92 }} variant="outlined">
                <InputLabel id="list-sort-label">정렬</InputLabel>
                <Select
                  labelId="list-sort-label"
                  label="정렬"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as ListSort)}
                  sx={{ fontSize: "0.875rem", py: 0.5 }}
                >
                  {SORT_OPTIONS.map((opt) => (
                    <MenuItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </Box>
          <ContractList contracts={sortedContracts} />
        </Stack>
      </Stack>
    </Box>
  );
}

/** 내 계약 현황 카드: 월구독 / 장기계약 구분 */
function ContractStatusCard({
  subscriptionTotal,
  subscriptionSoon7,
  subscriptionSoon1,
  longtermTotal,
  longtermSoon30,
  longtermExpired,
}: {
  subscriptionTotal: number;
  subscriptionSoon7: number;
  subscriptionSoon1: number;
  longtermTotal: number;
  longtermSoon30: number;
  longtermExpired: number;
}) {
  return (
    <Card variant="outlined" sx={{ borderRadius: 2, borderColor: "divider" }}>
      <Stack divider={<Box sx={{ borderTop: 1, borderColor: "divider" }} />}>
        <Box sx={{ py: 1.5, px: 2 }}>
          <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ display: "block", mb: 1 }}>
            월구독
          </Typography>
          <Box sx={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 0 }}>
            <StatusColumn value={subscriptionTotal} unit="건" label="총 계약" />
            <StatusColumn value={subscriptionSoon7} unit="건" label="7일 내 만료" />
            <StatusColumn value={subscriptionSoon1} unit="건" label="1일 내 만료" />
          </Box>
        </Box>
        <Box sx={{ py: 1.5, px: 2 }}>
          <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ display: "block", mb: 1 }}>
            장기계약
          </Typography>
          <Box sx={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 0 }}>
            <StatusColumn value={longtermTotal} unit="건" label="총 계약" />
            <StatusColumn value={longtermSoon30} unit="건" label="30일 내 만료" />
            <StatusColumn value={longtermExpired} unit="건" label="만료 지남" />
          </Box>
        </Box>
      </Stack>
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
