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
import ShareRoundedIcon from "@mui/icons-material/ShareRounded";

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
  const [shareMessage, setShareMessage] = useState("");
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [inviteCount, setInviteCount] = useState(0);
  const router = useRouter();

  useEffect(() => {
    if (typeof Notification !== "undefined") {
      setNotificationPermission(Notification.permission);
    }
    // 추천 코드 조회
    fetch("/api/referral")
      .then((res) => res.json())
      .then((data) => {
        setReferralCode(data.referralCode ?? null);
        setInviteCount(data.inviteCount ?? 0);
      })
      .catch(() => {});
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

        {/* 앱 초대 */}
        <Card variant="outlined" sx={{ borderRadius: 2 }}>
          <CardContent sx={{ p: 2.5 }}>
            <Stack spacing={1.5}>
              <Stack direction="row" alignItems="center" spacing={0.75}>
                <ShareRoundedIcon sx={{ fontSize: 20, color: "text.secondary" }} />
                <Typography variant="subtitle2" fontWeight={700}>
                  앱 초대
                </Typography>
              </Stack>

              {/* 내 추천 코드 */}
              {referralCode && (
                <Box
                  sx={{
                    bgcolor: "grey.100",
                    borderRadius: 2,
                    p: 2,
                    textAlign: "center",
                  }}
                >
                  <Typography variant="caption" color="text.secondary">
                    내 추천 코드
                  </Typography>
                  <Typography
                    variant="h5"
                    fontWeight={800}
                    letterSpacing="0.2em"
                    sx={{ mt: 0.5 }}
                  >
                    {referralCode}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                    {inviteCount}/30명 초대 완료
                  </Typography>
                </Box>
              )}

              <Button
                variant="contained"
                fullWidth
                sx={{ ...BUTTON_SX, bgcolor: "#FFC434", color: "#333", "&:hover": { bgcolor: "#e6b02e" } }}
                onClick={async () => {
                  const code = referralCode ?? "";
                  const shareData = {
                    title: "D-Day - 계약 만료일 관리",
                    text: `계약 만료일, 놓치지 마세요! D-Day로 간편하게 관리하세요.\n추천코드: ${code}`,
                    url: "https://d-day-one.vercel.app",
                  };
                  try {
                    if (navigator.share) {
                      await navigator.share(shareData);
                    } else {
                      await navigator.clipboard.writeText(
                        `${shareData.text}\n${shareData.url}`
                      );
                      setShareMessage("링크가 복사되었습니다!");
                      setTimeout(() => setShareMessage(""), 3000);
                    }
                  } catch {
                    // 사용자가 공유 취소한 경우
                  }
                }}
              >
                친구에게 추천하기
              </Button>
              {shareMessage && (
                <Alert severity="success">{shareMessage}</Alert>
              )}
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
