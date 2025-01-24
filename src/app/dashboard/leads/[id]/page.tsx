import LeadCollectionContainer from "@/components/dashboard/leads/LeadsContainer";

export default async function Page({
  params,
}: {
  params: { id: string };
}) {
    const id = await params?.id;
  return (
    <div className="p-4 ">
      <h1 className="text-2xl font-bold mb-4">Lead Collections</h1>
      <LeadCollectionContainer id={id} />
    </div>
  );
}
