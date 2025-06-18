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
  PieChart
} from "lucide-react"

const menuItems = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    children: [
      { title: "Ringkasan MAKARTI", href: "/dashboard" },
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
          <ul className="space-y-1 ml-6">
            {section.children.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "block px-2 py-1 rounded hover:bg-blue-100 text-sm",
                    pathname === item.href ? "bg-blue-200 font-medium" : "text-gray-700"
                  )}
                >
                  {item.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </aside>
  )
}
