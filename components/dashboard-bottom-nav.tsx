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

export function DashboardBottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const theme = useTheme();
  const [blobKey, setBlobKey] = useState(0);

  const activeIndex = useMemo(() => {
    if (pathname.startsWith("/dashboard/info")) return 1;
    if (pathname.startsWith("/dashboard/contracts/new")) return 2;
    if (pathname.startsWith("/dashboard/profile")) return 3;
    if (pathname.startsWith("/dashboard/settings")) return 4;
    return 0;
  }, [pathname]);

  useEffect(() => {
    setBlobKey((k) => k + 1);
  }, [activeIndex]);

  const blobLeftPercent = (activeIndex * 100) / ITEM_COUNT + 100 / ITEM_COUNT / 2;

  return (
    <nav
      className="fixed left-1/2 bottom-0 z-30 w-full max-w-[430px] -translate-x-1/2"
      style={{
        paddingBottom: "env(safe-area-inset-bottom)",
      }}
    >
      <div
        className="relative mx-4 mb-2 flex h-14 items-end overflow-visible rounded-2xl border border-outline-variant/50 shadow-lg"
        style={{
          background: alpha(theme.palette.background.paper, 0.92),
          backdropFilter: "blur(14px)",
        }}
      >
        {/* 볼록 블롭 인디케이터 — 좌우 대칭 돔, 슬라이드 + 바운스 */}
        <div
          className="absolute bottom-0 overflow-visible"
          style={{
            left: `${blobLeftPercent}%`,
            width: 56,
            height: 32,
            transform: "translateX(-50%)",
            transition: "left 0.38s cubic-bezier(0.34, 1.56, 0.64, 1)",
          }}
        >
          <div
            key={blobKey}
            className="animate-nav-blob absolute inset-0"
            style={{
              background: alpha(theme.palette.background.paper, 0.98),
              borderRadius: "28px 28px 0 0",
              boxShadow: "0 -3px 12px rgba(0,0,0,0.06), 0 2px 6px rgba(0,0,0,0.04)",
            }}
          />
        </div>

        {/* 아이템들 */}
        <div className="relative flex w-full flex-1">
          {NAV_ITEMS.map((item, index) => {
            const isActive = index === activeIndex;
            const Icon = item.icon;
            return (
              <button
                key={item.href}
                type="button"
                onClick={() => router.push(item.href)}
                className="flex flex-1 flex-col items-center justify-center gap-0.5 pb-1.5 pt-2 transition-colors"
                style={{
                  color: isActive
                    ? theme.palette.primary.main
                    : theme.palette.text.secondary,
                }}
              >
                <Icon
                  sx={{
                    fontSize: index === 2 ? 28 : 24,
                    filter: isActive && index === 2 ? "drop-shadow(0 2px 6px rgba(0,0,0,0.2))" : undefined,
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
