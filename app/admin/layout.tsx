import type React from "react"
import { AdminHeader } from "@/components/admin-header"
import { AdminSidebar } from "@/components/admin-sidebar"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <div className="flex flex-col flex-1 h-screen overflow-auto">
        <AdminHeader />
        <main className="flex-1 p-4 md:p-6 bg-slate-950/50">{children}</main>
      </div>
    </div>
  )
}
