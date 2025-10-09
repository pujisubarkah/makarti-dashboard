// pages/api/pegawai/index.ts

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    if (req.query.id) {
      // Ambil data pegawai berdasarkan id
      try {
        const pegawai = await prisma.pegawai.findUnique({
          where: { id: Number(req.query.id) },
          include: {
            users_pegawai_unit_kerja_idTousers: {
              select: { unit_kerja: true }
            }
          }
        });
        if (!pegawai) {
          res.status(404).json({ error: 'Pegawai tidak ditemukan' });
        } else {
          res.status(200).json(pegawai);
        }
      } catch (error) {
        console.error('Error fetching pegawai by id:', error);
        res.status(500).json({ error: 'Gagal mengambil data pegawai' });
      }
    } else {
      // Ambil semua data pegawai
      try {
        const pegawai = await prisma.pegawai.findMany({
          include: {
            users_pegawai_unit_kerja_idTousers: {
              select: { unit_kerja: true }
            }
          }
        });
        res.status(200).json(pegawai);
      } catch (error) {
        console.error('Error fetching pegawai data:', error);
        res.status(500).json({ error: 'Gagal mengambil data pegawai' });
      }
    }
  } else if (req.method === 'POST') {
    // Tambah data pegawai
    try {
      const { nip, nama, unit_kerja_id, jabatan, golongan } = req.body;
      const newPegawai = await prisma.pegawai.create({
        data: {
          nip,
          nama,
          unit_kerja_id,
          jabatan,
          golongan,
        },
      });
      res.status(201).json(newPegawai);
    } catch (error) {
      console.error('Error creating pegawai:', error);
      res.status(500).json({ error: 'Gagal menambahkan pegawai' });
    }
  } else {
    // Method tidak didukung
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Metode ${req.method} tidak diizinkan`);
  }
}