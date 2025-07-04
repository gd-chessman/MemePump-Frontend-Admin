"use client"

import { useState, useRef, useEffect } from "react"
import { Search, Settings, LogOut } from "lucide-react"
import { Avatar } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"

import { useRouter } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { getMyInfor } from "@/services/api/UserAdminService"
import { logout } from "@/services/api/AuthService"

export function AdminHeader() {
  const { data: myInfor} = useQuery({
    queryKey: ["my-infor"],
    queryFn: getMyInfor,
    refetchOnMount: true,
  });
  const [isAvatarMenuOpen, setIsAvatarMenuOpen] = useState(false)
  const avatarMenuRef = useRef<HTMLDivElement>(null)
  const avatarButtonRef = useRef<HTMLButtonElement>(null)
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

  const handleLogout = async () => {
    await logout()
    router.push("/login")
  }



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
          {/* Custom Avatar Dropdown */}
          <div className="relative">
            <Button
              ref={avatarButtonRef}
              variant="ghost"
              className={`relative h-9 w-9 rounded-full transition-all duration-200 ${isAvatarMenuOpen ? "ring-2 ring-primary ring-offset-2" : ""}`}
              onClick={() => setIsAvatarMenuOpen(!isAvatarMenuOpen)}
            >
              <Avatar className="h-9 w-9 border-2 border-primary/20 bg-primary/10 text-primary flex items-center justify-center">
                {myInfor?.username?.charAt(0).toUpperCase()}
              </Avatar>
            </Button>

            {isAvatarMenuOpen && (
              <div
                ref={avatarMenuRef}
                className="absolute right-0 mt-2 w-64 rounded-md border bg-popover p-1 text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95 z-50"
              >
                <div className="flex items-center gap-4 p-3">
                  <Avatar className="h-12 w-12 border-2 border-primary/20 bg-primary/10 text-primary flex items-center justify-center">
                    {myInfor?.username?.charAt(0).toUpperCase()}
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

                <button className="flex w-full items-center px-3 py-2 text-sm rounded-md text-destructive hover:bg-destructive/10" onClick={handleLogout}>
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
