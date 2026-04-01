"use client";

import { useEffect, useState } from "react";
import { Box, Card, CardContent, Stack, Typography } from "@mui/material";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { createClient } from "@/lib/supabase/client";
import {
  Contract,
  ContractCategory,
  CATEGORY_LABELS,
  CATEGORY_PASTEL,
} from "@/lib/types";
import { getDday, getDdayForPaymentDay } from "@/lib/dday";

/** 월구독 여부 */
function isMonthly(c: Contract) {
  return c.end_date === "9999-12-31";
}

/** memo에서 지출일 추출 */
function getPaymentDay(c: Contract): number | null {
  if (!c.memo) return null;
  const m = c.memo.match(/지출일=(\d+)/);
  return m ? Number(m[1]) : null;
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

/** 차트/그래프 터치 방지 스타일 */
const noInteraction = {
  pointerEvents: "none" as const,
  userSelect: "none" as const,
  WebkitUserSelect: "none" as const,
  WebkitTouchCallout: "none" as const,
};

export function ProfileStats() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { data } = await supabase
        .from("contracts")
        .select("*")
        .eq("user_id", user.id)
        .is("deleted_at", null);

      setContracts((data as Contract[]) ?? []);
      setLoading(false);
    })().catch(() => setLoading(false));
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

  // 월구독: 7일 이내, 1일 이내 만료
  const monthly7 = monthlySubs.filter((c) => {
    const day = getPaymentDay(c);
    if (day == null) return false;
    const d = getDdayForPaymentDay(day);
    return d >= 0 && d <= 7;
  });
  const monthly1 = monthlySubs.filter((c) => {
    const day = getPaymentDay(c);
    if (day == null) return false;
    const d = getDdayForPaymentDay(day);
    return d >= 0 && d <= 1;
  });

  // 장기계약: 30일 이내, 만료 지남
  const longTerm30 = longTerms.filter((c) => {
    const d = getDday(c.end_date);
    return d >= 0 && d <= 30;
  });
  const longTermExpired = longTerms.filter((c) => {
    const d = getDday(c.end_date);
    return d < 0;
  });

  const monthlyTotal = monthlySubs.reduce((s, c) => s + (c.amount ?? 0), 0);
  const longTermTotal = longTerms.reduce((s, c) => s + (c.amount ?? 0), 0);

  const monthlyCategoryData = groupByCategory(monthlySubs);
  const longTermCategoryData = groupByCategory(longTerms);

  const monthlyPieData = monthlyCategoryData
    .filter((d) => d.total > 0)
    .map((d) => ({
      name: CATEGORY_LABELS[d.category],
      value: d.total,
      color: CATEGORY_PASTEL[d.category],
    }));

  const longTermPieData = longTermCategoryData
    .filter((d) => d.total > 0)
    .map((d) => ({
      name: CATEGORY_LABELS[d.category],
      value: d.total,
      color: CATEGORY_PASTEL[d.category],
    }));

  if (contracts.length === 0) {
    return (
      <Card variant="outlined" sx={{ borderRadius: 2 }}>
        <CardContent sx={{ textAlign: "center", py: 4 }}>
          <Typography color="text.secondary">등록된 계약이 없어요.</Typography>
          <Typography variant="caption" color="text.secondary">
            구독이나 계약을 추가하면 통계가 표시됩니다.
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Stack spacing={3}>
      {/* ━━━ 월 구독 섹션 ━━━ */}
      <Box>
        <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1.5 }}>
          월 구독
        </Typography>

        {/* 요약 카드 3개 */}
        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 1 }}>
          <SummaryCard label="총 계약" value={`${monthlySubs.length}건`} color="#44B2FF" />
          <SummaryCard
            label="7일 내 결제"
            value={`${monthly7.length}건`}
            color={monthly7.length > 0 ? "#FF7E44" : "#6BCB77"}
          />
          <SummaryCard
            label="1일 내 결제"
            value={`${monthly1.length}건`}
            color={monthly1.length > 0 ? "#FF6295" : "#6BCB77"}
          />
        </Box>

        {/* 도넛 차트 + 카테고리별 금액 */}
        {monthlyPieData.length > 0 && (
          <Card variant="outlined" sx={{ borderRadius: 2, mt: 1.5 }}>
            <CardContent>
              <Box sx={{ width: "100%", height: 200, position: "relative", ...noInteraction }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={monthlyPieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      dataKey="value"
                      stroke="none"
                      isAnimationActive={false}
                    >
                      {monthlyPieData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
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
                    월 합계
                  </Typography>
                  <Typography variant="body2" fontWeight={700}>
                    {monthlyTotal.toLocaleString()}원
                  </Typography>
                </Box>
              </Box>

              {/* 카테고리별 항목 */}
              <Stack spacing={1} sx={{ mt: 1.5 }}>
                {monthlyCategoryData.map((d) => (
                  <Box
                    key={d.category}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Box
                        sx={{
                          width: 10,
                          height: 10,
                          borderRadius: "50%",
                          bgcolor: CATEGORY_PASTEL[d.category],
                          flexShrink: 0,
                        }}
                      />
                      <Typography variant="body2">
                        {CATEGORY_LABELS[d.category]}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {d.count}건
                      </Typography>
                    </Box>
                    <Typography variant="body2" fontWeight={600}>
                      {d.total.toLocaleString()}원
                    </Typography>
                  </Box>
                ))}
              </Stack>
            </CardContent>
          </Card>
        )}
      </Box>

      {/* ━━━ 장기 계약 섹션 ━━━ */}
      <Box>
        <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1.5 }}>
          장기 계약
        </Typography>

        {/* 요약 카드 3개 */}
        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 1 }}>
          <SummaryCard label="총 계약" value={`${longTerms.length}건`} color="#44B2FF" />
          <SummaryCard
            label="30일 내 만료"
            value={`${longTerm30.length}건`}
            color={longTerm30.length > 0 ? "#FF7E44" : "#6BCB77"}
          />
          <SummaryCard
            label="만료 지남"
            value={`${longTermExpired.length}건`}
            color={longTermExpired.length > 0 ? "#FF6295" : "#6BCB77"}
          />
        </Box>

        {/* 도넛 차트 + 카테고리별 금액 */}
        {longTermPieData.length > 0 && (
          <Card variant="outlined" sx={{ borderRadius: 2, mt: 1.5 }}>
            <CardContent>
              <Box sx={{ width: "100%", height: 200, position: "relative", ...noInteraction }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={longTermPieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      dataKey="value"
                      stroke="none"
                      isAnimationActive={false}
                    >
                      {longTermPieData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
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
                    {longTermTotal.toLocaleString()}원
                  </Typography>
                </Box>
              </Box>

              {/* 카테고리별 항목 */}
              <Stack spacing={1} sx={{ mt: 1.5 }}>
                {longTermCategoryData.map((d) => (
                  <Box
                    key={d.category}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Box
                        sx={{
                          width: 10,
                          height: 10,
                          borderRadius: "50%",
                          bgcolor: CATEGORY_PASTEL[d.category],
                          flexShrink: 0,
                        }}
                      />
                      <Typography variant="body2">
                        {CATEGORY_LABELS[d.category]}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {d.count}건
                      </Typography>
                    </Box>
                    <Typography variant="body2" fontWeight={600}>
                      {d.total.toLocaleString()}원
                    </Typography>
                  </Box>
                ))}
              </Stack>
            </CardContent>
          </Card>
        )}
      </Box>
    </Stack>
  );
}

/** 요약 카드 (색상 배경) */
function SummaryCard({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: string;
}) {
  return (
    <Card
      sx={{
        borderRadius: 2,
        bgcolor: color,
        border: "none",
        boxShadow: "none",
      }}
    >
      <CardContent
        sx={{
          p: 1.5,
          "&:last-child": { pb: 1.5 },
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Typography variant="caption" sx={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.85)" }}>
          {label}
        </Typography>
        <Typography variant="subtitle1" fontWeight={700} sx={{ lineHeight: 1.3, color: "#fff" }}>
          {value}
        </Typography>
      </CardContent>
    </Card>
  );
}
