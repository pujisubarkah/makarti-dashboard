'use client'

import { useState } from 'react'
import SidebarUserWrapper from '@/components/SidebarUserWrapper'
import Header from '@/components/header'
import Footer from '@/components/footer'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  return (
    <div className="flex min-h-screen bg-gray-50 text-gray-900">
      <SidebarUserWrapper 
        isCollapsed={sidebarCollapsed} 
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} 
      />
      <div className="flex flex-col flex-1 min-w-0">
        <Header />
        <main className="flex-1 p-6 overflow-y-auto">{children}</main>
        <Footer />
      </div>
    </div>
  )
}
