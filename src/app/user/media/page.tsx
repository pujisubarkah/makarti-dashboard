// app/publikasi/page.tsx
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

interface PublikasiItem {
  id: number
  judul: string
  tanggal: string
  jenis: string
  unit: string
  link: string
  likes?: number
  views?: number
}

export default function PublikasiPage() {
  const router = useRouter()

  // Dummy initial data
  const initialData: PublikasiItem[] = [
    {
      id: 1,
      judul: 'Peluncuran Inovasi Pelayanan',
      tanggal: '2025-05-20',
      jenis: 'Media Online',
      unit: 'Unit A',
      link: '#',
    },
    {
      id: 2,
      judul: 'Live IG Sosialisasi Kebijakan',
      tanggal: '2025-05-18',
      jenis: 'Instagram',
      unit: 'Unit B',
      link: '#',
      likes: 300,
      views: 5000,
    },
  ]

  // Ambil data publikasi dari localStorage jika tersedia
  const [data, setData] = useState<PublikasiItem[]>(() => {
    const saved = localStorage.getItem("publikasiData")
    return saved ? JSON.parse(saved) : initialData
  })

  const [showModal, setShowModal] = useState(false)

  // Form State
  const [formData, setFormData] = useState({
    judul: "",
    tanggal: "",
    jenis: "Media Online",
    link: "",
    likes: 0,
    views: 0,
  })

  const userUnit = typeof window !== 'undefined' ? localStorage.getItem("userUnit") : null

  const jenisMediaOptions = ["Media Online", "Instagram", "Media Massa", "Website"]

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: name === "likes" || name === "views" ? parseInt(value) || 0 : value,
    }))
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!userUnit) {
      alert("Tidak dapat menentukan unit kerja")
      return
    }

    const newItem = {
      id: Date.now(),
      ...formData,
      unit: userUnit, // tambahkan unit dari localStorage
    }

    const updatedData = [...data, newItem]
    setData(updatedData)
    localStorage.setItem("publikasiData", JSON.stringify(updatedData))

    setFormData({
      judul: "",
      tanggal: "",
      jenis: "Media Online",
      link: "",
      likes: 0,
      views: 0,
    })
    setShowModal(false)
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-blue-700">Publikasi & Media</h1>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          + Tambah Publikasi
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto mb-8">
        <table className="min-w-full bg-white shadow-md rounded-xl overflow-hidden">
          <thead className="bg-blue-100 text-sm text-gray-700">
            <tr>
              <th className="px-4 py-2 text-left">No</th>
              <th className="px-4 py-2 text-left">Judul</th>
              <th className="px-4 py-2 text-left">Tanggal</th>
              <th className="px-4 py-2 text-left">Jenis Media</th>
              <th className="px-4 py-2 text-right">Likes</th>
              <th className="px-4 py-2 text-right">Views</th>
              <th className="px-4 py-2 text-right">Engagement</th>
              <th className="px-4 py-2 text-center">Link</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {data.map((item, index) => {
              const isInstagram = item.jenis === 'Instagram'
              const engagement =
                isInstagram && item.views
                  ? ((item.likes! / item.views!) * 100).toFixed(1) + '%'
                  : '-'

              return (
                <tr key={item.id} className="border-t">
                  <td className="px-4 py-2">{index + 1}</td>
                  <td className="px-4 py-2">{item.judul}</td>
                  <td className="px-4 py-2">{item.tanggal}</td>
                  <td className="px-4 py-2">{item.jenis}</td>
                  <td className="px-4 py-2 text-right">{isInstagram ? item.likes : '-'}</td>
                  <td className="px-4 py-2 text-right">{isInstagram ? item.views : '-'}</td>
                  <td className="px-4 py-2 text-right">{engagement}</td>
                  <td className="px-4 py-2 text-center">
                    <a href={item.link} className="text-blue-600 underline">
                      Lihat
                    </a>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Modal Form */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4">Tambah Publikasi</h2>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Judul</label>
                  <input
                    type="text"
                    name="judul"
                    value={formData.judul}
                    onChange={handleChange}
                    required
                    className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal</label>
                  <input
                    type="date"
                    name="tanggal"
                    value={formData.tanggal}
                    onChange={handleChange}
                    required
                    className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Jenis Media</label>
                  <select
                    name="jenis"
                    value={formData.jenis}
                    onChange={handleChange}
                    className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-500"
                  >
                    {jenisMediaOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Link</label>
                  <input
                    type="url"
                    name="link"
                    value={formData.link}
                    onChange={handleChange}
                    placeholder="https://example.com"    
                    className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {formData.jenis === "Instagram" && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Likes</label>
                      <input
                        type="number"
                        name="likes"
                        value={formData.likes}
                        onChange={handleChange}
                        className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Views</label>
                      <input
                        type="number"
                        name="views"
                        value={formData.views}
                        onChange={handleChange}
                        className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </>
                )}
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border rounded hover:bg-gray-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}