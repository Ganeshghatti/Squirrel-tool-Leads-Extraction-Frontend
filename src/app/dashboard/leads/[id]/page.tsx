import LeadCollectionContainer from "@/components/dashboard/leads/LeadsContainer";
import { use } from "react";

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  return (
    <div className="p-4 w-full">
      <h1 className="text-2xl font-bold mb-4">Lead Collections</h1>
      <LeadCollectionContainer id={resolvedParams.id} />
    </div>
  );
}