/**
 * @api GET /api/admin/upload/files — 查看已上传文件
 * @query orderId - 按订单ID筛选
 * @query limit - 每页数量（默认50）
 * @query offset - 偏移量（默认0）
 */
import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';
import { getCurrentUser } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const tokenUser = await getCurrentUser();
    if (!tokenUser || tokenUser.role !== 'admin') {
      return NextResponse.json({ error: '无权访问' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('orderId');
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    const client = getSupabaseClient();

    // Query progress entries that have files
    let query = client
      .from('service_progress_entries')
      .select('*', { count: 'exact' })
      .neq('files', '[]')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (orderId) {
      query = query.eq('order_id', orderId);
    }

    const { data, error, count } = await query;

    if (error) throw new Error(error.message);

    // Flatten files from all entries
    const files = (data || []).flatMap((entry) =>
      (entry.files || []).map((file: { name: string; url: string; size: number; type: string }) => ({
        ...file,
        entryId: entry.id,
        orderId: entry.order_id,
        nodeIndex: entry.node_index,
        operator: entry.operator,
        uploadedAt: entry.created_at,
      }))
    );

    return NextResponse.json({ success: true, files, total: count || 0 });
  } catch (error) {
    console.error('Upload files GET error:', error);
    return NextResponse.json({ error: '查询失败' }, { status: 500 });
  }
}
