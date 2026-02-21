"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import SettingsIcon from "@mui/icons-material/Settings";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

const ROUTE_TITLES: Record<string, { headline: string; subtitle?: string }> = {
  "/dashboard": { headline: "디데이" },
  "/dashboard/settings": { headline: "설정" },
  "/dashboard/profile": { headline: "프로필" },
  "/dashboard/info": { headline: "정보" },
  "/dashboard/contracts/new": { headline: "새 계약", subtitle: "계약 추가" },
};

function getTitle(pathname: string): { headline: string; subtitle?: string } {
  if (ROUTE_TITLES[pathname]) return ROUTE_TITLES[pathname];
  if (pathname.match(/^\/dashboard\/contracts\/[^/]+\/edit$/))
    return { headline: "계약 수정", subtitle: "계약" };
  if (pathname.match(/^\/dashboard\/contracts\/[^/]+$/))
    return { headline: "계약 상세", subtitle: "계약" };
  return { headline: "디데이" };
}

export function DashboardHeader() {
  const pathname = usePathname() ?? "";
  const router = useRouter();
  const isHome = pathname === "/dashboard";
  const { headline, subtitle } = getTitle(pathname);

  return (
    <header className="sticky top-0 z-10 border-b border-outline-variant/70 bg-surface/85 backdrop-blur-xl">
      <div className="mx-auto flex h-[4.35rem] w-full max-w-mobile items-center justify-between gap-3 px-4">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          {!isHome ? (
            <button
              type="button"
              onClick={() => router.back()}
              className="flex shrink-0 items-center justify-center rounded-full p-2 text-foreground hover:bg-surface-container-high focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label="뒤로 가기"
            >
              <ArrowBackIcon sx={{ fontSize: 24 }} />
            </button>
          ) : null}
          <div className="flex min-w-0 flex-col leading-none">
            <span className="truncate text-lg font-semibold text-foreground">
              {headline}
            </span>
            {subtitle ? (
              <span className="mt-0.5 truncate text-xs font-medium text-muted-foreground">
                {subtitle}
              </span>
            ) : isHome ? (
              <span className="mt-0.5 text-[10px] font-semibold tracking-[0.14em] text-primary">
                D-DAY
              </span>
            ) : null}
          </div>
        </div>

        <Link
          href="/dashboard/settings"
          className="flex shrink-0 items-center justify-center rounded-full p-2 text-foreground hover:bg-surface-container-high focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="설정"
        >
          <SettingsIcon sx={{ fontSize: 24 }} />
        </Link>
      </div>
    </header>
  );
}
