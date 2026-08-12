import { redirect } from "next/navigation";
import { getSessionPayload } from "@/lib/auth/session";
import { ROLES } from "@/lib/constants";

export const dynamic = "force-dynamic";

export default async function Home() {
  const payload = await getSessionPayload();
  if (!payload) redirect("/login");
  redirect(payload.role === ROLES.SUPER_ADMIN ? "/super-admin" : "/dashboard");
}
