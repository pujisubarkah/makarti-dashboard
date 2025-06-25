"use client"

import { useState } from "react"
import {
  Users,
  Building2,
  TrendingUp,
  Target,
  ChevronDown,
  ChevronRight,
  Activity,
  Star,
  CheckCircle,
  Clock,
  AlertTriangle
} from "lucide-react"

interface OrgNode {
  id: string
  name: string
  position: string
  department: string
  level: number
  kpi: {
    target: number
    achieved: number
    status: "excellent" | "good" | "warning" | "poor"
  }
  children?: OrgNode[]
  metrics?: {
    inovasi: number
    komunikasi: number
    networking: number
    learning: number
  }
  isDashedConnection?: boolean
}

const organizationData: OrgNode = {
  id: "1",
  name: "Kepala Lembaga Administrasi Negara",
  position: "Kepala LAN",
  department: "LAN",
  level: 1,
  kpi: {
    target: 100,
    achieved: 92,
    status: "excellent"
  },

  children: [
    {
      id: "3",
      name: "Sekretaris Utama",
      position: "Sekretaris Utama",
      department: "SETAMA",
      level: 2,
      kpi: {
        target: 100,
        achieved: 88,
        status: "good"
      },

      
      children: [
        {
          id: "2",
          name: "Inspektorat",
          position: "Inspektur",
          department: "INSPEKTORAT", 
          level: 3,
          kpi: {
            target: 100,
            achieved: 86,
            status: "good"
          },
          metrics: {
            inovasi: 82,
            komunikasi: 88,
            networking: 85,
            learning: 89
          }
        },
        {
          id: "4",
          name: "Biro Perencanaan dan Keuangan",
          position: "Kepala Biro",
          department: "SETAMA",
          level: 3,
          kpi: {
            target: 100,
            achieved: 85,
            status: "good"
          },
          metrics: {
            inovasi: 82,
            komunikasi: 88,
            networking: 85,
            learning: 87
          }
        },
        {
          id: "5",
          name: "Biro Hukum, Organisasi dan Sumber Daya Manusia",
          position: "Kepala Biro",
          department: "SETAMA",
          level: 3,
          kpi: {
            target: 100,
            achieved: 90,
            status: "excellent"
          },
          metrics: {
            inovasi: 88,
            komunikasi: 95,
            networking: 89,
            learning: 92
          }
        },
        {
          id: "6",
          name: "Biro Umum, Kerjasama dan Humas",
          position: "Kepala Biro",
          department: "SETAMA",
          level: 3,
          kpi: {
            target: 100,
            achieved: 89,
            status: "good"
          },
          metrics: {
            inovasi: 85,
            komunikasi: 93,
            networking: 87,
            learning: 95
          }
        }
      ]
    },
    {
      id: "7",
      name: "Deputi Bidang Peningkatan Kualitas Kebijakan Administrasi Negara",
      position: "Deputi",
      department: "DEPUTI I",
      level: 2,
      kpi: {
        target: 100,
        achieved: 94,
        status: "excellent"
      },
 
      children: [
        {
          id: "8",
          name: "Direktorat Strategi Peningkatan Kualitas Kebijakan Adm Negara",
          position: "Direktur",
          department: "DEPUTI I",
          level: 3,
          kpi: {
            target: 100,
            achieved: 92,
            status: "excellent"
          },
          metrics: {
            inovasi: 95,
            komunikasi: 88,
            networking: 90,
            learning: 82
          }
        },
        {
          id: "9",
          name: "Direktorat Advokasi dan Pengembangan Kinerja Kebijakan",
          position: "Direktur",
          department: "DEPUTI I",
          level: 3,
          kpi: {
            target: 100,
            achieved: 96,
            status: "excellent"
          },
          metrics: {
            inovasi: 100,
            komunikasi: 92,
            networking: 94,
            learning: 88
          }
        },
        {
          id: "10",
          name: "Direktorat Penguatan KapasitasJabatan Fungsional",
          position: "Direktur",
          department: "DEPUTI I",
          level: 3,
          kpi: {
            target: 100,
            achieved: 93,
            status: "excellent"
          },
          metrics: {
            inovasi: 95,
            komunikasi: 90,
            networking: 92,
            learning: 85
          }
        }
      ]
    },
    {
      id: "11",
      name: "Deputi Bidang Transformasi Pembelajaran Aparatur Sipil Negara",
      position: "Deputi",
      department: "DEPUTI II",
      level: 2,
      kpi: {
        target: 100,
        achieved: 87,
        status: "good"
      },
  
      children: [
        {
          id: "12",
          name: "Direktorat Sistem Pembelajaran Terintegrasi ",
          position: "Direktur",
          department: "DEPUTI II",
          level: 3,
          kpi: {
            target: 100,
            achieved: 89,
            status: "good"
          },
          metrics: {
            inovasi: 87,
            komunikasi: 92,
            networking: 88,
            learning: 95
          }
        },
        {
          id: "13",
          name: "Direktorat Ekosistem Pembelajaran ASN",
          position: "Direktur",
          department: "DEPUTI II",
          level: 3,
          kpi: {
            target: 100,
            achieved: 85,
            status: "good"
          },
          metrics: {
            inovasi: 83,
            komunikasi: 88,
            networking: 87,
            learning: 90
          }
        },
        {
          id: "14",
          name: "Direktorat Teknologi dan Digitalisasi Pembelajaran",
          position: "Direktur",
          department: "DEPUTI II",
          level: 3,
          kpi: {
            target: 100,
            achieved: 87,
            status: "good"
          },
          metrics: {
            inovasi: 85,
            komunikasi: 90,
            networking: 89,
            learning: 92
          }
        }
      ]
    },
    {
      id: "15",
      name: "Deputi Bidang Penyelenggaraan Pengembangan Kapasitas ASN",
      position: "Deputi",
      department: "DEPUTI III",
      level: 2,
      kpi: {
        target: 100,
        achieved: 79,
        status: "warning"
      },
  
      children: [
        {
          id: "16",
          name: "Direktorat Pembelajaran Manajerial Kepemimpinan",
          position: "Direktur",
          department: "DEPUTI III",
          level: 3,
          kpi: {
            target: 100,
            achieved: 81,
            status: "good"
          },
          metrics: {
            inovasi: 78,
            komunikasi: 85,
            networking: 82,
            learning: 80
          }
        },
        {
          id: "17",
          name: "Direktorat Pembelajaran Karakter dan Sosial Kultural",
          position: "Direktur",
          department: "DEPUTI III",
          level: 3,
          kpi: {
            target: 100,
            achieved: 77,
            status: "warning"
          },
          metrics: {
            inovasi: 72,
            komunikasi: 80,
            networking: 78,
            learning: 76
          }
        },
        {
          id: "18",
          name: "Direktorat Pembelajaran Teknis dan Fungsional Terintegrasi",
          position: "Asisten Deputi",
          department: "DEPUTI III",
          level: 3,
          kpi: {
            target: 100,
            achieved: 79,
            status: "warning"
          },
          metrics: {
            inovasi: 75,
            komunikasi: 82,
            networking: 80,
            learning: 78
          }
        }
      ]
    },
    {
      id: "19",
      name: "Deputi Bidang Penjaminan Mutu Pengembangan Kapasitas dan Pembelajaran ASN",
      position: "Deputi",
      department: "DEPUTI IV",
      level: 2,
      kpi: {
        target: 100,
        achieved: 84,
        status: "good"
      },

      children: [
        {
          id: "20",
          name: "Direktorat Penjaminan Mutu Pembelajaran",
          position: "Direktur",
          department: "DEPUTI IV",
          level: 3,
          kpi: {
            target: 100,
            achieved: 86,
            status: "good"
          },
          metrics: {
            inovasi: 82,
            komunikasi: 87,
            networking: 84,
            learning: 92
          }
        },
        {
          id: "21",
          name: "Direktorat Penjaminan Mutu Pengembangan Kapasitas",
          position: "Asisten Deputi",
          department: "DEPUTI IV",
          level: 3,
          kpi: {
            target: 100,
            achieved: 82,
            status: "good"
          },
          metrics: {
            inovasi: 78,
            komunikasi: 83,
            networking: 80,
            learning: 88
          }
        },
        {
      id: "22",
      name: "Kepala Pusat Data dan Informasi",
      position: "Kepala Pusat",
      department: "PUSAT",
      level: 3,
      kpi: {
        target: 100,
        achieved: 89,
        status: "good"
      },
      metrics: {
        inovasi: 87,
        komunikasi: 91,
        networking: 88,
        learning: 90
      },
      isDashedConnection: true
    },
    {
      id: "23",
      name: "Kepala Pusat Pembelajaran dan Strategi Kebijakan Manajemen Kinerja",
      position: "Kepala Pusat",
      department: "PUSAT",
      level: 3,
      kpi: {
        target: 100,
        achieved: 91,
        status: "excellent"
      },
      metrics: {
        inovasi: 93,
        komunikasi: 89,
        networking: 90,
        learning: 92
      },
      isDashedConnection: true
    },
    {
      id: "24",
      name: "Kepala Pusat Pembelajaran dan Strategi Kebijakan Manajemen Pemerintahan",
      position: "Kepala Pusat",
      department: "PUSAT",
      level: 3,
      kpi: {
        target: 100,
        achieved: 88,
        status: "good"
      },
      metrics: {
        inovasi: 86,
        komunikasi: 90,
        networking: 87,
        learning: 89
      },
      isDashedConnection: true
    },
    {
      id: "25",
      name: "Kepala Pusat Pembelajaran dan Strategi Kebijakan Pelayanan Publik",
      position: "Kepala Pusat",
      department: "PUSAT",
      level: 3,
      kpi: {
        target: 100,
        achieved: 90,
        status: "excellent"
      },
      metrics: {
        inovasi: 92,
        komunikasi: 88,
        networking: 89,
        learning: 91
      },
      isDashedConnection: true
    },
    {
      id: "26",
      name: "Kepala Pusat Pembelajaran dan Strategi Kebijakan Talenta ASN",
      position: "Kepala Pusat",
      department: "PUSAT",
      level: 3,
      kpi: {
        target: 100,
        achieved: 87,
        status: "good"
      },
      metrics: {
        inovasi: 85,
        komunikasi: 89,
        networking: 86,
        learning: 88
      },
      isDashedConnection: true
    },
    // Polytechnic directors with dashed connection
    {
      id: "27",
      name: "Direktur Politeknik STIA LAN Jakarta",
      position: "Direktur",
      department: "POLTEK",
      level: 3,
      kpi: {
        target: 100,
        achieved: 85,
        status: "good"
      },
      metrics: {
        inovasi: 83,
        komunikasi: 87,
        networking: 84,
        learning: 86
      },
      isDashedConnection: true
    },
    {
      id: "28",
      name: "Direktur Politeknik STIA LAN Bandung",
      position: "Direktur",
      department: "POLTEK",
      level: 3,
      kpi: {
        target: 100,
        achieved: 88,
        status: "good"
      },
      metrics: {
        inovasi: 86,
        komunikasi: 90,
        networking: 87,
        learning: 89
      },
      isDashedConnection: true
    },
    {
      id: "29",
      name: "Direktur Politeknik STIA LAN Makassar",
      position: "Direktur",
      department: "POLTEK",
      level: 3,
      kpi: {
        target: 100,
        achieved: 84,
        status: "good"
      },
      metrics: {
        inovasi: 82,
        komunikasi: 86,
        networking: 83,
        learning: 85
      },
      isDashedConnection: true
    },

      ]
    }
  ]
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "excellent":
      return "bg-green-500 text-white border-green-600"
    case "good":
      return "bg-blue-500 text-white border-blue-600"
    case "warning":
      return "bg-yellow-500 text-white border-yellow-600"
    case "poor":
      return "bg-red-500 text-white border-red-600"
    default:
      return "bg-gray-500 text-white border-gray-600"
  }
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case "excellent":
      return <Star className="w-2.5 h-2.5" />
    case "good":
      return <CheckCircle className="w-2.5 h-2.5" />
    case "warning":
      return <Clock className="w-2.5 h-2.5" />
    case "poor":
      return <AlertTriangle className="w-2.5 h-2.5" />
    default:
      return <Activity className="w-2.5 h-2.5" />
  }
}

