import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { ContractEditForm } from "@/components/contract-edit-form";
import { LoadingSpinner } from "@/components/loading-spinner";
import { Suspense } from "react";
import { Box, Stack, Typography } from "@mui/material";

async function EditContent({ id }: { id: string }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");
  const { data: contract, error } = await supabase
    .from("contracts")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .is("deleted_at", null)
    .single();
  if (error || !contract) notFound();
  return (
    <Box sx={{ px: 2, py: 3.5 }}>
      <Stack spacing={1.7}>
        <Box>
          <Typography
            variant="caption"
            sx={{ color: "primary.main", fontWeight: 700, letterSpacing: "0.08em" }}
          >
            EDIT CONTRACT
          </Typography>
          <Typography variant="h5" sx={{ mt: 0.3, fontWeight: 700 }}>
            계약 수정
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.7 }}>
            필요한 정보만 수정하고 저장하면 만료 알림 일정도 함께 갱신됩니다.
          </Typography>
        </Box>
        <ContractEditForm contract={contract} />
      </Stack>
    </Box>
  );
}

async function ParamsAndEdit({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <EditContent id={id} />;
}

export default function ContractEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <ParamsAndEdit params={params} />
    </Suspense>
  );
}
