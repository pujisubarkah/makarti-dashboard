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
  ChevronLeft,
  ChevronRight,
} from "lucide-react"

const menuItems = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    children: [
      { title: "RINGKASAN MAKARTI", href: "/admin/dashboard" },
      { title: "POHON MAKARTI", href: "/admin/dashboard/statistik" },
      { title: "REPORT MAKARTI", href: "/admin/dashboard/report" },
    ],
  },
   {
    title: "SKP Transformasional",
    icon: LayoutDashboard,
    children: [
      { title: "Pohon Kinerja (SKP-T)", href: "/admin/skp-transformasional/statistik" },
      { title: "Report Kinerja (SKP-T)", href: "/admin/skp-transformasional/report" },
    ],
  },
   {
    title: "SKP Generik",
    icon: LayoutDashboard,
    children: [
      { title: "Dashboard SKP Generik", href: "/admin/skp-generik" },
    ],
  },
  {
    title: "Inovasi (SKP-T)",
    icon: Lightbulb,
    children: [
      { title: "Kinerja Inovasi", href: "/admin/inovasi/kinerja" },
      // { title: "SKP Transformasional", href: "/admin/inovasi/skp" },
      { title: "Produk Inovasi", href: "/admin/inovasi/produk" },
      { title: "Produk Kajian", href: "/admin/inovasi/kajian" },
    ],
  },
  {
    title: "Branding (SKP-T)",
    icon: Megaphone,
    children: [
      { title: "Publikasi Media", href: "/admin/branding/media" },
      //{ title: "Sosialisasi Branding", href: "/admin/branding/sosialisasi" },
    ],
  },
  {
    title: "Networking (SKP-T)",
    icon: Users,
    children: [
      { title: "Networking Eksternal", href: "/admin/networking/kunjungan" },
      { title: "Koordinasi Eksternal", href: "/admin/networking/koordinasi" },
    ],
  },
  {
    title: "Learning (SKP-T)",
    icon: BookOpenCheck,
    children: [
      { title: "Bangkom Pegawai Internal", href: "/admin/learning/pelatihan" },
      { title: "Penyelenggaraan Bangkom", href: "/admin/learning/peserta" },
      // { title: "Penyelenggaraan Bangkom", href: "/admin/learning/penyelenggaraan" },
    ],
  },
    {
      title: "Pegawai",
      icon: Users,
      children: [
    { title: "Data Pegawai", href: "/admin/pegawai" },
    { title: "Prediksi Pegawai", href: "/admin/assignment" },
      ],
    },
  {
    title: "Anggaran",
    icon: PieChart,
    children: [
      { title: "Serapan Anggaran", href: "/admin/serapan" },
      { title: "Rencana Mingguan", href: "/admin/kegiatan" },
    ],
  },
 
  {
    title: "Panduan",
    icon: PieChart,
    children: [
      { title: "Panduan Makarti 5.0", href: "https://s.id/PanduanMakarti" },
    ],
  },
]

export function Sidebar({ isCollapsed, onToggle }: { isCollapsed?: boolean; onToggle?: () => void }) {
  const pathname = usePathname()
  return (
    <aside 
      className={cn(
        "bg-white dark:bg-gray-900 border-r dark:border-gray-800 h-screen sticky top-0 overflow-y-auto shadow-md flex-shrink-0 transition-all duration-300",
        isCollapsed ? "w-16 min-w-16 max-w-16" : "w-64 min-w-64 max-w-64"
      )}
    >
      <div className="p-4">
        <h1 
          className={cn(
            "text-xl font-bold mb-6 text-blue-700 dark:text-blue-400 transition-all duration-300",
            isCollapsed ? "text-center text-base" : "truncate"
          )}
        >
          {isCollapsed ? "🌟" : "🌟 MAKARTI 5.0"}
        </h1>
        
        {menuItems.map((section) => (
          <div key={section.title} className="mb-4">
            <div 
              className={cn(
                "flex items-center text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2 transition-all duration-300",
                isCollapsed ? "justify-center" : ""
              )}
              title={isCollapsed ? section.title : undefined}
            >
              <section.icon className={cn("w-4 h-4", !isCollapsed && "mr-2")} />
              {!isCollapsed && section.title}
            </div>
            <ul className={cn("space-y-1", !isCollapsed && "ml-2")}>
              {section.children.map((item) => {
                const isActive = pathname === item.href
                return (
                  <li key={item.href}>
                    <Link href={item.href}>
                      <div
                        className={cn(
                          "flex items-center text-sm font-medium p-2 rounded-lg transition-colors",
                          isActive
                            ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 border-r-2 border-blue-700 dark:border-blue-400"
                            : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-blue-600 dark:hover:text-blue-400",
                          isCollapsed ? "justify-center" : ""
                        )}
                        title={isCollapsed ? item.title : undefined}
                      >
                        {isCollapsed ? (
                          <span className="text-xs">•</span>
                        ) : (
                          <span className="ml-2 truncate text-sm">{item.title}</span>
                        )}
                      </div>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
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
