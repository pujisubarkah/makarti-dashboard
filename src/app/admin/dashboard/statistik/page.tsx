"use client"

import { useState, useEffect } from "react"
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
  id: number
  name: string
  position_id: number
  department_id: number
  level: number
  parent_id: number | null
  org_positions: {
    id: number
    title: string
  }
  org_departments: {
    id: number
    name: string
    color: string
  }
  org_kpis: {
    id: number
    unit_id: number
    target: number
    achieved: number
    status: "excellent" | "good" | "warning" | "poor"
  } | null
  org_metrics: {
    id: number
    unit_id: number
    inovasi: number
    komunikasi: number
    networking: number
    learning: number
  } | null
  children?: OrgNode[]
  isDashedConnection?: boolean
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

function OrgChart({ node }: { 
  node: OrgNode; 
}) {
  const [expandedNodes, setExpandedNodes] = useState<Set<number>>(new Set([1, 3, 7, 11, 15, 19]))

  const toggleNode = (id: number) => {
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
  const pusatNodes = node.children?.filter(child => child.isDashedConnection && child.org_departments.name === 'PUSAT') || []
  const polytechnicDirectors = node.children?.filter(child => child.isDashedConnection && child.org_departments.name === 'POLTEK') || []

  return (
    <div className="flex flex-col items-center">
      {/* Node Card */}
      <div className={`relative bg-white rounded-lg shadow-md border-2 p-2 mb-3 w-40 transition-all duration-300 hover:shadow-lg hover:scale-102 ${
        node.level === 1 ? 'border-purple-300' : 
        node.level === 2 ? 'border-blue-300' : 'border-gray-300'
      }`}>
        {/* Department Header */}
        <div className={`absolute -top-1.5 left-2 px-1.5 py-0.5 rounded-full text-xs font-bold text-white ${node.org_departments.color}`}>
          {node.org_departments.name}
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

          <p className="text-xs text-gray-600 mb-2">{node.org_positions.title}</p>

          {/* KPI Section */}
          {node.org_kpis && (
            <div className="mb-2">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-gray-700">KPI</span>
                <div className={`flex items-center px-1 py-0.5 rounded-full text-xs font-bold ${getStatusColor(node.org_kpis.status)}`}>
                  {getStatusIcon(node.org_kpis.status)}
                  <span className="ml-1">{node.org_kpis.achieved}%</span>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1">
                <div 
                  className={`h-1 rounded-full transition-all duration-500 ${
                    node.org_kpis.status === 'excellent' ? 'bg-green-500' :
                    node.org_kpis.status === 'good' ? 'bg-blue-500' :
                    node.org_kpis.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${node.org_kpis.achieved}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Metrics */}
          {node.org_metrics && (
            <div className="grid grid-cols-1 gap-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-1 h-1 bg-yellow-500 rounded-full mr-1"></div>
                  <span className="text-xs text-gray-600">Inovasi</span>
                </div>
                <span className="text-xs font-medium text-gray-800">{node.org_metrics.inovasi}%</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-1 h-1 bg-pink-500 rounded-full mr-1"></div>
                  <span className="text-xs text-gray-600">Komunikasi</span>
                </div>
                <span className="text-xs font-medium text-gray-800">{node.org_metrics.komunikasi}%</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-1 h-1 bg-cyan-500 rounded-full mr-1"></div>
                  <span className="text-xs text-gray-600">Networking</span>
                </div>
                <span className="text-xs font-medium text-gray-800">{node.org_metrics.networking}%</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-1 h-1 bg-green-500 rounded-full mr-1"></div>
                  <span className="text-xs text-gray-600">Learning</span>
                </div>
                <span className="text-xs font-medium text-gray-800">{node.org_metrics.learning}%</span>
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

                        <p className="text-xs text-gray-600 mb-2">{pusat.org_positions.title}</p>

                        {/* KPI Section */}
                        {pusat.org_kpis && (
                          <div className="mb-2">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs font-medium text-gray-700">KPI</span>
                              <div className={`flex items-center px-1 py-0.5 rounded-full text-xs font-bold ${getStatusColor(pusat.org_kpis.status)}`}>
                                {getStatusIcon(pusat.org_kpis.status)}
                                <span className="ml-1">{pusat.org_kpis.achieved}%</span>
                              </div>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-1">
                              <div 
                                className={`h-1 rounded-full transition-all duration-500 ${
                                  pusat.org_kpis.status === 'excellent' ? 'bg-green-500' :
                                  pusat.org_kpis.status === 'good' ? 'bg-blue-500' :
                                  pusat.org_kpis.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                                }`}
                                style={{ width: `${pusat.org_kpis.achieved}%` }}
                              ></div>
                            </div>
                          </div>
                        )}

                        {/* Metrics */}
                        {pusat.org_metrics && (
                          <div className="space-y-1">
                            <div className="flex justify-between items-center">
                              <span className="text-xs text-gray-600">Inovasi</span>
                              <span className="text-xs font-semibold text-purple-600">{pusat.org_metrics.inovasi || 0}%</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-xs text-gray-600">Komunikasi</span>
                              <span className="text-xs font-semibold text-blue-600">{pusat.org_metrics.komunikasi || 0}%</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-xs text-gray-600">Networking</span>
                              <span className="text-xs font-semibold text-green-600">{pusat.org_metrics.networking || 0}%</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-xs text-gray-600">Learning</span>
                              <span className="text-xs font-semibold text-orange-600">{pusat.org_metrics.learning || 0}%</span>
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

                        <p className="text-xs text-gray-600 mb-2">{director.org_positions.title}</p>

                        {/* KPI Section */}
                        {director.org_kpis && (
                          <div className="mb-2">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs font-medium text-gray-700">KPI</span>
                              <div className={`flex items-center px-1 py-0.5 rounded-full text-xs font-bold ${getStatusColor(director.org_kpis.status)}`}>
                                {getStatusIcon(director.org_kpis.status)}
                                <span className="ml-1">{director.org_kpis.achieved}%</span>
                              </div>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-1">
                              <div 
                                className={`h-1 rounded-full transition-all duration-500 ${
                                  director.org_kpis.status === 'excellent' ? 'bg-green-500' :
                                  director.org_kpis.status === 'good' ? 'bg-blue-500' :
                                  director.org_kpis.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                                }`}
                                style={{ width: `${director.org_kpis.achieved}%` }}
                              ></div>
                            </div>
                          </div>
                        )}

                        {/* Metrics */}
                        {director.org_metrics && (
                          <div className="grid grid-cols-1 gap-1">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center">
                                <div className="w-1 h-1 bg-yellow-500 rounded-full mr-1"></div>
                                <span className="text-xs text-gray-600">Inovasi</span>
                              </div>
                              <span className="text-xs font-medium text-gray-800">{director.org_metrics.inovasi}%</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center">
                                <div className="w-1 h-1 bg-pink-500 rounded-full mr-1"></div>
                                <span className="text-xs text-gray-600">Komunikasi</span>
                              </div>
                              <span className="text-xs font-medium text-gray-800">{director.org_metrics.komunikasi}%</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center">
                                <div className="w-1 h-1 bg-cyan-500 rounded-full mr-1"></div>
                                <span className="text-xs text-gray-600">Networking</span>
                              </div>
                              <span className="text-xs font-medium text-gray-800">{director.org_metrics.networking}%</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center">
                                <div className="w-1 h-1 bg-green-500 rounded-full mr-1"></div>
                                <span className="text-xs text-gray-600">Learning</span>
                              </div>
                              <span className="text-xs font-medium text-gray-800">{director.org_metrics.learning}%</span>
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
  const [organizationData, setOrganizationData] = useState<OrgNode | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchOrganizationData = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/organisasi')
        if (!response.ok) {
          throw new Error('Failed to fetch organization data')
        }
        const data = await response.json()
        setOrganizationData(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchOrganizationData()
  }, [])

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

  if (loading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading organization data...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-gray-600 mb-2">Error loading organization data</p>
            <p className="text-red-500 text-sm">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  if (!organizationData) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-600">No organization data available</p>
        </div>
      </div>
    )
  }

  const allNodes = getAllNodes(organizationData)
  const totalNodes = allNodes.length
  const excellentNodes = allNodes.filter(node => node.org_kpis?.status === 'excellent').length
  const goodNodes = allNodes.filter(node => node.org_kpis?.status === 'good').length
  const warningNodes = allNodes.filter(node => node.org_kpis?.status === 'warning').length
  const poorNodes = allNodes.filter(node => node.org_kpis?.status === 'poor').length

  const averageKPI = Math.round(allNodes.filter(node => node.org_kpis).reduce((sum, node) => sum + (node.org_kpis?.achieved || 0), 0) / allNodes.filter(node => node.org_kpis).length || 0)

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
              .filter(node => node.org_kpis?.status === 'excellent')
              .sort((a, b) => (b.org_kpis?.achieved || 0) - (a.org_kpis?.achieved || 0))
              .slice(0, 3)
              .map((node, index) => (
                <div key={node.id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-gray-800 text-sm">{node.name}</p>
                      <p className="text-xs text-gray-600">{node.org_departments.name}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">{node.org_kpis?.achieved || 0}%</p>
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
              .filter(node => node.org_kpis?.status === 'poor' || node.org_kpis?.status === 'warning')
              .sort((a, b) => (a.org_kpis?.achieved || 0) - (b.org_kpis?.achieved || 0))
              .slice(0, 3)
              .map((node, index) => (
                <div key={node.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-gray-800 text-sm">{node.name}</p>
                      <p className="text-xs text-gray-600">{node.org_departments.name}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-red-600">{node.org_kpis?.achieved || 0}%</p>
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