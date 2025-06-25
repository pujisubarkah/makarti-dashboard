// components/SidebarUser.tsx
"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Newspaper,
  Users,
  Share2,
  BookOpen,
  UserCheck,
  ActivitySquare,
  FileText,
  Package,
  PieChart,
  FileSearch,
} from 'lucide-react'

const menuItems = [
  {
    label: 'Dashboard',
    href: '/user/dashboard',
    icon: LayoutDashboard,
  },
  {
    label: 'Media & Publikasi',
    href: '/user/media',
    icon: Newspaper,
  },
  {
    label: 'Pelatihan',
    href: '/user/sosialisasi',
    icon: BookOpen,
  },
  {
    label: 'Networking / Kunjungan',
    href: '/user/networking',
    icon: Users,
  },
  {
    label: 'Koordinasi Instansi',
    href: '/user/koordinasi',
    icon: Share2,
  },
  {
    label: 'Pelatihan Pegawai',
    href: '/user/pelatihan',
    icon: BookOpen,
  },
  {
    label: 'Peserta',
    href: '/user/peserta',
    icon: UserCheck,
  },
  {
    label: 'Inovasi',
    href: '/user/inovasi',
    icon: ActivitySquare,
  },
  {
    label: 'SKP Transformasional',
    href: '/user/inovasi/skp',
    icon: FileText,
  },
  {
    label: 'Produk Inovasi',
    href: '/user/inovasi/produk',
    icon: Package,
  },
  {
    label: 'Produk Kajian/Analisis Kebijakan',
    href: '/user/kajian',
    icon: FileSearch,
  },
  {
    label: 'Serapan Anggaran',
    href: '/user/serapan',
    icon: PieChart,
  },
]

export function SidebarUser() {
  const pathname = usePathname()

  return (
    <aside className="w-64 bg-white border-r h-screen p-4 sticky top-0 overflow-y-auto shadow-md">
      <h1 className="text-xl font-bold mb-6 text-blue-700">🌟 MAKARTI 5.0</h1>
      <nav className="space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          
          return (
            <Link key={item.href} href={item.href}>
              <div className={`flex items-center text-sm font-semibold p-2 rounded-lg transition-colors ${
                isActive 
                  ? 'bg-blue-100 text-blue-700 border-r-2 border-blue-700' 
                  : 'text-gray-600 hover:bg-gray-100 hover:text-blue-600'
              }`}>
                <Icon className="mr-3 w-4 h-4" />
                <span>{item.label}</span>
              </div>
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
