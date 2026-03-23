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
  TextField,
  Typography,
} from "@mui/material";
import NotificationsRoundedIcon from "@mui/icons-material/NotificationsRounded";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import PrivacyTipOutlinedIcon from "@mui/icons-material/PrivacyTipOutlined";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import PersonOutlineRoundedIcon from "@mui/icons-material/PersonOutlineRounded";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import ShareRoundedIcon from "@mui/icons-material/ShareRounded";
import CardGiftcardRoundedIcon from "@mui/icons-material/CardGiftcardRounded";
import ContentCopyRoundedIcon from "@mui/icons-material/ContentCopyRounded";

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
  const [codeCopied, setCodeCopied] = useState(false);
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [inviteCount, setInviteCount] = useState(0);
  const [alreadyReferred, setAlreadyReferred] = useState(false);
  const [inputCode, setInputCode] = useState("");
  const [referralMessage, setReferralMessage] = useState("");
  const [referralError, setReferralError] = useState(false);
  const [isSubmittingCode, setIsSubmittingCode] = useState(false);
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
        setAlreadyReferred(data.alreadyReferred ?? false);
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
                {referralCode ? (
                  <>
                    <Stack direction="row" alignItems="center" justifyContent="center" spacing={0.5} sx={{ mt: 0.5 }}>
                      <Typography
                        variant="h5"
                        fontWeight={800}
                        letterSpacing="0.2em"
                      >
                        {referralCode}
                      </Typography>
                      <Box
                        component="button"
                        onClick={async () => {
                          await navigator.clipboard.writeText(referralCode);
                          setCodeCopied(true);
                          setTimeout(() => setCodeCopied(false), 2000);
                        }}
                        sx={{
                          border: "none",
                          bgcolor: "transparent",
                          cursor: "pointer",
                          p: 0.5,
                          borderRadius: 1,
                          display: "flex",
                          alignItems: "center",
                          "&:hover": { bgcolor: "grey.200" },
                        }}
                      >
                        <ContentCopyRoundedIcon sx={{ fontSize: 18, color: codeCopied ? "success.main" : "text.secondary" }} />
                      </Box>
                    </Stack>
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                      {inviteCount}/30명 초대 완료
                    </Typography>
                  </>
                ) : (
                  <Typography variant="h5" fontWeight={800} sx={{ mt: 0.5, color: "text.disabled" }}>
                    ------
                  </Typography>
                )}
              </Box>

              <Button
                variant="contained"
                fullWidth
                sx={{ ...BUTTON_SX, bgcolor: "#FFC434", color: "#333", "&:hover": { bgcolor: "#e6b02e" } }}
                onClick={async () => {
                  const code = referralCode ?? "";
                  const shareData = {
                    title: "머니게임 - 세상의 모든 알림",
                    text: `불필요한 지출, 놓치지 마세요! 머니게임으로 간편하게 관리하세요.\n추천코드: ${code}`,
                    url: "https://savemymoney.xyz",
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

        {/* 추천 코드 입력 */}
        {!alreadyReferred && (
          <Card variant="outlined" sx={{ borderRadius: 2 }}>
            <CardContent sx={{ p: 2.5 }}>
              <Stack spacing={1.5}>
                <Stack direction="row" alignItems="center" spacing={0.75}>
                  <CardGiftcardRoundedIcon sx={{ fontSize: 20, color: "text.secondary" }} />
                  <Typography variant="subtitle2" fontWeight={700}>
                    추천 코드 입력
                  </Typography>
                </Stack>
                <Typography variant="body2" color="text.secondary">
                  친구에게 받은 추천 코드를 입력하면 500 XP를 받을 수 있어요!
                </Typography>
                <Stack direction="row" spacing={1}>
                  <TextField
                    size="small"
                    placeholder="코드 입력"
                    value={inputCode}
                    onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                    inputProps={{ maxLength: 6, style: { textTransform: "uppercase", letterSpacing: "0.15em", textAlign: "center" } }}
                    sx={{ flex: 1 }}
                  />
                  <Button
                    variant="contained"
                    disabled={isSubmittingCode || inputCode.length < 4}
                    onClick={async () => {
                      setIsSubmittingCode(true);
                      setReferralMessage("");
                      setReferralError(false);
                      try {
                        const res = await fetch("/api/referral", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ code: inputCode }),
                        });
                        const data = await res.json();
                        if (res.ok) {
                          setReferralMessage("추천 코드가 적용되었습니다! +500 XP");
                          setAlreadyReferred(true);
                          setInputCode("");
                        } else {
                          setReferralError(true);
                          setReferralMessage(data.error ?? "오류가 발생했습니다.");
                        }
                      } catch {
                        setReferralError(true);
                        setReferralMessage("네트워크 오류가 발생했습니다.");
                      } finally {
                        setIsSubmittingCode(false);
                      }
                    }}
                    sx={{ minWidth: 80 }}
                  >
                    {isSubmittingCode ? "..." : "적용"}
                  </Button>
                </Stack>
                {referralMessage && (
                  <Alert severity={referralError ? "error" : "success"}>{referralMessage}</Alert>
                )}
              </Stack>
            </CardContent>
          </Card>
        )}

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
