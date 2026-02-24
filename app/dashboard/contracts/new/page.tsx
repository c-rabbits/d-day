import { ContractNewFlowWithReset } from "@/components/contract-new-flow-mui";
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
    <Box sx={{ px: 1.5, pt: 3.5, pb: 14, bgcolor: "grey.50", minHeight: "100vh" }}>
      <Stack spacing={2}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          계약을 단계별로 등록해보세요
        </Typography>
        <ContractNewFlowWithReset />
      </Stack>
    </Box>
  );
}
