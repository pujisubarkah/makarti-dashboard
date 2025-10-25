
'use client'

import { useParams } from 'next/navigation'
import { useState, useEffect, useMemo, useRef } from 'react'
import { GraduationCap, Calendar, Clock, Plus, Edit, Trash2, FileText, Award, TrendingUp } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts'

// Local type for champion summary (from /api/pelatihan_pegawai/summary)
interface ChampionData {
  nama: string
  unit_kerja: string
  total_jam: number
  jumlah_pelatihan: number
  rata_rata_jam: number
}

type PelatihanItem = {
  id?: number
  judul: string
  tanggal: string
  jam: number
  sertifikat: string
  pegawai_id?: number
  unit_kerja_id?: number
}

export default function PelatihanPage() {
  const params = useParams()
  const slug = params?.slug as string
  const formRef = useRef<HTMLFormElement>(null)

  // Champion modal state (moved inside component)
  const [showChampionModal, setShowChampionModal] = useState(false)
  const [championData, setChampionData] = useState<ChampionData | null>(null)
  const [championShown, setChampionShown] = useState(false)

  // Fetch champion summary once and show modal with a short delay
  useEffect(() => {
    let mounted = true
    const fetchChampion = async () => {
      try {
        const res = await fetch('/api/pelatihan_pegawai/summary')
        if (!res.ok) return
        const list: ChampionData[] = await res.json()
        if (!mounted || !Array.isArray(list) || list.length === 0) return
        const champ = list.reduce((max, cur) => (cur.total_jam > max.total_jam ? cur : max), list[0])
        setChampionData(champ)
        if (!championShown && champ.total_jam > 0) {
          setTimeout(() => {
            if (mounted) {
              setShowChampionModal(true)
              setChampionShown(true)
            }
          }, 2000)
        }
      } catch {
        // ignore
      }
    }
    fetchChampion()
    return () => { mounted = false }
  }, [championShown])

  // Close modal on Escape key
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowChampionModal(false)
    }
    if (showChampionModal) window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [showChampionModal])

  // Derived champion metrics for modal (level, progress)
  const levelNames = ['Cupu', 'Rajin', 'Jago', 'Pro', 'Hero', 'Legend', 'Suhu']
  const championLevel = championData ? Math.floor(championData.total_jam / 20) + 1 : 1
  const championLevelIndex = Math.max(0, Math.min(championLevel - 1, levelNames.length - 1))
  const championTotalJam = championData?.total_jam ?? 0
  const championLevelName = championTotalJam > 1000 ? 'You Know Who' : levelNames[championLevelIndex]
  const progressPercent = ((championTotalJam % 20) / 20) * 100
  const jamToNext = Math.max(0, (championLevel * 20) - championTotalJam)

  // ...user level will be derived after pelatihanList is declared

  const [showModal, setShowModal] = useState(false)
  const [editIndex, setEditIndex] = useState<number | null>(null)
  const [pelatihanList, setPelatihanList] = useState<PelatihanItem[]>([])
  const [loading, setLoading] = useState(false)
  const [showAchievement, setShowAchievement] = useState(false)
  const [achievementMessage, setAchievementMessage] = useState('')

  // Current user's level derived from their pelatihanList
  const userTotalJam = pelatihanList.reduce((s, p) => s + (p.jam || 0), 0)
  const userLevel = Math.floor(userTotalJam / 20) + 1
  const userLevelIndex = Math.max(0, Math.min(userLevel - 1, levelNames.length - 1))
  const userLevelName = userTotalJam > 1000 ? 'You Know Who' : levelNames[userLevelIndex]

  // Generate chart data per bulan
  const chartData = useMemo(() => {
    const monthlyData: Record<string, {
      bulan: string;
      jumlah_pelatihan: number;
      total_jam: number;
      dengan_sertifikat: number;
      sortKey: string;
    }> = {}

    pelatihanList.forEach(pelatihan => {
      const date = new Date(pelatihan.tanggal)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      const monthLabel = date.toLocaleDateString('id-ID', { year: 'numeric', month: 'short' })

      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = {
          bulan: monthLabel,
          jumlah_pelatihan: 0,
          total_jam: 0,
          dengan_sertifikat: 0,
          sortKey: monthKey
        }
      }

      monthlyData[monthKey].jumlah_pelatihan += 1
      monthlyData[monthKey].total_jam += pelatihan.jam
      if (pelatihan.sertifikat && pelatihan.sertifikat.trim() !== '') {
        monthlyData[monthKey].dengan_sertifikat += 1
      }
    })

    return Object.values(monthlyData).sort((a, b) => a.sortKey.localeCompare(b.sortKey))
  }, [pelatihanList])

  // Fetch data pelatihan
  useEffect(() => {
    const nip = localStorage.getItem("username") // Mengambil NIP dari username
    
    if (nip) {
      fetch(`/api/employee/pelatihan/${nip}`)
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            setPelatihanList(data)
          }
        })
        .catch(error => console.error('Error fetching pelatihan:', error))
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    
    const formData = new FormData(e.currentTarget)
    const sertifikatValue = formData.get('sertifikat') as string
    
    const pelatihanData = {
      judul: formData.get('judul') as string,
      tanggal: formData.get('tanggal') as string,
      jam: parseInt(formData.get('jam') as string),
      sertifikat: sertifikatValue && sertifikatValue.trim() !== '' ? sertifikatValue : null,
      username: localStorage.getItem("username") || "", // Gunakan username sebagai NIP
      unit_kerja_id: parseInt(localStorage.getItem("id") || "1"),
    }

    // Debug log
    console.log('Data yang akan dikirim:', pelatihanData)
    console.log('localStorage username:', localStorage.getItem("username"))
    console.log('localStorage id (unit_kerja_id):', localStorage.getItem("id"))

    // Calculate current level before submission
    const currentTotalJam = pelatihanList.reduce((sum, p) => sum + p.jam, 0)
    const currentLevel = Math.floor(currentTotalJam / 20) + 1

    try {
      const method = editIndex !== null ? 'PUT' : 'POST'
      const url = editIndex !== null ? `/api/pelatihan/${pelatihanList[editIndex].id}` : '/api/pelatihan'
      
      console.log('URL API:', url)
      console.log('Method:', method)
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pelatihanData),
      })

      if (response.ok) {
        const result = await response.json()
        let updatedList = [...pelatihanList]
        
        if (editIndex !== null) {
          // Update existing item
          updatedList[editIndex] = result
          setEditIndex(null)
        } else {
          // Add new item
          updatedList = [...pelatihanList, result]
        }
        
        setPelatihanList(updatedList)
        
        // Check for level up only when adding new training (not editing)
        if (editIndex === null) {
          const newTotalJam = updatedList.reduce((sum, p) => sum + p.jam, 0)
          const newLevel = Math.floor(newTotalJam / 20) + 1
          
          if (newLevel > currentLevel) {
            // Level up achieved!
            const levelNames = ['Cupu', 'Rajin', 'Jago', 'Pro', 'Hero', 'Legend', 'Suhu']
            const levelEmojis = ['🐣', '📚', '🎯', '�', '🦸', '⚡', '🔥']
            
            const levelIndex = Math.min(newLevel - 1, 6)
            setAchievementMessage(`🎉 Selamat! Anda naik ke level ${newLevel} - ${levelNames[levelIndex]} ${levelEmojis[levelIndex]}`)
            setShowAchievement(true)
            
            // Hide achievement after 5 seconds
            setTimeout(() => {
              setShowAchievement(false)
            }, 5000)
          } else if (newTotalJam > 0 && newTotalJam % 20 === pelatihanData.jam % 20) {
            // Milestone celebration for significant training hours
            const milestones = [10, 50, 100, 200, 300, 500]
            const milestone = milestones.find(m => 
              newTotalJam >= m && currentTotalJam < m
            )
            
            if (milestone) {
              setAchievementMessage(`🌟 Pencapaian Luar Biasa! Anda telah menyelesaikan ${milestone} jam pelatihan!`)
              setShowAchievement(true)
              
              setTimeout(() => {
                setShowAchievement(false)
              }, 4000)
            }
          }
        }
        
        setShowModal(false)
        setEditIndex(null)
        
        // Reset form safely
        if (formRef.current) {
          formRef.current.reset()
        }
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        console.error('API Error Response:', errorData)
        alert(`Gagal menyimpan data pelatihan: ${errorData.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Error:', error)
      alert(`Terjadi kesalahan saat menyimpan data: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (index: number) => {
    setEditIndex(index)
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditIndex(null)
    // Reset form when closing modal
    if (formRef.current) {
      formRef.current.reset()
    }
  }

  const handleDelete = async (index: number) => {
    if (!confirm('Yakin ingin menghapus data pelatihan ini?')) return
    
    const pelatihan = pelatihanList[index]
    try {
      const response = await fetch(`/api/pelatihan/${pelatihan.id}`, {
        method: 'DELETE',
      })
      
      if (response.ok) {
        setPelatihanList(pelatihanList.filter((_, i) => i !== index))
      } else {
        alert('Gagal menghapus data pelatihan')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Terjadi kesalahan saat menghapus data')
    }
  }

  return (
    <>
      <style jsx>{`
        @keyframes bounce-in {
          0% { transform: scale(0.3) translateY(-50px); opacity: 0; }
          50% { transform: scale(1.05) translateY(0); }
          70% { transform: scale(0.9); }
          100% { transform: scale(1); opacity: 1; }
        }
        .animate-bounce-in {
          animation: bounce-in 0.6s ease-out;
        }
      `}</style>
      <div className="p-6 space-y-6 min-h-full">
      {/* Header dengan Gamifikasi */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-lg p-6 text-white">
        <div className="flex justify-between items-center">
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
              <GraduationCap className="w-8 h-8" />
              Pengembangan Kapasitas Individu
            </h1>
            <p className="text-blue-100">
              Kelola dan input data pelatihan yang telah diikuti {slug.replace(/-/g, ' ')}
            </p>
            <p className="text-sm text-blue-200 mt-2 font-medium">
              🐣 <span className="font-bold">CUPU</span> → 📚 <span className="font-bold">RAJIN</span> → 🎯 <span className="font-bold">JAGO</span> → 🏆 <span className="font-bold">PRO</span> → 🦸 <span className="font-bold">HERO</span> → ⚡ <span className="font-bold">LEGEND</span> → 🔥 <span className="font-bold">SUHU</span>
            </p>
            <p className="text-xs text-blue-300 mt-1 opacity-80">
              Kumpulkan JP untuk unlock level berikutnya! Naik level setiap 20 JP.
            </p>
          </div>
          
          {/* Level System */}
          <div className="flex items-center gap-4">
            {(() => {
              const totalJam = pelatihanList.reduce((total, pelatihan) => total + pelatihan.jam, 0)
              const currentLevel = Math.floor(totalJam / 20) + 1
              const jamForNextLevel = (currentLevel * 20) - totalJam
              const progressPercent = ((totalJam % 20) / 20) * 100
              
              const getLevelBadge = (level: number) => {
                if (level >= 7) return { emoji: '🔥', title: 'Suhu', color: 'text-red-300' }
                if (level >= 6) return { emoji: '⚡', title: 'Legend', color: 'text-purple-300' }
                if (level >= 5) return { emoji: '�', title: 'Hero', color: 'text-blue-300' }
                if (level >= 4) return { emoji: '🏆', title: 'Pro', color: 'text-yellow-300' }
                if (level >= 3) return { emoji: '🎯', title: 'Jago', color: 'text-green-300' }
                if (level >= 2) return { emoji: '📚', title: 'Rajin', color: 'text-indigo-300' }
                return { emoji: '🐣', title: 'Cupu', color: 'text-orange-300' }
              }
              
              const badge = getLevelBadge(currentLevel)
              
              return (
                <div className="text-right">
                  <div className="flex items-center justify-end gap-3 mb-2">
                    <span className="text-5xl drop-shadow-lg">{badge.emoji}</span>
                    <div>
                      <p className="text-sm font-bold text-white/90">Level {currentLevel}</p>
                      <p className={`text-2xl font-extrabold ${badge.color} drop-shadow-md tracking-wide`}>
                        {badge.title.toUpperCase()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-blue-100">Total: {totalJam} JP</p>
                    {jamForNextLevel > 0 && (
                      <>
                        <p className="text-xs text-blue-200">
                          {jamForNextLevel} JP lagi ke Level {currentLevel + 1}
                        </p>
                        {(() => {
                          const nextLevelNames = ['Cupu', 'Rajin', 'Jago', 'Pro', 'Hero', 'Legend', 'Suhu']
                          const nextLevelIndex = Math.min(currentLevel, 6)
                          return (
                            <p className="text-sm text-blue-300 font-bold tracking-wide">
                              → {nextLevelNames[nextLevelIndex].toUpperCase()}
                            </p>
                          )
                        })()}
                      </>
                    )}
                  </div>
                  {/* Progress Bar */}
                  <div className="w-32 bg-white/20 rounded-full h-2 mt-2">
                    <div
                      className="bg-white h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progressPercent}%` }}
                    ></div>
                  </div>
                </div>
              )
            })()}
          </div>
        </div>
      </div>

      {/* Achievement Notification */}
      {showAchievement && (
        <div className="fixed top-4 right-4 z-50 animate-bounce-in">
          <div className="bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 text-white p-6 rounded-xl shadow-2xl border-2 border-yellow-300 max-w-md">
            <div className="flex items-center gap-3">
              <div className="text-4xl animate-pulse">🎉</div>
              <div>
                <h3 className="font-bold text-lg">Achievement Unlocked!</h3>
                <p className="text-sm opacity-90">{achievementMessage}</p>
              </div>
            </div>
            <button
              onClick={() => setShowAchievement(false)}
              className="absolute top-2 right-2 text-white/70 hover:text-white"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-600 text-sm font-semibold">TOTAL PELATIHAN</p>
              <p className="text-3xl font-bold text-gray-800">{pelatihanList.length}</p>
            </div>
            <GraduationCap className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-600 text-sm font-semibold">TOTAL JAM</p>
              <p className="text-3xl font-bold text-gray-800">
                {pelatihanList.reduce((total, pelatihan) => total + pelatihan.jam, 0)}
              </p>
            </div>
            <Clock className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-600 text-sm font-semibold">DENGAN SERTIFIKAT</p>
              <p className="text-3xl font-bold text-gray-800">
                {pelatihanList.filter(p => p.sertifikat && p.sertifikat.trim() !== '').length}
              </p>
            </div>
            <Award className="w-8 h-8 text-green-500" />
          </div>
        </div>
      </div>

      {/* Chart Pergerakan Pelatihan */}
      {pelatihanList.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-purple-700 flex items-center gap-2">
              <TrendingUp className="w-6 h-6" />
              Tren Pelatihan per Bulan
            </h2>
            <div className="text-sm text-gray-600 bg-purple-50 px-3 py-1 rounded-full">
              {chartData.length} bulan data
            </div>
          </div>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <XAxis 
                  dataKey="bulan" 
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#f8fafc', 
                    border: '1px solid #e2e8f0', 
                    borderRadius: '8px',
                    fontSize: '14px'
                  }}
                  formatter={(value, name) => {
                    if (name === 'jumlah_pelatihan') return [value, 'Jumlah Pelatihan']
                    if (name === 'total_jam') return [value, 'Total Jam']
                    return [value, name]
                  }}
                />
                <Legend wrapperStyle={{ fontWeight: 'bold', fontSize: 14 }} />
                <Line 
                  type="monotone" 
                  dataKey="jumlah_pelatihan" 
                  name="Jumlah Pelatihan" 
                  stroke="#2563eb" 
                  strokeWidth={3} 
                  connectNulls 
                  dot={{ fill: '#2563eb', strokeWidth: 2, r: 4 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="total_jam" 
                  name="Total Jam" 
                  stroke="#3b82f6" 
                  strokeWidth={2} 
                  connectNulls 
                  strokeDasharray="5 5"
                  dot={{ fill: '#3b82f6', strokeWidth: 2, r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
            <h3 className="font-semibold text-purple-800 mb-2">Insight Chart</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-purple-800 mb-3">Keterangan Chart:</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                    <span className="text-gray-700">
                      <strong>Jumlah Pelatihan:</strong> Tren bulanan pelatihan yang diikuti
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-1 bg-blue-500"></div>
                    <span className="text-gray-700">
                      <strong>Total Jam:</strong> Akumulasi jam pelatihan per bulan
                    </span>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-purple-800 mb-3">Ringkasan Bulanan:</h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="bg-white p-2 rounded border">
                    <p className="text-xs text-gray-500">Rata-rata/bulan</p>
                    <p className="font-semibold text-purple-600">
                      {chartData.length > 0 ? (pelatihanList.length / chartData.length).toFixed(1) : 0} pelatihan
                    </p>
                  </div>
                  <div className="bg-white p-2 rounded border">
                    <p className="text-xs text-gray-500">Bulan terbanyak</p>
                    <p className="font-semibold text-blue-600">
                      {chartData.length > 0 ? Math.max(...chartData.map(d => d.jumlah_pelatihan)) : 0} pelatihan
                    </p>
                  </div>
                  <div className="bg-white p-2 rounded border">
                    <p className="text-xs text-gray-500">Rata-rata jam/bulan</p>
                    <p className="font-semibold text-orange-600">
                      {chartData.length > 0 ? (pelatihanList.reduce((sum, p) => sum + p.jam, 0) / chartData.length).toFixed(1) : 0} jam
                    </p>
                  </div>
                  <div className="bg-white p-2 rounded border">
                    <p className="text-xs text-gray-500">Tingkat sertifikasi</p>
                    <p className="font-semibold text-green-600">
                      {pelatihanList.length > 0 ? ((pelatihanList.filter(p => p.sertifikat && p.sertifikat.trim() !== '').length / pelatihanList.length) * 100).toFixed(0) : 0}%
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tambah Pelatihan Button */}
      <div className="flex justify-end">
        <button
          onClick={() => {
            setEditIndex(null)
            setShowModal(true)
            // Reset form when opening for new entry
            setTimeout(() => {
              if (formRef.current) {
                formRef.current.reset()
              }
            }, 0)
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all font-semibold flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Tambah Pelatihan
        </button>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="px-6 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold">Data Pelatihan</h2>
              <p className="text-blue-100 text-sm">Daftar pelatihan yang telah diikuti</p>
            </div>
            {pelatihanList.length > 0 && (
              <div className="text-right">
                <p className="text-sm text-blue-100">Menampilkan {pelatihanList.length} data</p>
              </div>
            )}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 border text-left text-sm font-semibold text-gray-700">Judul Pelatihan</th>
                <th className="px-4 py-3 border text-left text-sm font-semibold text-gray-700">Tanggal</th>
                <th className="px-4 py-3 border text-left text-sm font-semibold text-gray-700">Jam</th>
                <th className="px-4 py-3 border text-left text-sm font-semibold text-gray-700">Sertifikat</th>
                <th className="px-4 py-3 border text-center text-sm font-semibold text-gray-700">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {pelatihanList.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-gray-500">
                    <GraduationCap className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p className="font-medium">Belum ada data pelatihan</p>
                    <p className="text-sm">Klik &quot;Tambah Pelatihan&quot; untuk mulai menginput data</p>
                  </td>
                </tr>
              ) : (
                pelatihanList.map((pelatihan, index) => (
                  <tr key={pelatihan.id || index} className="hover:bg-purple-50 transition-colors">
                    <td className="px-4 py-3 border">
                      <div className="font-medium text-gray-800">{pelatihan.judul}</div>
                    </td>
                    <td className="px-4 py-3 border">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar className="w-4 h-4" />
                        {new Date(pelatihan.tanggal).toLocaleDateString('id-ID')}
                      </div>
                    </td>
                    <td className="px-4 py-3 border">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Clock className="w-4 h-4" />
                        {pelatihan.jam} jam
                      </div>
                    </td>
                    <td className="px-4 py-3 border">
                      {pelatihan.sertifikat ? (
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-green-600">
                            <Award className="w-4 h-4" />
                            <span className="text-sm">Ada</span>
                          </div>
                          <a
                            href={pelatihan.sertifikat.startsWith('http') ? pelatihan.sertifikat : `https://${pelatihan.sertifikat}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-600 hover:text-blue-800 underline hover:no-underline transition-all inline-flex items-center gap-1"
                            title="Lihat Sertifikat"
                          >
                            <GraduationCap className="w-3 h-3" /> Lihat
                          </a>
                        </div>
                      ) : (
                        <span className="text-gray-400 text-sm">Tidak ada</span>
                      )}
                    </td>
                    <td className="px-4 py-3 border">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleEdit(index)}
                          className="text-blue-600 hover:bg-blue-50 rounded-lg p-2 transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(index)}
                          className="text-red-600 hover:bg-red-50 rounded-lg p-2 transition-colors"
                          title="Hapus"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Form */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-xl shadow-xl p-8 w-full max-w-lg relative">
            <h2 className="text-xl font-bold mb-6 text-purple-700 flex items-center gap-2">
              <GraduationCap className="w-6 h-6" />
              {editIndex !== null ? "Edit Pelatihan" : "Tambah Pelatihan"}
            </h2>
            <form ref={formRef} className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="judul" className="block text-sm font-medium text-gray-700 mb-1">
                  Judul Pelatihan
                </label>
                <input
                  type="text"
                  id="judul"
                  name="judul"
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  placeholder="Masukkan judul pelatihan"
                  defaultValue={editIndex !== null && pelatihanList[editIndex] ? pelatihanList[editIndex].judul : ""}
                />
              </div>

              <div>
                <label htmlFor="tanggal" className="block text-sm font-medium text-gray-700 mb-1">
                  Tanggal Pelatihan
                </label>
                <input
                  type="date"
                  id="tanggal"
                  name="tanggal"
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  defaultValue={editIndex !== null && pelatihanList[editIndex] ? 
                    new Date(pelatihanList[editIndex].tanggal).toISOString().split('T')[0] : ""}
                />
              </div>

              <div>
                <label htmlFor="jam" className="block text-sm font-medium text-gray-700 mb-1">
                  Jumlah Jam Pelatihan
                </label>
                <input
                  type="number"
                  id="jam"
                  name="jam"
                  min="1"
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  placeholder="Contoh: 8"
                  defaultValue={editIndex !== null && pelatihanList[editIndex] ? pelatihanList[editIndex].jam : ""}
                />
              </div>

              <div>
                <label htmlFor="sertifikat" className="block text-sm font-medium text-gray-700 mb-1">
                  Link/Nama Sertifikat (Opsional)
                </label>
                <input
                  type="text"
                  id="sertifikat"
                  name="sertifikat"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  placeholder="URL sertifikat atau nama sertifikat"
                  defaultValue={editIndex !== null && pelatihanList[editIndex] ? pelatihanList[editIndex].sertifikat : ""}
                />
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg shadow-lg hover:shadow-xl transition-all font-semibold disabled:opacity-50 flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <>
                      <FileText className="w-4 h-4" />
                      <span>{editIndex !== null ? "Update" : "Simpan"}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      </div>
    {/* Champion Modal (inline) */}
    {showChampionModal && (
      <div onClick={() => setShowChampionModal(false)} className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div className="max-w-lg w-full p-0 overflow-hidden bg-transparent shadow-2xl max-h-[90vh]">
          <div onClick={(e) => e.stopPropagation()} className="relative bg-gradient-to-br from-yellow-400 via-yellow-500 to-orange-500 rounded-2xl shadow-2xl overflow-hidden">
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute top-0 left-0 w-20 h-20 bg-white bg-opacity-20 rounded-full mb-4 animate-bounce" style={{ animationDelay: '0s', animationDuration: '3s' }}></div>
              <div className="absolute top-1/4 right-0 w-16 h-16 bg-white bg-opacity-15 rounded-full mb-4 animate-ping" style={{ animationDelay: '1s', animationDuration: '4s' }}></div>
              <div className="absolute bottom-0 left-1/4 w-12 h-12 bg-white bg-opacity-25 rounded-full mb-4 animate-pulse" style={{ animationDelay: '2s' }}></div>
              <div className="absolute top-3/4 right-1/4 w-8 h-8 bg-white bg-opacity-30 rounded-full mb-4 animate-bounce" style={{ animationDelay: '0.5s', animationDuration: '2.5s' }}></div>
              <div className="absolute top-1/2 left-0 w-6 h-6 bg-white bg-opacity-20 rounded-full mb-4 animate-ping" style={{ animationDelay: '1.5s' }}></div>
            </div>

            <div className="absolute inset-0">
              <div className="absolute top-8 left-8 text-2xl animate-pulse" style={{ animationDelay: '0s' }}>✨</div>
              <div className="absolute top-12 right-12 text-xl animate-bounce" style={{ animationDelay: '1s' }}>⭐</div>
              <div className="absolute bottom-16 left-12 text-lg animate-pulse" style={{ animationDelay: '2s' }}>🌟</div>
              <div className="absolute bottom-8 right-8 text-2xl animate-bounce" style={{ animationDelay: '0.5s' }}>💫</div>
              <div className="absolute top-1/2 left-6 text-sm animate-ping" style={{ animationDelay: '1.5s' }}>✨</div>
              <div className="absolute top-20 right-20 text-lg animate-pulse" style={{ animationDelay: '2.5s' }}>🎊</div>
            </div>

            <div className="relative z-10 p-8 text-center text-white overflow-y-auto max-h-[85vh] scrollbar-custom">
              <div className="mb-8">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-white bg-opacity-20 rounded-full mb-4 animate-pulse">
                  <Award className="w-10 h-10 text-white" />
                </div>
                <h1 className="text-3xl font-bold mb-2 animate-bounce">🏆 LEARNING CHAMPION! 🏆</h1>
                <div className="flex justify-center space-x-1 mb-4">
                  <span className="animate-bounce text-2xl" style={{ animationDelay: '0s' }}>🥇</span>
                  <span className="animate-bounce text-2xl" style={{ animationDelay: '0.2s' }}>🎉</span>
                  <span className="animate-bounce text-2xl" style={{ animationDelay: '0.4s' }}>🚀</span>
                </div>
                <div className="bg-white bg-opacity-90 rounded-full px-4 py-1 inline-block">
                  <span className="text-yellow-600 font-bold text-sm">🌟 OUTSTANDING ACHIEVEMENT 🌟</span>
                </div>
              </div>

              {championData && (
                <>
                  <div className="bg-white bg-opacity-95 rounded-xl p-6 mb-6 text-gray-800 shadow-lg">
                    <div className="flex items-center justify-center gap-4 mb-3">
                      <div className="text-5xl">{championLevel >= 7 ? '🔥' : championLevel >=6 ? '⚡' : championLevel >=5 ? '🦸' : championLevel >=4 ? '🏆' : championLevel >=3 ? '🎯' : championLevel >=2 ? '�' : '🐣'}</div>
                      <div className="text-left">
                        <h2 className="text-2xl font-bold text-gray-800 mb-1">{championData.nama}</h2>
                        <p className="text-gray-600 mb-1 font-medium">{championData.unit_kerja}</p>
                        <div className="inline-flex items-center bg-gradient-to-r from-yellow-400 to-orange-400 text-white px-3 py-1 rounded-full text-sm font-bold shadow-md">{`Level ${championLevel} — ${championLevelName}`}</div>
                      </div>
                    </div>
                    <div className="mt-4">
                      <div className="text-sm text-gray-600 mb-2">Progress menuju Level {championLevel + 1}: {jamToNext} JP lagi</div>
                      <div className="w-full bg-white rounded-full h-3 bg-opacity-40">
                        <div className="bg-yellow-400 h-3 rounded-full transition-all" style={{ width: `${progressPercent}%` }} />
                      </div>
                    </div>
                  </div>

                  <div className="bg-white bg-opacity-95 rounded-xl p-6 mb-6 shadow-lg">
                    <h3 className="text-lg font-bold text-gray-800 mb-3 text-center">Statistik Singkat</h3>
                    <div className="grid grid-cols-3 gap-3 text-center">
                      <div>
                        <div className="text-2xl font-bold text-blue-600">{championData.total_jam}</div>
                        <div className="text-xs text-gray-500">Total Jam</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-green-600">{championData.jumlah_pelatihan}</div>
                        <div className="text-xs text-gray-500">Pelatihan</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-purple-600">{championData.rata_rata_jam.toFixed(1)}</div>
                        <div className="text-xs text-gray-500">Rata-rata/Jam</div>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mt-4">{`${championData.nama} menunjukkan konsistensi dan dedikasi. Ingat, level Anda saat ini adalah ${userLevel} — ${userLevelName}. Jangan mau kalah, ayo input pelatihan yang Anda ikuti!`}</p>
                    <div className="mt-4 flex gap-3">
                      <button onClick={() => { setShowChampionModal(false); setShowModal(true); }} className="flex-1 bg-yellow-400 text-white font-bold py-3 rounded-xl shadow">Input Pelatihan Anda — Tambah Pelatihan</button>
                      <button onClick={() => setShowChampionModal(false)} className="flex-1 bg-white text-yellow-600 font-bold py-3 rounded-xl border border-yellow-200">Nanti</button>
                    </div>
                  </div>
                </>
              )}

              <div className="space-y-3">
                <button onClick={() => setShowChampionModal(false)} className="w-full bg-white text-yellow-600 hover:bg-yellow-50 font-bold py-4 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border-2 border-yellow-200">
                  <span className="text-xl mr-2">✨</span>Terima Kasih Champion!<span className="text-xl ml-2">✨</span>
                </button>
                <div className="text-center"><span className="text-white text-xs bg-white bg-opacity-20 px-3 py-1 rounded-full">🎯 Keep up the excellent work! 🎯</span></div>
              </div>

              <div className="flex justify-center mt-4 pb-2"><div className="flex space-x-1"><div className="w-2 h-2 bg-white bg-opacity-40 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div><div className="w-2 h-2 bg-white bg-opacity-40 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div><div className="w-2 h-2 bg-white bg-opacity-40 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div></div></div>
            </div>
          </div>
        </div>
      </div>
    )}
    </>
  )
}