import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyToken, ADMIN_COOKIE } from "@/lib/auth";
import LoginForm from "@/components/admin/LoginForm";

export const metadata = {
  title: "Sign In — Himalayan Reserve Admin",
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage() {
  const store = await cookies();
  const admin = verifyToken(store.get(ADMIN_COOKIE)?.value);
  if (admin) redirect("/admin");
  return <LoginForm />;
}