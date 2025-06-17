// app/publikasi/page.tsx
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

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
      unit: userUnit,
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
        <Dialog open={showModal} onOpenChange={setShowModal}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">+ Tambah Publikasi</Button>
          </DialogTrigger>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
  <DialogHeader>
    <DialogTitle>Tambah Publikasi</DialogTitle>
  </DialogHeader>
  <form onSubmit={handleSubmit} className="space-y-4">
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">Judul</label>
      <input
        type="text"
        name="judul"
        value={formData.judul}
        onChange={handleChange}
        required
        className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-500"
      />
    </div>

    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">Tanggal</label>
      <input
        type="date"
        name="tanggal"
        value={formData.tanggal}
        onChange={handleChange}
        required
        className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-500"
      />
    </div>

    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">Jenis Media</label>
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

    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">Link</label>
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
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Likes</label>
          <input
            type="number"
            name="likes"
            value={formData.likes}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Views</label>
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

    <div className="flex justify-end gap-3 pt-2">
      <Button variant="outline" onClick={() => setShowModal(false)} type="button">
        Batal
      </Button>
      <Button type="submit">Simpan</Button>
    </div>
  </form>
</DialogContent>
        </Dialog>
      </div>

      {/* Table */}
      <div className="overflow-x-auto mb-8">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>No</TableHead>
              <TableHead>Judul</TableHead>
              <TableHead>Tanggal</TableHead>
              <TableHead>Jenis Media</TableHead>
              <TableHead className="text-right">Likes</TableHead>
              <TableHead className="text-right">Views</TableHead>
              <TableHead className="text-right">Engagement</TableHead>
              <TableHead className="text-center">Link</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item, index) => {
              const isInstagram = item.jenis === 'Instagram'
              const engagement =
                isInstagram && item.views
                  ? ((item.likes! / item.views!) * 100).toFixed(1) + '%'
                  : '-'

              return (
                <TableRow key={item.id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{item.judul}</TableCell>
                  <TableCell>{item.tanggal}</TableCell>
                  <TableCell>{item.jenis}</TableCell>
                  <TableCell className="text-right">{isInstagram ? item.likes : '-'}</TableCell>
                  <TableCell className="text-right">{isInstagram ? item.views : '-'}</TableCell>
                  <TableCell className="text-right">{engagement}</TableCell>
                  <TableCell className="text-center">
                    <a href={item.link} className="text-blue-600 underline">
                      Lihat
                    </a>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}