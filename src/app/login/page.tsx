'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Eye, EyeOff } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.message || 'Gagal login')
        return
      }

      // ✅ Simpan ke localStorage
      localStorage.setItem('username', data.user.username)
      localStorage.setItem('role_id', data.user.role_id.toString())
      localStorage.setItem('id', data.user.id || '')

      // ✅ Redirect berdasarkan role
      if (data.user.role_id === 1) {
        router.push('/admin/dashboard')
      } else {
        router.push('/user/dashboard')
      }

    } catch {
      setError('Terjadi kesalahan server')
    }
  }

  return (
    <div className="flex h-screen m-0 p-0">
      {/* Kiri: Form Login */}
      <div className="w-full md:w-1/4 flex flex-col justify-center items-center bg-white p-8 min-h-screen">
        <div className="flex flex-col items-center mb-6">
          <Image 
            src="/lanri.png" 
            alt="Logo MAKARTI" 
            width={200} 
            height={120} 
           
          />
          <h1 className="text-6xl font-bold mb-2 text-[#3781c7]">MAKARTI 5.0</h1>
          <p className="text-black text-center text-lg md:text-xl font-medium">Dashboard Monitoring Kinerja & Inovasi ASN LAN</p>
        </div>
        <div className="w-full max-w-md">
          <form onSubmit={handleLogin} className="space-y-6 text-base md:text-lg">
            {error && (
              <p className="text-red-500 text-base md:text-lg">{error}</p>
            )}
            <div className="mb-4">
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-gray-500"><Eye size={22} /></span>
                <input
                  className="shadow appearance-none border rounded w-full py-3 pl-12 pr-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline text-base md:text-lg"
                  id="username"
                  type="text"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="mb-4">
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-gray-500"><EyeOff size={22} /></span>
                <input
                  className="shadow appearance-none border rounded w-full py-3 pl-12 pr-12 text-gray-700 leading-tight focus:outline-none focus:shadow-outline text-base md:text-lg"
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={22} /> : <Eye size={22} />}
                </button>
              </div>
            </div>
            <div className="mb-6">
              <label className="inline-flex items-center text-base md:text-lg">
                <input
                  type="checkbox"
                  className="form-checkbox text-[#3781c7] scale-110"
                  checked={false}
                  onChange={() => {}}
                  disabled
                />
                <span className="ml-2 text-gray-700">Ingat saya?</span>
              </label>
            </div>
            <div className="flex items-center justify-between">
              <button
                className="bg-[#3781c7] hover:bg-[#2d6ca1] text-white font-bold py-3 w-full rounded focus:outline-none focus:shadow-outline text-base md:text-lg"
                type="submit"
              >
                Masuk
              </button>
            </div>
          </form>
        </div>
      </div>
      {/* Kanan: Background Image */}
      <div className="hidden md:flex w-3/4 bg-gray-100 items-center justify-center m-0 p-0 relative min-h-screen">
        <Image
          src="/smarter.png"
          alt="Background MAKARTI"
          fill
          className="object-cover"
          priority
        />
      </div>
    </div>
  )
}
