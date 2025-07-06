"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { 
  LayoutDashboard, 
  Users, 
  BookOpen, 
  Calendar, 
  MessageSquare, 
  BarChart3, 
  Settings,
  FileText,
  AlertTriangle,
  Clock
} from "lucide-react"
import { cn } from "@/lib/utils"

const menuItems = [
  {
    label: "Tableau de bord",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Utilisateurs",
    href: "/admin/users",
    icon: Users,
  },
  {
    label: "Livres",
    href: "/admin/books",
    icon: BookOpen,
  },
  {
    label: "Emprunts",
    href: "/admin/borrows",
    icon: Clock,
  },
  {
    label: "Réservations",
    href: "/admin/reservations",
    icon: Calendar,
  },
  {
    label: "Commentaires",
    href: "/admin/comments",
    icon: MessageSquare,
  },
  {
    label: "Analytiques",
    href: "/admin/analytics",
    icon: BarChart3,
  },
  {
    label: "Rapports",
    href: "/admin/reports",
    icon: FileText,
  },
  {
    label: "Système",
    href: "/admin/system",
    icon: Settings,
  },
]

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <aside className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 bg-slate-800 border-r border-slate-700 overflow-y-auto">
      <div className="p-4">
        <div className="mb-6">
          <div className="flex items-center space-x-2 text-amber-400 bg-amber-400/10 p-3 rounded-lg border border-amber-400/20">
            <AlertTriangle className="h-4 w-4" />
            <span className="text-sm font-medium">Mode Administrateur</span>
          </div>
        </div>

        <nav className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            
            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-start space-x-3 h-11 text-slate-300 hover:text-white hover:bg-slate-700/50",
                    isActive && "bg-red-600/20 text-red-400 hover:bg-red-600/30 hover:text-red-300 border-l-2 border-red-500"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </Button>
              </Link>
            )
          })}
        </nav>

        <div className="mt-8 pt-6 border-t border-slate-700">
          <div className="text-xs text-slate-500 mb-2">ACCÈS RAPIDE</div>
          <div className="space-y-1">
            <Button variant="ghost" size="sm" className="w-full justify-start text-slate-400 hover:text-white text-xs">
              <AlertTriangle className="h-3 w-3 mr-2" />
              Livres en retard
            </Button>
            <Button variant="ghost" size="sm" className="w-full justify-start text-slate-400 hover:text-white text-xs">
              <Users className="h-3 w-3 mr-2" />
              Nouveaux utilisateurs
            </Button>
          </div>
        </div>
      </div>
    </aside>
  )
}
