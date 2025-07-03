'use client'

import SidebarUserWrapper from '@/components/SidebarUserWrapper'
import Header from '@/components/header'
import Footer from '@/components/footer'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-gray-50 text-gray-900">
      <SidebarUserWrapper />
      <div className="flex flex-col flex-1">
        <Header />
        <main className="flex-1 p-6 overflow-y-auto">{children}</main>
        <Footer />
      </div>
    </div>
  )
}
