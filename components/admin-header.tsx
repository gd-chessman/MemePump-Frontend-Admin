"use client"

import { useState, useRef, useEffect } from "react"
import { Bell, Search, Settings, LogOut, X, ShieldAlert, RefreshCw, Server, AlertTriangle } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ThemeToggle } from "@/components/theme-toggle"
import { useRouter } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { getMyInfor } from "@/services/api/UserAdminService"

export function AdminHeader() {
  const { data: myInfor} = useQuery({
    queryKey: ["my-infor"],
    queryFn: getMyInfor,
  });
  const [isAvatarMenuOpen, setIsAvatarMenuOpen] = useState(false)
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)
  const avatarMenuRef = useRef<HTMLDivElement>(null)
  const avatarButtonRef = useRef<HTMLButtonElement>(null)
  const notificationsMenuRef = useRef<HTMLDivElement>(null)
  const notificationsButtonRef = useRef<HTMLButtonElement>(null)
  const router = useRouter()

  // Close menus when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      // Handle avatar menu
      if (
        avatarMenuRef.current &&
        avatarButtonRef.current &&
        !avatarMenuRef.current.contains(event.target as Node) &&
        !avatarButtonRef.current.contains(event.target as Node)
      ) {
        setIsAvatarMenuOpen(false)
      }

      // Handle notifications menu
      if (
        notificationsMenuRef.current &&
        notificationsButtonRef.current &&
        !notificationsMenuRef.current.contains(event.target as Node) &&
        !notificationsButtonRef.current.contains(event.target as Node)
      ) {
        setIsNotificationsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const handleSettingsClick = () => {
    router.push("/admin/settings")
    setIsAvatarMenuOpen(false)
  }

  // System notifications data
  const notifications = [
    {
      id: 1,
      title: "System Update Completed",
      message: "The system has been updated to version 2.5.0",
      time: "10 minutes ago",
      icon: RefreshCw,
      iconColor: "text-blue-500",
    },
    {
      id: 2,
      title: "Security Alert",
      message: "Multiple failed login attempts detected from IP 192.168.1.45",
      time: "25 minutes ago",
      icon: ShieldAlert,
      iconColor: "text-amber-500",
    },
    {
      id: 3,
      title: "Server Performance",
      message: "High CPU usage detected on main server (85%)",
      time: "1 hour ago",
      icon: Server,
      iconColor: "text-emerald-500",
    },
    {
      id: 4,
      title: "Database Warning",
      message: "Database storage reaching 90% capacity",
      time: "3 hours ago",
      icon: AlertTriangle,
      iconColor: "text-rose-500",
    },
  ]

  return (
    <div className="sticky top-0 z-40 w-full bg-background/80 backdrop-blur-md border-b">
      <div className="flex h-14 items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-2 md:gap-4">
          <div className="hidden md:flex">
            <div className="header-search py-1">
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search..."
                  className="w-[12.5rem] md:w-[16.25rem] lg:w-[20rem] h-8 outline-none border-0 bg-transparent p-0 shadow-none focus-visible:ring-0 text-sm"
                />
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />

          {/* Notifications Button and Dropdown */}
          <div className="relative">
            <Button
              ref={notificationsButtonRef}
              variant="ghost"
              size="icon"
              className={`header-icon-button relative ${isNotificationsOpen ? "bg-muted" : ""}`}
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            >
              <Bell className="h-5 w-5" />
              <Badge className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full p-0 text-xs">
                {notifications.length}
              </Badge>
            </Button>

            {isNotificationsOpen && (
              <div
                ref={notificationsMenuRef}
                className="absolute right-0 mt-2 w-80 rounded-md border bg-popover p-1 text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95 z-50"
              >
                <div className="flex items-center justify-between p-3">
                  <h3 className="font-semibold">System Notifications</h3>
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setIsNotificationsOpen(false)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <div className="h-px bg-muted my-1"></div>

                <div className="max-h-[350px] overflow-auto">
                  {notifications.length > 0 ? (
                    notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className="flex items-start gap-3 p-3 hover:bg-accent rounded-md cursor-pointer"
                      >
                        <div
                          className={`flex h-8 w-8 items-center justify-center rounded-full bg-muted ${notification.iconColor}/10`}
                        >
                          <notification.icon className={`h-4 w-4 ${notification.iconColor}`} />
                        </div>
                        <div className="flex flex-col">
                          <div className="flex w-full justify-between">
                            <span className="font-medium">{notification.title}</span>
                          </div>
                          <span className="text-sm text-muted-foreground">{notification.message}</span>
                          <span className="text-xs text-muted-foreground mt-1">{notification.time}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-center text-muted-foreground">No new notifications</div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Custom Avatar Dropdown */}
          <div className="relative">
            <Button
              ref={avatarButtonRef}
              variant="ghost"
              className={`relative h-9 w-9 rounded-full transition-all duration-200 ${isAvatarMenuOpen ? "ring-2 ring-primary ring-offset-2" : ""}`}
              onClick={() => setIsAvatarMenuOpen(!isAvatarMenuOpen)}
            >
              <Avatar className="h-9 w-9 border-2 border-primary/20">
                <AvatarImage src="/abstract-geometric-shapes.png" alt="User" />
                <AvatarFallback className="bg-primary/10 text-primary">AD</AvatarFallback>
              </Avatar>
            </Button>

            {isAvatarMenuOpen && (
              <div
                ref={avatarMenuRef}
                className="absolute right-0 mt-2 w-64 rounded-md border bg-popover p-1 text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95 z-50"
              >
                <div className="flex items-center gap-4 p-3">
                  <Avatar className="h-12 w-12 border-2 border-primary/20">
                    <AvatarImage src="/abstract-geometric-shapes.png" alt="User" />
                    <AvatarFallback className="bg-primary/10 text-primary">AD</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{myInfor?.username}</p>
                    <p className="text-xs leading-none text-muted-foreground">{myInfor?.email}</p>
                  </div>
                </div>

                <div className="h-px bg-muted my-1"></div>

                <div className="p-2">
                  <div className="text-xs font-medium text-muted-foreground mb-2">ACCOUNT INFORMATION</div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex flex-col space-y-1 rounded-md bg-muted p-2">
                      <span className="text-xs font-medium">Status</span>
                      <span className="text-xs text-emerald-500 font-medium">Active</span>
                    </div>
                    <div className="flex flex-col space-y-1 rounded-md bg-muted p-2">
                      <span className="text-xs font-medium">Role</span>
                      <span className="text-xs font-medium uppercase">{myInfor?.role}</span>
                    </div>
                  </div>
                </div>

                <div className="h-px bg-muted my-1"></div>

                <button
                  className="flex w-full items-center px-3 py-2 text-sm rounded-md hover:bg-accent"
                  onClick={handleSettingsClick}
                >
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </button>

                <div className="h-px bg-muted my-1"></div>

                <button className="flex w-full items-center px-3 py-2 text-sm rounded-md text-destructive hover:bg-destructive/10">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log Out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
