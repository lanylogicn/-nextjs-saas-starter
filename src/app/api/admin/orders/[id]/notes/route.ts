/**
 * @api POST /api/admin/orders/[id]/notes — 添加管理员备注
 * @cookie admin_token - 需管理员登录
 * @param {string} id - 服务单ID
 * @body {string} note - 备注内容
 * @returns {{ success: boolean, error?: string }}
 * 备注仅管理员可见，用于记录内部沟通信息
 */
import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';
import { getCurrentUser } from '@/lib/auth';

// POST: Add admin note to order
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
    const { content } = body;

    if (!content) {
      return NextResponse.json({ error: '请输入备注内容' }, { status: 400 });
    }

    const client = getSupabaseClient();

    const { data: note, error } = await client
      .from('admin_notes')
      .insert({
        order_id: id,
        content,
        admin_id: tokenUser.userId,
      })
      .select()
      .single();

    if (error) throw new Error(`添加备注失败: ${error.message}`);

    // Log admin operation
    await client.from('operation_logs').insert({
      admin_id: tokenUser.userId,
      action: 'add_admin_note',
      detail: `订单ID: ${id}, 备注: ${content.substring(0, 100)}`,
    });

    return NextResponse.json({ success: true, note });
  } catch (err) {
    const message = err instanceof Error ? err.message : '操作失败';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
