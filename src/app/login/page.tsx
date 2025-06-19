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
    <div className="relative min-h-screen w-full">
      <Image
        src="/bigger.jpg"
        alt="Background"
        fill
        className="object-cover object-top"
        priority
      />
      <div className="absolute inset-0 bg-black bg-opacity-40" />
      <div className="absolute inset-0 flex items-center justify-start pl-12">
        <div className="bg-black bg-opacity-60 backdrop-blur-md p-6 rounded-xl shadow-xl w-full max-w-sm z-10 text-white">
          <div className="text-center mb-5">
            <h1 className="text-2xl font-bold text-white mb-1">Selamat Datang</h1>
            <p className="text-blue-200 text-4xl font-extrabold">MAKARTI 5.0</p>
          </div>

          {error && (
            <div className="bg-red-500 bg-opacity-80 text-white px-3 py-2 rounded-lg mb-3 text-xs flex items-center">
              <span className="mr-2">⚠️</span>
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-medium mb-1 text-blue-100">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                placeholder="Masukkan username"
                className="w-full rounded-lg px-3 py-2 bg-white bg-opacity-10 text-white border border-blue-300 border-opacity-30 text-sm focus:ring-2 focus:ring-blue-400"
              />
            </div>

            <div className="relative">
              <label className="block text-xs font-medium mb-1 text-blue-100">Password</label>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Masukkan password"
                className="w-full rounded-lg px-3 py-2 bg-white bg-opacity-10 text-white border border-blue-300 border-opacity-30 text-sm focus:ring-2 focus:ring-blue-400 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-9 text-white opacity-70 hover:opacity-100"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-2.5 rounded-lg shadow-lg transition-all duration-300 transform hover:scale-[1.02] text-sm"
            >
              Masuk
            </button>
          </form>

        </div>
      </div>
    </div>
  )
}
