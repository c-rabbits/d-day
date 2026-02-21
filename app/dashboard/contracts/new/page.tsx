import { ContractNewFlowMui } from "@/components/contract-new-flow-mui";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Box, Chip, Stack, Typography } from "@mui/material";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";

export default async function NewContractPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  return (
    <Box sx={{ px: 2, py: 3.5 }}>
      <Stack spacing={2}>
        <Box>
          <Chip
            icon={<AutoAwesomeRoundedIcon />}
            label="NEW CONTRACT"
            color="primary"
            variant="outlined"
            size="small"
            sx={{ fontWeight: 700, mb: 1.2 }}
          />
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            계약을 단계별로 등록해보세요
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.8 }}>
            카테고리 선택 → 정보 입력 → 알림 설정 순서로 진행됩니다.
          </Typography>
        </Box>
        <ContractNewFlowMui />
      </Stack>
    </Box>
  );
}
