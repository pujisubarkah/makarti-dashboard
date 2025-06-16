"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  Lightbulb,
  Megaphone,
  Users,
  BookOpenCheck,
  LayoutDashboard,
} from "lucide-react"

const menuItems = [
  {
    title: "Inovasi",
    icon: Lightbulb,
    children: [
      { title: "Daftar Ide Inovasi", href: "/inovasi" },
      { title: "Progres Implementasi", href: "/inovasi/progres" },
      { title: "Uji Coba & Dampak", href: "/inovasi/dampak" },
    ],
  },
  {
    title: "Komunikasi & Branding",
    icon: Megaphone,
    children: [
      { title: "Strategi Komunikasi", href: "/komunikasi/strategi" },
      { title: "Kegiatan Branding", href: "/komunikasi/branding" },
      { title: "Publikasi & Media", href: "/komunikasi/media" },
    ],
  },
  {
    title: "Networking",
    icon: Users,
    children: [
      { title: "Kolaborasi Antar Unit", href: "/networking/internal" },
      { title: "Keterlibatan Eksternal", href: "/networking/eksternal" },
      { title: "Forum & Event", href: "/networking/forum" },
    ],
  },
  {
    title: "Learning",
    icon: BookOpenCheck,
    children: [
      { title: "Pelatihan Pegawai", href: "/learning/pelatihan" },
      { title: "Pembelajaran Organisasi", href: "/learning/organisasi" },
      { title: "Umpan Balik & Refleksi", href: "/learning/feedback" },
    ],
  },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-64 bg-white border-r h-screen p-4 sticky top-0 overflow-y-auto shadow-md">
      <h1 className="text-xl font-bold mb-6 text-blue-700">🌟 MAKARTI</h1>
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
