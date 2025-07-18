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
  level: number
  parent_id: number | null
  unit_kerja_id: number | null
  position: {
    title: string
  }
  department: {
    name: string
    color: string | null
  }
  children_ids: number[]
  scores: {
    learning_pelatihan_score: number | null
    learning_penyelenggaraan_score: number | null
    learning_score: number | null
    branding_engagement_score: number | null
    branding_publikasi_score: number | null
    branding_score: number | null
    networking_kerjasama_score: number | null
    networking_koordinasi_score: number | null
    networking_score: number | null
    inovasi_kinerja_score: number | null
    inovasi_kajian_score: number | null
    inovasi_score: number | null
    bigger_score: number | null
    smarter_score: number | null
    better_score: number | null
  }
  children?: OrgNode[]
  isDashedConnection?: boolean
}

interface ScoresData {
  level_1: OrgNode[]
  level_2: OrgNode[]
  level_3: OrgNode[]
  all_units: OrgNode[]
  hierarchy: OrgNode[]
}

const getStatusFromScore = (score: number | null): "excellent" | "good" | "warning" | "poor" => {
  if (!score) return "poor"
  if (score >= 90) return "excellent"
  if (score >= 80) return "good"
  if (score >= 70) return "warning"
  return "poor"
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
  
  // Get status from better_score
  const betterScore = node.scores.better_score || 0
  const status = getStatusFromScore(betterScore)
  // Separate different types of children by department
  const regularChildren = node.children?.filter(child => 
    !child.isDashedConnection && 
    child.level !== 2 && 
    !['PUSAT', 'POLTEK', 'INSPEKTORAT', 'BALAI'].includes(child.department.name)
  ) || []
  
  const level2Nodes = node.children?.filter(child => !child.isDashedConnection && child.level === 2) || []
  const pusatNodes = node.children?.filter(child => child.department.name === 'PUSAT') || []
  const polytechnicDirectors = node.children?.filter(child => child.department.name === 'POLTEK') || []
  const inspektoratNodes = node.children?.filter(child => child.department.name === 'INSPEKTORAT') || []
  const balaiNodes = node.children?.filter(child => child.department.name === 'BALAI') || []

  return (
    <div className="flex flex-col items-center">
      {/* Node Card */}
      <div className={`relative bg-white rounded-lg shadow-md border-2 p-2 mb-3 w-40 transition-all duration-300 hover:shadow-lg hover:scale-102 ${
        node.level === 1 ? 'border-purple-300' : 
        node.level === 2 ? 'border-blue-300' : 'border-gray-300'
      }`}>
        {/* Department Header */}
        <div className={`absolute -top-1.5 left-2 px-1.5 py-0.5 rounded-full text-xs font-bold text-white`}
             style={{ backgroundColor: node.department.color || '#6b7280' }}>
          {node.department.name}
        </div>

        {/* Main Content */}
        <div className="mt-1">
          <div className="flex flex-col mb-1">            <div className="flex items-center justify-between">
              <Building2 className="w-3 h-3 text-gray-600" />
              {((regularChildren.length > 0) || (level2Nodes.length > 0) || (pusatNodes.length > 0) || (polytechnicDirectors.length > 0) || (inspektoratNodes.length > 0) || (balaiNodes.length > 0)) && (
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

          <p className="text-xs text-gray-600 mb-2">{node.position.title}</p>

          {/* KPI Section - Using better_score */}
          <div className="mb-2">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-gray-700">KPI (Better)</span>
              <div className={`flex items-center px-1 py-0.5 rounded-full text-xs font-bold ${getStatusColor(status)}`}>
                {getStatusIcon(status)}
                <span className="ml-1">{Math.round(betterScore)}%</span>
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1">
              <div 
                className={`h-1 rounded-full transition-all duration-500 ${
                  status === 'excellent' ? 'bg-green-500' :
                  status === 'good' ? 'bg-blue-500' :
                  status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${Math.min(betterScore, 100)}%` }}
              ></div>
            </div>
          </div>

          {/* MAKARTI Metrics */}
          <div className="grid grid-cols-1 gap-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-1 h-1 bg-yellow-500 rounded-full mr-1"></div>
                <span className="text-xs text-gray-600">Inovasi</span>
              </div>
              <span className="text-xs font-medium text-gray-800">{Math.round(node.scores.inovasi_score || 0)}%</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-1 h-1 bg-pink-500 rounded-full mr-1"></div>
                <span className="text-xs text-gray-600">Branding</span>
              </div>
              <span className="text-xs font-medium text-gray-800">{Math.round(node.scores.branding_score || 0)}%</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-1 h-1 bg-cyan-500 rounded-full mr-1"></div>
                <span className="text-xs text-gray-600">Networking</span>
              </div>
              <span className="text-xs font-medium text-gray-800">{Math.round(node.scores.networking_score || 0)}%</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-1 h-1 bg-green-500 rounded-full mr-1"></div>
                <span className="text-xs text-gray-600">Learning</span>
              </div>
              <span className="text-xs font-medium text-gray-800">{Math.round(node.scores.learning_score || 0)}%</span>
            </div>
          </div>
        </div>
      </div>      {/* Connection Lines and Children */}
      {((regularChildren.length > 0) || (level2Nodes.length > 0) || (pusatNodes.length > 0) || (polytechnicDirectors.length > 0) || (inspektoratNodes.length > 0) || (balaiNodes.length > 0)) && isNodeExpanded && (
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
                        </div>                        <p className="text-xs text-gray-600 mb-2">{pusat.position.title}</p>

                        {/* KPI Section - Using better_score */}
                        <div className="mb-2">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-medium text-gray-700">KPI (Better)</span>
                            <div className={`flex items-center px-1 py-0.5 rounded-full text-xs font-bold ${getStatusColor(getStatusFromScore(pusat.scores.better_score))}`}>
                              {getStatusIcon(getStatusFromScore(pusat.scores.better_score))}
                              <span className="ml-1">{Math.round(pusat.scores.better_score || 0)}%</span>
                            </div>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-1">
                            <div 
                              className={`h-1 rounded-full transition-all duration-500 ${
                                getStatusFromScore(pusat.scores.better_score) === 'excellent' ? 'bg-green-500' :
                                getStatusFromScore(pusat.scores.better_score) === 'good' ? 'bg-blue-500' :
                                getStatusFromScore(pusat.scores.better_score) === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${Math.min(pusat.scores.better_score || 0, 100)}%` }}
                            ></div>
                          </div>
                        </div>

                        {/* MAKARTI Metrics */}
                        <div className="grid grid-cols-1 gap-1">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <div className="w-1 h-1 bg-yellow-500 rounded-full mr-1"></div>
                              <span className="text-xs text-gray-600">Inovasi</span>
                            </div>
                            <span className="text-xs font-medium text-gray-800">{Math.round(pusat.scores.inovasi_score || 0)}%</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <div className="w-1 h-1 bg-pink-500 rounded-full mr-1"></div>
                              <span className="text-xs text-gray-600">Branding</span>
                            </div>
                            <span className="text-xs font-medium text-gray-800">{Math.round(pusat.scores.branding_score || 0)}%</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <div className="w-1 h-1 bg-cyan-500 rounded-full mr-1"></div>
                              <span className="text-xs text-gray-600">Networking</span>
                            </div>
                            <span className="text-xs font-medium text-gray-800">{Math.round(pusat.scores.networking_score || 0)}%</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <div className="w-1 h-1 bg-green-500 rounded-full mr-1"></div>
                              <span className="text-xs text-gray-600">Learning</span>
                            </div>
                            <span className="text-xs font-medium text-gray-800">{Math.round(pusat.scores.learning_score || 0)}%</span>
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
              </div>              {/* Polytechnic Directors Container - All Horizontal */}
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
                        </div>                        <p className="text-xs text-gray-600 mb-2">{director.position.title}</p>

                        {/* KPI Section - Using better_score */}
                        <div className="mb-2">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-medium text-gray-700">KPI (Better)</span>
                            <div className={`flex items-center px-1 py-0.5 rounded-full text-xs font-bold ${getStatusColor(getStatusFromScore(director.scores.better_score))}`}>
                              {getStatusIcon(getStatusFromScore(director.scores.better_score))}
                              <span className="ml-1">{Math.round(director.scores.better_score || 0)}%</span>
                            </div>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-1">
                            <div 
                              className={`h-1 rounded-full transition-all duration-500 ${
                                getStatusFromScore(director.scores.better_score) === 'excellent' ? 'bg-green-500' :
                                getStatusFromScore(director.scores.better_score) === 'good' ? 'bg-blue-500' :
                                getStatusFromScore(director.scores.better_score) === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${Math.min(director.scores.better_score || 0, 100)}%` }}
                            ></div>
                          </div>
                        </div>

                        {/* MAKARTI Metrics */}
                        <div className="grid grid-cols-1 gap-1">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <div className="w-1 h-1 bg-yellow-500 rounded-full mr-1"></div>
                              <span className="text-xs text-gray-600">Inovasi</span>
                            </div>
                            <span className="text-xs font-medium text-gray-800">{Math.round(director.scores.inovasi_score || 0)}%</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <div className="w-1 h-1 bg-pink-500 rounded-full mr-1"></div>
                              <span className="text-xs text-gray-600">Branding</span>
                            </div>
                            <span className="text-xs font-medium text-gray-800">{Math.round(director.scores.branding_score || 0)}%</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <div className="w-1 h-1 bg-cyan-500 rounded-full mr-1"></div>
                              <span className="text-xs text-gray-600">Networking</span>
                            </div>
                            <span className="text-xs font-medium text-gray-800">{Math.round(director.scores.networking_score || 0)}%</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <div className="w-1 h-1 bg-green-500 rounded-full mr-1"></div>
                              <span className="text-xs text-gray-600">Learning</span>
                            </div>
                            <span className="text-xs font-medium text-gray-800">{Math.round(director.scores.learning_score || 0)}%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Inspektorat - Horizontal Layout */}
          {inspektoratNodes.length > 0 && (
            <div className="mt-8">
              {/* Dashed connector line to inspektorat section */}
              <div className="flex flex-col items-center">
                <div className="w-px h-6 border-l-2 border-dashed border-gray-400 mx-auto"></div>
                <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full mb-4">
                  Inspektorat
                </div>
              </div>
              
              {/* Horizontal line for inspektorat */}
              <div className="flex items-center mb-2">
                <div className="h-px border-t-2 border-dashed border-gray-400 flex-1"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full mx-2"></div>
                <div className="h-px border-t-2 border-dashed border-gray-400 flex-1"></div>
              </div>

              {/* Inspektorat Container - All Horizontal */}
              <div className="flex justify-center space-x-4 flex-wrap gap-y-4">
                {inspektoratNodes.map((inspektorat) => (
                  <div key={inspektorat.id} className="relative">
                    {/* Dashed vertical connector to inspektorat */}
                    <div className="w-px h-4 border-l-2 border-dashed border-gray-400 mx-auto -mt-2"></div>
                    
                    {/* Inspektorat Node */}
                    <div className={`relative bg-white rounded-lg shadow-md border-2 border-dashed border-red-400 p-2 w-40 transition-all duration-300 hover:shadow-lg hover:scale-102`}>
                      {/* Department Header */}
                      <div className="absolute -top-1.5 left-2 px-1.5 py-0.5 rounded-full text-xs font-bold text-white bg-gradient-to-r from-red-500 to-pink-500">
                        INSPEKTORAT
                      </div>

                      {/* Main Content */}
                      <div className="mt-1">
                        <div className="flex flex-col mb-1">
                          <div className="flex items-center justify-between">
                            <Building2 className="w-3 h-3 text-red-600" />
                          </div>
                          <h3 className="font-bold text-gray-800 text-xs leading-tight mt-1">{inspektorat.name}</h3>
                        </div>

                        <p className="text-xs text-gray-600 mb-2">{inspektorat.position.title}</p>

                        {/* KPI Section - Using better_score */}
                        <div className="mb-2">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-medium text-gray-700">KPI (Better)</span>
                            <div className={`flex items-center px-1 py-0.5 rounded-full text-xs font-bold ${getStatusColor(getStatusFromScore(inspektorat.scores.better_score))}`}>
                              {getStatusIcon(getStatusFromScore(inspektorat.scores.better_score))}
                              <span className="ml-1">{Math.round(inspektorat.scores.better_score || 0)}%</span>
                            </div>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-1">
                            <div 
                              className={`h-1 rounded-full transition-all duration-500 ${
                                getStatusFromScore(inspektorat.scores.better_score) === 'excellent' ? 'bg-green-500' :
                                getStatusFromScore(inspektorat.scores.better_score) === 'good' ? 'bg-blue-500' :
                                getStatusFromScore(inspektorat.scores.better_score) === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${Math.min(inspektorat.scores.better_score || 0, 100)}%` }}
                            ></div>
                          </div>
                        </div>

                        {/* MAKARTI Metrics */}
                        <div className="grid grid-cols-1 gap-1">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <div className="w-1 h-1 bg-yellow-500 rounded-full mr-1"></div>
                              <span className="text-xs text-gray-600">Inovasi</span>
                            </div>
                            <span className="text-xs font-medium text-gray-800">{Math.round(inspektorat.scores.inovasi_score || 0)}%</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <div className="w-1 h-1 bg-pink-500 rounded-full mr-1"></div>
                              <span className="text-xs text-gray-600">Branding</span>
                            </div>
                            <span className="text-xs font-medium text-gray-800">{Math.round(inspektorat.scores.branding_score || 0)}%</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <div className="w-1 h-1 bg-cyan-500 rounded-full mr-1"></div>
                              <span className="text-xs text-gray-600">Networking</span>
                            </div>
                            <span className="text-xs font-medium text-gray-800">{Math.round(inspektorat.scores.networking_score || 0)}%</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <div className="w-1 h-1 bg-green-500 rounded-full mr-1"></div>
                              <span className="text-xs text-gray-600">Learning</span>
                            </div>
                            <span className="text-xs font-medium text-gray-800">{Math.round(inspektorat.scores.learning_score || 0)}%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Balai - Horizontal Layout */}
          {balaiNodes.length > 0 && (
            <div className="mt-8">
              {/* Dashed connector line to balai section */}
              <div className="flex flex-col items-center">
                <div className="w-px h-6 border-l-2 border-dashed border-gray-400 mx-auto"></div>
                <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full mb-4">
                  Balai
                </div>
              </div>
              
              {/* Horizontal line for balai */}
              <div className="flex items-center mb-2">
                <div className="h-px border-t-2 border-dashed border-gray-400 flex-1"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full mx-2"></div>
                <div className="h-px border-t-2 border-dashed border-gray-400 flex-1"></div>
              </div>

              {/* Balai Container - All Horizontal */}
              <div className="flex justify-center space-x-4 flex-wrap gap-y-4">
                {balaiNodes.map((balai) => (
                  <div key={balai.id} className="relative">
                    {/* Dashed vertical connector to balai */}
                    <div className="w-px h-4 border-l-2 border-dashed border-gray-400 mx-auto -mt-2"></div>
                    
                    {/* Balai Node */}
                    <div className={`relative bg-white rounded-lg shadow-md border-2 border-dashed border-teal-400 p-2 w-40 transition-all duration-300 hover:shadow-lg hover:scale-102`}>
                      {/* Department Header */}
                      <div className="absolute -top-1.5 left-2 px-1.5 py-0.5 rounded-full text-xs font-bold text-white bg-gradient-to-r from-teal-500 to-cyan-500">
                        BALAI
                      </div>

                      {/* Main Content */}
                      <div className="mt-1">
                        <div className="flex flex-col mb-1">
                          <div className="flex items-center justify-between">
                            <Building2 className="w-3 h-3 text-teal-600" />
                          </div>
                          <h3 className="font-bold text-gray-800 text-xs leading-tight mt-1">{balai.name}</h3>
                        </div>

                        <p className="text-xs text-gray-600 mb-2">{balai.position.title}</p>

                        {/* KPI Section - Using better_score */}
                        <div className="mb-2">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-medium text-gray-700">KPI (Better)</span>
                            <div className={`flex items-center px-1 py-0.5 rounded-full text-xs font-bold ${getStatusColor(getStatusFromScore(balai.scores.better_score))}`}>
                              {getStatusIcon(getStatusFromScore(balai.scores.better_score))}
                              <span className="ml-1">{Math.round(balai.scores.better_score || 0)}%</span>
                            </div>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-1">
                            <div 
                              className={`h-1 rounded-full transition-all duration-500 ${
                                getStatusFromScore(balai.scores.better_score) === 'excellent' ? 'bg-green-500' :
                                getStatusFromScore(balai.scores.better_score) === 'good' ? 'bg-blue-500' :
                                getStatusFromScore(balai.scores.better_score) === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${Math.min(balai.scores.better_score || 0, 100)}%` }}
                            ></div>
                          </div>
                        </div>

                        {/* MAKARTI Metrics */}
                        <div className="grid grid-cols-1 gap-1">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <div className="w-1 h-1 bg-yellow-500 rounded-full mr-1"></div>
                              <span className="text-xs text-gray-600">Inovasi</span>
                            </div>
                            <span className="text-xs font-medium text-gray-800">{Math.round(balai.scores.inovasi_score || 0)}%</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <div className="w-1 h-1 bg-pink-500 rounded-full mr-1"></div>
                              <span className="text-xs text-gray-600">Branding</span>
                            </div>
                            <span className="text-xs font-medium text-gray-800">{Math.round(balai.scores.branding_score || 0)}%</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <div className="w-1 h-1 bg-cyan-500 rounded-full mr-1"></div>
                              <span className="text-xs text-gray-600">Networking</span>
                            </div>
                            <span className="text-xs font-medium text-gray-800">{Math.round(balai.scores.networking_score || 0)}%</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <div className="w-1 h-1 bg-green-500 rounded-full mr-1"></div>
                              <span className="text-xs text-gray-600">Learning</span>
                            </div>
                            <span className="text-xs font-medium text-gray-800">{Math.round(balai.scores.learning_score || 0)}%</span>
                          </div>
                        </div>
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
        const response = await fetch('/api/scores/rekap')
        if (!response.ok) {
          throw new Error('Failed to fetch organization data')
        }
        const data: ScoresData = await response.json()
        
        // Build hierarchy from the flat data
        const allUnits = data.all_units
        const unitsMap = new Map(allUnits.map(unit => [unit.id, { ...unit, children: [] as OrgNode[] }]))
        
        // Build parent-child relationships
        allUnits.forEach(unit => {
          if (unit.parent_id) {
            const parent = unitsMap.get(unit.parent_id)
            const child = unitsMap.get(unit.id)
            if (parent && child) {
              parent.children.push(child)
            }
          }
        })
        
        // Find root node (level 1 with no parent)
        const rootNode = Array.from(unitsMap.values()).find(unit => unit.parent_id === null && unit.level === 1)
        
        if (rootNode) {
          setOrganizationData(rootNode)
        } else {
          throw new Error('No root organization node found')
        }
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
  
  // Calculate status based on better_score
  const excellentNodes = allNodes.filter(node => getStatusFromScore(node.scores.better_score) === 'excellent').length
  const goodNodes = allNodes.filter(node => getStatusFromScore(node.scores.better_score) === 'good').length
  const warningNodes = allNodes.filter(node => getStatusFromScore(node.scores.better_score) === 'warning').length
  const poorNodes = allNodes.filter(node => getStatusFromScore(node.scores.better_score) === 'poor').length

  const averageKPI = Math.round(allNodes.reduce((sum, node) => sum + (node.scores.better_score || 0), 0) / allNodes.length || 0)

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
      </div>      {/* Performance Insights */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-green-500" />
            Top Performers
          </h3>
          <div className="space-y-3">
            {allNodes
              .filter(node => getStatusFromScore(node.scores.better_score) === 'excellent')
              .sort((a, b) => (b.scores.better_score || 0) - (a.scores.better_score || 0))
              .slice(0, 3)
              .map((node, index) => (
                <div key={node.id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-gray-800 text-sm">{node.name}</p>
                      <p className="text-xs text-gray-600">{node.department.name}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">{Math.round(node.scores.better_score || 0)}%</p>
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
              .filter(node => getStatusFromScore(node.scores.better_score) === 'poor' || getStatusFromScore(node.scores.better_score) === 'warning')
              .sort((a, b) => (a.scores.better_score || 0) - (b.scores.better_score || 0))
              .slice(0, 3)
              .map((node, index) => (
                <div key={node.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-gray-800 text-sm">{node.name}</p>
                      <p className="text-xs text-gray-600">{node.department.name}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-red-600">{Math.round(node.scores.better_score || 0)}%</p>
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