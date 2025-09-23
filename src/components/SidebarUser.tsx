// components/SidebarUser.tsx
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
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
} from 'lucide-react'

type SidebarUserProps = {
  roleId: number
}

const menuItems = [
  {
    label: 'Dashboard',
    href: '/user/dashboard',
    icon: LayoutDashboard,
    status: 'ready',
  },
  {
    label: 'Kegiatan Mingguan',
    href: '/user/kegiatan',
    icon: Coins,
    status: 'ready',
  },
  {
    label: 'Publikasi Media',
    href: '/user/branding/media',
    icon: Newspaper,
    status: 'ready',
  },
  {
    label: 'Networking Eksternal',
    href: '/user/networking/kunjungan',
    icon: Users,
    status: 'ready',
  },
  {
    label: 'Koordinasi Eksternal',
    href: '/user/networking/koordinasi',
    icon: Share2,
    status: 'ready',
  },
  {
    label: 'Pelatihan Pegawai',
    href: '/user/learning/pelatihan',
    icon: BookOpen,
    status: 'ready',
  },
  {
    label: 'Penyelenggaraan Bangkom',
    href: '/user/learning/peserta',
    icon: UserCheck,
    status: 'ready',
  },
  {
    label: 'Kinerja Inovasi',
    href: '/user/inovasi/kinerja',
    icon: ActivitySquare,
    status: 'ready',
  },
  {
    label: 'Produk Inovasi',
    href: '/user/inovasi/produk',
    icon: Package,
    status: 'ready',
  },
  {
    label: 'Produk Kajian',
    href: '/user/inovasi/kajian',
    icon: FileSearch,
    status: 'ready',
  },
  {
    label: 'Serapan Anggaran',
    href: '/user/serapan',
    icon: PieChart,
    status: 'ready',
    allowedRoles: [3], // hanya untuk role_id 3
  },
  {
    label: 'Panduan Makarti 5.0',
    href: 'https://s.id/PanduanMakarti',
    icon: PieChart,
    status: 'ready',
    allowedRoles: [3], // hanya untuk role_id 3
  },
]

export function SidebarUser({ roleId }: SidebarUserProps) {
  const pathname = usePathname()

  return (
    <aside className="w-64 min-w-64 max-w-64 bg-white border-r h-screen p-4 sticky top-0 overflow-y-auto shadow-xl flex-shrink-0">      <h1 className="text-2xl font-extrabold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-500 to-pink-500 flex items-center gap-2 truncate">
        <span className="text-3xl flex-shrink-0">🌟</span> 
        <span className="truncate">MAKARTI 5.0</span>
      </h1>
      <nav className="space-y-2">
        {menuItems
          .filter((item) => {
            if (!item.allowedRoles) return true
            return item.allowedRoles.includes(roleId)
          })
          .map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            const iconBg =
              item.status === 'ready'
                ? 'bg-blue-100 text-blue-600'
                : 'bg-orange-100 text-orange-500'

            return (
              <Link key={item.href} href={item.href} className="block">
                <div
                  className={`flex items-center justify-between text-base font-semibold p-2 rounded-xl transition-all duration-200 group shadow-sm
                    ${
                      isActive
                        ? 'bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 border-r-4 border-blue-600 shadow-lg scale-[1.03]'
                        : 'text-gray-600 hover:bg-blue-50 hover:text-blue-700 hover:scale-[1.01]'
                    }`}
                >                  <div className="flex items-center gap-3 min-w-0">
                    <span
                      className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors flex-shrink-0 ${iconBg} group-hover:scale-110`}
                    >
                      <Icon className="w-5 h-5" />
                    </span>
                    <span className="truncate text-sm leading-tight">{item.label}</span>
                  </div>
                  {item.status === 'maintenance' && (
                    <span className="ml-2 text-xs font-bold text-orange-600 bg-orange-100 px-2 py-0.5 rounded-full border border-orange-300 shadow-sm animate-pulse">
                      🚧
                    </span>
                  )}
                </div>
              </Link>
            )
          })}
      </nav>
    </aside>
  )
}
