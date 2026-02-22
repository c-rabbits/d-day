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
  CardActionArea,
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
      <Stack spacing={2.5}>
        <Typography variant="h5" fontWeight={700}>
          설정
        </Typography>

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
                variant="outlined"
                onClick={handlePushPermission}
                disabled={isLoadingPush}
                fullWidth
                sx={BUTTON_SX}
              >
                {isLoadingPush ? "요청 중..." : "브라우저 알림 권한 요청"}
              </Button>
              {notificationMessage && (
                <Alert severity={notificationError ? "error" : "success"}>{notificationMessage}</Alert>
              )}
            </Stack>
          </CardContent>
        </Card>

        {/* 서비스 정보 - 각각 독립 카드 */}
        <Stack direction="row" alignItems="center" spacing={0.75}>
          <InfoOutlinedIcon sx={{ fontSize: 20, color: "text.secondary" }} />
          <Typography variant="subtitle2" fontWeight={700}>
            서비스 정보
          </Typography>
        </Stack>

        <Card variant="outlined" sx={{ borderRadius: 2 }}>
          <CardActionArea component={Link} href="/terms">
            <CardContent sx={{ p: 2, display: "flex", alignItems: "center", gap: 1 }}>
              <DescriptionOutlinedIcon sx={{ fontSize: 22, color: "text.secondary" }} />
              <Typography fontWeight={600}>서비스 이용약관</Typography>
            </CardContent>
          </CardActionArea>
        </Card>

        <Card variant="outlined" sx={{ borderRadius: 2 }}>
          <CardActionArea component={Link} href="/privacy">
            <CardContent sx={{ p: 2, display: "flex", alignItems: "center", gap: 1 }}>
              <PrivacyTipOutlinedIcon sx={{ fontSize: 22, color: "text.secondary" }} />
              <Typography fontWeight={600}>개인정보 처리방침</Typography>
            </CardContent>
          </CardActionArea>
        </Card>

        <Card variant="outlined" sx={{ borderRadius: 2 }}>
          <CardActionArea component="a" href="mailto:sample@example.com">
            <CardContent sx={{ p: 2, display: "flex", alignItems: "center", gap: 1 }}>
              <EmailOutlinedIcon sx={{ fontSize: 22, color: "text.secondary" }} />
              <Typography fontWeight={600}>문의/피드백</Typography>
            </CardContent>
          </CardActionArea>
        </Card>
      </Stack>
    </Box>
  );
}
