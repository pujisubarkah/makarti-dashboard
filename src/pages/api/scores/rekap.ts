import { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

interface UnitWithScores {
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
  parent?: UnitWithScores | null
  children: UnitWithScores[]
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
}

function calculateAverageScores(children: UnitWithScores[]) {
  if (children.length === 0) return null

  const validChildren = children.filter(child => child.scores)
  if (validChildren.length === 0) return null
  const averages: Record<string, number | null> = {
    learning_pelatihan_score: 0,
    learning_penyelenggaraan_score: 0,
    learning_score: 0,
    branding_engagement_score: 0,
    branding_publikasi_score: 0,
    branding_score: 0,
    networking_kerjasama_score: 0,
    networking_koordinasi_score: 0,
    networking_score: 0,
    inovasi_kinerja_score: 0,
    inovasi_kajian_score: 0,
    inovasi_score: 0,
    bigger_score: 0,
    smarter_score: 0,
    better_score: 0
  }

  const scoreKeys = Object.keys(averages)
  
  scoreKeys.forEach(key => {
    const validScores = validChildren
      .map(child => child.scores[key as keyof typeof child.scores])
      .filter(score => score !== null && score !== undefined) as number[]
    
    if (validScores.length > 0) {
      averages[key] = validScores.reduce((sum, score) => sum + score, 0) / validScores.length
    } else {
      averages[key] = null
    }
  })

  return averages as UnitWithScores['scores']
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Get all org_units with their relationships and scores
    const orgUnits = await prisma.org_units.findMany({
      include: {
        org_positions: true,
        org_departments: true,
        users: {
          include: {
            rekap_skor_unit_kerja: true
          }
        }
      },
      orderBy: [
        { level: 'asc' },
        { name: 'asc' }
      ]
    })    // Transform data and build hierarchy
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const unitsWithScores: UnitWithScores[] = orgUnits.map((unit: any) => {
      const scores = unit.users?.rekap_skor_unit_kerja?.[0]
      
      return {
        id: unit.id,
        name: unit.name,
        level: unit.level,
        parent_id: unit.parent_id,
        unit_kerja_id: unit.unit_kerja_id,
        position: {
          title: unit.org_positions.title
        },
        department: {
          name: unit.org_departments.name,
          color: unit.org_departments.color
        },
        children: [],
        scores: {
          learning_pelatihan_score: scores?.learning_pelatihan_score ? Number(scores.learning_pelatihan_score) : null,
          learning_penyelenggaraan_score: scores?.learning_penyelenggaraan_score ? Number(scores.learning_penyelenggaraan_score) : null,
          learning_score: scores?.total_learning_score ? Number(scores.total_learning_score) : null,
          branding_engagement_score: scores?.branding_engagement_score ? Number(scores.branding_engagement_score) : null,
          branding_publikasi_score: scores?.branding_publikasi_score ? Number(scores.branding_publikasi_score) : null,
          branding_score: scores?.branding_score ? Number(scores.branding_score) : null,
          networking_kerjasama_score: scores?.networking_kerjasama_score ? Number(scores.networking_kerjasama_score) : null,
          networking_koordinasi_score: scores?.networking_koordinasi_score ? Number(scores.networking_koordinasi_score) : null,
          networking_score: scores?.networking_score ? Number(scores.networking_score) : null,
          inovasi_kinerja_score: scores?.inovasi_kinerja_score ? Number(scores.inovasi_kinerja_score) : null,
          inovasi_kajian_score: scores?.inovasi_kajian_score ? Number(scores.inovasi_kajian_score) : null,
          inovasi_score: scores?.inovasi_score ? Number(scores.inovasi_score) : null,
          bigger_score: scores?.bigger_score ? Number(scores.bigger_score) : null,
          smarter_score: scores?.smarter_score ? Number(scores.smarter_score) : null,
          better_score: scores?.better_score ? Number(scores.better_score) : null,
        }
      }
    })

    // Build parent-child relationships
    const unitsMap = new Map(unitsWithScores.map(unit => [unit.id, unit]))
    
    unitsWithScores.forEach(unit => {
      if (unit.parent_id) {
        const parent = unitsMap.get(unit.parent_id)
        if (parent) {
          unit.parent = parent
          parent.children.push(unit)
        }
      }    })

    // Calculate average scores for parent units
    unitsWithScores.forEach(unit => {
      if (unit.level === 1) {
        // For level 1 units, calculate average from all level 3 and 4 units
        const level3And4Units = unitsWithScores.filter(u => u.level === 3 || u.level === 4)
        const averageScores = calculateAverageScores(level3And4Units)
        if (averageScores) {
          unit.scores = { ...unit.scores, ...averageScores }
        }
      } else if (unit.level === 2 && unit.children.length > 0) {
        // For level 2 units, calculate average from their direct children
        const averageScores = calculateAverageScores(unit.children)
        if (averageScores) {
          unit.scores = { ...unit.scores, ...averageScores }
        }
      }
    })

    // Remove circular references by creating clean objects without parent references
    const cleanUnits = unitsWithScores.map(unit => ({
      id: unit.id,
      name: unit.name,
      level: unit.level,
      parent_id: unit.parent_id,
      unit_kerja_id: unit.unit_kerja_id,
      position: unit.position,
      department: unit.department,
      children_ids: unit.children.map(child => child.id), // Just store IDs instead of full objects
      scores: unit.scores
    }))

    // Group by level for easier consumption
    const result = {
      level_1: cleanUnits.filter(unit => unit.level === 1),
      level_2: cleanUnits.filter(unit => unit.level === 2),
      level_3: cleanUnits.filter(unit => unit.level === 3),
      all_units: cleanUnits,
      hierarchy: cleanUnits.filter(unit => unit.parent_id === null) // Root units
    }

    return res.status(200).json(result)  } catch (error: unknown) {
    console.error('Error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    return res.status(500).json({ message: 'Internal server error', error: errorMessage })
  }
}
