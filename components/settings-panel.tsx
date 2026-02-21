"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Stack,
  Typography,
} from "@mui/material";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import NotificationsRoundedIcon from "@mui/icons-material/NotificationsRounded";

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
      </Stack>
    </Box>
  );
}
