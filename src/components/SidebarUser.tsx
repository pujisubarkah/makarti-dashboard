// components/SidebarUser.tsx
"use client"

import Link from "next/link"
import {
  LayoutDashboard,
  Newspaper,
  Megaphone,
  Users,
  Share2,
  BookOpen,
  UserCheck,
  ActivitySquare,
  FileText,
  Package,
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
    label: 'Sosialisasi',
    href: '/user/sosialisasi',
    icon: Megaphone,
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
    label: 'Pelatihan',
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
]

export function SidebarUser() {
  return (
    <aside className="w-64 bg-white border-r h-screen p-4 sticky top-0 overflow-y-auto shadow-md">
      <h1 className="text-xl font-bold mb-6 text-blue-700">🌟 MAKARTI</h1>
      {menuItems.map((item) => {
        const Icon = item.icon
        return (
          <Link key={item.href} href={item.href} className="block">
            <div className="flex items-center text-sm font-semibold text-gray-600 mb-2 hover:text-blue-600 transition-colors">
              <Icon className="mr-2 w-4 h-4" />
              <span>{item.label}</span>
            </div>
          </Link>
        )
      })}
    </aside>
  )
}