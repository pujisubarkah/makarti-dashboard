"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  Lightbulb,
  LayoutDashboard,
  Megaphone,
  Users,
  BookOpenCheck,
  PieChart,
} from "lucide-react"

const menuItems = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    children: [
      { title: "Ringkasan MAKARTI", href: "/admin/dashboard" },
      { title: "Statistik", href: "/admin/dashboard/statistik" },
    ],
  },
  {
    title: "Inovasi",
    icon: Lightbulb,
    children: [
      { title: "Kinerja Inovasi", href: "/admin/inovasi/kinerja" },
      { title: "SKP Transformasional", href: "/admin/inovasi/skp" },
      { title: "Jumlah Produk", href: "/admin/inovasi/produk" },
    ],
  },
  {
    title: "Komunikasi & Branding",
    icon: Megaphone,
    children: [
      { title: "Postingan Media", href: "/admin/komunikasi/media" },
      { title: "Jumlah Sosialisasi", href: "/admin/komunikasi/sosialisasi" },
    ],
  },
  {
    title: "Networking",
    icon: Users,
    children: [
      { title: "Instansi yang Dikunjungi", href: "/admin/networking/kunjungan" },
      { title: "Kegiatan Koordinasi", href: "/admin/networking/koordinasi" },
    ],
  },
  {
    title: "Learning",
    icon: BookOpenCheck,
    children: [
      { title: "Jumlah Pelatihan", href: "/admin/learning/pelatihan" },
      { title: "Jumlah Peserta", href: "/admin/learning/peserta" },
      { title: "Penyelenggaraan", href: "/admin/learning/penyelenggaraan" },
    ],
  },
  {
    title: "Serapan Anggaran",
    icon: PieChart,
    children: [
      { title: "Grafik Serapan", href: "/admin/serapan" },
    ],
  },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-64 bg-white border-r h-screen p-4 sticky top-0 overflow-y-auto shadow-md">
      <h1 className="text-xl font-bold mb-6 text-blue-700">🌟 MAKARTI 5.0</h1>
      {menuItems.map((section) => (
        <div key={section.title} className="mb-4">
          <div className="flex items-center text-sm font-semibold text-gray-600 mb-2">
            <section.icon className="mr-2 w-4 h-4" />
            {section.title}
          </div>
          <ul className="space-y-1 ml-2">
            {section.children.map((item) => {
              const isActive = pathname === item.href
              return (
                <li key={item.href}>
                  <Link href={item.href}>
                    <div
                      className={cn(
                        "flex items-center text-sm font-medium p-2 rounded-lg transition-colors",
                        isActive
                          ? "bg-blue-100 text-blue-700 border-r-2 border-blue-700"
                          : "text-gray-600 hover:bg-gray-100 hover:text-blue-600"
                      )}
                    >
                      <span className="ml-2">{item.title}</span>
                    </div>
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>
      ))}
    </aside>
  )
}
