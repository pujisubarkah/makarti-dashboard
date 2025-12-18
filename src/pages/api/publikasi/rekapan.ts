import { PrismaClient } from '@prisma/client'
import type { NextApiRequest, NextApiResponse } from 'next'

const prisma = new PrismaClient()

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // Hitung total publikasi
    const total = await prisma.publikasi.count()

    // Summary: Per Unit Kerja - dengan error handling
    let summaryPerUnitKerja: { unit_kerja: string; count: number }[] = []
    try {
      const pubPerUnitKerja = await prisma.publikasi.groupBy({
        by: ['unit_kerja_id'],
        _count: {
          _all: true,
        },
        where: {
          unit_kerja_id: {
            not: undefined
          }
        }
      })

      // Fetch unit_kerja names for each unit_kerja_id
      const unitKerjaIds = pubPerUnitKerja.map(item => item.unit_kerja_id).filter((id): id is number => id !== null && id !== undefined)
      
      if (unitKerjaIds.length > 0) {
        const unitKerjaList = await prisma.users.findMany({
          where: {
            id: { in: unitKerjaIds },
          },
          select: {
            id: true,
            unit_kerja: true,
          },
        })

        summaryPerUnitKerja = pubPerUnitKerja.map((item) => {
          const user = unitKerjaList.find(u => u.id === item.unit_kerja_id)
          return {
            unit_kerja: user?.unit_kerja || 'Unknown',
            count: item._count._all,
          }
        })
      }
    } catch (error) {
      console.error('Error in groupBy query:', error)
      summaryPerUnitKerja = []
    }

    // Summary: Per Bulan - dengan error handling
    let summaryPerBulan: { month: string; year: number; count: number }[] = []
    try {
      // First, let's check the data structure
      const sampleData = await prisma.publikasi.findFirst({
        select: {
          tanggal: true
        }
      })
      console.log('Sample tanggal data:', sampleData)

      // Try a simpler approach first
      const rawData = await prisma.$queryRaw<{ month: number; year: number; count: bigint }[]>`
        SELECT 
          EXTRACT(MONTH FROM tanggal::timestamp) AS month,
          EXTRACT(YEAR FROM tanggal::timestamp) AS year,
          COUNT(*) AS count
        FROM makarti.publikasi
        WHERE tanggal IS NOT NULL
        GROUP BY EXTRACT(YEAR FROM tanggal::timestamp), EXTRACT(MONTH FROM tanggal::timestamp)
        ORDER BY EXTRACT(YEAR FROM tanggal::timestamp), EXTRACT(MONTH FROM tanggal::timestamp)
      `

      console.log('Raw monthly data:', rawData)

      const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
      ]

      summaryPerBulan = rawData.map(item => ({
        month: monthNames[Number(item.month) - 1] || 'Unknown',
        year: Number(item.year),
        count: Number(item.count),
      }))
    } catch (error) {
      console.error('Error in monthly summary query:', error)
      
      // Fallback: try using JavaScript date functions
      try {
        const allPublikasi = await prisma.publikasi.findMany({
          select: {
            tanggal: true
          },
          where: {
            tanggal: {
              not: undefined
            }
          }
        })

        console.log('Total publikasi with tanggal:', allPublikasi.length)
        console.log('Sample dates:', allPublikasi.slice(0, 3))

        // Group by month/year using JavaScript
        const monthlyGroups: { [key: string]: number } = {}
        
        allPublikasi.forEach(pub => {
          if (pub.tanggal) {
            const date = new Date(pub.tanggal)
            const year = date.getFullYear()
            const month = date.getMonth() + 1 // getMonth() returns 0-11
            const key = `${year}-${month}`
            monthlyGroups[key] = (monthlyGroups[key] || 0) + 1
          }
        })

        const monthNames = [
          'January', 'February', 'March', 'April', 'May', 'June',
          'July', 'August', 'September', 'October', 'November', 'December'
        ]

        summaryPerBulan = Object.entries(monthlyGroups)
          .map(([key, count]) => {
            const [year, month] = key.split('-')
            return {
              month: monthNames[parseInt(month) - 1] || 'Unknown',
              year: parseInt(year),
              count
            }
          })
          .sort((a, b) => a.year - b.year || monthNames.indexOf(a.month) - monthNames.indexOf(b.month))

      } catch (fallbackError) {
        console.error('Fallback method also failed:', fallbackError)
        summaryPerBulan = []
      }
    }

    return res.status(200).json({
      totalPublikasi: total,
      perUnitKerja: summaryPerUnitKerja,
      perBulan: summaryPerBulan,
    })
  } catch (error) {
    console.error('❌ Error fetching publikasi:', error)
    return res.status(500).json({ error: 'Gagal mengambil data publikasi' })
  }
}

