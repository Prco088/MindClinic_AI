"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Users,
  Calendar,
  FileText,
  FolderOpen,
  Settings,
} from "lucide-react"

const navItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Pacientes",
    href: "/patients",
    icon: Users,
  },
  {
    title: "Agenda",
    href: "/appointments",
    icon: Calendar,
  },
  {
    title: "Prontuários",
    href: "/records",
    icon: FileText,
  },
  {
    title: "Documentos",
    href: "/documents",
    icon: FolderOpen,
  },
  {
    title: "Configurações",
    href: "/settings",
    icon: Settings,
  },
]

export function SidebarNav() {
  const pathname = usePathname()

  return (
    <nav className="grid items-start gap-2">
      {navItems.map((item) => {
        const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 transition-all",
              isActive 
                ? "bg-accent text-accent-foreground" 
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            )}
          >
            <item.icon className="h-4 w-4" />
            <span className="text-sm font-medium">{item.title}</span>
          </Link>
        )
      })}
    </nav>
  )
}
