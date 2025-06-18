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

interface PelatihanPeserta {
  id: number
  nama: string
  tanggal: string
  jenis: string
  jumlahPeserta: number
  unit: string
}

export default function FormPelatihanPage() {
  const [showModal, setShowModal] = useState(false)
  const [data, setData] = useState<PelatihanPeserta[]>([])

  const [formData, setFormData] = useState({
    nama: '',
    tanggal: '',
    jenis: 'Webinar',
    jumlahPeserta: 0,
  })

  // Get unit from localStorage
  const unit = typeof window !== 'undefined' ? localStorage.getItem("userUnit") || "Pusdatin" : "Pusdatin"

  // Load data from localStorage on component mount
  useEffect(() => {
    const savedData = localStorage.getItem("pelatihanPesertaData")
    if (savedData) {
      setData(JSON.parse(savedData))
    }
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (value: string) => {
    setFormData(prev => ({ ...prev, jenis: value }))
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const newItem = {
      id: Date.now(),
      ...formData,
      jumlahPeserta: Number(formData.jumlahPeserta),
      unit: unit // Add unit from localStorage
    }

    const updatedData = [...data, newItem]
    setData(updatedData)
    localStorage.setItem("pelatihanPesertaData", JSON.stringify(updatedData))

    // Reset form and close modal
    setFormData({
      nama: '',
      tanggal: '',
      jenis: 'Webinar',
      jumlahPeserta: 0,
    })
    setShowModal(false)
  }

  return (
    <div className="p-6">
      {/* Header & Add Button */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-blue-700">Data Pelatihan dan Peserta</h1>
        <Dialog open={showModal} onOpenChange={setShowModal}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">+ Isi Data Pelatihan</Button>
          </DialogTrigger>
          <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto p-6 bg-white rounded-xl shadow-lg">
            <DialogHeader>
              <DialogTitle className="text-blue-700 text-xl font-semibold">
                Form Pengisian Pelatihan
              </DialogTitle>
            </DialogHeader>

            {/* Form Input */}
            <form onSubmit={handleSubmit} className="space-y-5 mt-2">
              {/* Nama Kegiatan */}
              <div className="space-y-1">
                <Label htmlFor="nama" className="text-sm font-medium text-gray-700">Nama Kegiatan</Label>
                <Input
                  id="nama"
                  name="nama"
                  value={formData.nama}
                  onChange={handleChange}
                  required
                  placeholder="Contoh: Webinar Transformasi Digital"
                  className="border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200"
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

              {/* Jenis Pelatihan */}
              <div className="space-y-1">
                <Label htmlFor="jenis" className="text-sm font-medium text-gray-700">Jenis Pelatihan</Label>
                <Select onValueChange={handleSelectChange} defaultValue={formData.jenis}>
                  <SelectTrigger id="jenis" className="border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200">
                    <SelectValue placeholder="Pilih jenis pelatihan" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-gray-200 rounded-md shadow-lg">
                    <SelectItem value="Webinar">Webinar</SelectItem>
                    <SelectItem value="Seminar">Seminar</SelectItem>
                    <SelectItem value="Zoom">Zoom</SelectItem>
                    <SelectItem value="Sosialisasi">Sosialisasi</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Jumlah Peserta */}
              <div className="space-y-1">
                <Label htmlFor="jumlahPeserta" className="text-sm font-medium text-gray-700">Jumlah Peserta</Label>
                <Input
                  id="jumlahPeserta"
                  type="number"
                  name="jumlahPeserta"
                  value={formData.jumlahPeserta}
                  onChange={handleChange}
                  min="1"
                  required
                  className="border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200"
                  placeholder="Misal: 80"
                />
              </div>

              {/* Submit & Cancel Buttons */}
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

      {/* Training Data Table */}
      <div className="overflow-x-auto mb-8">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>No</TableHead>
              <TableHead>Nama Kegiatan</TableHead>
              <TableHead>Tanggal</TableHead>
              <TableHead>Jenis</TableHead>
              <TableHead>Jumlah Peserta</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item, index) => (
              <TableRow key={item.id}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>{item.nama}</TableCell>
                <TableCell>{item.tanggal}</TableCell>
                <TableCell>{item.jenis}</TableCell>
                <TableCell>{item.unit}</TableCell>
                <TableCell>{item.jumlahPeserta}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}