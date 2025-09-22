import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET: Ambil semua data rencana mingguan berdasarkan unit_id
export async function GET(
    req: Request, 
    { params }: { params: Promise<{ unit_id: string }> }
) {
    try {
        const resolvedParams = await params;
        const unit_id = parseInt(resolvedParams.unit_id);
        
        if (isNaN(unit_id)) {
            return NextResponse.json({ error: 'Invalid unit_id' }, { status: 400 });
        }

        const data = await prisma.rencana_mingguan.findMany({
            where: { unit_id },
            orderBy: [
                { bulan: 'asc' },
                { minggu: 'asc' }
            ]
        });

        return NextResponse.json({ data }, { status: 200 });
    } catch (error) {
        console.error('Error fetching rencana mingguan:', error);
        return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
    }
}

// POST: Tambah data rencana mingguan baru
export async function POST(
    req: Request, 
    { params }: { params: Promise<{ unit_id: string }> }
) {
    try {
        const resolvedParams = await params;
        const unit_id = parseInt(resolvedParams.unit_id);
        
        if (isNaN(unit_id)) {
            return NextResponse.json({ error: 'Invalid unit_id' }, { status: 400 });
        }

        const body = await req.json();
        const { bulan, minggu, kegiatan, jenis_belanja, anggaran_rencana, anggaran_cair, status } = body;

        // Validasi input
        if (!bulan || !minggu || !kegiatan || !jenis_belanja || !anggaran_rencana || !status) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Logic untuk anggaran_cair berdasarkan status
        let finalAnggaranCair = anggaran_cair || anggaran_rencana;
        if (['Dibatalkan', 'Ditunda', 'Reschedule'].includes(status)) {
            finalAnggaranCair = 0;
        }

        const newData = await prisma.rencana_mingguan.create({
            data: {
                unit_id,
                bulan: parseInt(bulan),
                minggu: parseInt(minggu),
                kegiatan,
                jenis_belanja,
                anggaran_rencana: parseFloat(anggaran_rencana),
                anggaran_cair: parseFloat(finalAnggaranCair),
                status
            }
        });

        return NextResponse.json({ data: newData }, { status: 201 });
    } catch (error) {
        console.error('Error creating rencana mingguan:', error);
        return NextResponse.json({ error: 'Failed to create data' }, { status: 500 });
    }
}

// PUT: Update data rencana mingguan
export async function PUT(
    req: Request, 
    { params }: { params: Promise<{ unit_id: string }> }
) {
    try {
        const resolvedParams = await params;
        const unit_id = parseInt(resolvedParams.unit_id);
        
        if (isNaN(unit_id)) {
            return NextResponse.json({ error: 'Invalid unit_id' }, { status: 400 });
        }

        const body = await req.json();
        const { id, bulan, minggu, kegiatan, jenis_belanja, anggaran_rencana, anggaran_cair, status } = body;

        if (!id) {
            return NextResponse.json({ error: 'Missing id for update' }, { status: 400 });
        }

        // Logic untuk anggaran_cair berdasarkan status
        let finalAnggaranCair = anggaran_cair || anggaran_rencana;
        if (['Dibatalkan', 'Ditunda', 'Reschedule'].includes(status)) {
            finalAnggaranCair = 0;
        }

        const updatedData = await prisma.rencana_mingguan.update({
            where: { id: parseInt(id) },
            data: {
                bulan: parseInt(bulan),
                minggu: parseInt(minggu),
                kegiatan,
                jenis_belanja,
                anggaran_rencana: parseFloat(anggaran_rencana),
                anggaran_cair: parseFloat(finalAnggaranCair),
                status
            }
        });

        return NextResponse.json({ data: updatedData }, { status: 200 });
    } catch (error) {
        console.error('Error updating rencana mingguan:', error);
        return NextResponse.json({ error: 'Failed to update data' }, { status: 500 });
    }
}

// DELETE: Hapus data rencana mingguan
export async function DELETE(
    req: Request, 
    { params }: { params: Promise<{ unit_id: string }> }
) {
    try {
        const resolvedParams = await params;
        const unit_id = parseInt(resolvedParams.unit_id);
        const url = new URL(req.url);
        const id = url.searchParams.get('id');

        if (isNaN(unit_id) || !id) {
            return NextResponse.json({ error: 'Invalid unit_id or missing id' }, { status: 400 });
        }

        await prisma.rencana_mingguan.delete({
            where: { id: parseInt(id) }
        });

        return NextResponse.json({ message: 'Data deleted successfully' }, { status: 200 });
    } catch (error) {
        console.error('Error deleting rencana mingguan:', error);
        return NextResponse.json({ error: 'Failed to delete data' }, { status: 500 });
    }
}
