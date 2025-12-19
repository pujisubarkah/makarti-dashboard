// components/SidebarUser.tsx
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Newspaper,
  Users,
  Share2,
  BookOpen,
  UserCheck,
  ActivitySquare,
  Package,
  PieChart,
  FileSearch,
  Coins,
  ChevronLeft,
  ChevronRight,
  UserCog,
} from 'lucide-react'

type SidebarUserProps = {
  roleId: number
  isCollapsed?: boolean
  onToggle?: () => void
}

type MenuItem = {
  label: string
  href?: string
  icon?: React.ComponentType<{ className?: string }>
  status?: 'ready' | 'maintenance'
  allowedRoles?: number[]
  type?: 'group' | 'item'
}

const menuItems: MenuItem[] = [
  {
    label: 'Dashboard',
    href: '/user/dashboard',
    icon: LayoutDashboard,
    status: 'ready',
    type: 'item',
  },
  {
    label: 'Daftar Pegawai',
    href: '/user/pegawai',
    icon: Users,
    status: 'ready',
    type: 'item',
  },
  {
    label: 'HCDP',
    href: '/user/HCDP',
    icon: PieChart,
    status: 'ready',
    type: 'item',
  },
  {
    type: 'group',
    label: 'RENCANA AKSI',
  },
  {
    label: 'Aksi Makarti',
    href: '/user/rencana',
    icon: UserCheck,
    status: 'ready',
    type: 'item',
  },
  {
    type: 'group',
    label: 'SKP GENERIK',
  },
  {
    label: 'Input SKP Generik',
    href: '/user/skp-generik',
    icon: FileSearch,
    status: 'ready',
    type: 'item',
  },
  {
    label: 'Kegiatan Mingguan',
    href: '/user/kegiatan',
    icon: Coins,
    status: 'ready',
    type: 'item',
  },
  {
    label: 'Serapan Anggaran',
    href: '/user/serapan',
    icon: PieChart,
    status: 'ready',
    allowedRoles: [3], // hanya untuk role_id 3
    type: 'item',
  },
  {
    type: 'group',
    label: 'SKP TRANSFORMASI',
  },
  {
    label: 'Publikasi Media',
    href: '/user/branding/media',
    icon: Newspaper,
    status: 'ready',
    type: 'item',
  },
  {
    label: 'Networking Eksternal',
    href: '/user/networking/kunjungan',
    icon: Users,
    status: 'ready',
    type: 'item',
  },
  {
    label: 'Koordinasi Eksternal',
    href: '/user/networking/koordinasi',
    icon: Share2,
    status: 'ready',
    type: 'item',
  },
  {
    label: 'Pelatihan Pegawai',
    href: '/user/learning/pelatihan',
    icon: BookOpen,
    status: 'ready',
    type: 'item',
  },
  {
    label: 'Penyelenggaraan Bangkom',
    href: '/user/learning/peserta',
    icon: UserCheck,
    status: 'ready',
    type: 'item',
  },
  {
    label: 'Kinerja Inovasi',
    href: '/user/inovasi/kinerja',
    icon: ActivitySquare,
    status: 'ready',
    type: 'item',
  },
  {
    label: 'Produk Inovasi',
    href: '/user/inovasi/produk',
    icon: Package,
    status: 'ready',
    type: 'item',
  },
  {
    label: 'Produk Kajian',
    href: '/user/inovasi/kajian',
    icon: FileSearch,
    status: 'ready',
    type: 'item',
  },
  {
    type: 'group',
    label: 'MASTER PEGAWAI',
  },
  {
    label: 'Dashboard Pegawai',
    href: '/user/dashboard-pegawai',
    icon: PieChart,
    status: 'ready',
    allowedRoles: [5], // hanya untuk role_id 5
    type: 'item',
  },
  {
    label: 'Edit Pegawai',
    href: '/user/master-pegawai',
    icon: UserCog,
    status: 'ready',
    allowedRoles: [5], // hanya untuk role_id 5
    type: 'item',
  },
  {
    label: 'HCDP',
    href: '/user/SDM/HCDP',
    icon: Users,
    status: 'ready',
    allowedRoles: [5], // hanya untuk role_id 5
    type: 'item',
  },
  {
    type: 'group',
    label: 'PANDUAN',
  },
  {
    label: 'Panduan Makarti 5.0',
    href: 'https://s.id/PanduanMakarti',
    icon: PieChart,
    status: 'ready',
    type: 'item',
  },
]

