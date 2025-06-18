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

interface InovasiItem {
  id: number
  judul: string
  pengusul: string
  tahap: string
  tanggal: string
  indikator: string
  unit: string
}

// Dummy initial data
const initialData: InovasiItem[] = [
  {
    id: 1,
    judul: 'Digitalisasi Formulir Pelayanan',
    pengusul: 'Unit A',
    tahap: 'Implementasi',
    tanggal: '2025-05-15',
    indikator: 'Target selesai Juni 2025',
    unit: 'Unit A'
  },
  {
    id: 2,
    judul: 'Sistem Monitoring Real-time',
    pengusul: 'Unit B',
    tahap: 'Uji Coba',
    tanggal: '2025-05-10',
    indikator: 'Uji coba 3 bulan',
    unit: 'Unit B'
  },
]

export default function InovasiPage() {
  const [showModal, setShowModal] = useState(false)
  const [data, setData] = useState<InovasiItem[]>([])

  // Load data from localStorage on component mount
  useEffect(() => {
    const savedData = localStorage.getItem("inovasiData")
    setData(savedData ? JSON.parse(savedData) : initialData)
  }, [])

  const [formData, setFormData] = useState({
    judul: '',
    pengusul: 'Unit A',
    tahap: 'Ide',
    tanggal: '',
    indikator: '',
  })

  const tahapOptions = ["Ide", "Perencanaan", "Uji Coba", "Implementasi"]
  const unitOptions = ["Unit A", "Unit B", "Unit C", "Unit D"]

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
      const newItem = {
        id: Date.now(),
        ...formData,
        unit: formData.pengusul // Set unit same as pengusul
      }

      const updatedData = [...data, newItem]
      setData(updatedData)
      localStorage.setItem("inovasiData", JSON.stringify(updatedData))

      // API call if needed
      const res = await fetch('/api/inovasi', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (res.ok) {
        alert('Data berhasil disimpan!')
        setFormData({
          judul: '',
          pengusul: 'Unit A',
          tahap: 'Ide',
          tanggal: '',
          indikator: '',
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
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-blue-700">Data Inovasi</h1>
        <Dialog open={showModal} onOpenChange={setShowModal}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">+ Tambah Inovasi</Button>
          </DialogTrigger>
          <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto p-6 bg-white rounded-xl shadow-lg">
            <DialogHeader>
              <DialogTitle className="text-blue-700 text-xl font-semibold">
                Form Pengisian Inovasi
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-5 mt-2">
              {/* Judul Inovasi */}
              <div className="space-y-1">
                <Label htmlFor="judul" className="text-sm font-medium text-gray-700">Judul Inovasi</Label>
                <Input
                  id="judul"
                  name="judul"
                  value={formData.judul}
                  onChange={handleChange}
                  required
                  placeholder="Contoh: Digitalisasi Formulir Pelayanan"
                  className="border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200"
                />
              </div>

              {/* Pengusul */}
              <div className="space-y-1">
                <Label htmlFor="pengusul" className="text-sm font-medium text-gray-700">Pengusul</Label>
                <Select
                  name="pengusul"
                  value={formData.pengusul}
                  onValueChange={(value) => handleSelectChange("pengusul", value)}
                >
                  <SelectTrigger id="pengusul" className="border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200">
                    <SelectValue placeholder="Pilih unit pengusul" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-gray-200 rounded-md shadow-lg">
                    {unitOptions.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Tahap Inovasi */}
              <div className="space-y-1">
                <Label htmlFor="tahap" className="text-sm font-medium text-gray-700">Tahap</Label>
                <Select
                  name="tahap"
                  value={formData.tahap}
                  onValueChange={(value) => handleSelectChange("tahap", value)}
                >
                  <SelectTrigger id="tahap" className="border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200">
                    <SelectValue placeholder="Pilih tahap inovasi" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-gray-200 rounded-md shadow-lg">
                    {tahapOptions.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Tanggal Inovasi */}
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

              {/* Indikator Kinerja */}
              <div className="space-y-1">
                <Label htmlFor="indikator" className="text-sm font-medium text-gray-700">Indikator Kinerja</Label>
                <Input
                  id="indikator"
                  name="indikator"
                  value={formData.indikator}
                  onChange={handleChange}
                  required
                  placeholder="Misal: Target uji coba Juni 2025"
                  className="border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200"
                />
              </div>

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

      {/* Table */}
      <div className="overflow-x-auto mb-8">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>No</TableHead>
              <TableHead>Judul Inovasi</TableHead>
              <TableHead>Pengusul</TableHead>
              <TableHead>Tahap</TableHead>
              <TableHead>Tanggal</TableHead>
              <TableHead>Indikator Kinerja</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item, index) => (
              <TableRow key={item.id}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>{item.judul}</TableCell>
                <TableCell>{item.pengusul}</TableCell>
                <TableCell>{item.tahap}</TableCell>
                <TableCell>{item.tanggal}</TableCell>
                <TableCell>{item.indikator}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}