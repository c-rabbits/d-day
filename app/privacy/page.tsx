"use client";

import { useRouter } from "next/navigation";
import { Box, Button, Container, Stack, Typography } from "@mui/material";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";

const SECTIONS: Array<{
  title: string;
  body?: string;
  items?: string[];
  subsections?: { title: string; items: string[] }[];
}> = [
  {
    title: "1. 개인정보의 처리 목적",
    body: "디데이(이하 \"회사\")는 다음 목적을 위해 개인정보를 처리합니다.",
    items: [
      "회원 가입 및 관리",
      "계약 만료 알림 서비스 제공",
      "고객 문의 응대",
      "유료 서비스 결제 및 관리",
      "서비스 개선 및 통계 분석",
    ],
  },
  {
    title: "2. 수집하는 개인정보 항목",
    subsections: [
      {
        title: "① 회원가입 시",
        items: ["이메일 주소", "비밀번호(암호화 저장)", "닉네임(선택)"],
      },
      {
        title: "② 서비스 이용 시 자동 수집",
        items: ["기기 정보(OS, 모델명)", "앱 버전", "접속 로그", "푸시 토큰"],
      },
      {
        title: "③ 유료 결제 시",
        items: ["결제 내역 (Google Play 결제 정보)", "※ 카드 정보는 회사가 직접 저장하지 않습니다."],
      },
    ],
  },
  {
    title: "3. 개인정보의 보유 및 이용기간",
    items: [
      "회원 탈퇴 시 즉시 삭제",
      "관계 법령에 따라 보존이 필요한 경우 해당 기간 동안 보관",
      "예: 전자상거래 관련 기록: 5년 / 소비자 불만 기록: 3년",
    ],
  },
  {
    title: "4. 개인정보의 제3자 제공",
    body: "회사는 이용자의 개인정보를 원칙적으로 외부에 제공하지 않습니다. 다만 다음의 경우 예외로 합니다:",
    items: ["이용자의 동의가 있는 경우", "법령에 따른 요청이 있는 경우"],
  },
  {
    title: "5. 개인정보 처리의 위탁",
    body: "회사는 원활한 서비스 제공을 위해 다음과 같이 업무를 위탁할 수 있습니다:",
    items: ["Google Firebase (푸시 및 인증)", "Google Play Billing (결제 처리)"],
  },
  {
    title: "6. 이용자의 권리",
    body: "이용자는 언제든지 다음을 할 수 있습니다:",
    items: ["개인정보 열람", "수정", "삭제", "처리 정지 요청"],
  },
  {
    title: "7. 개인정보의 파기 절차 및 방법",
    items: [
      "전자 파일 형태 → 복구 불가능한 방식으로 삭제",
      "출력물 → 파쇄 또는 소각",
    ],
  },
  {
    title: "8. 개인정보의 안전성 확보 조치",
    items: ["암호화 저장", "접근 권한 최소화", "보안 업데이트 적용"],
  },
  {
    title: "9. 개인정보 보호책임자",
    body: "사업자명: 스튜디오 코니\n이메일: qmirrorp@gmail.com",
  },
  {
    title: "10. 개인정보처리방침의 변경",
    body: "본 방침은 2026년 2월 28일부터 적용됩니다. 변경 시 앱 또는 웹사이트에 공지합니다.",
  },
];

export default function PrivacyPage() {
  const router = useRouter();
  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "grey.50", pb: 6, overflowY: "auto", WebkitOverflowScrolling: "touch" }}>
      <Container maxWidth="sm" sx={{ py: 3, px: 2.5 }}>
        <Button
          startIcon={<ArrowBackRoundedIcon />}
          onClick={() => router.back()}
          sx={{ mb: 2, color: "text.primary" }}
        >
          이전으로
        </Button>

        <Typography variant="h5" fontWeight={700} sx={{ mb: 3, color: "grey.900" }}>
          디데이 개인정보처리방침
        </Typography>

        <Stack spacing={3}>
          {SECTIONS.map((section) => (
            <Box key={section.title}>
              <Typography
                variant="subtitle1"
                fontWeight={700}
                sx={{ color: "primary.main", mb: 1, fontSize: "0.95rem" }}
              >
                {section.title}
              </Typography>
              {section.body && (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ lineHeight: 1.7, pl: 0.5, whiteSpace: "pre-line" }}
                >
                  {section.body}
                </Typography>
              )}
              {section.items && (
                <Stack component="ul" sx={{ m: 0, pl: 2.5, "& li": { mb: 0.75 }, mt: 0.5 }}>
                  {section.items.map((item, i) => (
                    <Typography
                      key={i}
                      component="li"
                      variant="body2"
                      color="text.secondary"
                      sx={{ lineHeight: 1.7 }}
                    >
                      {item}
                    </Typography>
                  ))}
                </Stack>
              )}
              {section.subsections?.map((sub) => (
                <Box key={sub.title} sx={{ mt: 1.5 }}>
                  <Typography
                    variant="body2"
                    fontWeight={600}
                    color="text.secondary"
                    sx={{ mb: 0.5, fontSize: "0.85rem" }}
                  >
                    {sub.title}
                  </Typography>
                  <Stack component="ul" sx={{ m: 0, pl: 2.5, "& li": { mb: 0.5 } }}>
                    {sub.items.map((item, i) => (
                      <Typography
                        key={i}
                        component="li"
                        variant="body2"
                        color="text.secondary"
                        sx={{ lineHeight: 1.7 }}
                      >
                        {item}
                      </Typography>
                    ))}
                  </Stack>
                </Box>
              ))}
            </Box>
          ))}
        </Stack>
      </Container>
    </Box>
  );
}
