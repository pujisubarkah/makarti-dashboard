// app/user/networking/tambah/page.tsx
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface NetworkingItem {
  id: number
  instansi: string
  jenis: string
  tanggal: string
  status: string
  unit: string | null
}

export default function TambahNetworkingPage() {
  const [showModal, setShowModal] = useState(false)
  const [data, setData] = useState<NetworkingItem[]>([])

  const [formData, setFormData] = useState({
    instansi: "",
    jenis: "Kunjungan",
    tanggal: "",
    status: "Selesai",
  })

  const userUnit = typeof window !== 'undefined' ? localStorage.getItem("userUnit") : null

  const jenisOptions = ["Kunjungan", "Kerjasama", "Koordinasi"]
  const statusOptions = ["Selesai", "MoU Ditandatangani", "Menunggu Tindak Lanjut"]

  // Load data from localStorage on component mount
  useEffect(() => {
    const savedData = localStorage.getItem("networkingData")
    if (savedData) {
      setData(JSON.parse(savedData))
    }
  }, [])

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
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
    localStorage.setItem("networkingData", JSON.stringify(updatedData))

    // Reset form and close modal
    setFormData({
      instansi: "",
      jenis: "Kunjungan",
      tanggal: "",
      status: "Selesai",
    })
    setShowModal(false)
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-blue-700">Kegiatan Networking</h1>
        <Dialog open={showModal} onOpenChange={setShowModal}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">+ Tambah Kegiatan</Button>
          </DialogTrigger>
          <DialogContent 
  className="max-w-md max-h-[90vh] overflow-y-auto p-6 bg-white rounded-xl shadow-lg"
  onInteractOutside={(e) => {
    // Optional: prevent closing when clicking outside
    e.preventDefault()
  }}
>
  <DialogHeader>
    <DialogTitle className="text-blue-700 text-xl font-semibold">
      Tambah Kegiatan Networking
    </DialogTitle>
  </DialogHeader>

  <form onSubmit={handleSubmit} className="space-y-5 mt-2">
    {/* Instansi */}
    <div className="space-y-1">
      <Label htmlFor="instansi" className="text-sm font-medium text-gray-700">Instansi / Pihak Terkait</Label>
      <Input
        id="instansi"
        name="instansi"
        value={formData.instansi}
        onChange={handleChange}
        required
        placeholder="Contoh: Kementerian PANRB"
        className="border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200"
      />
    </div>

    {/* Jenis Kegiatan */}
    <div className="space-y-1">
      <Label htmlFor="jenis" className="text-sm font-medium text-gray-700">Jenis Kegiatan</Label>
      <Select
        name="jenis"
        value={formData.jenis}
        onValueChange={(value) =>
          setFormData((prev) => ({ ...prev, jenis: value }))
        }
      >
        <SelectTrigger id="jenis" className="border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200">
          <SelectValue placeholder="Pilih jenis kegiatan" />
        </SelectTrigger>
        <SelectContent className="bg-white border border-gray-200 rounded-md shadow-lg">
          {jenisOptions.map((option) => (
            <SelectItem key={option} value={option}>
              {option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>

    {/* Tanggal */}
    <div className="space-y-1">
      <Label htmlFor="tanggal" className="text-sm font-medium text-gray-700">Tanggal</Label>
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

    {/* Status */}
    <div className="space-y-1">
      <Label htmlFor="status" className="text-sm font-medium text-gray-700">Status</Label>
      <Select
        name="status"
        value={formData.status}
        onValueChange={(value) =>
          setFormData((prev) => ({ ...prev, status: value }))
        }
      >
        <SelectTrigger id="status" className="border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200">
          <SelectValue placeholder="Pilih status" />
        </SelectTrigger>
        <SelectContent className="bg-white border border-gray-200 rounded-md shadow-lg">
          {statusOptions.map((option) => (
            <SelectItem key={option} value={option}>
              {option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
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

      {/* Tabel Daftar Kegiatan */}
      <div className="overflow-x-auto mb-8">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>No</TableHead>
              <TableHead>Instansi</TableHead>
              <TableHead>Tanggal</TableHead>
              <TableHead>Jenis</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item, index) => (
              <TableRow key={item.id}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>{item.instansi}</TableCell>
                <TableCell>{item.tanggal}</TableCell>
                <TableCell>{item.jenis}</TableCell>
                <TableCell>{item.status}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}