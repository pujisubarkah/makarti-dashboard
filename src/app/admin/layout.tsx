import { Sidebar } from '@/components/Sidebar'
import Header from '@/components/header'
import Footer from '@/components/footer'
import { Toaster } from 'sonner'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-gray-50 text-gray-900">
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0">
        <Header />
        <main className="flex-1 p-6 overflow-y-auto">{children}</main>
        <Footer />
      </div>
      <Toaster richColors position="top-center" />
    </div>
  )
}
