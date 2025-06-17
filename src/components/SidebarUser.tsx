'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Newspaper,
  Megaphone,
  Users,
  Share2,
  BookOpen,
  UserCheck,
  Activity,
  FileText,
  Package,
  LogOut,
} from 'lucide-react'
import clsx from 'clsx'

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
    icon: Activity,
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

export default function SidebarUser() {
  const pathname = usePathname()

  return (
    <aside className="w-64 h-screen bg-white border-r shadow-sm fixed">
      <div className="p-6 font-bold text-xl text-blue-700 border-b">
        Portal User
      </div>
      <nav className="flex flex-col p-4 space-y-1">
        {menuItems.map(({ label, href, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={clsx(
              'flex items-center px-4 py-2 rounded-lg hover:bg-blue-50 text-sm',
              pathname === href ? 'bg-blue-100 text-blue-700 font-semibold' : 'text-gray-700'
            )}
          >
            <Icon className="w-5 h-5 mr-3" />
            {label}
          </Link>
        ))}

        <div className="mt-6 border-t pt-4">
          <Link
            href="/logout"
            className="flex items-center px-4 py-2 rounded-lg hover:bg-red-50 text-sm text-red-600"
          >
            <LogOut className="w-5 h-5 mr-3" />
            Keluar
          </Link>
        </div>
      </nav>
    </aside>
  )
}
