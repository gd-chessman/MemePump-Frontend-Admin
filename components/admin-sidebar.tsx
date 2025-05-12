"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  BarChart3,
  FileText,
  Home,
  LayoutDashboard,
  Menu,
  Settings,
  Users,
  X,
  ChevronDown,
  ChevronRight,
  Tag,
  ChevronLeft,
  Wallet,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"

interface NavItem {
  title: string
  href: string
  icon: React.ElementType
  submenu?: { title: string; href: string }[]
}

const navItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    title: "Users",
    href: "/admin/users",
    icon: Users,
  },
  {
    title: "User Wallets",
    href: "/admin/user-wallets",
    icon: Wallet,
  },
  {
    title: "Categorys Token",
    href: "/admin/categories-token",
    icon: Tag,
  },
  {
    title: "Analytics",
    href: "/admin/analytics",
    icon: BarChart3,
  },
  {
    title: "Reports",
    href: "/admin/reports",
    icon: FileText,
  },
  {
    title: "Settings",
    href: "/admin/settings",
    icon: Settings,
  },
]

export function AdminSidebar() {
  const [isOpen, setIsOpen] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null)
  const pathname = usePathname()

  const toggleSubmenu = (title: string) => {
    setOpenSubmenu(openSubmenu === title ? null : title)
  }

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed)
  }

  // Check if the current path matches the nav item or any of its subitems
  const isActive = (item: NavItem) => {
    if (pathname === item.href) return true
    if (item.submenu && item.submenu.some((subitem) => pathname === subitem.href)) return true
    return false
  }

  // Open submenu if current path is in a submenu
  useEffect(() => {
    navItems.forEach((item) => {
      if (item.submenu && item.submenu.some((subitem) => pathname === subitem.href)) {
        setOpenSubmenu(item.title)
      }
    })
  }, [pathname])

  return (
    <>
      <Button
        variant="outline"
        size="icon"
        className="fixed left-4 top-3 z-50 md:hidden"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
      </Button>
      <aside
        className={cn(
          "bg-slate-900 z-40 shrink-0 h-screen flex flex-col md:sticky fixed top-0 left-0 transition-all duration-300 ease-in-out border-r border-slate-800",
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
          isCollapsed ? "w-20" : "w-64",
        )}
      >
        <div className="flex h-14 items-center border-b border-slate-800 px-6 justify-between relative">
          <Link href="/admin" className={cn("flex items-center gap-2", isCollapsed && "justify-center")}>
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary">
              <Home className="h-4 w-4 text-primary-foreground" />
            </div>
            {!isCollapsed && <span className="text-lg font-bold text-white">Admin Panel</span>}
          </Link>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleCollapse}
            className="hidden md:flex absolute right-0 h-8 w-4 p-0 bg-slate-900 border border-slate-800 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 z-50"
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>
        <ScrollArea className="flex-1">
          <nav className={cn("grid gap-1 py-4", isCollapsed ? "px-1" : "px-2")}>
            {navItems.map((item) => (
              <div key={item.title}>
                {item.submenu ? (
                  <>
                    <button
                      onClick={() => toggleSubmenu(item.title)}
                      className={cn(
                        "sidebar-item w-full text-left",
                        isActive(item) ? "sidebar-item-active" : "sidebar-item-inactive",
                        isCollapsed && "justify-center px-0",
                      )}
                    >
                      <item.icon className={cn("sidebar-icon", isActive(item) && "sidebar-active-icon")} />
                      {!isCollapsed && (
                        <>
                          <span className="flex-1">{item.title}</span>
                          {openSubmenu === item.title ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </>
                      )}
                    </button>
                    {openSubmenu === item.title && !isCollapsed && (
                      <div className="ml-4 mt-1 grid gap-1 pl-4 border-l border-slate-800">
                        {item.submenu.map((subitem) => (
                          <Link
                            key={subitem.href}
                            href={subitem.href}
                            className={cn(
                              "sidebar-item",
                              pathname === subitem.href ? "sidebar-item-active" : "sidebar-item-inactive",
                            )}
                          >
                            <span>{subitem.title}</span>
                          </Link>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <Link
                    href={item.href}
                    className={cn(
                      "sidebar-item",
                      pathname === item.href ? "sidebar-item-active" : "sidebar-item-inactive",
                      isCollapsed && "justify-center px-0",
                    )}
                    title={isCollapsed ? item.title : undefined}
                  >
                    <item.icon className={cn("sidebar-icon", pathname === item.href && "sidebar-active-icon")} />
                    {!isCollapsed && <span>{item.title}</span>}
                  </Link>
                )}
              </div>
            ))}
          </nav>
        </ScrollArea>
        {!isCollapsed && (
          <div className="border-t border-slate-800 p-4">
            <div className="flex items-center gap-3 rounded-lg bg-white/5 p-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary">
                <span className="text-sm font-medium text-primary-foreground">AD</span>
              </div>
              <div className="flex flex-col">
                <p className="text-sm font-medium text-white">Admin User</p>
                <p className="text-xs text-white/60">admin@example.com</p>
              </div>
            </div>
          </div>
        )}
        {isCollapsed && (
          <div className="border-t border-slate-800 p-2">
            <div className="flex items-center justify-center py-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary">
                <span className="text-sm font-medium text-primary-foreground">AD</span>
              </div>
            </div>
          </div>
        )}
      </aside>
    </>
  )
}
