import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma, ensureConnection } from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query

  // Ensure database connection
  await ensureConnection()

  try {
    switch (req.method) {
      // 🔹 GET detail IDP by ID or username
      case 'GET': {
        let idp = null
        
        // Check if the parameter is a valid IDP ID (small integer) or username (string/large number)
        const isValidId = !isNaN(Number(id)) && Number(id) < 2147483647 && Number(id) > 0 && Number.isInteger(Number(id))
        
        if (isValidId) {
          // Search by IDP ID (small integer)
          idp = await prisma.idp.findUnique({
            where: { id: Number(id) },
            include: {
              users: {
                select: { unit_kerja: true, username: true },
              },
            },
          })
        } else {
          // Search by username (string or large number that represents username)
          idp = await prisma.idp.findFirst({
            where: {
              users: {
                username: String(id)
              }
            },
            include: {
              users: {
                select: { unit_kerja: true, username: true },
              },
            },
            orderBy: {
              updated_at: 'desc' // Get the latest IDP for this user
            }
          })
        }
        
        if (!idp) {
          await prisma.$disconnect()
          return res.status(404).json({ error: 'IDP tidak ditemukan' })
        }
        await prisma.$disconnect()
        return res.status(200).json(idp)
      }

      // 🔹 PUT update IDP
      case 'PUT': {
        const data = req.body
        const updated = await prisma.idp.update({
          where: { id: Number(id) },
          data: {
            ...data,
            updated_at: new Date(),
          },
        })
        await prisma.$disconnect()
        return res.status(200).json(updated)
      }

      // 🔹 DELETE IDP
      case 'DELETE': {
        await prisma.idp.delete({
          where: { id: Number(id) },
        })
        await prisma.$disconnect()
        return res.status(204).end()
      }

      default:
        res.setHeader('Allow', ['GET', 'PUT', 'DELETE'])
        return res.status(405).end(`Method ${req.method} Not Allowed`)
    }
  } catch (error) {
    console.error('Error in /api/idp/[id]:', error)
    await prisma.$disconnect()
    return res.status(500).json({ error: 'Gagal memproses data IDP.' })
  }
}
