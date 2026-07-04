/**
 * @api PATCH /api/admin/users/[id] — 更新用户（冻结/解冻/升级/降级/设置到期时间）
 * @cookie admin_token - 需管理员登录
 * @param {string} id - 用户ID
 * @body {boolean} [is_frozen] - 是否冻结
 * @body {string} [membership_level] - 会员等级（free/pro/flagship）
 * @body {string} [membership_expires_at] - 到期时间（null清除）
 * @returns {{ success: boolean, error?: string }}
 */
import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';
import { getCurrentUser } from '@/lib/auth';

// PATCH: Update user (freeze/unfreeze, change membership)
export async function PATCH(
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
    const client = getSupabaseClient();

    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
    const detailParts: string[] = [];

    if (body.is_frozen !== undefined) {
      updates.is_frozen = body.is_frozen;
      detailParts.push(body.is_frozen ? '冻结账号' : '解冻账号');
    }
    if (body.membership_level) {
      updates.membership_level = body.membership_level;
      const levelNames: Record<string, string> = { free: '测试版', pro: '普通版', flagship: '完整版' };
      detailParts.push(`服务计划变更为${levelNames[body.membership_level] || body.membership_level}`);
    }
    if (body.membership_expires_at !== undefined) {
      updates.membership_expires_at = body.membership_expires_at || null;
      if (body.membership_expires_at) {
        detailParts.push(`到期时间设为${body.membership_expires_at}`);
      } else {
        detailParts.push('清除到期时间');
      }
    }

    if (Object.keys(updates).length <= 1) {
      return NextResponse.json({ error: '无有效更新' }, { status: 400 });
    }

    const { error: updateErr } = await client
      .from('users')
      .update(updates)
      .eq('id', id);

    if (updateErr) throw new Error(`更新失败: ${updateErr.message}`);

    // Log admin operation
    await client.from('operation_logs').insert({
      admin_id: tokenUser.userId,
      action: 'update_user',
      detail: `用户ID: ${id}, 操作: ${detailParts.join(', ')}`,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : '操作失败';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
