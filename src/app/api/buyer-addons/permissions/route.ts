/**
 * @api GET /api/buyer-addons/permissions — 查询买家高级功能权限
 * @cookie token - 需登录
 * @returns {{ permissions: { priority_review, delivery_report, progress_card } }}
 */
import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';
import { getCurrentUser } from '@/lib/auth';

// GET: Check if current user has buyer addon permissions
export async function GET() {
  try {
    const tokenUser = await getCurrentUser();
    if (!tokenUser) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 });
    }

    const client = getSupabaseClient();
    const { data, error } = await client
      .from('buyer_addon_permissions')
      .select('addon_type, expires_at')
      .eq('user_id', tokenUser.userId);

    if (error) {
      return NextResponse.json({ error: '查询权限失败' }, { status: 500 });
    }

    // Filter out expired permissions
    const now = new Date().toISOString();
    const activePermissions = (data || []).filter(
      (p: { addon_type: string; expires_at: string | null }) => !p.expires_at || p.expires_at > now
    );

    const permissions: Record<string, boolean> = {
      urgent_review: false,
      delivery_cert: false,
      share_card: false,
    };
    for (const p of activePermissions) {
      permissions[p.addon_type] = true;
    }

    return NextResponse.json({ permissions });
  } catch (err) {
    const message = err instanceof Error ? err.message : '查询失败';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
