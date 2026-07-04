/**
 * @api GET /api/contact — 获取联系信息
 * 公开接口，无需登录
 * @returns {{ phone, email, work_hours }}
 * 数据由管理员在后台配置
 */
import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

export async function GET() {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('contact_config')
    .select('config_key, config_value');

  if (error) {
    return NextResponse.json({ error: '获取联系方式失败' }, { status: 500 });
  }

  const config: Record<string, string> = {};
  for (const item of data || []) {
    config[item.config_key] = item.config_value;
  }

  return NextResponse.json(config);
}