const getDepartmentColor = (department: string) => {
  switch (department) {
    case "LAN":
      return "bg-gradient-to-r from-purple-600 to-indigo-600"
    case "INSPEKTORAT":
      return "bg-gradient-to-r from-red-600 to-rose-600"
    case "SETAMA":
      return "bg-gradient-to-r from-green-500 to-emerald-500"
    case "DEPUTI I":
      return "bg-gradient-to-r from-yellow-500 to-orange-500"
    case "DEPUTI II":
      return "bg-gradient-to-r from-pink-500 to-red-500"
    case "DEPUTI III":
      return "bg-gradient-to-r from-cyan-500 to-blue-500"
    case "DEPUTI IV":
      return "bg-gradient-to-r from-violet-500 to-purple-500"
    case "PUSAT":
      return "bg-gradient-to-r from-indigo-500 to-purple-500"
    case "POLTEK":
      return "bg-gradient-to-r from-orange-500 to-red-500"
    default:
      return "bg-gradient-to-r from-gray-500 to-gray-600"
  }
}

function OrgChart({ node }: { 
  node: OrgNode; 
}) {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set(['1', '3', '7', '11', '15', '19']))

  const toggleNode = (id: string) => {
    const newExpanded = new Set(expandedNodes)
    if (newExpanded.has(id)) {
      newExpanded.delete(id)
    } else {
      newExpanded.add(id)
    }
    setExpandedNodes(newExpanded)
  }

  const isNodeExpanded = expandedNodes.has(node.id)

  // Separate different types of children
  const regularChildren = node.children?.filter(child => !child.isDashedConnection && child.level !== 2) || []
  const level2Nodes = node.children?.filter(child => !child.isDashedConnection && child.level === 2) || []
  const pusatNodes = node.children?.filter(child => child.isDashedConnection && child.department === 'PUSAT') || []
  const polytechnicDirectors = node.children?.filter(child => child.isDashedConnection && child.department === 'POLTEK') || []

  return (
    <div className="flex flex-col items-center">
      {/* Node Card */}
      <div className={`relative bg-white rounded-lg shadow-md border-2 p-2 mb-3 w-40 transition-all duration-300 hover:shadow-lg hover:scale-102 ${
        node.level === 1 ? 'border-purple-300' : 
        node.level === 2 ? 'border-blue-300' : 'border-gray-300'
      }`}>
        {/* Department Header */}
        <div className={`absolute -top-1.5 left-2 px-1.5 py-0.5 rounded-full text-xs font-bold text-white ${getDepartmentColor(node.department)}`}>
          {node.department}
        </div>

        {/* Main Content */}
        <div className="mt-1">
          <div className="flex flex-col mb-1">
            <div className="flex items-center justify-between">
              <Building2 className="w-3 h-3 text-gray-600" />
              {((regularChildren.length > 0) || (level2Nodes.length > 0) || (pusatNodes.length > 0) || (polytechnicDirectors.length > 0)) && (
                <button
                  onClick={() => toggleNode(node.id)}
                  className="p-0.5 rounded-full hover:bg-gray-100 transition-colors"
                >
                  {isNodeExpanded ? (
                    <ChevronDown className="w-3 h-3 text-gray-600" />
                  ) : (
                    <ChevronRight className="w-3 h-3 text-gray-600" />
                  )}
                </button>
              )}
            </div>
            <h3 className="font-bold text-gray-800 text-xs leading-tight mt-1">{node.name}</h3>
          </div>

          <p className="text-xs text-gray-600 mb-2">{node.position}</p>

          {/* KPI Section */}
          <div className="mb-2">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-gray-700">KPI</span>
              <div className={`flex items-center px-1 py-0.5 rounded-full text-xs font-bold ${getStatusColor(node.kpi.status)}`}>
                {getStatusIcon(node.kpi.status)}
                <span className="ml-1">{node.kpi.achieved}%</span>
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1">
              <div 
                className={`h-1 rounded-full transition-all duration-500 ${
                  node.kpi.status === 'excellent' ? 'bg-green-500' :
                  node.kpi.status === 'good' ? 'bg-blue-500' :
                  node.kpi.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${node.kpi.achieved}%` }}
              ></div>
            </div>
          </div>

          {/* Metrics */}
          {node.metrics && (
            <div className="grid grid-cols-1 gap-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-1 h-1 bg-yellow-500 rounded-full mr-1"></div>
                  <span className="text-xs text-gray-600">Inovasi</span>
                </div>
                <span className="text-xs font-medium text-gray-800">{node.metrics.inovasi}%</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-1 h-1 bg-pink-500 rounded-full mr-1"></div>
                  <span className="text-xs text-gray-600">Komunikasi</span>
                </div>
                <span className="text-xs font-medium text-gray-800">{node.metrics.komunikasi}%</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-1 h-1 bg-cyan-500 rounded-full mr-1"></div>
                  <span className="text-xs text-gray-600">Networking</span>
                </div>
                <span className="text-xs font-medium text-gray-800">{node.metrics.networking}%</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-1 h-1 bg-green-500 rounded-full mr-1"></div>
                  <span className="text-xs text-gray-600">Learning</span>
                </div>
                <span className="text-xs font-medium text-gray-800">{node.metrics.learning}%</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Connection Lines and Children */}
      {((regularChildren.length > 0) || (level2Nodes.length > 0) || (pusatNodes.length > 0) || (polytechnicDirectors.length > 0)) && isNodeExpanded && (
        <div className="relative">
          {/* Level 2 Nodes (Deputi) - Horizontal Layout */}
          {level2Nodes.length > 0 && (
            <div className="mt-4">
              {/* Vertical connector */}
              <div className="w-px h-4 bg-gray-300 mx-auto"></div>
              
              {/* Horizontal line for level 2 nodes */}
              <div className="flex items-center mb-2">
                <div className="h-px bg-gray-300 flex-1"></div>
                <div className="w-1.5 h-1.5 bg-gray-300 rounded-full"></div>
                <div className="h-px bg-gray-300 flex-1"></div>
              </div>

              {/* Level 2 Container - All Horizontal */}
              <div className="flex justify-center space-x-3 flex-wrap gap-y-4">
                {/* Render Level 2 nodes (Deputi) */}
                {level2Nodes.map((level2Node) => (
                  <div key={level2Node.id} className="relative">
                    {/* Vertical connector to level 2 node */}
                    <div className="w-px h-4 bg-gray-300 mx-auto -mt-2"></div>
                    <OrgChart 
                      node={level2Node} 
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Regular Children */}
          {regularChildren.length > 0 && (
            <>
              {/* Vertical Line */}
              <div className="w-px h-4 bg-gray-300 mx-auto"></div>
              
              {/* Horizontal Line */}
              {regularChildren.length > 1 && (
                <div className="flex items-center">
                  <div className="h-px bg-gray-300 flex-1"></div>
                  <div className="w-1.5 h-1.5 bg-gray-300 rounded-full"></div>
                  <div className="h-px bg-gray-300 flex-1"></div>
                </div>
              )}

              {/* Regular Children Container */}
              <div className={`flex ${
                regularChildren.length > 3 ? 'flex-wrap justify-center gap-2' : 
                regularChildren.length > 1 ? 'justify-center space-x-2' : 'justify-center'
              } mt-2`}>
                {regularChildren.map((child) => (
                  <div key={child.id} className="relative">
                    {/* Vertical connector to child */}
                    <div className="w-px h-4 bg-gray-300 mx-auto -mt-2"></div>
                    <OrgChart 
                      node={child} 
                    />
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Kepala Pusat - Horizontal Layout */}
          {pusatNodes.length > 0 && (
            <div className="mt-8">
              {/* Dashed connector line to pusat section */}
              <div className="flex flex-col items-center">
                <div className="w-px h-6 border-l-2 border-dashed border-gray-400 mx-auto"></div>
                <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full mb-4">
                  Kepala Pusat
                </div>
              </div>
              
              {/* Horizontal line for kepala pusat */}
              <div className="flex items-center mb-2">
                <div className="h-px border-t-2 border-dashed border-gray-400 flex-1"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full mx-2"></div>
                <div className="h-px border-t-2 border-dashed border-gray-400 flex-1"></div>
              </div>

              {/* Kepala Pusat Container - All Horizontal */}
              <div className="flex justify-center space-x-4 flex-wrap gap-y-4">
                {pusatNodes.map((pusat) => (
                  <div key={pusat.id} className="relative">
                    {/* Dashed vertical connector to pusat */}
                    <div className="w-px h-4 border-l-2 border-dashed border-gray-400 mx-auto -mt-2"></div>
                    
                    {/* Pusat Node */}
                    <div className={`relative bg-white rounded-lg shadow-md border-2 border-dashed border-indigo-400 p-2 w-40 transition-all duration-300 hover:shadow-lg hover:scale-102`}>
                      {/* Department Header */}
                      <div className="absolute -top-1.5 left-2 px-1.5 py-0.5 rounded-full text-xs font-bold text-white bg-gradient-to-r from-indigo-500 to-purple-500">
                        PUSAT
                      </div>

                      {/* Main Content */}
                      <div className="mt-1">
                        <div className="flex flex-col mb-1">
                          <div className="flex items-center justify-between">
                            <Building2 className="w-3 h-3 text-indigo-600" />
                          </div>
                          <h3 className="font-bold text-gray-800 text-xs leading-tight mt-1">{pusat.name}</h3>
                        </div>

                        <p className="text-xs text-gray-600 mb-2">{pusat.position}</p>

                        {/* KPI Section */}
                        <div className="mb-2">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-medium text-gray-700">KPI</span>
                            <div className={`flex items-center px-1 py-0.5 rounded-full text-xs font-bold ${getStatusColor(pusat.kpi.status)}`}>
                              {getStatusIcon(pusat.kpi.status)}
                              <span className="ml-1">{pusat.kpi.achieved}%</span>
                            </div>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-1">
                            <div 
                              className={`h-1 rounded-full transition-all duration-500 ${
                                pusat.kpi.status === 'excellent' ? 'bg-green-500' :
                                pusat.kpi.status === 'good' ? 'bg-blue-500' :
                                pusat.kpi.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${pusat.kpi.achieved}%` }}
                            ></div>
                          </div>
                        </div>

                        {/* Metrics */}
                        <div className="space-y-1">
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-gray-600">Inovasi</span>
                            <span className="text-xs font-semibold text-purple-600">{pusat.metrics?.inovasi || 0}%</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-gray-600">Komunikasi</span>
                            <span className="text-xs font-semibold text-blue-600">{pusat.metrics?.komunikasi || 0}%</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-gray-600">Networking</span>
                            <span className="text-xs font-semibold text-green-600">{pusat.metrics?.networking || 0}%</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-gray-600">Learning</span>
                            <span className="text-xs font-semibold text-orange-600">{pusat.metrics?.learning || 0}%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Polytechnic Directors - Horizontal Layout */}
          {polytechnicDirectors.length > 0 && (
            <div className="mt-8">
              {/* Dashed connector line to polytechnic section */}
              <div className="flex flex-col items-center">
                <div className="w-px h-6 border-l-2 border-dashed border-gray-400 mx-auto"></div>
                <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full mb-4">
                  Politeknik STIA LAN
                </div>
              </div>
              
              {/* Horizontal line for polytechnic directors */}
              <div className="flex items-center mb-2">
                <div className="h-px border-t-2 border-dashed border-gray-400 flex-1"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full mx-2"></div>
                <div className="h-px border-t-2 border-dashed border-gray-400 flex-1"></div>
              </div>

              {/* Polytechnic Directors Container - All Horizontal */}
              <div className="flex justify-center space-x-4">
                {polytechnicDirectors.map((director) => (
                  <div key={director.id} className="relative">
                    {/* Dashed vertical connector to director */}
                    <div className="w-px h-4 border-l-2 border-dashed border-gray-400 mx-auto -mt-2"></div>
                    
                    {/* Director Node */}
                    <div className={`relative bg-white rounded-lg shadow-md border-2 border-dashed border-orange-400 p-2 w-40 transition-all duration-300 hover:shadow-lg hover:scale-102`}>
                      {/* Department Header */}
                      <div className="absolute -top-1.5 left-2 px-1.5 py-0.5 rounded-full text-xs font-bold text-white bg-gradient-to-r from-orange-500 to-red-500">
                        POLTEK
                      </div>

                      {/* Main Content */}
                      <div className="mt-1">
                        <div className="flex flex-col mb-1">
                          <div className="flex items-center justify-between">
                            <Building2 className="w-3 h-3 text-orange-600" />
                          </div>
                          <h3 className="font-bold text-gray-800 text-xs leading-tight mt-1">{director.name}</h3>
                        </div>

                        <p className="text-xs text-gray-600 mb-2">{director.position}</p>

                        {/* KPI Section */}
                        <div className="mb-2">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-medium text-gray-700">KPI</span>
                            <div className={`flex items-center px-1 py-0.5 rounded-full text-xs font-bold ${getStatusColor(director.kpi.status)}`}>
                              {getStatusIcon(director.kpi.status)}
                              <span className="ml-1">{director.kpi.achieved}%</span>
                            </div>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-1">
                            <div 
                              className={`h-1 rounded-full transition-all duration-500 ${
                                director.kpi.status === 'excellent' ? 'bg-green-500' :
                                director.kpi.status === 'good' ? 'bg-blue-500' :
                                director.kpi.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${director.kpi.achieved}%` }}
                            ></div>
                          </div>
                        </div>

                        {/* Metrics */}
                        {director.metrics && (
                          <div className="grid grid-cols-1 gap-1">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center">
                                <div className="w-1 h-1 bg-yellow-500 rounded-full mr-1"></div>
                                <span className="text-xs text-gray-600">Inovasi</span>
                              </div>
                              <span className="text-xs font-medium text-gray-800">{director.metrics.inovasi}%</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center">
                                <div className="w-1 h-1 bg-pink-500 rounded-full mr-1"></div>
                                <span className="text-xs text-gray-600">Komunikasi</span>
                              </div>
                              <span className="text-xs font-medium text-gray-800">{director.metrics.komunikasi}%</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center">
                                <div className="w-1 h-1 bg-cyan-500 rounded-full mr-1"></div>
                                <span className="text-xs text-gray-600">Networking</span>
                              </div>
                              <span className="text-xs font-medium text-gray-800">{director.metrics.networking}%</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center">
                                <div className="w-1 h-1 bg-green-500 rounded-full mr-1"></div>
                                <span className="text-xs text-gray-600">Learning</span>
                              </div>
                              <span className="text-xs font-medium text-gray-800">{director.metrics.learning}%</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function StatistikPage() {
  // Calculate overall statistics
  const getAllNodes = (node: OrgNode): OrgNode[] => {
    const nodes = [node]
    if (node.children) {
      node.children.forEach(child => {
        nodes.push(...getAllNodes(child))
      })
    }
    return nodes
  }

  const allNodes = getAllNodes(organizationData)
  const totalNodes = allNodes.length
  const excellentNodes = allNodes.filter(node => node.kpi.status === 'excellent').length
  const goodNodes = allNodes.filter(node => node.kpi.status === 'good').length
  const warningNodes = allNodes.filter(node => node.kpi.status === 'warning').length
  const poorNodes = allNodes.filter(node => node.kpi.status === 'poor').length

  const averageKPI = Math.round(allNodes.reduce((sum, node) => sum + node.kpi.achieved, 0) / totalNodes)

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Pohon Kinerja Organisasi LAN</h1>
        <p className="text-gray-600">Visualisasi struktur organisasi Lembaga Administrasi Negara dengan metrik kinerja real-time</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Unit</p>
              <p className="text-2xl font-bold text-purple-600">{totalNodes}</p>
            </div>
            <Users className="w-8 h-8 text-purple-500" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Excellent</p>
              <p className="text-2xl font-bold text-green-600">{excellentNodes}</p>
            </div>
            <Star className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Good</p>
              <p className="text-2xl font-bold text-blue-600">{goodNodes}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Warning</p>
              <p className="text-2xl font-bold text-yellow-600">{warningNodes}</p>
            </div>
            <Clock className="w-8 h-8 text-yellow-500" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-red-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Poor</p>
              <p className="text-2xl font-bold text-red-600">{poorNodes}</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>
        </div>
      </div>

      {/* Organization Chart */}
      <div className="bg-white rounded-xl shadow-lg p-4 overflow-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-800">Struktur Organisasi & Kinerja</h2>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Target className="w-4 h-4" />
            <span>Rata-rata KPI: {averageKPI}%</span>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 mb-6 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
            <span className="text-xs text-gray-600">Excellent (90-100%)</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
            <span className="text-xs text-gray-600">Good (80-89%)</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
            <span className="text-xs text-gray-600">Warning (70-79%)</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
            <span className="text-xs text-gray-600">Poor (&lt;70%)</span>
          </div>
        </div>

        {/* Org Chart - Portrait Layout */}
        <div className="flex justify-center">
          <OrgChart 
            node={organizationData} 
          />
        </div>
      </div>

      {/* Performance Insights */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-green-500" />
            Top Performers
          </h3>
          <div className="space-y-3">
            {allNodes
              .filter(node => node.kpi.status === 'excellent')
              .sort((a, b) => b.kpi.achieved - a.kpi.achieved)
              .slice(0, 3)
              .map((node, index) => (
                <div key={node.id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-gray-800 text-sm">{node.name}</p>
                      <p className="text-xs text-gray-600">{node.department}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">{node.kpi.achieved}%</p>
                    <p className="text-xs text-gray-500">KPI</p>
                  </div>
                </div>
              ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
            <AlertTriangle className="w-5 h-5 mr-2 text-red-500" />
            Needs Attention
          </h3>
          <div className="space-y-3">
            {allNodes
              .filter(node => node.kpi.status === 'poor' || node.kpi.status === 'warning')
              .sort((a, b) => a.kpi.achieved - b.kpi.achieved)
              .slice(0, 3)
              .map((node, index) => (
                <div key={node.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-gray-800 text-sm">{node.name}</p>
                      <p className="text-xs text-gray-600">{node.department}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-red-600">{node.kpi.achieved}%</p>
                    <p className="text-xs text-gray-500">KPI</p>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  )
}