"use client"

import { Bell, UserCircle2 } from "lucide-react"
import Image from "next/image"

export default function Header() {
  return (
    <header className="h-16 bg-white border-b shadow-sm px-6 flex items-center justify-between sticky top-0 z-20">
      <h1 className="text-lg font-semibold text-blue-700">📊 MAKARTI Dashboard</h1>
      <div className="flex items-center gap-4">
        <button className="relative p-2 hover:bg-gray-100 rounded-full">
          <Bell className="w-5 h-5 text-gray-600" />
          {/* Notifikasi indikator */}
          <span className="absolute top-1 right-1 bg-red-500 w-2 h-2 rounded-full"></span>
        </button>
        <div className="flex items-center gap-2">
          <Image
            src="/avatar.png" // Pastikan kamu punya avatar di public/avatar.png
            alt="User Avatar"
            width={32}
            height={32}
            className="rounded-full"
          />
          <span className="text-sm font-medium text-gray-800">Admin</span>
        </div>
      </div>
    </header>
  )
}
