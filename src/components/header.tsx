'use client'

import { useEffect, useState, useRef } from "react"
import { Bell, ChevronDown } from "lucide-react"
import Image from "next/image"
import { useRouter } from "next/navigation"

export default function Header() {
  const [username, setUsername] = useState<string | null>(null)
  const [unitKerja, setUnitKerja] = useState<string>('MAKARTI Dashboard')
  const [menuOpen, setMenuOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  useEffect(() => {
    const storedUsername = localStorage.getItem('username')
    const storedId = localStorage.getItem('id')

    if (storedUsername) setUsername(storedUsername)

    if (storedId) {
      fetch(`/api/users/${storedId}`)
        .then(res => res.json())
        .then(data => {
          if (data.user?.unit_kerja) {
            setUnitKerja(data.user.unit_kerja)
          }
        })
        .catch(() => {
          setUnitKerja('MAKARTI Dashboard')
        })
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setMenuOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleLogout = () => {
    localStorage.clear()
    router.push('/login')
  }

  const handleChangePassword = () => {
    router.push('/ubah-password')
  }

  return (
    <header className="h-16 bg-white border-b shadow-sm px-6 flex items-center justify-between sticky top-0 z-20">
      <h1 className="text-lg font-semibold text-blue-700">
        📊 {unitKerja}
      </h1>

      <div className="flex items-center gap-4">
        <button className="relative p-2 hover:bg-gray-100 rounded-full">
          <Bell className="w-5 h-5 text-gray-600" />
          <span className="absolute top-1 right-1 bg-red-500 w-2 h-2 rounded-full"></span>
        </button>

        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex items-center gap-2 hover:bg-gray-100 px-2 py-1 rounded-lg"
          >
            <Image
              src="/avatar.png"
              alt="User Avatar"
              width={32}
              height={32}
              className="rounded-full"
            />
            <span className="text-sm font-medium text-gray-800">
              {username || 'Pengguna'}
            </span>
            <ChevronDown className="w-4 h-4 text-gray-500" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white border rounded-lg shadow-lg z-30">
              <button
                onClick={handleChangePassword}
                className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
              >
                🔒 Ubah Password
              </button>
              <button
                onClick={handleLogout}
                className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
              >
                🚪 Keluar
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
