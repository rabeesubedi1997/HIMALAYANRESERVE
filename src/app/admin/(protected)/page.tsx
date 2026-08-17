import { getSettings } from "@/lib/settings";
import AdminDashboard from "@/components/admin/AdminDashboard";

export default async function AdminPage() {
  const settings = await getSettings();
  return <AdminDashboard initial={settings} />;
}