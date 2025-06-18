"use client"

import { useState } from "react"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function ProdukInovasiPage() {
  const [showModal, setShowModal] = useState(false)

  const [formData, setFormData] = useState({
    nama: '',
    unit: 'Pusat A',
    jenis: 'Aplikasi Digital',
    status: 'Aktif Digunakan',
    tanggalRilis: '',
    keterangan: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    try {
      const res = await fetch('/api/produk-inovasi', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (res.ok) {
        alert('Data berhasil disimpan!')
        setFormData({
          nama: '',
          unit: 'Pusat A',
          jenis: 'Aplikasi Digital',
          status: 'Aktif Digunakan',
          tanggalRilis: '',
          keterangan: '',
        })
        setShowModal(false)
      } else {
        alert('Gagal menyimpan data.')
      }
    } catch {
      alert('Terjadi kesalahan saat mengirim data.')
    }
  }

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold text-blue-700 mb-6">Form Produk Inovasi</h1>

      {/* Tombol Tambah */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogTrigger asChild>
          <Button className="bg-blue-600 hover:bg-blue-700 mb-6">+ Tambah Produk</Button>
        </DialogTrigger>
        <DialogContent className="max-w-md p-6 bg-white rounded-xl shadow-lg">
          <DialogHeader>
            <DialogTitle className="text-blue-700 text-xl font-semibold">
              Isi Data Produk Inovasi
            </DialogTitle>
          </DialogHeader>

          {/* Form Input */}
          <form onSubmit={handleSubmit} className="space-y-5 mt-4">
            {/* Nama Produk */}
            <div className="space-y-1">
              <Label htmlFor="nama" className="text-sm font-medium text-gray-700">Nama Produk</Label>
              <Input
                id="nama"
                name="nama"
                value={formData.nama}
                onChange={handleChange}
                required
                placeholder="Contoh: Sistem e-Integritas"
                className="border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200"
              />
            </div>

            {/* Unit Kerja */}
            <div className="space-y-1">
              <Label htmlFor="unit" className="text-sm font-medium text-gray-700">Unit Kerja</Label>
              <Select
                name="unit"
                value={formData.unit}
                onValueChange={(value) => handleSelectChange("unit", value)}
              >
                <SelectTrigger id="unit" className="border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200">
                  <SelectValue placeholder="Pilih unit kerja" />
                </SelectTrigger>
                <SelectContent className="bg-white border border-gray-200 rounded-md shadow-lg">
                  <SelectItem value="Pusat A">Pusat A</SelectItem>
                  <SelectItem value="Pusat B">Pusat B</SelectItem>
                  <SelectItem value="Pusat C">Pusat C</SelectItem>
                  <SelectItem value="Pusat D">Pusat D</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Jenis Produk */}
            <div className="space-y-1">
              <Label htmlFor="jenis" className="text-sm font-medium text-gray-700">Jenis Produk</Label>
              <Select
                name="jenis"
                value={formData.jenis}
                onValueChange={(value) => handleSelectChange("jenis", value)}
              >
                <SelectTrigger id="jenis" className="border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200">
                  <SelectValue placeholder="Pilih jenis produk" />
                </SelectTrigger>
                <SelectContent className="bg-white border border-gray-200 rounded-md shadow-lg">
                  <SelectItem value="Aplikasi Digital">Aplikasi Digital</SelectItem>
                  <SelectItem value="Dashboard">Dashboard</SelectItem>
                  <SelectItem value="Modul Pelatihan">Modul Pelatihan</SelectItem>
                  <SelectItem value="SOP">SOP</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Status Produk */}
            <div className="space-y-1">
              <Label htmlFor="status" className="text-sm font-medium text-gray-700">Status</Label>
              <Select
                name="status"
                value={formData.status}
                onValueChange={(value) => handleSelectChange("status", value)}
              >
                <SelectTrigger id="status" className="border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200">
                  <SelectValue placeholder="Pilih status produk" />
                </SelectTrigger>
                <SelectContent className="bg-white border border-gray-200 rounded-md shadow-lg">
                  <SelectItem value="Aktif Digunakan">Aktif Digunakan</SelectItem>
                  <SelectItem value="Uji Coba">Uji Coba</SelectItem>
                  <SelectItem value="Arsip">Arsip</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Tanggal Rilis */}
            <div className="space-y-1">
              <Label htmlFor="tanggalRilis" className="text-sm font-medium text-gray-700">Tanggal Rilis</Label>
              <Input
                id="tanggalRilis"
                type="date"
                name="tanggalRilis"
                value={formData.tanggalRilis}
                onChange={handleChange}
                required
                className="border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200"
              />
            </div>

            {/* Keterangan */}
            <div className="space-y-1">
              <Label htmlFor="keterangan" className="text-sm font-medium text-gray-700">Keterangan</Label>
              <Input
                id="keterangan"
                name="keterangan"
                value={formData.keterangan}
                onChange={handleChange}
                placeholder="Contoh: Sistem pelaporan benturan kepentingan"
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
  )
}