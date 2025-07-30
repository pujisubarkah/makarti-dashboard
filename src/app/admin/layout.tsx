"use client"
import { useState } from 'react'
import { Sidebar } from '@/components/Sidebar'
import Header from '@/components/header'
import Footer from '@/components/footer'
import { Toaster } from 'sonner'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex min-h-screen bg-gray-50 text-gray-900">
      {/* Sidebar for desktop */}
      <div className="hidden md:block">
        <Sidebar />
      </div>
      {/* Sidebar overlay for mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 flex md:hidden">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setSidebarOpen(false)} />
          <div className="relative z-50 w-64 bg-white h-full shadow-lg">
            <Sidebar />
            <button
              className="absolute top-4 right-4 text-gray-600"
              onClick={() => setSidebarOpen(false)}
              aria-label="Close sidebar"
            >
              ✕
            </button>
          </div>
        </div>
      )}
      <div className="flex flex-col flex-1 min-w-0">
        {/* Hamburger for mobile */}
        <button
          className="md:hidden p-2 text-gray-600"
          onClick={() => setSidebarOpen(true)}
          aria-label="Open sidebar"
          style={{ position: 'absolute', left: 16, top: 16, zIndex: 50 }}
        >
          <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <Header />
        <main className="flex-1 p-6 overflow-y-auto">{children}</main>
        <Footer />
      </div>
      <Toaster richColors position="top-center" />
    </div>
  )
}
