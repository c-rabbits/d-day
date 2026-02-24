"use client";

import { useMemo, useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import HomeIcon from "@mui/icons-material/Home";
import EmojiEventsRoundedIcon from "@mui/icons-material/EmojiEventsRounded";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import PersonIcon from "@mui/icons-material/Person";
import SettingsIcon from "@mui/icons-material/Settings";

const NAV_ITEMS = [
  { label: "홈", href: "/dashboard", icon: HomeIcon },
  { label: "미션", href: "/dashboard/missions", icon: EmojiEventsRoundedIcon },
  { label: "계약 추가", href: "/dashboard/contracts/new", icon: AddCircleIcon },
  { label: "프로필", href: "/dashboard/profile", icon: PersonIcon },
  { label: "설정", href: "/dashboard/settings", icon: SettingsIcon },
] as const;

const ITEM_COUNT = NAV_ITEMS.length;
const GAP = 8;
const CIRCLE_SIZE = 52;
const BAR_HEIGHT = CIRCLE_SIZE + GAP * 2;

export function DashboardBottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [pillKey, setPillKey] = useState(0);

  const activeIndex = useMemo(() => {
    if (pathname.startsWith("/dashboard/missions")) return 1;
    if (pathname.startsWith("/dashboard/contracts/new")) return 2;
    if (pathname.startsWith("/dashboard/profile")) return 3;
    if (pathname.startsWith("/dashboard/settings")) return 4;
    return 0;
  }, [pathname]);

  useEffect(() => {
    setPillKey((k) => k + 1);
  }, [activeIndex]);

  const circleLeftPercent = (activeIndex * 100) / ITEM_COUNT + 100 / ITEM_COUNT / 2;

  return (
    <nav
      className="fixed left-1/2 bottom-0 z-30 w-full max-w-[430px] -translate-x-1/2"
      style={{
        paddingBottom: "env(safe-area-inset-bottom)",
      }}
    >
      <div
        className="relative mx-8 mb-3 flex items-center overflow-visible rounded-full shadow-lg"
        style={{
          background: "#1a1a1a",
          height: BAR_HEIGHT,
          maxWidth: 320,
          marginLeft: "auto",
          marginRight: "auto",
        }}
      >
        {/* 포커스: 흰색 동그라미 */}
        <div
          className="absolute top-1/2 overflow-visible"
          style={{
            left: `${circleLeftPercent}%`,
            width: CIRCLE_SIZE,
            height: CIRCLE_SIZE,
            marginTop: -CIRCLE_SIZE / 2,
            transform: "translateX(-50%)",
            transition: "left 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)",
          }}
        >
          <div
            key={pillKey}
            className="animate-nav-blob absolute rounded-full bg-white"
            style={{
              left: "50%",
              top: "50%",
              width: CIRCLE_SIZE,
              height: CIRCLE_SIZE,
              marginLeft: -CIRCLE_SIZE / 2,
              marginTop: -CIRCLE_SIZE / 2,
            }}
          />
        </div>

        {/* 아이템들 — 기본 흰 아이콘, 활성 시 #FFC434 */}
        <div className="relative z-10 flex w-full">
          {NAV_ITEMS.map((item, index) => {
            const isActive = index === activeIndex;
            const Icon = item.icon;
            return (
              <button
                key={item.href}
                type="button"
                onClick={() => router.push(item.href)}
                className="flex flex-1 flex-col items-center justify-center py-2 transition-colors"
                style={{
                  color: isActive ? "#FFC434" : "#ffffff",
                }}
              >
                <Icon
                  sx={{
                    fontSize: index === 2 ? 26 : 24,
                  }}
                />
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
