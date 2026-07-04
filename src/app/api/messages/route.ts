/**
 * @api GET|PUT /api/messages — 站内消息
 * @cookie token - 需登录
 *
 * GET: 获取当前用户的消息列表
 * @returns {{ messages: Message[] }}
 *
 * PUT: 标记所有消息为已读
 * @returns {{ success: boolean }}
 */
import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';
import { getCurrentUser } from '@/lib/auth';

// GET: List user's messages
export async function GET() {
  try {
    const tokenUser = await getCurrentUser();
    if (!tokenUser || tokenUser.role === 'admin') {
      return NextResponse.json({ error: '请先登录' }, { status: 401 });
    }

    const client = getSupabaseClient();
    const { data: messages, error } = await client
      .from('messages')
      .select('*')
      .eq('user_id', tokenUser.userId)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) throw new Error(`查询失败: ${error.message}`);

    return NextResponse.json({ messages: messages || [] });
  } catch (err) {
    const message = err instanceof Error ? err.message : '查询失败';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
