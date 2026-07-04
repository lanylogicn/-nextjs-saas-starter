/**
 * @api GET|PUT /api/admin/config — 系统配置
 * @cookie admin_token - 需管理员登录
 *
 * GET: 获取所有系统配置项（free/pro/flagship最大单数、功能开关等）
 * @returns {{ config: ConfigItem[] }}
 *
 * PUT: 更新系统配置
 * @body {string} config_key - 配置键名
 * @body {string} config_value - 配置值
 * @returns {{ success: boolean }}
 */
import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';
import { getCurrentUser, hashPassword } from '@/lib/auth';

// GET: Get system config
export async function GET() {
  try {
    const tokenUser = await getCurrentUser();
    if (!tokenUser || tokenUser.role !== 'admin') {
      return NextResponse.json({ error: '无权访问' }, { status: 403 });
    }

    const client = getSupabaseClient();
    const { data: configs, error } = await client
      .from('system_config')
      .select('*')
      .order('config_key');

    if (error) throw new Error(`查询失败: ${error.message}`);

    // Don't expose admin password hash
    const safeConfigs = (configs || []).map((c) => {
      if (c.config_key === 'admin_password_hash') {
        return { ...c, config_value: '******' };
      }
      return c;
    });

    return NextResponse.json({ configs: safeConfigs });
  } catch (err) {
    const message = err instanceof Error ? err.message : '查询失败';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// PATCH: Update system config
export async function PATCH(request: Request) {
  try {
    const tokenUser = await getCurrentUser();
    if (!tokenUser || tokenUser.role !== 'admin') {
      return NextResponse.json({ error: '无权访问' }, { status: 403 });
    }

    const body = await request.json();
    const { configs } = body; // Array of { key, value }

    if (!configs || !Array.isArray(configs)) {
      return NextResponse.json({ error: '参数格式错误' }, { status: 400 });
    }

    const client = getSupabaseClient();

    for (const config of configs) {
      if (config.key === 'admin_password_hash') continue; // Skip password hash updates here

      if (config.key === 'admin_password') {
        // Hash new admin password
        const hashed = await hashPassword(config.value);
        await client
          .from('system_config')
          .update({ config_value: hashed, updated_at: new Date().toISOString() })
          .eq('config_key', 'admin_password_hash');
      } else if (config.key === 'admin_phone') {
        // Validate phone format
        if (!/^1[3-9]\d{9}$/.test(config.value)) {
          continue; // Skip invalid phone
        }
        await client
          .from('system_config')
          .update({ config_value: config.value, updated_at: new Date().toISOString() })
          .eq('config_key', config.key);
      } else {
        await client
          .from('system_config')
          .update({ config_value: config.value, updated_at: new Date().toISOString() })
          .eq('config_key', config.key);
      }
    }

    // Log admin operation
    await client.from('operation_logs').insert({
      admin_id: tokenUser.userId,
      action: 'update_system_config',
      detail: `更新配置项: ${configs.map((c: { key: string }) => c.key).join(', ')}`,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : '操作失败';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
