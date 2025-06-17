import './globals.css'
import { Poppins } from 'next/font/google'
import { Toaster } from 'sonner'

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
      <body>
        {children}
        <Toaster richColors position="top-center" />
      </body>
    </html>
  )
}
