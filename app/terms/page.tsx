"use client";

import { useRouter } from "next/navigation";
import { Box, Button, Container, Stack, Typography } from "@mui/material";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";

const CLAUSES = [
  {
    title: "제1조 (목적)",
    body: "이 약관은 개인 사업자 \"디데이\" (이하 \"회사\")가 제공하는 모바일 앱 및 웹 기반 서비스(이하 \"서비스\")의 이용과 관련하여 회사와 이용자의 권리·의무 및 책임사항을 규정함을 목적으로 합니다.",
  },
  {
    title: "제2조 (정의)",
    items: [
      "\"서비스\"라 함은 회사가 제공하는 디데이 앱, 웹(PWA), 알림 기능 등을 의미합니다.",
      "\"이용자\"라 함은 본 약관에 따라 회사가 제공하는 서비스를 이용하는 자를 말합니다.",
      "\"유료서비스\"라 함은 이용자가 결제하여 사용하는 프리미엄 기능을 의미합니다.",
    ],
  },
  {
    title: "제3조 (약관의 명시와 개정)",
    items: [
      "회사는 이 약관을 앱 내 및 웹사이트 초기 화면에 게시합니다.",
      "약관의 변경이 있는 경우 회사는 사전에 공지하며, 변경된 약관은 공지한 시점 이후 적용됩니다.",
    ],
  },
  {
    title: "제4조 (서비스 제공)",
    items: [
      "회사는 다음과 같은 서비스를 제공합니다:",
      "계약 만료 알림(카운트다운, D-day 계산)",
      "알림 설정 및 푸시서비스",
      "계약 목록 관리",
      "서비스 이용은 회사의 정책에 따라 일부 제한될 수 있습니다.",
    ],
  },
  {
    title: "제5조 (이용 계약)",
    items: [
      "이용계약은 이용자가 약관에 동의하고 서비스 이용을 신청함으로써 성립됩니다.",
      "회사는 아래에 해당할 경우 이용 신청을 거부할 수 있습니다:",
      "허위 내용 등록",
      "기타 불법적 이용이 의심되는 경우",
    ],
  },
  {
    title: "제6조 (계정 및 개인정보)",
    items: [
      "이용자는 정확한 정보로 계정을 생성해야 합니다.",
      "회사는 개인정보 처리방침에 따라 이용자의 정보를 안전하게 관리합니다.",
    ],
  },
  {
    title: "제7조 (유료 서비스 및 결제)",
    items: [
      "유료서비스 결제는 Google Play 결제 시스템을 통해 이루어집니다.",
      "환불은 Google Play 정책에 따릅니다.",
    ],
  },
  {
    title: "제8조 (이용자의 의무)",
    items: [
      "이용자는 약관 준수 및 서비스 이용 관련 법령을 준수해야 합니다.",
      "타인의 권리를 침해하거나 불법적인 행위를 해서는 안 됩니다.",
    ],
  },
  {
    title: "제9조 (서비스 이용 제한)",
    body: "회사는 다음과 같은 경우 이용을 제한 또는 중단할 수 있습니다:",
    items: [
      "서비스 운영에 중대한 장애가 발생한 경우",
      "이용자의 약관 위반이 확인된 경우",
    ],
  },
  {
    title: "제10조 (알림 및 정보의 정확성)",
    items: [
      "디데이 서비스는 이용자가 입력한 데이터를 기반으로 알림을 제공합니다.",
      "회사는 알림 누락, 정보 오차 등에 대해 책임을 지지 않습니다.",
    ],
  },
  {
    title: "제11조 (지적재산권)",
    body: "서비스에 포함된 모든 콘텐츠 및 디자인은 회사 또는 라이선스 제공자의 소유이며, 무단 복제 및 배포를 금합니다.",
  },
  {
    title: "제12조 (면책조항)",
    body: "회사는 천재지변, 서비스 장애, 네트워크 문제 등 회사 귀책사유가 아닌 사유로 발생한 손해에 대해 책임을 지지 않습니다.",
  },
  {
    title: "제13조 (준거법 및 재판관할)",
    body: "본 약관은 대한민국 법률에 따라 해석되며, 분쟁 발생 시 서울중앙지방법원을 1심 관할 법원으로 합니다.",
  },
];

export default function TermsPage() {
  const router = useRouter();
  return (
    <Box
      sx={{
        height: "100vh",
        maxHeight: "100dvh",
        bgcolor: "grey.50",
        overflowY: "auto",
        overflowX: "hidden",
        WebkitOverflowScrolling: "touch",
      }}
    >
      <Container maxWidth="sm" sx={{ py: 3, px: 2.5, pb: 6 }}>
        <Button
          startIcon={<ArrowBackRoundedIcon />}
          onClick={() => router.back()}
          sx={{ mb: 2, color: "text.primary" }}
        >
          이전으로
        </Button>

        <Typography variant="h5" fontWeight={700} sx={{ mb: 3, color: "grey.900" }}>
          디데이 서비스 이용약관
        </Typography>

        <Stack spacing={3}>
          {CLAUSES.map((clause) => (
            <Box key={clause.title}>
              <Typography
                variant="subtitle1"
                fontWeight={700}
                sx={{ color: "primary.main", mb: 1, fontSize: "0.95rem" }}
              >
                {clause.title}
              </Typography>
              {clause.body && (
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7, pl: 0.5 }}>
                  {clause.body}
                </Typography>
              )}
              {clause.items && (
                <Stack component="ul" sx={{ m: 0, pl: 2.5, "& li": { mb: 0.75 } }}>
                  {clause.items.map((item, i) => (
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
            </Box>
          ))}
        </Stack>

        <Box
          sx={{
            mt: 4,
            pt: 2,
            borderTop: "1px solid",
            borderColor: "divider",
          }}
        >
          <Typography variant="subtitle2" fontWeight={700} color="text.secondary" gutterBottom>
            부칙
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
            이 약관은 2026년 2월 28일부터 시행합니다.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}
