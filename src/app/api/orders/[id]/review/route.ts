/**
 * @api POST /api/orders/[id]/review — 买家审核
 * @param {string} id - 服务单ID
 * @body {string} action - 审核动作：'approve'(通过) 或 'reject'(驳回)
 * @body {string} [rejection_reason] - 驳回原因（reject时必填）
 * 通过：推进到节点5（审核通过，终稿输出）
 * 驳回：回退到节点3（制作中）
 * @returns {{ success: boolean, error?: string }}
 */
import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

// POST: Buyer review (approve or reject)
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { action, rejection_reason } = body; // action: 'approve' or 'reject'

    if (!action || !['approve', 'reject'].includes(action)) {
      return NextResponse.json({ error: '请选择通过或驳回' }, { status: 400 });
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

    if (order.current_node !== 4) {
      return NextResponse.json({ error: '当前节点不在审核状态' }, { status: 400 });
    }

    if (action === 'approve') {
      // Advance to node 5
      const { error: updateErr } = await client
        .from('service_orders')
        .update({
          current_node: 5,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (updateErr) throw new Error(`更新失败: ${updateErr.message}`);

      await client.from('progress_logs').insert({
        order_id: id,
        node: 5,
        action: 'approve',
        operator_type: 'buyer',
      });

      // Notify seller
      await client.from('messages').insert({
        user_id: order.seller_id,
        title: '买家审核通过',
        content: `服务单 ${order.order_no} 买家已审核通过，请继续推进终稿输出`,
        type: 'system',
        is_read: false,
      });

      return NextResponse.json({ success: true, message: '审核已通过' });
    } else {
      // Reject: go back to node 3
      if (!rejection_reason) {
        return NextResponse.json({ error: '请填写修改意见' }, { status: 400 });
      }

      const { error: updateErr } = await client
        .from('service_orders')
        .update({
          current_node: 3,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (updateErr) throw new Error(`更新失败: ${updateErr.message}`);

      await client.from('progress_logs').insert({
        order_id: id,
        node: 3,
        action: 'reject',
        operator_type: 'buyer',
        rejection_reason,
      });

      // Notify seller
      await client.from('messages').insert({
        user_id: order.seller_id,
        title: '买家审核驳回',
        content: `服务单 ${order.order_no} 买家驳回审核，修改意见：${rejection_reason}`,
        type: 'system',
        is_read: false,
      });

      return NextResponse.json({ success: true, message: '已驳回，卖家将收到修改意见' });
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : '操作失败';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
