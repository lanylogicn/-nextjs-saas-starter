/**
 * @api PUT|DELETE /api/admin/buyer-addons/[id] — 更新/删除买家高级功能
 * @cookie admin_token - 需管理员登录
 * @param {string} id - 功能ID
 *
 * PUT: 更新功能配置
 * DELETE: 删除功能
 */
import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';
import { getCurrentUser } from '@/lib/auth';

// DELETE: Revoke buyer addon permission
export async function DELETE(
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

    // Get permission info before deleting
    const { data: perm } = await client
      .from('buyer_addon_permissions')
      .select('user_id, addon_type')
      .eq('id', id)
      .maybeSingle();

    const { error } = await client
      .from('buyer_addon_permissions')
      .delete()
      .eq('id', id);

    if (error) {
      return NextResponse.json({ error: '删除失败' }, { status: 500 });
    }

    // Log operation
    if (perm) {
      await client.from('operation_logs').insert({
        admin_id: tokenUser.userId,
        action: 'revoke_buyer_addon',
        target_type: 'user',
        target_id: perm.user_id,
        details: { addon_type: perm.addon_type },
      });
    }

    return NextResponse.json({ success: true, message: '权限已关闭' });
  } catch (err) {
    const message = err instanceof Error ? err.message : '操作失败';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
