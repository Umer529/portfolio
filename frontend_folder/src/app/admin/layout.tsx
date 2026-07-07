import type { Metadata } from "next";
import { AdminNav } from "@/components/admin/AdminNav";

export const metadata: Metadata = {
  title: "Admin — Umer Farooq",
  robots: { index: false, follow: false },
};

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex flex-1 flex-col">
      <AdminNav />
      <div className="mx-auto w-full max-w-5xl flex-1 px-6 py-16">{children}</div>
    </div>
  );
}
