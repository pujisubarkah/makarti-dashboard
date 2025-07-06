import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

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
    color: string | null
  }
  org_kpis: {
    id: number
    unit_id: number
    target: number
    achieved: number
    status: string
  } | null
  org_metrics?: {
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

// Fungsi rekursif untuk membangun pohon organisasi
async function buildOrgTree(parentId: number | null = null): Promise<OrgNode[]> {
  const units = await prisma.org_units.findMany({
    where: { parent_id: parentId },
    include: {
      org_positions: true,
      org_departments: true,
      org_kpis: true,
      org_metrics: true,
    },
    orderBy: [
      { level: 'asc' },
      { id: 'asc' }
    ]
  });

  const tree = await Promise.all(
    units.map(async (unit): Promise<OrgNode> => ({
      id: unit.id,
      name: unit.name,
      position_id: unit.position_id,
      department_id: unit.department_id,
      level: unit.level,
      parent_id: unit.parent_id,
      org_positions: unit.org_positions,
      org_departments: {
        id: unit.org_departments.id,
        name: unit.org_departments.name,
        color: unit.org_departments.color || 'bg-gray-500'
      },
      org_kpis: unit.org_kpis || {
        id: 0,
        unit_id: unit.id,
        target: 100,
        achieved: 0,
        status: 'poor'
      },
      org_metrics: unit.org_metrics,
      children: await buildOrgTree(unit.id),
      // Mark PUSAT and POLTEK departments as having dashed connections
      isDashedConnection: unit.org_departments.name === 'PUSAT' || unit.org_departments.name === 'POLTEK'
    }))
  );

  return tree;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    try {
      const orgTree = await buildOrgTree();
      
      // If there's a root node, return it; otherwise return the first item
      if (orgTree.length > 0) {
        return res.status(200).json(orgTree[0]);
      } else {
        return res.status(404).json({ error: 'No organization data found' });
      }
    } catch (error) {
      console.error('Error fetching organization tree:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}