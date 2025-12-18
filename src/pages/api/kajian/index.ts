import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma'

// Main handler - hanya GET
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const kajians = await prisma.kajian.findMany({
        include: {
          users: true,
        },
      });
      
      return res.status(200).json({ data: kajians });
    } catch (error) {
      console.error(error);
      
      return res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    
    return res.status(405).json({ error: 'Method not allowed' });
  }
}

