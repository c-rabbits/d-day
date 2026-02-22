"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Link as MuiLink,
  Stack,
  Typography,
} from "@mui/material";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import NotificationsRoundedIcon from "@mui/icons-material/NotificationsRounded";
import LockResetRoundedIcon from "@mui/icons-material/LockResetRounded";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import PrivacyTipOutlinedIcon from "@mui/icons-material/PrivacyTipOutlined";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";

export function SettingsPanel() {
  const [notificationMessage, setNotificationMessage] = useState("");
  const [notificationError, setNotificationError] = useState(false);
  const [isLoadingPush, setIsLoadingPush] = useState(false);
  const router = useRouter();

  const handlePushPermission = async () => {
    setIsLoadingPush(true);
    setNotificationError(false);
    setNotificationMessage("");
    try {
      if (typeof Notification === "undefined") {
        setNotificationError(true);
        setNotificationMessage("이 브라우저는 알림을 지원하지 않습니다.");
        return;
      }
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        setNotificationMessage("브라우저 알림이 허용되었습니다.");
      } else {
        setNotificationError(true);
        setNotificationMessage("알림이 거부되었습니다. 브라우저 설정에서 변경해 주세요.");
      }
    } finally {
      setIsLoadingPush(false);
    }
  };

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/auth/login");
  };

  return (
    <Box sx={{ px: 2, py: 3.5 }}>
      <Stack spacing={2}>
        <Typography
          variant="caption"
          sx={{ color: "primary.main", fontWeight: 700, letterSpacing: "0.08em" }}
        >
          SETTINGS
        </Typography>

        <Card variant="outlined" sx={{ borderRadius: 3 }}>
          <CardContent sx={{ p: 2.3 }}>
            <Stack spacing={1.6}>
              <Button
                variant="outlined"
                startIcon={<NotificationsRoundedIcon />}
                onClick={handlePushPermission}
                disabled={isLoadingPush}
              >
                {isLoadingPush ? "요청 중..." : "브라우저 알림 권한 요청"}
              </Button>

              {notificationMessage && (
                <Alert severity={notificationError ? "error" : "success"}>
                  {notificationMessage}
                </Alert>
              )}
            </Stack>
          </CardContent>
        </Card>

        <Card variant="outlined" sx={{ borderRadius: 3 }}>
          <CardContent sx={{ p: 2.3 }}>
            <Stack spacing={1.3}>
              <Typography variant="subtitle1" fontWeight={700}>
                계정
              </Typography>
              <Button
                component={Link}
                href="/auth/update-password"
                variant="outlined"
                startIcon={<LockResetRoundedIcon />}
                sx={{ justifyContent: "flex-start" }}
              >
                비밀번호 변경
              </Button>
              <Button
                variant="contained"
                color="error"
                startIcon={<LogoutRoundedIcon />}
                onClick={handleLogout}
              >
                로그아웃
              </Button>
            </Stack>
          </CardContent>
        </Card>

        <Card variant="outlined" sx={{ borderRadius: 3 }}>
          <CardContent sx={{ p: 2.3 }}>
            <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1.2 }}>
              서비스 정보
            </Typography>
            <Stack spacing={0.8}>
              <MuiLink
                component={Link}
                href="/terms"
                color="inherit"
                underline="hover"
                sx={{ display: "flex", alignItems: "center", gap: 0.75 }}
              >
                <DescriptionOutlinedIcon fontSize="small" />
                서비스 이용약관
              </MuiLink>
              <MuiLink
                component={Link}
                href="/privacy"
                color="inherit"
                underline="hover"
                sx={{ display: "flex", alignItems: "center", gap: 0.75 }}
              >
                <PrivacyTipOutlinedIcon fontSize="small" />
                개인정보처리방침
              </MuiLink>
              <MuiLink
                href="mailto:sample@example.com"
                color="inherit"
                underline="hover"
                sx={{ display: "flex", alignItems: "center", gap: 0.75 }}
              >
                <EmailOutlinedIcon fontSize="small" />
                문의/피드백 (sample@example.com)
              </MuiLink>
            </Stack>
          </CardContent>
        </Card>
      </Stack>
    </Box>
  );
}
