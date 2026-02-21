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
const BLOB_SIZE = 44;
const DOT_SIZE = 6;

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
        className="relative mx-4 mb-2 flex h-16 items-center overflow-visible rounded-2xl border border-outline-variant/50 shadow-lg"
        style={{
          background: alpha(theme.palette.background.paper, 0.95),
          backdropFilter: "blur(14px)",
        }}
      >
        {/* 아이콘을 감싸는 원형 블롭 — 슬라이드 + 바운스 */}
        <div
          className="absolute top-1/2 overflow-visible"
          style={{
            left: `${blobLeftPercent}%`,
            width: BLOB_SIZE,
            height: BLOB_SIZE,
            marginTop: -BLOB_SIZE / 2,
            transform: "translateX(-50%)",
            transition: "left 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
          }}
        >
          <div
            key={blobKey}
            className="animate-nav-blob absolute rounded-full"
            style={{
              left: "50%",
              top: "50%",
              width: BLOB_SIZE,
              height: BLOB_SIZE,
              marginLeft: -BLOB_SIZE / 2,
              marginTop: -BLOB_SIZE / 2,
              background: alpha(theme.palette.background.paper, 1),
              boxShadow: "0 2px 12px rgba(0,0,0,0.08), 0 4px 20px rgba(0,0,0,0.04)",
            }}
          />
        </div>

        {/* 활성 탭 위 작은 점 인디케이터 — 슬라이드 + 팝 */}
        <div
          className="absolute top-3 overflow-visible"
          style={{
            left: `${blobLeftPercent}%`,
            width: DOT_SIZE,
            height: DOT_SIZE,
            transform: "translateX(-50%)",
            transition: "left 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
          }}
        >
          <span
            key={blobKey}
            className="animate-nav-dot absolute inset-0 rounded-full"
            style={{
              background: theme.palette.primary.main,
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
                    fontSize: index === 2 ? 28 : 24,
                    filter: isActive && index === 2 ? "drop-shadow(0 2px 6px rgba(0,0,0,0.15))" : undefined,
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
