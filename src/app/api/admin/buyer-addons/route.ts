/**
 * @api GET|PUT /api/admin/buyer-addons — 买家高级功能管理
 * @cookie admin_token - 需管理员登录
 *
 * GET: 获取买家高级功能配置列表
 * @returns {{ addons: BuyerAddon[] }}
 *
 * PUT: 更新买家高级功能配置
 * @body {string} addon_key - 功能键名
 * @body {boolean} [is_enabled] - 是否启用
 * @body {string} [min_level] - 最低等级
 * @returns {{ success: boolean }}
 */
import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';
import { getCurrentUser } from '@/lib/auth';

// GET: List all buyer addon permissions (with user info)
export async function GET() {
  try {
    const tokenUser = await getCurrentUser();
    if (!tokenUser || tokenUser.role !== 'admin') {
      return NextResponse.json({ error: '无权访问' }, { status: 403 });
    }

    const client = getSupabaseClient();

    // Get all permissions with user info
    const { data: permissions, error } = await client
      .from('buyer_addon_permissions')
      .select('id, user_id, addon_type, granted_by, expires_at, created_at, users(nickname, phone)')
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: '获取权限列表失败' }, { status: 500 });
    }

    // Get all users for the grant form
    const { data: users } = await client
      .from('users')
      .select('id, nickname, phone')
      .order('created_at', { ascending: false });

    return NextResponse.json({
      permissions: permissions || [],
      users: users || [],
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : '获取失败';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// POST: Grant buyer addon permission
export async function POST(request: Request) {
  try {
    const tokenUser = await getCurrentUser();
    if (!tokenUser || tokenUser.role !== 'admin') {
      return NextResponse.json({ error: '无权访问' }, { status: 403 });
    }

    const body = await request.json();
    const { user_id, addon_type, expires_at } = body;

    if (!user_id || !addon_type) {
      return NextResponse.json({ error: '参数不完整' }, { status: 400 });
    }

    const validTypes = ['urgent_review', 'delivery_cert', 'share_card'];
    if (!validTypes.includes(addon_type)) {
      return NextResponse.json({ error: '无效的功能类型' }, { status: 400 });
    }

    const client = getSupabaseClient();

    // Upsert permission
    const { error } = await client
      .from('buyer_addon_permissions')
      .upsert({
        user_id,
        addon_type,
        granted_by: tokenUser.userId,
        expires_at: expires_at || null,
      }, { onConflict: 'user_id,addon_type' });

    if (error) {
      return NextResponse.json({ error: '开通失败' }, { status: 500 });
    }

    // Log operation
    await client.from('operation_logs').insert({
      admin_id: tokenUser.userId,
      action: 'grant_buyer_addon',
      target_type: 'user',
      target_id: user_id,
      details: { addon_type, expires_at },
    });

    return NextResponse.json({ success: true, message: '权限已开通' });
  } catch (err) {
    const message = err instanceof Error ? err.message : '操作失败';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
