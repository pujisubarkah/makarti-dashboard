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

interface SkpTransformasionalItem {
  id: number
  pegawai: string
  unit: string
  inovasi: string
  target: string
  status: string
  dampak: string
}

const initialData: SkpTransformasionalItem[] = [
  {
    id: 1,
    pegawai: 'Budi Santosa',
    unit: 'Biro A',
    inovasi: 'Dashboard SKP Inovatif',
    target: 'Transparansi Kinerja Pegawai',
    status: 'On Progress',
    dampak: 'Visibilitas meningkat 80%'
  },
  {
    id: 2,
    pegawai: 'Ani Wijaya',
    unit: 'Pusat B',
    inovasi: 'Sistem Monitoring Real-time',
    target: 'Efisiensi pelaporan',
    status: 'Dalam Rencana',
    dampak: 'Waktu pelaporan berkurang 50%'
  },
]

export default function SkpTransformasionalPage() {
  const [showModal, setShowModal] = useState(false)
  const [data, setData] = useState<SkpTransformasionalItem[]>([])

  // Load data from localStorage on component mount
  useEffect(() => {
    const savedData = localStorage.getItem("skpTransformasionalData")
    setData(savedData ? JSON.parse(savedData) : initialData)
  }, [])

  const [formData, setFormData] = useState({
    pegawai: '',
    unit: 'Biro A',
    inovasi: '',
    target: '',
    status: 'Dalam Rencana',
    dampak: '',
  })

  const unitOptions = ["Biro A", "Pusat B", "Sekretariat", "Unit C"]
  const statusOptions = ["Dalam Rencana", "On Progress", "Sudah Implementasi"]

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
        ...formData
      }

      const updatedData = [...data, newItem]
      setData(updatedData)
      localStorage.setItem("skpTransformasionalData", JSON.stringify(updatedData))

      // API call if needed
      const res = await fetch('/api/skp-transformasional', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (res.ok) {
        alert('Data berhasil disimpan!')
        setFormData({
          pegawai: '',
          unit: 'Biro A',
          inovasi: '',
          target: '',
          status: 'Dalam Rencana',
          dampak: '',
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
        <h1 className="text-2xl font-bold text-blue-700">Data SKP Transformasional</h1>
        <Dialog open={showModal} onOpenChange={setShowModal}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">+ Tambah Inovasi</Button>
          </DialogTrigger>
          <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto p-6 bg-white rounded-xl shadow-lg">
            <DialogHeader>
              <DialogTitle className="text-blue-700 text-xl font-semibold">
                Form SKP Transformasional
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-5 mt-2">
              {/* Nama Pegawai */}
              <div className="space-y-1">
                <Label htmlFor="pegawai" className="text-sm font-medium text-gray-700">Nama Pegawai</Label>
                <Input
                  id="pegawai"
                  name="pegawai"
                  value={formData.pegawai}
                  onChange={handleChange}
                  required
                  placeholder="Contoh: Budi Santosa"
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
                    {unitOptions.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Judul Inovasi */}
              <div className="space-y-1">
                <Label htmlFor="inovasi" className="text-sm font-medium text-gray-700">Judul Inovasi</Label>
                <Input
                  id="inovasi"
                  name="inovasi"
                  value={formData.inovasi}
                  onChange={handleChange}
                  required
                  placeholder="Contoh: Dashboard SKP Inovatif"
                  className="border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200"
                />
              </div>

              {/* Target Transformasi */}
              <div className="space-y-1">
                <Label htmlFor="target" className="text-sm font-medium text-gray-700">Target Transformasi</Label>
                <Input
                  id="target"
                  name="target"
                  value={formData.target}
                  onChange={handleChange}
                  required
                  placeholder="Contoh: Transparansi Kinerja Pegawai"
                  className="border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200"
                />
              </div>

              {/* Status Inovasi */}
              <div className="space-y-1">
                <Label htmlFor="status" className="text-sm font-medium text-gray-700">Status</Label>
                <Select
                  name="status"
                  value={formData.status}
                  onValueChange={(value) => handleSelectChange("status", value)}
                >
                  <SelectTrigger id="status" className="border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200">
                    <SelectValue placeholder="Pilih status inovasi" />
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

              {/* Dampak Inovasi */}
              <div className="space-y-1">
                <Label htmlFor="dampak" className="text-sm font-medium text-gray-700">Dampak Inovasi</Label>
                <Input
                  id="dampak"
                  name="dampak"
                  value={formData.dampak}
                  onChange={handleChange}
                  placeholder="Contoh: Visibilitas meningkat 80%"
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
              <TableHead>Nama Pegawai</TableHead>
              <TableHead>Unit Kerja</TableHead>
              <TableHead>Judul Inovasi</TableHead>
              <TableHead>Target</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Dampak</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item, index) => (
              <TableRow key={item.id}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>{item.pegawai}</TableCell>
                <TableCell>{item.unit}</TableCell>
                <TableCell>{item.inovasi}</TableCell>
                <TableCell>{item.target}</TableCell>
                <TableCell>{item.status}</TableCell>
                <TableCell>{item.dampak}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}