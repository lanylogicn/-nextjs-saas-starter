/**
 * @api GET /api/admin/users — 用户列表
 * @cookie admin_token - 需管理员登录
 * @returns {{ users: User[] }}
 * 返回所有用户信息（含会员等级、冻结状态、到期时间等）
 */
import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';
import { getCurrentUser } from '@/lib/auth';

// GET: List all users
export async function GET() {
  try {
    const tokenUser = await getCurrentUser();
    if (!tokenUser || tokenUser.role !== 'admin') {
      return NextResponse.json({ error: '无权访问' }, { status: 403 });
    }

    const client = getSupabaseClient();
    const { data: users, error } = await client
      .from('users')
      .select('id, phone, email, nickname, membership_level, membership_expires_at, is_frozen, created_at')
      .order('created_at', { ascending: false })
      .limit(500);

    if (error) throw new Error(`查询失败: ${error.message}`);

    return NextResponse.json({ users: users || [] });
  } catch (err) {
    const message = err instanceof Error ? err.message : '查询失败';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