export function SidebarUser({ roleId, isCollapsed, onToggle }: SidebarUserProps) {
  const pathname = usePathname()

  return (
    <aside 
      className={cn(
        "bg-white border-r h-screen sticky top-0 overflow-y-auto shadow-xl flex-shrink-0 transition-all duration-300",
        isCollapsed ? "w-16 min-w-16 max-w-16" : "w-64 min-w-64 max-w-64"
      )}
    >
      <div className="p-4">
        <h1 
          className={cn(
            "font-extrabold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-500 to-pink-500 flex items-center gap-2 transition-all duration-300",
            isCollapsed ? "text-center justify-center text-xl" : "text-2xl truncate"
          )}
        >
          <span className={cn("flex-shrink-0", isCollapsed ? "text-2xl" : "text-3xl")}>🌟</span> 
          {!isCollapsed && <span className="truncate">MAKARTI 5.0</span>}
        </h1>
        <nav className="space-y-2">
          {menuItems
            .filter((item) => {
              if (!item.allowedRoles) return true
              return item.allowedRoles.includes(roleId)
            })
            .map((item, index) => {
              // Render group label
              if (item.type === 'group') {
                if (isCollapsed) {
                  return (
                    <div key={`group-${index}`} className="pt-4 pb-2">
                      <div className="h-px bg-gray-300" />
                    </div>
                  )
                }
                return (
                  <div key={`group-${index}`} className="pt-4 pb-2">
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-2">
                      {item.label}
                    </h3>
                  </div>
                )
              }

              // Render menu item
              const Icon = item.icon!
              const isActive = pathname === item.href
              const iconBg =
                item.status === 'ready'
                  ? 'bg-blue-100 text-blue-600'
                  : 'bg-orange-100 text-orange-500'

              return (
                <Link key={item.href} href={item.href!} className="block">
                  <div
                    className={cn(
                      "flex items-center text-base font-semibold p-2 rounded-xl transition-all duration-200 group shadow-sm",
                      isActive
                        ? 'bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 border-r-4 border-blue-600 shadow-lg scale-[1.03]'
                        : 'text-gray-600 hover:bg-blue-50 hover:text-blue-700 hover:scale-[1.01]',
                      isCollapsed ? "justify-center" : "justify-between"
                    )}
                    title={isCollapsed ? item.label : undefined}
                  >
                    <div className={cn("flex items-center gap-3 min-w-0", isCollapsed && "justify-center")}>
                      <span
                        className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors flex-shrink-0 ${iconBg} group-hover:scale-110`}
                      >
                        <Icon className="w-5 h-5" />
                      </span>
                      {!isCollapsed && <span className="truncate text-sm leading-tight">{item.label}</span>}
                    </div>
                    {!isCollapsed && item.status === 'maintenance' && (
                      <span className="ml-2 text-xs font-bold text-orange-600 bg-orange-100 px-2 py-0.5 rounded-full border border-orange-300 shadow-sm animate-pulse">
                        🚧
                      </span>
                    )}
                  </div>
                </Link>
              )
            })}
        </nav>
      </div>
      
      {/* Toggle Button */}
      {onToggle && (
        <button
          onClick={onToggle}
          className="absolute -right-3 top-8 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-1 shadow-lg transition-all duration-300 z-50"
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </button>
      )}
    </aside>
  )
}
