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
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import NotificationsRoundedIcon from "@mui/icons-material/NotificationsRounded";
import LockResetRoundedIcon from "@mui/icons-material/LockResetRounded";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import PrivacyTipOutlinedIcon from "@mui/icons-material/PrivacyTipOutlined";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import PersonOutlineRoundedIcon from "@mui/icons-material/PersonOutlineRounded";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

export function SettingsPanel() {
  const [tab, setTab] = useState(0);
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
        <Box>
          <Typography variant="h5" fontWeight={700} gutterBottom>
            설정
          </Typography>
          <Typography variant="body2" color="text.secondary">
            계정, 알림, 서비스 정보
          </Typography>
        </Box>

        <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="fullWidth" sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tab icon={<PersonOutlineRoundedIcon />} iconPosition="start" label="계정" />
          <Tab icon={<NotificationsRoundedIcon />} iconPosition="start" label="알림" />
          <Tab icon={<InfoOutlinedIcon />} iconPosition="start" label="서비스 정보" />
        </Tabs>

        {tab === 0 && (
          <Card variant="outlined" sx={{ borderRadius: 2 }}>
            <CardContent sx={{ p: 2.5 }}>
              <Stack spacing={1.5}>
                <Typography variant="subtitle2" fontWeight={700}>
                  계정
                </Typography>
                <Button
                  component={Link}
                  href="/auth/update-password"
                  variant="outlined"
                  startIcon={<LockResetRoundedIcon />}
                  fullWidth
                  sx={{ justifyContent: "flex-start" }}
                >
                  비밀번호 변경
                </Button>
                <Button
                  variant="contained"
                  color="error"
                  startIcon={<LogoutRoundedIcon />}
                  onClick={handleLogout}
                  fullWidth
                >
                  로그아웃
                </Button>
              </Stack>
            </CardContent>
          </Card>
        )}

        {tab === 1 && (
          <Card variant="outlined" sx={{ borderRadius: 2 }}>
            <CardContent sx={{ p: 2.5 }}>
              <Stack spacing={1.5}>
                <Typography variant="subtitle2" fontWeight={700}>
                  알림
                </Typography>
                <Button
                  variant="outlined"
                  startIcon={<NotificationsRoundedIcon />}
                  onClick={handlePushPermission}
                  disabled={isLoadingPush}
                  fullWidth
                >
                  {isLoadingPush ? "요청 중..." : "브라우저 알림 권한 요청"}
                </Button>
                {notificationMessage && (
                  <Alert severity={notificationError ? "error" : "success"}>{notificationMessage}</Alert>
                )}
              </Stack>
            </CardContent>
          </Card>
        )}

        {tab === 2 && (
          <Card variant="outlined" sx={{ borderRadius: 2 }}>
            <CardContent sx={{ p: 2.5 }}>
              <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.5 }}>
                서비스 정보
              </Typography>
              <Stack spacing={0.75}>
                <MuiLink component={Link} href="/terms" color="inherit" underline="hover" sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                  <DescriptionOutlinedIcon fontSize="small" />
                  서비스 이용약관
                </MuiLink>
                <MuiLink component={Link} href="/privacy" color="inherit" underline="hover" sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                  <PrivacyTipOutlinedIcon fontSize="small" />
                  개인정보처리방침
                </MuiLink>
                <MuiLink href="mailto:sample@example.com" color="inherit" underline="hover" sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                  <EmailOutlinedIcon fontSize="small" />
                  문의/피드백 (sample@example.com)
                </MuiLink>
              </Stack>
            </CardContent>
          </Card>
        )}
      </Stack>
    </Box>
  );
}
