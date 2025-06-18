'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

export default function LoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (username === 'admin' && password === 'admin') {
      router.push('/admin/dashboard')
    } else if (username === 'user' && password === 'user') {
      router.push('/user/dashboard')
    } else {
      setError('Username atau password salah')
    }
  }

  return (
    <div className="relative min-h-screen w-full">
      {/* Gambar Background */}
        <Image
          src="/bigger.jpg"
          alt="Background"
          fill
          className="object-cover object-top"
          priority
        />

        {/* Overlay gelap */}
      <div className="absolute inset-0 bg-black bg-opacity-40" />

      {/* Form login di sebelah kiri - ukuran lebih kecil */}
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
                className="w-full border border-blue-300 border-opacity-30 rounded-lg px-3 py-2 bg-white bg-opacity-10 text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all text-sm"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                placeholder="Masukkan username"
              />
            </div>
            
            <div>
              <label className="block text-xs font-medium mb-1 text-blue-100">Password</label>
              <input
                type="password"
                className="w-full border border-blue-300 border-opacity-30 rounded-lg px-3 py-2 bg-white bg-opacity-10 text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all text-sm"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Masukkan password"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-2.5 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] text-sm"
            >
              Masuk 
            </button>
          </form>

          <div className="mt-4 text-center">
            <p className="text-blue-200 text-xs">
              Demo: admin/admin atau user/user
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
