/**
 * @api GET /api/admin/operation-logs — 操作日志
 * @cookie admin_token - 需管理员登录
 * @returns {{ logs: OperationLog[] }}
 * 记录所有管理员操作（用户管理/订单管理/配置变更等）
 */
import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';
import { getCurrentUser } from '@/lib/auth';

// GET: List operation logs
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

    const { data: logs, error, count } = await client
      .from('operation_logs')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) throw new Error(`查询失败: ${error.message}`);

    return NextResponse.json({
      logs: logs || [],
      total: count || 0,
      page,
      pageSize,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : '查询失败';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
