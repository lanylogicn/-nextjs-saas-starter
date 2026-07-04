/**
 * @api GET /api/admin/orders — 全部订单列表
 * @cookie admin_token - 需管理员登录
 * @returns {{ orders: ServiceOrder[] }}
 * 返回所有服务单（含卖家信息），支持管理员全局管控
 */
import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';
import { getCurrentUser } from '@/lib/auth';

// GET: List all orders (admin)
export async function GET(request: Request) {
  try {
    const tokenUser = await getCurrentUser();
    if (!tokenUser || tokenUser.role !== 'admin') {
      return NextResponse.json({ error: '无权访问' }, { status: 403 });
    }

    const client = getSupabaseClient();
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = 20;
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data: orders, error, count } = await client
      .from('service_orders')
      .select('*, users!service_orders_seller_id_fkey(nickname, email, phone)', { count: 'exact' })
      .eq('is_deleted', false)
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) throw new Error(`查询失败: ${error.message}`);

    return NextResponse.json({
      orders: orders || [],
      total: count || 0,
      page,
      pageSize,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : '查询失败';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
