"use client";

import { usePathname, useRouter } from "next/navigation";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

const ROUTE_TITLES: Record<string, { headline: string; subtitle?: string }> = {
  "/dashboard/settings": { headline: "설정" },
  "/dashboard/profile": { headline: "프로필" },
  "/dashboard/info": { headline: "정보" },
  "/dashboard/contracts/new": { headline: "새 계약", subtitle: "계약 추가" },
};

function getTitle(pathname: string): { headline: string; subtitle?: string } | null {
  if (ROUTE_TITLES[pathname]) return ROUTE_TITLES[pathname];
  if (pathname.match(/^\/dashboard\/contracts\/[^/]+\/edit$/))
    return { headline: "계약 수정", subtitle: "계약" };
  if (pathname.match(/^\/dashboard\/contracts\/[^/]+$/))
    return { headline: "계약 상세", subtitle: "계약" };
  return null;
}

export function DashboardHeader() {
  const pathname = usePathname() ?? "";
  const router = useRouter();
  const isHome = pathname === "/dashboard";
  const title = getTitle(pathname);

  return (
    <header className="sticky top-0 z-10 border-b border-outline-variant/70 bg-surface/85 backdrop-blur-xl">
      <div className="mx-auto flex h-12 w-full max-w-mobile items-center gap-3 px-4">
        {!isHome && title ? (
          <>
            <button
              type="button"
              onClick={() => router.back()}
              className="flex shrink-0 items-center justify-center rounded-full p-1.5 text-foreground hover:bg-surface-container-high focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label="뒤로 가기"
            >
              <ArrowBackIcon sx={{ fontSize: 22 }} />
            </button>
            <div className="flex min-w-0 flex-col leading-tight">
              <span className="truncate text-base font-semibold text-foreground">
                {title.headline}
              </span>
              {title.subtitle ? (
                <span className="truncate text-xs font-medium text-muted-foreground">
                  {title.subtitle}
                </span>
              ) : null}
            </div>
          </>
        ) : (
          <div className="min-w-0 flex-1" />
        )}
      </div>
    </header>
  );
}
