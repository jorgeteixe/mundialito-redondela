"use client";

import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { Button } from "@mr/ui";

export default function DashboardPage() {
  const router = useRouter();

  async function handleLogout() {
    await authClient.signOut();
    router.push("/login");
  }

  return (
    <main className="flex min-h-screen items-center justify-center">
      <Button variant="outline" onClick={handleLogout}>
        Cerrar sesión
      </Button>
    </main>
  );
}
