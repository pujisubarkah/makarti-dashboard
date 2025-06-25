"use client"
import { useState } from "react"

interface OrgNode {
  id: string
  name: string
  position: string
  department: string
  children?: OrgNode[]
}

const organizationData: OrgNode = {
  id: "1",
  name: "Kepala Lembaga Administrasi Negara",
  position: "Kepala LAN",
  department: "LAN",
  children: [
    {
      id: "2",
      name: "Sekretaris Utama",
      position: "Sekretaris Utama",
      department: "SETAMA",
      children: [
        { id: "3", name: "Biro Perencanaan", position: "Kepala Biro", department: "SETAMA" },
        { id: "4", name: "Biro Umum", position: "Kepala Biro", department: "SETAMA" },
        { id: "5", name: "Biro SDM", position: "Kepala Biro", department: "SETAMA" }
      ]
    },
    {
      id: "6",
      name: "Deputi Bidang I",
      position: "Deputi",
      department: "DEPUTI I",
      children: [
        { id: "7", name: "ASDEP Kajian Strategis", position: "Asisten Deputi", department: "DEPUTI I" },
        { id: "8", name: "ASDEP Inovasi", position: "Asisten Deputi", department: "DEPUTI I" }
      ]
    }
  ]
}

function OrgChart({ node }: { node: OrgNode }) {
  const [expanded] = useState(true)

  return (
    <div className="flex flex-col items-center">
      {/* Node Card */}
      <div className="bg-white border rounded shadow p-2 min-w-[120px] text-center text-sm">
        <div className="font-bold">{node.name}</div>
        <div className="text-xs text-gray-600">{node.position}</div>
      </div>

      {/* Children Nodes */}
      {node.children && node.children.length > 0 && (
        <div className={`ml-4 mt-2 w-full ${expanded ? '' : 'hidden'}`}>
          <div className="relative pl-4 border-l border-gray-300">
            {node.children.map((child, index) => (
              <div key={index} className="mt-2">
                <OrgChart node={child} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default function HorizontalOrgChart() {
  return (
    <div className="p-6 bg-gray-50 min-h-screen overflow-x-auto">
      <h1 className="text-xl font-bold mb-6">Struktur Organisasi - Pohon Kinerja</h1>
      <div className="flex">
        <OrgChart node={organizationData} />
      </div>
    </div>
  )
}