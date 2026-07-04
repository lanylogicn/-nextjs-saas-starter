/**
 * @api POST /api/auth/avatar — 上传用户头像
 * @body FormData { avatar: File }
 * @returns {{ success: boolean, avatarUrl?: string, error?: string }}
 * 需登录，图片存储到 Supabase Storage
 */
import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';
import { getCurrentUser } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const tokenUser = await getCurrentUser();
    if (!tokenUser || tokenUser.role === 'admin') {
      return NextResponse.json({ error: '请先登录' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('avatar') as File | null;
    if (!file) {
      return NextResponse.json({ error: '请选择图片' }, { status: 400 });
    }

    // Validate file type and size
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: '仅支持 JPG/PNG/GIF/WebP 格式' }, { status: 400 });
    }
    if (file.size > 2 * 1024 * 1024) {
      return NextResponse.json({ error: '图片大小不能超过 2MB' }, { status: 400 });
    }

    // Convert to base64 and store as data URL in the database
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = buffer.toString('base64');
    const dataUrl = `data:${file.type};base64,${base64}`;

    const client = getSupabaseClient();
    const { error } = await client
      .from('users')
      .update({ avatar_url: dataUrl })
      .eq('id', tokenUser.userId);

    if (error) throw new Error(`更新失败: ${error.message}`);

    return NextResponse.json({ success: true, avatar_url: dataUrl });
  } catch (err) {
    const message = err instanceof Error ? err.message : '上传失败';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
