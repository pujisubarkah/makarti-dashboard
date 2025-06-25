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
}

const organizationData: OrgNode = {
  id: "1",
  name: "Kepala Pusat Data dan Informasi",
  position: "Kepala Pusat",
  department: "PUSDATIN",
  level: 1,
  kpi: {
    target: 100,
    achieved: 95,
    status: "excellent"
  },
  metrics: {
    inovasi: 98,
    komunikasi: 92,
    networking: 95,
    learning: 90
  },
  children: [
    {
      id: "2",
      name: "Koordinator Bidang Inovasi",
      position: "Koordinator",
      department: "Inovasi",
      level: 2,
      kpi: {
        target: 100,
        achieved: 92,
        status: "excellent"
      },
      metrics: {
        inovasi: 95,
        komunikasi: 88,
        networking: 90,
        learning: 85
      },
      children: [
        {
          id: "3",
          name: "Tim Pengembangan Inovasi",
          position: "Staff",
          department: "Inovasi",
          level: 3,
          kpi: {
            target: 100,
            achieved: 88,
            status: "good"
          },
          metrics: {
            inovasi: 92,
            komunikasi: 85,
            networking: 87,
            learning: 82
          }
        },
        {
          id: "4",
          name: "Tim Implementasi",
          position: "Staff",
          department: "Inovasi",
          level: 3,
          kpi: {
            target: 100,
            achieved: 85,
            status: "good"
          },
          metrics: {
            inovasi: 88,
            komunikasi: 82,
            networking: 85,
            learning: 80
          }
        }
      ]
    },
    {
      id: "5",
      name: "Koordinator Bidang Komunikasi",
      position: "Koordinator",
      department: "Komunikasi",
      level: 2,
      kpi: {
        target: 100,
        achieved: 78,
        status: "warning"
      },
      metrics: {
        inovasi: 75,
        komunikasi: 85,
        networking: 80,
        learning: 70
      },
      children: [
        {
          id: "6",
          name: "Tim Media & Branding",
          position: "Staff",
          department: "Komunikasi",
          level: 3,
          kpi: {
            target: 100,
            achieved: 82,
            status: "good"
          },
          metrics: {
            inovasi: 78,
            komunikasi: 88,
            networking: 82,
            learning: 75
          }
        },
        {
          id: "7",
          name: "Tim Sosialisasi",
          position: "Staff",
          department: "Komunikasi",
          level: 3,
          kpi: {
            target: 100,
            achieved: 74,
            status: "warning"
          },
          metrics: {
            inovasi: 72,
            komunikasi: 82,
            networking: 78,
            learning: 65
          }
        }
      ]
    },
    {
      id: "8",
      name: "Koordinator Bidang Networking",
      position: "Koordinator",
      department: "Networking",
      level: 2,
      kpi: {
        target: 100,
        achieved: 90,
        status: "excellent"
      },
      metrics: {
        inovasi: 85,
        komunikasi: 90,
        networking: 95,
        learning: 88
      },
      children: [
        {
          id: "9",
          name: "Tim Kunjungan Instansi",
          position: "Staff",
          department: "Networking",
          level: 3,
          kpi: {
            target: 100,
            achieved: 87,
            status: "good"
          },
          metrics: {
            inovasi: 82,
            komunikasi: 88,
            networking: 92,
            learning: 85
          }
        },
        {
          id: "10",
          name: "Tim Koordinasi",
          position: "Staff",
          department: "Networking",
          level: 3,
          kpi: {
            target: 100,
            achieved: 93,
            status: "excellent"
          },
          metrics: {
            inovasi: 88,
            komunikasi: 92,
            networking: 98,
            learning: 90
          }
        }
      ]
    },
    {
      id: "11",
      name: "Koordinator Bidang Learning",
      position: "Koordinator",
      department: "Learning",
      level: 2,
      kpi: {
        target: 100,
        achieved: 65,
        status: "poor"
      },
      metrics: {
        inovasi: 60,
        komunikasi: 68,
        networking: 65,
        learning: 70
      },
      children: [
        {
          id: "12",
          name: "Tim Pelatihan",
          position: "Staff",
          department: "Learning",
          level: 3,
          kpi: {
            target: 100,
            achieved: 70,
            status: "warning"
          },
          metrics: {
            inovasi: 65,
            komunikasi: 72,
            networking: 68,
            learning: 75
          }
        },
        {
          id: "13",
          name: "Tim Pengembangan SDM",
          position: "Staff",
          department: "Learning",
          level: 3,
          kpi: {
            target: 100,
            achieved: 60,
            status: "poor"
          },
          metrics: {
            inovasi: 55,
            komunikasi: 64,
            networking: 62,
            learning: 65
          }
        }
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
      return <Star className="w-4 h-4" />
    case "good":
      return <CheckCircle className="w-4 h-4" />
    case "warning":
      return <Clock className="w-4 h-4" />
    case "poor":
      return <AlertTriangle className="w-4 h-4" />
    default:
      return <Activity className="w-4 h-4" />
  }
}

const getDepartmentColor = (department: string) => {
  switch (department) {
    case "PUSDATIN":
      return "bg-gradient-to-r from-purple-600 to-indigo-600"
    case "Inovasi":
      return "bg-gradient-to-r from-yellow-500 to-orange-500"
    case "Komunikasi":
      return "bg-gradient-to-r from-pink-500 to-red-500"
    case "Networking":
      return "bg-gradient-to-r from-cyan-500 to-blue-500"
    case "Learning":
      return "bg-gradient-to-r from-green-500 to-emerald-500"
    default:
      return "bg-gradient-to-r from-gray-500 to-gray-600"
  }
}

function OrgChart({ node, onToggle }: { 
  node: OrgNode; 
  onToggle: (id: string) => void;
}) {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set(['1', '2', '5', '8', '11']))

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

  return (
    <div className="flex flex-col items-center">
      {/* Node Card */}
      <div className={`relative bg-white rounded-xl shadow-lg border-2 p-6 mb-6 min-w-80 max-w-96 transition-all duration-300 hover:shadow-xl hover:scale-105 ${
        node.level === 1 ? 'border-purple-300' : 
        node.level === 2 ? 'border-blue-300' : 'border-gray-300'
      }`}>
        {/* Department Header */}
        <div className={`absolute -top-3 left-4 px-3 py-1 rounded-full text-xs font-bold text-white ${getDepartmentColor(node.department)}`}>
          {node.department}
        </div>

        {/* Main Content */}
        <div className="mt-2">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center">
              <Building2 className="w-5 h-5 text-gray-600 mr-2" />
              <h3 className="font-bold text-gray-800 text-sm">{node.name}</h3>
            </div>
            {node.children && node.children.length > 0 && (
              <button
                onClick={() => toggleNode(node.id)}
                className="p-1 rounded-full hover:bg-gray-100 transition-colors"
              >
                {isNodeExpanded ? (
                  <ChevronDown className="w-4 h-4 text-gray-600" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-gray-600" />
                )}
              </button>
            )}
          </div>

          <p className="text-xs text-gray-600 mb-3">{node.position}</p>

          {/* KPI Section */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-gray-700">KPI Performance</span>
              <div className={`flex items-center px-2 py-1 rounded-full text-xs font-bold ${getStatusColor(node.kpi.status)}`}>
                {getStatusIcon(node.kpi.status)}
                <span className="ml-1">{node.kpi.achieved}%</span>
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-500 ${
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
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></div>
                <span className="text-xs text-gray-600">Inovasi: {node.metrics.inovasi}%</span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-pink-500 rounded-full mr-2"></div>
                <span className="text-xs text-gray-600">Komunikasi: {node.metrics.komunikasi}%</span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-cyan-500 rounded-full mr-2"></div>
                <span className="text-xs text-gray-600">Networking: {node.metrics.networking}%</span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                <span className="text-xs text-gray-600">Learning: {node.metrics.learning}%</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Connection Lines and Children */}
      {node.children && node.children.length > 0 && isNodeExpanded && (
        <div className="relative">
          {/* Vertical Line */}
          <div className="w-px h-8 bg-gray-300 mx-auto"></div>
          
          {/* Horizontal Line */}
          {node.children.length > 1 && (
            <div className="flex items-center">
              <div className="h-px bg-gray-300 flex-1"></div>
              <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
              <div className="h-px bg-gray-300 flex-1"></div>
            </div>
          )}

          {/* Children Container */}
          <div className={`flex ${node.children.length > 1 ? 'justify-center space-x-8' : 'justify-center'} mt-4`}>
            {node.children.map((child) => (
              <div key={child.id} className="relative">
                {/* Vertical connector to child */}
                <div className="w-px h-8 bg-gray-300 mx-auto -mt-4"></div>
                <OrgChart 
                  node={child} 
                  onToggle={toggleNode}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
)
}

export default function StatistikPage() {
  const [selectedMetric, setSelectedMetric] = useState<string>("all")

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
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Pohon Kinerja Organisasi</h1>
        <p className="text-gray-600">Visualisasi struktur organisasi dengan metrik kinerja real-time</p>
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
      <div className="bg-white rounded-xl shadow-lg p-8 overflow-x-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-800">Struktur Organisasi & Kinerja</h2>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Target className="w-4 h-4" />
            <span>Rata-rata KPI: {averageKPI}%</span>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 mb-8 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-green-500 rounded-full mr-2"></div>
            <span className="text-xs text-gray-600">Excellent (90-100%)</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-blue-500 rounded-full mr-2"></div>
            <span className="text-xs text-gray-600">Good (80-89%)</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-yellow-500 rounded-full mr-2"></div>
            <span className="text-xs text-gray-600">Warning (70-79%)</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-red-500 rounded-full mr-2"></div>
            <span className="text-xs text-gray-600">Poor (&lt;70%)</span>
          </div>
        </div>

        {/* Org Chart */}
        <div className="min-w-full">
          <OrgChart 
            node={organizationData} 
            onToggle={() => {}}
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