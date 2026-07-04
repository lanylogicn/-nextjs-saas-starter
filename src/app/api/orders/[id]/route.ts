/**
 * @api GET|PUT /api/orders/[id] — 订单详情 / 推进进度
 *
 * GET: 获取订单详情（含进度日志）
 * @param {string} id - 服务单ID
 * @returns {{ order, logs }}
 *
 * PUT: 卖家推进进度（current_node + 1）
 * @param {string} id - 服务单ID
 * @body 无需额外参数
 * 节点4为强制审核关卡，需买家审核通过后才能继续
 * 节点7为确认完成，完成时自动触发成就徽章检查
 * @returns {{ success: boolean, current_node?: number, error?: string }}
 */
import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';
import { getCurrentUser, NODE_LABELS, TOTAL_NODES } from '@/lib/auth';

// GET: Get order detail
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const tokenUser = await getCurrentUser();
    if (!tokenUser) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 });
    }

    const { id } = await params;
    const client = getSupabaseClient();

    const { data: order, error } = await client
      .from('service_orders')
      .select('*')
      .eq('id', id)
      .eq('is_deleted', false)
      .maybeSingle();

    if (error) throw new Error(`查询失败: ${error.message}`);
    if (!order) return NextResponse.json({ error: '订单不存在' }, { status: 404 });

    // Verify ownership for seller
    if (tokenUser.role === 'seller' && order.seller_id !== tokenUser.userId) {
      return NextResponse.json({ error: '无权查看此订单' }, { status: 403 });
    }

    // Get progress logs
    const { data: logs, error: logErr } = await client
      .from('progress_logs')
      .select('*')
      .eq('order_id', id)
      .order('created_at', { ascending: true });

    if (logErr) throw new Error(`查询日志失败: ${logErr.message}`);

    // Get admin notes (only for admin)
    let adminNotesList: unknown[] = [];
    if (tokenUser.role === 'admin') {
      const { data: notes } = await client
        .from('admin_notes')
        .select('*')
        .eq('order_id', id)
        .order('created_at', { ascending: true });
      adminNotesList = notes || [];
    }

    return NextResponse.json({ order, logs: logs || [], adminNotes: adminNotesList });
  } catch (err) {
    const message = err instanceof Error ? err.message : '查询失败';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// PATCH: Advance progress
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const tokenUser = await getCurrentUser();
    if (!tokenUser || tokenUser.role !== 'seller') {
      return NextResponse.json({ error: '请先登录卖家账号' }, { status: 401 });
    }

    const { id } = await params;
    const client = getSupabaseClient();

    const { data: order, error: orderErr } = await client
      .from('service_orders')
      .select('*')
      .eq('id', id)
      .eq('is_deleted', false)
      .maybeSingle();

    if (orderErr) throw new Error(`查询失败: ${orderErr.message}`);
    if (!order) return NextResponse.json({ error: '订单不存在' }, { status: 404 });
    if (order.seller_id !== tokenUser.userId) {
      return NextResponse.json({ error: '无权操作此订单' }, { status: 403 });
    }

    // Check if at node 4 (waiting for buyer review) - cannot advance
    if (order.current_node === 4) {
      return NextResponse.json({ error: '当前等待买家审核，无法推进进度' }, { status: 400 });
    }

    if (order.current_node >= TOTAL_NODES) {
      return NextResponse.json({ error: '订单已完成，无法继续推进' }, { status: 400 });
    }

    const newNode = order.current_node + 1;

    const { data: updated, error: updateErr } = await client
      .from('service_orders')
      .update({
        current_node: newNode,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (updateErr) throw new Error(`更新失败: ${updateErr.message}`);

    // Log progress
    await client.from('progress_logs').insert({
      order_id: id,
      node: newNode,
      action: 'advance',
      operator_id: tokenUser.userId,
      operator_type: 'seller',
    });

    // Notify seller if node reaches 4 (waiting for review)
    if (newNode === 4) {
      // Notify buyer through seller's message (buyer doesn't have account)
      // Just log it, buyer will see when they query
    }

    // When order completes (node 7), trigger achievement check
    if (newNode === 7) {
      try {
        await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:5000'}/api/achievements/check`, {
          method: 'POST',
        });
      } catch {
        // Non-blocking: achievement check failure shouldn't affect order completion
      }
    }

    return NextResponse.json({ order: updated });
  } catch (err) {
    const message = err instanceof Error ? err.message : '操作失败';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
