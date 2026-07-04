/**
 * @api GET /api/buyer/[orderNo] — 买家按编号查询服务单进度
 * @param {string} orderNo - SV编号（如 SV240101ABC123）
 * 无需登录，任何人可通过编号查询
 * @returns {{ order, logs }} 或 {{ error: string }}
 */
import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

// GET: Buyer query by order number
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ orderNo: string }> }
) {
  try {
    const { orderNo } = await params;
    const client = getSupabaseClient();

    const { data: order, error } = await client
      .from('service_orders')
      .select('id, order_no, buyer_nickname, service_type, service_content, current_node, estimated_delivery, created_at')
      .eq('order_no', orderNo)
      .eq('is_deleted', false)
      .maybeSingle();

    if (error) throw new Error(`查询失败: ${error.message}`);
    if (!order) return NextResponse.json({ error: '服务单不存在，请检查编号' }, { status: 404 });

    // Get progress logs
    const { data: logs, error: logErr } = await client
      .from('progress_logs')
      .select('node, action, operator_type, rejection_reason, created_at')
      .eq('order_id', order.id)
      .order('created_at', { ascending: true });

    if (logErr) throw new Error(`查询日志失败: ${logErr.message}`);

    return NextResponse.json({ order, logs: logs || [] });
  } catch (err) {
    const message = err instanceof Error ? err.message : '查询失败';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
