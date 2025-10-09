// components/SidebarSlug.tsx
'use client'

import Link from 'next/link'
import { usePathname, useParams } from 'next/navigation'
import {
  User,
  CheckSquare,
  GraduationCap,
  Home,
} from 'lucide-react'

type SidebarSlugProps = {
  className?: string
}

type MenuItem = {
  label: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  status?: 'ready' | 'maintenance'
  type?: 'group' | 'item'
}

export function SidebarSlug({ className }: SidebarSlugProps) {
  const pathname = usePathname()
  const params = useParams()
  const slug = params?.slug as string

  // Menu items dengan dynamic slug
  const menuItems: MenuItem[] = [
 
    {
      label: `Dashboard`,
      href: `/${slug}`,
      icon: Home,
      status: 'ready',
      type: 'item',
    },
    {
      label: 'Profil',
      href: `/${slug}/profil`,
      icon: User,
      status: 'ready',
      type: 'item',
    },
    {
      label: 'Task',
      href: `/${slug}/task`,
      icon: CheckSquare,
      status: 'ready',
      type: 'item',
    },
    {
      label: 'Pelatihan',
      href: `/${slug}/pelatihan`,
      icon: GraduationCap,
      status: 'ready',
      type: 'item',
    },
  ]

  return (
    <aside className={`w-64 min-w-64 max-w-64 bg-white border-r h-screen p-4 sticky top-0 overflow-y-auto shadow-xl flex-shrink-0 ${className || ''}`}>
      <h1 className="text-2xl font-extrabold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-500 to-pink-500 flex items-center gap-2 truncate">
        <span className="text-3xl flex-shrink-0">🌟</span> 
        <span className="truncate">MAKARTI 5.0</span>
      </h1>
      
      {/* Display current slug */}
      {slug && (
        <div className="mb-6 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-600 font-medium">PEGAWAI LAN:</p>
          <p className="text-lg font-bold text-blue-800 truncate">{slug.replace(/-/g, ' ')}</p>
        </div>
      )}

      <nav className="space-y-2">
        {menuItems.map((item, index) => {
          // Render group label
          if (item.type === 'group') {
            return (
              <div key={`group-${index}`} className="pt-4 pb-2">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-2">
                  {item.label}
                </h3>
              </div>
            )
          }

          // Render menu item
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
              >
                <div className="flex items-center gap-3 min-w-0">
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