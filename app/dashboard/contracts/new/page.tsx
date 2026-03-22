import { ContractNewFlowWithReset } from "@/components/contract-new-flow-mui";
import { Box, Stack, Typography } from "@mui/material";

export default function NewContractPage() {
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
