"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import ComputerRoundedIcon from "@mui/icons-material/ComputerRounded";
import DarkModeRoundedIcon from "@mui/icons-material/DarkModeRounded";
import LightModeRoundedIcon from "@mui/icons-material/LightModeRounded";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

const ThemeSwitcher = () => {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  // useEffect only runs on the client, so now we can safely show the UI
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const ICON_SIZE = 16;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size={"sm"}>
          {theme === "light" ? (
            <LightModeRoundedIcon
              key="light"
              sx={{ fontSize: ICON_SIZE, color: "text.secondary" }}
            />
          ) : theme === "dark" ? (
            <DarkModeRoundedIcon
              key="dark"
              sx={{ fontSize: ICON_SIZE, color: "text.secondary" }}
            />
          ) : (
            <ComputerRoundedIcon
              key="system"
              sx={{ fontSize: ICON_SIZE, color: "text.secondary" }}
            />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-content" align="start">
        <DropdownMenuRadioGroup
          value={theme}
          onValueChange={(e) => setTheme(e)}
        >
          <DropdownMenuRadioItem className="flex gap-2" value="light">
            <LightModeRoundedIcon sx={{ fontSize: ICON_SIZE, color: "text.secondary" }} />
            <span>Light</span>
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem className="flex gap-2" value="dark">
            <DarkModeRoundedIcon sx={{ fontSize: ICON_SIZE, color: "text.secondary" }} />
            <span>Dark</span>
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem className="flex gap-2" value="system">
            <ComputerRoundedIcon sx={{ fontSize: ICON_SIZE, color: "text.secondary" }} />
            <span>System</span>
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export { ThemeSwitcher };
