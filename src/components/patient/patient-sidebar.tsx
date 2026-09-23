"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { LayoutDashboard, User, FileText, FileCheck2, Calendar, Clock } from "lucide-react"

const navItems = [
  {
    title: "Dashboard",
    href: "/patient/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Documentos",
    href: "/patient/documents",
    icon: FileText,
  },
  {
    title: "Consentimentos",
    href: "/patient/consents",
    icon: FileCheck2,
  },
  {
    title: "Consultas",
    href: "/patient/appointments",
    icon: Calendar,
  },
  {
    title: "Linha do Tempo",
    href: "/patient/timeline",
    icon: Clock,
  },
  {
    title: "Meu Perfil",
    href: "/patient/profile",
    icon: User,
  }
]

export function PatientSidebar() {
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
