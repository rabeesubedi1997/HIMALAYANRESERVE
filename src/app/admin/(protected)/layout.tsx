import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyToken, ADMIN_COOKIE } from "@/lib/auth";
import AdminSidebar, { AdminMobileStrip } from "@/components/admin/AdminNav";

export const metadata: Metadata = {
  title: "Admin — Himalayan Reserve",
  robots: { index: false, follow: false },
};

export default async function AdminProtectedLayout({ children }: { children: React.ReactNode }) {
  const store = await cookies();
  const token = store.get(ADMIN_COOKIE)?.value;
  const admin = verifyToken(token);

  if (!admin) redirect("/admin/login");

  return (
    <div className="flex h-screen flex-col bg-ink text-paper">
      <header className="z-20 border-b hairline-gold bg-ink/95 backdrop-blur">
        <div className="mx-auto flex h-14 w-full max-w-[1600px] items-center justify-between px-6">
          <span className="font-display text-sm font-semibold tracking-[0.28em] text-paper">
            HIMALAYAN <span className="gold-text">RESERVE</span>{" "}
            <span className="ml-2 text-[0.6rem] uppercase tracking-[0.3em] text-paper-faint">Admin</span>
          </span>
          <span className="flex items-center gap-4">
            <span className="hidden text-xs text-paper-faint sm:inline">
              Signed in as <span className="text-paper-dim">{admin.username}</span>
            </span>
            <Link
              href="/"
              className="text-xs uppercase tracking-[0.2em] text-paper-dim transition-colors hover:text-gold"
            >
              View Site
            </Link>
            <form action="/api/admin/logout" method="post">
              <button
                type="submit"
                className="border border-white/15 px-4 py-1.5 text-xs uppercase tracking-[0.2em] text-paper-dim transition-colors hover:border-seal hover:text-seal"
              >
                Logout
              </button>
            </form>
          </span>
        </div>
      </header>
      <div className="flex min-h-0 flex-1 flex-col">
        <AdminMobileStrip />
        <div className="flex min-h-0 flex-1">
          <AdminSidebar />
          <div className="flex min-w-0 flex-1">{children}</div>
        </div>
      </div>
    </div>
  );
}