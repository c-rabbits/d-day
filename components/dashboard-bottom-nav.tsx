"use client";

import { useMemo, useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { alpha, useTheme } from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import ViewCarouselIcon from "@mui/icons-material/ViewCarousel";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import PersonIcon from "@mui/icons-material/Person";
import SettingsIcon from "@mui/icons-material/Settings";

const NAV_ITEMS = [
  { label: "홈", href: "/dashboard", icon: HomeIcon },
  { label: "정보", href: "/dashboard/info", icon: ViewCarouselIcon },
  { label: "계약 추가", href: "/dashboard/contracts/new", icon: AddCircleIcon },
  { label: "프로필", href: "/dashboard/profile", icon: PersonIcon },
  { label: "설정", href: "/dashboard/settings", icon: SettingsIcon },
] as const;

const ITEM_COUNT = NAV_ITEMS.length;
const PILL_WIDTH = 72;
const PILL_HEIGHT = 40;

export function DashboardBottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const theme = useTheme();
  const [pillKey, setPillKey] = useState(0);

  const activeIndex = useMemo(() => {
    if (pathname.startsWith("/dashboard/info")) return 1;
    if (pathname.startsWith("/dashboard/contracts/new")) return 2;
    if (pathname.startsWith("/dashboard/profile")) return 3;
    if (pathname.startsWith("/dashboard/settings")) return 4;
    return 0;
  }, [pathname]);

  useEffect(() => {
    setPillKey((k) => k + 1);
  }, [activeIndex]);

  const pillLeftPercent = (activeIndex * 100) / ITEM_COUNT + 100 / ITEM_COUNT / 2;

  return (
    <nav
      className="fixed left-1/2 bottom-0 z-30 w-full max-w-[430px] -translate-x-1/2"
      style={{
        paddingBottom: "env(safe-area-inset-bottom)",
      }}
    >
      <div
        className="relative mx-4 mb-2 flex h-14 items-center overflow-visible rounded-full border border-outline-variant/50 shadow-md"
        style={{
          background: alpha(theme.palette.background.paper, 0.98),
          backdropFilter: "blur(14px)",
        }}
      >
        {/* 활성 탭만 감싸는 pill 배경 — 아이콘+라벨 전체 */}
        <div
          className="absolute top-1/2 overflow-visible"
          style={{
            left: `${pillLeftPercent}%`,
            width: PILL_WIDTH,
            height: PILL_HEIGHT,
            marginTop: -PILL_HEIGHT / 2,
            transform: "translateX(-50%)",
            transition: "left 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)",
          }}
        >
          <div
            key={pillKey}
            className="animate-nav-blob absolute inset-0 rounded-full"
            style={{
              background: alpha(theme.palette.primary.main, 0.12),
            }}
          />
        </div>

        {/* 아이템들 */}
        <div className="relative z-10 flex w-full">
          {NAV_ITEMS.map((item, index) => {
            const isActive = index === activeIndex;
            const Icon = item.icon;
            return (
              <button
                key={item.href}
                type="button"
                onClick={() => router.push(item.href)}
                className="flex flex-1 flex-col items-center justify-center gap-0.5 py-2 transition-colors"
                style={{
                  color: isActive
                    ? theme.palette.primary.main
                    : theme.palette.text.secondary,
                }}
              >
                <Icon
                  sx={{
                    fontSize: index === 2 ? 26 : 22,
                    filter: isActive && index === 2 ? "drop-shadow(0 1px 4px rgba(0,0,0,0.12))" : undefined,
                  }}
                />
                <span
                  className="text-[11px] font-medium"
                  style={{
                    fontWeight: isActive ? 700 : 500,
                  }}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
