"use client";

import { useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  BottomNavigation,
  BottomNavigationAction,
  Paper,
  alpha,
  useTheme,
} from "@mui/material";
import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import ViewCarouselRoundedIcon from "@mui/icons-material/ViewCarouselRounded";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import SettingsRoundedIcon from "@mui/icons-material/SettingsRounded";

const NAV_ITEMS = [
  { label: "홈", href: "/dashboard", icon: <HomeRoundedIcon /> },
  { label: "정보", href: "/dashboard/info", icon: <ViewCarouselRoundedIcon /> },
  { label: "계약 추가", href: "/dashboard/contracts/new", icon: <AddCircleIcon /> },
  { label: "프로필", href: "/dashboard/profile", icon: <PersonRoundedIcon /> },
  { label: "설정", href: "/dashboard/settings", icon: <SettingsRoundedIcon /> },
] as const;

export function DashboardBottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const theme = useTheme();

  const activeIndex = useMemo(() => {
    if (pathname.startsWith("/dashboard/info")) return 1;
    if (pathname.startsWith("/dashboard/contracts/new")) return 2;
    if (pathname.startsWith("/dashboard/profile")) return 3;
    if (pathname.startsWith("/dashboard/settings")) return 4;
    return 0;
  }, [pathname]);

  return (
    <Paper
      elevation={0}
      sx={{
        position: "fixed",
        left: "50%",
        transform: "translateX(-50%)",
        bottom: 0,
        zIndex: 30,
        width: "100%",
        maxWidth: 430,
        borderTop: `1px solid ${theme.palette.divider}`,
        bgcolor: alpha(theme.palette.background.paper, 0.9),
        backdropFilter: "blur(14px)",
      }}
    >
      <BottomNavigation
        showLabels
        value={activeIndex}
        onChange={(_event, nextValue: number) => router.push(NAV_ITEMS[nextValue].href)}
        sx={{
          height: 76,
          pb: "env(safe-area-inset-bottom)",
          "& .MuiBottomNavigationAction-root": {
            minWidth: 0,
            color: "text.secondary",
          },
          "& .MuiBottomNavigationAction-root.Mui-selected": {
            color: "primary.main",
          },
          "& .MuiBottomNavigationAction-label": {
            fontSize: 11,
            mt: 0.2,
          },
          "& .MuiBottomNavigationAction-root.Mui-selected .MuiBottomNavigationAction-label": {
            fontSize: 11,
            fontWeight: 700,
          },
        }}
      >
        {NAV_ITEMS.map((item, index) => (
          <BottomNavigationAction
            key={item.href}
            label={item.label}
            icon={item.icon}
            sx={
              index === 2
                ? {
                    "& .MuiSvgIcon-root": { fontSize: 28 },
                    "&.Mui-selected .MuiSvgIcon-root": {
                      color: "primary.main",
                      filter: "drop-shadow(0 3px 8px rgba(0,0,0,0.16))",
                    },
                  }
                : undefined
            }
          />
        ))}
      </BottomNavigation>
    </Paper>
  );
}
