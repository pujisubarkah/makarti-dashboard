// components/SidebarSlugWrapper.tsx
'use client'

import { SidebarSlug } from './SidebarSlug'
import Header from './header'
import Footer from './footer'

type SidebarSlugWrapperProps = {
  children: React.ReactNode
  className?: string
  withHeader?: boolean
  withFooter?: boolean
}

export function SidebarSlugWrapper({ 
  children, 
  className,
  withHeader = false,
  withFooter = false 
}: SidebarSlugWrapperProps) {
  if (withHeader || withFooter) {
    return (
      <div className={`flex min-h-screen bg-gray-50 ${className || ''}`}>
        <SidebarSlug />
        <div className="flex-1 flex flex-col">
          {withHeader && <Header />}
          <main className="flex-1 overflow-x-hidden">
            {children}
          </main>
          {withFooter && <Footer />}
        </div>
      </div>
    )
  }

  return (
    <div className={`flex min-h-screen bg-gray-50 ${className || ''}`}>
      <SidebarSlug />
      <main className="flex-1 overflow-x-hidden">
        {children}
      </main>
    </div>
  )
}