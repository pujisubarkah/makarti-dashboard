// app/api/upload-photo/route.ts
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

export const runtime = 'edge'; // opsional, tapi disarankan untuk upload

export default async function handler(req: NextRequest) {
  try {
    // 1. Ambil data form
    const formData = await req.formData();
    const file = formData.get('photo') as File | null;
    const nip = formData.get('id') as string | null;

    if (!file) {
      console.log('File tidak ditemukan');
      return NextResponse.json({ error: 'File tidak ditemukan' }, { status: 400 });
    }

    if (!nip) {
      console.log('NIP wajib diisi');
      return NextResponse.json({ error: 'NIP wajib diisi' }, { status: 400 });
    }

    // 2. Validasi file
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      console.log('File type tidak valid:', file.type);
      return NextResponse.json({ error: 'Hanya file JPG/PNG yang diizinkan' }, { status: 400 });
    }

    const MAX_SIZE = 2 * 1024 * 1024; // 2 MB
    if (file.size > MAX_SIZE) {
      console.log('File terlalu besar:', file.size);
      return NextResponse.json({ error: 'Ukuran file maksimal 2 MB' }, { status: 400 });
    }

    // 3. Baca file sebagai buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 4. Buat nama file unik
    const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const fileName = `${nip}-${Date.now()}-${uuidv4()}.${fileExt}`;
    const filePath = `public/${fileName}`;

    // 5. Upload ke Supabase Storage
    const supabase = createSupabaseServerClient();
    const { error: uploadError } = await supabase
      .storage
      .from('foto_pegawai')
      .upload(filePath, buffer, {
        upsert: true,
        contentType: file.type,
      });

    if (uploadError) {
      console.log('Supabase upload error:', uploadError);
      return NextResponse.json({ error: 'Gagal mengunggah foto', detail: uploadError }, { status: 500 });
    }

    // 6. Dapatkan public URL
    const { data: { publicUrl } } = supabase
      .storage
      .from('foto_pegawai')
      .getPublicUrl(filePath);

    console.log('Upload berhasil, publicUrl:', publicUrl);
    return NextResponse.json({ photo_url: publicUrl }, { status: 200 });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    console.log('Internal error:', err);
    return NextResponse.json({ error: 'Terjadi kesalahan internal', detail: errorMessage }, { status: 500 });
  }
}