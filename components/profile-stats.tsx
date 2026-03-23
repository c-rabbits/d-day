"use client";

import { useEffect, useState } from "react";
import { Box, Card, CardContent, Stack, Typography } from "@mui/material";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { createClient } from "@/lib/supabase/client";
import {
  Contract,
  ContractCategory,
  CATEGORY_LABELS,
  CATEGORY_PASTEL,
} from "@/lib/types";

/** 월구독 여부 */
function isMonthly(c: Contract) {
  return c.end_date === "9999-12-31";
}

/** 카테고리별 집계 */
function groupByCategory(contracts: Contract[]) {
  const map: Record<string, { category: ContractCategory; total: number; count: number }> = {};
  for (const c of contracts) {
    if (!map[c.category]) {
      map[c.category] = { category: c.category, total: 0, count: 0 };
    }
    map[c.category].total += c.amount ?? 0;
    map[c.category].count += 1;
  }
  return Object.values(map).sort((a, b) => b.total - a.total);
}

export function ProfileStats() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("contracts")
        .select("*")
        .eq("user_id", user.id)
        .is("deleted_at", null);

      setContracts((data as Contract[]) ?? []);
      setLoading(false);
    })();
  }, []);

  if (loading) {
    return (
      <Box sx={{ textAlign: "center", py: 4 }}>
        <Typography color="text.secondary">불러오는 중...</Typography>
      </Box>
    );
  }

  const monthlySubs = contracts.filter(isMonthly);
  const longTerms = contracts.filter((c) => !isMonthly(c));
  const monthlyTotal = monthlySubs.reduce((s, c) => s + (c.amount ?? 0), 0);
  const longTermTotal = longTerms.reduce((s, c) => s + (c.amount ?? 0), 0);
  const totalAmount = monthlyTotal + longTermTotal;

  const categoryData = groupByCategory(contracts);
  const pieData = categoryData
    .filter((d) => d.total > 0)
    .map((d) => ({
      name: CATEGORY_LABELS[d.category],
      value: d.total,
      color: CATEGORY_PASTEL[d.category],
    }));

  const barData = categoryData.map((d) => ({
    name: CATEGORY_LABELS[d.category],
    amount: d.total,
    fill: CATEGORY_PASTEL[d.category],
  }));

  // 만료 임박 (30일 이내)
  const today = new Date();
  const expiringSoon = longTerms.filter((c) => {
    const end = new Date(c.end_date);
    const diff = Math.ceil((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diff >= 0 && diff <= 30;
  });

  return (
    <Stack spacing={2}>
      {/* 요약 카드 */}
      <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.5 }}>
        <SummaryCard
          label="월 구독"
          value={`${monthlySubs.length}건`}
          sub={`${monthlyTotal.toLocaleString()}원/월`}
          color="#A96BFF"
        />
        <SummaryCard
          label="장기 계약"
          value={`${longTerms.length}건`}
          sub={`${longTermTotal.toLocaleString()}원`}
          color="#44B2FF"
        />
        <SummaryCard
          label="총 관리 항목"
          value={`${contracts.length}건`}
          sub={`${totalAmount.toLocaleString()}원`}
          color="#FFC434"
        />
        <SummaryCard
          label="만료 임박"
          value={`${expiringSoon.length}건`}
          sub="30일 이내"
          color={expiringSoon.length > 0 ? "#FF6295" : "#6BCB77"}
        />
      </Box>

      {/* 카테고리별 지출 비율 (도넛 차트) */}
      {pieData.length > 0 && (
        <Card variant="outlined" sx={{ borderRadius: 2 }}>
          <CardContent>
            <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1 }}>
              카테고리별 비율
            </Typography>
            <Box sx={{ width: "100%", height: 200, position: "relative" }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    dataKey="value"
                    stroke="none"
                  >
                    {pieData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              {/* 도넛 중앙 텍스트 */}
              <Box
                sx={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  textAlign: "center",
                }}
              >
                <Typography variant="caption" color="text.secondary">
                  합계
                </Typography>
                <Typography variant="body2" fontWeight={700}>
                  {totalAmount.toLocaleString()}원
                </Typography>
              </Box>
            </Box>
            {/* 범례 */}
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 1 }}>
              {pieData.map((d, i) => (
                <Box key={i} sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  <Box
                    sx={{
                      width: 10,
                      height: 10,
                      borderRadius: "50%",
                      bgcolor: d.color,
                    }}
                  />
                  <Typography variant="caption" color="text.secondary">
                    {d.name}
                  </Typography>
                </Box>
              ))}
            </Box>
          </CardContent>
        </Card>
      )}

      {/* 카테고리별 금액 (바 차트) */}
      {barData.length > 0 && (
        <Card variant="outlined" sx={{ borderRadius: 2 }}>
          <CardContent>
            <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1 }}>
              카테고리별 금액
            </Typography>
            <Box sx={{ width: "100%", height: 200 }}>
              <ResponsiveContainer>
                <BarChart data={barData} layout="vertical" margin={{ left: 10, right: 20 }}>
                  <XAxis type="number" hide />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={60}
                    tick={{ fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    formatter={(value) => [`${Number(value).toLocaleString()}원`, "금액"]}
                    contentStyle={{ borderRadius: 8, fontSize: 13 }}
                  />
                  <Bar dataKey="amount" radius={[0, 6, 6, 0]} barSize={16}>
                    {barData.map((entry, i) => (
                      <Cell key={i} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* 데이터 없을 때 */}
      {contracts.length === 0 && (
        <Card variant="outlined" sx={{ borderRadius: 2 }}>
          <CardContent sx={{ textAlign: "center", py: 4 }}>
            <Typography color="text.secondary">
              등록된 계약이 없어요.
            </Typography>
            <Typography variant="caption" color="text.secondary">
              구독이나 계약을 추가하면 통계가 표시됩니다.
            </Typography>
          </CardContent>
        </Card>
      )}
    </Stack>
  );
}

/** 요약 카드 */
function SummaryCard({
  label,
  value,
  sub,
  color,
}: {
  label: string;
  value: string;
  sub: string;
  color: string;
}) {
  return (
    <Card
      variant="outlined"
      sx={{
        borderRadius: 2,
        borderLeft: `3px solid ${color}`,
      }}
    >
      <CardContent sx={{ p: 1.5, "&:last-child": { pb: 1.5 } }}>
        <Typography variant="caption" color="text.secondary">
          {label}
        </Typography>
        <Typography variant="h6" fontWeight={700} sx={{ lineHeight: 1.3 }}>
          {value}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {sub}
        </Typography>
      </CardContent>
    </Card>
  );
}
