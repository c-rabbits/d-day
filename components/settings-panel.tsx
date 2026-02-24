"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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
import NotificationsRoundedIcon from "@mui/icons-material/NotificationsRounded";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import PrivacyTipOutlinedIcon from "@mui/icons-material/PrivacyTipOutlined";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import PersonOutlineRoundedIcon from "@mui/icons-material/PersonOutlineRounded";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

const BUTTON_SX = {
  justifyContent: "center",
  py: 1.75,
  minHeight: 48,
};

const SERVICE_BUTTON_SX = {
  ...BUTTON_SX,
  justifyContent: "flex-start",
  pl: 2,
  textAlign: "left",
};

export function SettingsPanel() {
  const [notificationMessage, setNotificationMessage] = useState("");
  const [notificationError, setNotificationError] = useState(false);
  const [isLoadingPush, setIsLoadingPush] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (typeof Notification !== "undefined") {
      setNotificationPermission(Notification.permission);
    }
  }, []);

  const handlePushPermission = async () => {
    if (typeof Notification === "undefined") {
      setNotificationError(true);
      setNotificationMessage("이 브라우저는 알림을 지원하지 않습니다.");
      return;
    }
    if (Notification.permission === "granted") {
      setNotificationMessage("브라우저 설정에서 알림을 끌 수 있습니다.");
      setNotificationError(false);
      return;
    }
    setIsLoadingPush(true);
    setNotificationError(false);
    setNotificationMessage("");
    try {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
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
    <Box sx={{ px: 2, py: 3.5, pb: 14 }}>
      <Stack spacing={2.5}>
        <Typography variant="h5" fontWeight={700}>
          설정
        </Typography>

        {/* 알림 */}
        <Card variant="outlined" sx={{ borderRadius: 2 }}>
          <CardContent sx={{ p: 2.5 }}>
            <Stack spacing={1.5}>
              <Stack direction="row" alignItems="center" spacing={0.75}>
                <NotificationsRoundedIcon sx={{ fontSize: 20, color: "text.secondary" }} />
                <Typography variant="subtitle2" fontWeight={700}>
                  알림
                </Typography>
              </Stack>
              <Button
                variant="contained"
                onClick={handlePushPermission}
                disabled={isLoadingPush}
                fullWidth
                sx={BUTTON_SX}
              >
                {isLoadingPush ? "요청 중..." : notificationPermission === "granted" ? "알림 권한 끄기" : "알림 권한 켜기"}
              </Button>
              {notificationMessage && (
                <Alert severity={notificationError ? "error" : "success"}>{notificationMessage}</Alert>
              )}
            </Stack>
          </CardContent>
        </Card>

        {/* 계정 */}
        <Card variant="outlined" sx={{ borderRadius: 2 }}>
          <CardContent sx={{ p: 2.5 }}>
            <Stack spacing={1.5}>
              <Stack direction="row" alignItems="center" spacing={0.75}>
                <PersonOutlineRoundedIcon sx={{ fontSize: 20, color: "text.secondary" }} />
                <Typography variant="subtitle2" fontWeight={700}>
                  계정
                </Typography>
              </Stack>
              <Button
                component={Link}
                href="/auth/update-password"
                variant="outlined"
                fullWidth
                sx={BUTTON_SX}
              >
                비밀번호 변경
              </Button>
              <Button
                variant="contained"
                color="error"
                onClick={handleLogout}
                fullWidth
                sx={BUTTON_SX}
              >
                로그아웃
              </Button>
            </Stack>
          </CardContent>
        </Card>

        {/* 서비스 정보 - 아이콘·내용 왼쪽 정렬, 왼쪽 여백 */}
        <Card variant="outlined" sx={{ borderRadius: 2 }}>
          <CardContent sx={{ p: 2.5 }}>
            <Stack spacing={1.5}>
              <Stack direction="row" alignItems="center" spacing={0.75}>
                <InfoOutlinedIcon sx={{ fontSize: 20, color: "text.secondary" }} />
                <Typography variant="subtitle2" fontWeight={700}>
                  서비스 정보
                </Typography>
              </Stack>
              <Button
                component={Link}
                href="/terms"
                variant="outlined"
                fullWidth
                startIcon={<DescriptionOutlinedIcon />}
                sx={SERVICE_BUTTON_SX}
              >
                서비스 이용약관
              </Button>
              <Button
                component={Link}
                href="/privacy"
                variant="outlined"
                fullWidth
                startIcon={<PrivacyTipOutlinedIcon />}
                sx={SERVICE_BUTTON_SX}
              >
                개인정보 처리방침
              </Button>
              <Button
                component="a"
                href="mailto:sample@example.com"
                variant="outlined"
                fullWidth
                startIcon={<EmailOutlinedIcon />}
                sx={SERVICE_BUTTON_SX}
              >
                문의/피드백
              </Button>
            </Stack>
          </CardContent>
        </Card>
      </Stack>
    </Box>
  );
}
