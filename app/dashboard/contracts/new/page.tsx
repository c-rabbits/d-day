import { ContractNewFlowMui } from "@/components/contract-new-flow-mui";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Box, Stack, Typography } from "@mui/material";

export default async function NewContractPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  return (
    <Box sx={{ px: 2, py: 3.5 }}>
      <Stack spacing={2}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          계약을 단계별로 등록해보세요
        </Typography>
        <ContractNewFlowMui />
      </Stack>
    </Box>
  );
}
