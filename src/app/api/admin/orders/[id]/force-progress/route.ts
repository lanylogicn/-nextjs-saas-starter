/**
 * @api POST /api/admin/orders/[id]/force-progress — 强制推进/回退订单进度
 * @cookie admin_token - 需管理员登录
 * @param {string} id - 服务单ID
 * @body {string} action - 'force_advance'(推进) 或 'force_rollback'(回退)
 * @body {number} [target_node] - 目标节点（1-7），不传则自动+1/-1
 * @body {string} [note] - 备注
 * @returns {{ success: boolean, current_node?: number, error?: string }}
 */
import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';
import { getCurrentUser, TOTAL_NODES } from '@/lib/auth';

// POST: Force advance or rollback order node
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const tokenUser = await getCurrentUser();
    if (!tokenUser || tokenUser.role !== 'admin') {
      return NextResponse.json({ error: '无权访问' }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const { action, target_node, note } = body; // action: 'force_advance' or 'force_rollback'

    if (!action) {
      return NextResponse.json({ error: '请指定操作类型' }, { status: 400 });
    }

    const client = getSupabaseClient();

    const { data: order, error: orderErr } = await client
      .from('service_orders')
      .select('*')
      .eq('id', id)
      .eq('is_deleted', false)
      .maybeSingle();

    if (orderErr) throw new Error(`查询失败: ${orderErr.message}`);
    if (!order) return NextResponse.json({ error: '订单不存在' }, { status: 404 });

    let newNode: number;
    if (target_node) {
      newNode = target_node;
    } else if (action === 'force_advance') {
      newNode = Math.min(order.current_node + 1, TOTAL_NODES);
    } else {
      newNode = Math.max(order.current_node - 1, 1);
    }

    if (newNode < 1 || newNode > TOTAL_NODES) {
      return NextResponse.json({ error: '无效的节点' }, { status: 400 });
    }

    const { error: updateErr } = await client
      .from('service_orders')
      .update({
        current_node: newNode,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (updateErr) throw new Error(`更新失败: ${updateErr.message}`);

    // Log progress
    await client.from('progress_logs').insert({
      order_id: id,
      node: newNode,
      action,
      operator_id: tokenUser.userId,
      operator_type: 'admin',
    });

    // Add admin note if provided
    if (note) {
      await client.from('admin_notes').insert({
        order_id: id,
        content: note,
        admin_id: tokenUser.userId,
      });
    }

    // Log admin operation
    await client.from('operation_logs').insert({
      admin_id: tokenUser.userId,
      action,
      detail: `订单ID: ${id}, 节点: ${order.current_node} → ${newNode}${note ? `, 备注: ${note}` : ''}`,
    });

    return NextResponse.json({ success: true, new_node: newNode });
  } catch (err) {
    const message = err instanceof Error ? err.message : '操作失败';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
