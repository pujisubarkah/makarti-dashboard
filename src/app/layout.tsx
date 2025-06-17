import './globals.css'
import { Poppins } from 'next/font/google'
import { Toaster } from 'sonner'
import { Sidebar } from '@/components/Sidebar'
import Header from '@/components/header'
import Footer from '@/components/footer'

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  variable: '--font-poppins',
})

export const metadata = {
  title: 'Makarti Dashboard',
  description: 'Sistem Informasi Pengukuran Indeks Kualitas Kebijakan',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={poppins.variable}>
      <body className="flex min-h-screen bg-gray-50 text-gray-900">
        <Sidebar />
        <div className="flex flex-col flex-1">
          <Header />
          <main className="flex-1 p-6 overflow-y-auto">{children}</main>
          <Footer />
        </div>
        <Toaster richColors position="top-center" />
      </body>
    </html>
  )
}
