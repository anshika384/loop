import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import DashboardClient from "@/components/dashboard/dashboard-client";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("session_token")?.value;

  if (!sessionToken) {
    redirect("/login");
  }

  // Fetch the logged-in user and workspace information
  const user = await prisma.user.findUnique({
    where: { id: sessionToken },
    include: { workspace: true },
  });

  // If user session is invalid or deleted from the database
  if (!user) {
    // Delete the invalid session cookie
    cookieStore.delete("session_token");
    redirect("/login");
  }

  const serializedUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
    workspaceName: user.workspace ? user.workspace.name : "Personal Workspace",
  };

  return <DashboardClient user={serializedUser} />;
}
