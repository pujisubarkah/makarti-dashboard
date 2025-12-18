// app/[slug]/layout.tsx
'use client'

import { useState } from 'react'
import { SidebarSlug } from '@/components/SidebarSlug'
import Header from '@/components/header'
import Footer from '@/components/footer'

export default function SlugLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  return (
    <div className="flex min-h-screen bg-gray-50">
      <SidebarSlug 
        isCollapsed={sidebarCollapsed} 
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} 
      />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 overflow-x-hidden">
          {children}
        </main>
        <Footer />
      </div>
    </div>
  )
}