/**
 * @api DELETE /api/admin/orders/[id]/delete — 删除订单（软删除）
 * @cookie admin_token - 需管理员登录
 * @param {string} id - 服务单ID
 * @returns {{ success: boolean, error?: string }}
 * 逻辑删除（is_deleted=true），不物理删除数据
 */
import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';
import { getCurrentUser } from '@/lib/auth';

// POST: Delete order (soft delete)
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const tokenUser = await getCurrentUser();
    if (!tokenUser || tokenUser.role !== 'admin') {
      return NextResponse.json({ error: '无权访问' }, { status: 403 });
    }

    const { id } = await params;
    const client = getSupabaseClient();

    const { error } = await client
      .from('service_orders')
      .update({
        is_deleted: true,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) throw new Error(`删除失败: ${error.message}`);

    // Log admin operation
    await client.from('operation_logs').insert({
      admin_id: tokenUser.userId,
      action: 'delete_order',
      detail: `订单ID: ${id}`,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : '操作失败';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
