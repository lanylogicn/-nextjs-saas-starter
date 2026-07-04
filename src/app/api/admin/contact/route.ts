/**
 * @api GET|PUT /api/admin/contact — 联系我们配置
 * @cookie admin_token - 需管理员登录（PUT需管理员权限）
 *
 * GET: 获取联系信息（公开，无需登录）
 * @returns {{ phone, email, work_hours }}
 *
 * PUT: 更新联系信息
 * @body {string} phone - 电话
 * @body {string} email - 邮箱
 * @body {string} work_hours - 工作时间
 * @returns {{ success: boolean }}
 */
import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('contact_config')
    .select('config_key, config_value, updated_at')
    .order('config_key');

  if (error) {
    return NextResponse.json({ error: '获取联系方式配置失败' }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function PUT(request: Request) {
  const tokenUser = await getCurrentUser();
  if (!tokenUser || tokenUser.role !== 'admin') {
    return NextResponse.json({ error: '无权访问' }, { status: 403 });
  }

  const body = await request.json();
  const supabase = getSupabaseClient();

  for (const [key, value] of Object.entries(body)) {
    if (typeof value !== 'string') continue;
    const { error } = await supabase
      .from('contact_config')
      .upsert({ config_key: key, config_value: value, updated_at: new Date().toISOString() }, { onConflict: 'config_key' });

    if (error) {
      return NextResponse.json({ error: `更新 ${key} 失败` }, { status: 500 });
    }
  }

  return NextResponse.json({ success: true });
}
