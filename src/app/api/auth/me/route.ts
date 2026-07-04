/**
 * @api GET /api/auth/me — 获取当前登录用户信息
 * @cookie token - httpOnly JWT
 * @returns {{ user: { userId, role, nickname, membership_level, avatar_url } | null }}
 */
import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  try {
    const tokenUser = await getCurrentUser();
    if (!tokenUser) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    const client = getSupabaseClient();

    if (tokenUser.role === 'admin') {
      return NextResponse.json({
        user: {
          userId: tokenUser.userId,
          role: 'admin',
          nickname: '管理员',
          membership_level: 'flagship',
        },
      });
    }

    const { data: user, error } = await client
      .from('users')
      .select('id, nickname, membership_level, membership_expires_at, email, phone, is_frozen, avatar_url, seller_id')
      .eq('id', tokenUser.userId)
      .maybeSingle();

    if (error) throw new Error(`查询失败: ${error.message}`);
    if (!user) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    return NextResponse.json({
      user: {
        userId: user.id,
        role: 'seller',
        nickname: user.nickname,
        membership_level: user.membership_level,
        membership_expires_at: user.membership_expires_at,
        email: user.email,
        phone: user.phone,
        avatar_url: user.avatar_url,
        seller_id: user.seller_id,
      },
    });
  } catch {
    return NextResponse.json({ user: null }, { status: 500 });
  }
}
