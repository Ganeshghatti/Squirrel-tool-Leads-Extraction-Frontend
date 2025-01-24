import Image from "next/image";
import Login from "@/components/auth/Login";
import { LeadsManagement } from "@/components/dashboard/leads/LeadsManagement";

export default function Home() {
  return (
    <main>
      <Login />
    </main>
  );
}
