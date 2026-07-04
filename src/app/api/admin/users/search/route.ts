/**
 * 管理员按卖家ID搜索用户
 * GET /api/admin/users/search?seller_id=863457
 * @cookie admin_token - 需管理员登录
 * @returns {{ success: boolean, user?: object, error?: string }}
 * 返回匹配的用户信息（id, nickname, phone, email, membership_level, seller_id, frozen）
 */
import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';
import { getCurrentUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const tokenUser = await getCurrentUser();
    if (!tokenUser || tokenUser.role !== 'admin') {
      return NextResponse.json({ error: '无权访问' }, { status: 403 });
    }

    const supabase = getSupabaseClient();
    const sellerId = request.nextUrl.searchParams.get('seller_id');

    if (!sellerId) {
      return NextResponse.json({ error: '请输入卖家ID' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('users')
      .select('id, nickname, phone, email, membership_level, seller_id, is_frozen')
      .eq('seller_id', sellerId)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: '未找到该卖家，请检查ID是否正确' }, { status: 404 });
    }

    return NextResponse.json({ success: true, user: data });
  } catch (err) {
    const message = err instanceof Error ? err.message : '搜索失败';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
