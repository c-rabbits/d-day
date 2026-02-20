import { ContractNewFlow } from "@/components/contract-new-flow";

export default function NewContractPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <h1 className="mb-6 text-xl font-semibold">계약 추가</h1>
      <ContractNewFlow />
    </div>
  );
}
