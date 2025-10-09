// app/[slug]/page.tsx
'use client'

import { useParams } from 'next/navigation'
import Link from 'next/link'
import { User, CheckSquare, GraduationCap, BarChart3 } from 'lucide-react'

export default function SlugDashboard() {
  const params = useParams()
  const slug = params?.slug as string

  const menuCards = [
    {
      title: 'Profil',
      description: 'Kelola informasi profil dan pengaturan',
      href: `/${slug}/profil`,
      icon: User,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600'
    },
    {
      title: 'Task Management',
      description: 'Kelola dan pantau progress task',
      href: `/${slug}/task`,
      icon: CheckSquare,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600'
    },
    {
      title: 'Pelatihan',
      description: 'Akses program pelatihan dan sertifikasi',
      href: `/${slug}/pelatihan`,
      icon: GraduationCap,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600'
    }
  ]

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-lg p-6 text-white">
        <h1 className="text-4xl font-bold mb-2">
          Dashboard
        </h1>
        <p className="text-blue-100 text-lg">
           Dashboard khusus pegawai a.n. {slug.replace(/-/g, ' ')}
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-600 text-sm font-semibold">ACTIVE TASKS</p>
              <p className="text-3xl font-bold text-gray-800">12</p>
            </div>
            <BarChart3 className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-600 text-sm font-semibold">COMPLETED</p>
              <p className="text-3xl font-bold text-gray-800">28</p>
            </div>
            <CheckSquare className="w-8 h-8 text-green-500" />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-600 text-sm font-semibold">TRAININGS</p>
              <p className="text-3xl font-bold text-gray-800">8</p>
            </div>
            <GraduationCap className="w-8 h-8 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Menu Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {menuCards.map((card, index) => {
          const Icon = card.icon
          return (
            <Link key={index} href={card.href} className="block group">
              <div className={`${card.bgColor} rounded-xl shadow-lg p-6 border-2 border-transparent hover:border-gray-200 transition-all duration-300 group-hover:shadow-xl group-hover:scale-105`}>
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${card.color} flex items-center justify-center shadow-lg`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                </div>
                <h3 className={`text-xl font-bold mb-2 ${card.textColor}`}>
                  {card.title}
                </h3>
                <p className="text-gray-600 text-sm">
                  {card.description}
                </p>
                <div className="mt-4 flex items-center text-sm font-semibold">
                  <span className={card.textColor}>Akses sekarang</span>
                  <span className="ml-2 transition-transform group-hover:translate-x-1">→</span>
                </div>
              </div>
            </Link>
          )
        })}
      </div>

      {/* Info Section */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Informasi Context
        </h2>
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-gray-600">
            Anda sedang mengakses dashboard untuk: 
            <span className="font-bold text-blue-600 ml-2">{slug.replace(/-/g, ' ')}</span>
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Semua menu dan fitur akan disesuaikan dengan context ini.
          </p>
        </div>
      </div>
    </div>
  )
}