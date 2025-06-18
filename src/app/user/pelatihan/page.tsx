"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface PelatihanItem {
  id: number
  nama: string
  judul: string
  jam: number
  tanggal: string
  unit: string // Tetap disimpan, tapi tidak ditampilkan
}

export default function PelatihanPage() {
  const [showModal, setShowModal] = useState(false)
  const [data, setData] = useState<PelatihanItem[]>([])

  const [formData, setFormData] = useState({
    nama: '',
    judul: '',
    jam: 0,
    tanggal: ''
  })

  // Load data dari localStorage saat pertama kali halaman dimuat
  useEffect(() => {
    const savedData = localStorage.getItem("pelatihanData")
    if (savedData) {
      setData(JSON.parse(savedData))
    }
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const newItem = {
      id: Date.now(),
      ...formData,
      jam: Number(formData.jam),
      unit: 'Pusdatin' // Unit tetap untuk semua entri
    }

    const updatedData = [...data, newItem]
    setData(updatedData)
    localStorage.setItem("pelatihanData", JSON.stringify(updatedData))

    // Reset form dan tutup modal
    setFormData({
      nama: '',
      judul: '',
      jam: 0,
      tanggal: ''
    })
    setShowModal(false)
  }

  return (
    <div className="p-6">
      {/* Header & Tombol Tambah */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-blue-700">Data Pengembangan Kompetensi Pegawai</h1>
        <Dialog open={showModal} onOpenChange={setShowModal}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">+ Tambah Pelatihan</Button>
          </DialogTrigger>
          <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto p-6 bg-white rounded-xl shadow-lg">
            <DialogHeader>
              <DialogTitle className="text-blue-700 text-xl font-semibold">
                Form Pengisian Pelatihan
              </DialogTitle>
            </DialogHeader>

            {/* Form Input */}
            <form onSubmit={handleSubmit} className="space-y-5 mt-2">
              {/* Nama Pegawai */}
              <div className="space-y-1">
                <Label htmlFor="nama" className="text-sm font-medium text-gray-700">Nama Pegawai</Label>
                <Input
                  id="nama"
                  name="nama"
                  value={formData.nama}
                  onChange={handleChange}
                  required
                  placeholder="Masukkan nama pegawai"
                  className="border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200"
                />
              </div>

              {/* Judul Pelatihan */}
              <div className="space-y-1">
                <Label htmlFor="judul" className="text-sm font-medium text-gray-700">Judul Pelatihan</Label>
                <Input
                  id="judul"
                  name="judul"
                  value={formData.judul}
                  onChange={handleChange}
                  required
                  placeholder="Contoh: Pelatihan UI/UX Design"
                  className="border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200"
                />
              </div>

              {/* Jam Pelatihan */}
              <div className="space-y-1">
                <Label htmlFor="jam" className="text-sm font-medium text-gray-700">Jam Pelatihan</Label>
                <Input
                  id="jam"
                  type="number"
                  name="jam"
                  value={formData.jam}
                  onChange={handleChange}
                  min="1"
                  max="24"
                  required
                  className="border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200"
                  placeholder="Misal: 6"
                />
              </div>

              {/* Tanggal Pelatihan */}
              <div className="space-y-1">
                <Label htmlFor="tanggal" className="text-sm font-medium text-gray-700">Tanggal Pelatihan</Label>
                <Input
                  id="tanggal"
                  type="date"
                  name="tanggal"
                  value={formData.tanggal}
                  onChange={handleChange}
                  required
                  className="border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200"
                />
              </div>

              {/* Tombol Submit & Batal */}
              <div className="flex justify-end gap-3 mt-6">
                <Button
                  variant="outline"
                  onClick={() => setShowModal(false)}
                  type="button"
                  className="text-gray-700 border-gray-300 hover:bg-gray-100 transition-colors duration-200"
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors duration-200"
                >
                  Simpan
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Tabel Daftar Pelatihan */}
      <div className="overflow-x-auto mb-8">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>No</TableHead>
              <TableHead>Nama Pegawai</TableHead>
              <TableHead>Judul Pelatihan</TableHead>
              <TableHead>Jam</TableHead>
              <TableHead>Tanggal</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item, index) => (
              <TableRow key={item.id}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>{item.nama}</TableCell>
                <TableCell>{item.judul}</TableCell>
                <TableCell>{item.jam} jam</TableCell>
                <TableCell>{item.tanggal}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}