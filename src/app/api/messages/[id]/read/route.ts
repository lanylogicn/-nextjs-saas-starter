/**
 * @api PUT /api/messages/[id]/read — 标记单条消息为已读
 * @cookie token - 需登录
 * @param {string} id - 消息ID
 * @returns {{ success: boolean }}
 */
import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';
import { getCurrentUser } from '@/lib/auth';

// POST: Mark message as read
export async function POST(
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

    const { error } = await client
      .from('messages')
      .update({ is_read: true })
      .eq('id', id)
      .eq('user_id', tokenUser.userId);

    if (error) throw new Error(`操作失败: ${error.message}`);

    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : '操作失败';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
