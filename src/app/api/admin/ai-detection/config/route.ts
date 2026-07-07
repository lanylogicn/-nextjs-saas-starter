/**
 * @api GET|PUT /api/admin/ai-detection/config — AI检测配置管理
 * GET: 获取AI检测默认规则（哪些品类默认要求检测）
 * PUT: 更新AI检测规则
 */
import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';
import { getCurrentUser } from '@/lib/auth';

const CONFIG_KEY = 'ai_detection_config';

const DEFAULT_CONFIG = {
  require_detection: ['ppt_design', 'thesis_writing', 'copywriting'],
  default_threshold: 30,
  enabled: true,
};

export async function GET() {
  try {
    const tokenUser = await getCurrentUser();
    if (!tokenUser || tokenUser.role !== 'admin') {
      return NextResponse.json({ error: '无权访问' }, { status: 403 });
    }

    const client = getSupabaseClient();
    const { data } = await client
      .from('system_config')
      .select('config_value')
      .eq('config_key', CONFIG_KEY)
      .maybeSingle();

    const config = data?.config_value ? JSON.parse(data.config_value) : DEFAULT_CONFIG;
    return NextResponse.json({ success: true, config });
  } catch (error) {
    console.error('AI detection config GET error:', error);
    return NextResponse.json({ error: '查询失败' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const tokenUser = await getCurrentUser();
    if (!tokenUser || tokenUser.role !== 'admin') {
      return NextResponse.json({ error: '无权访问' }, { status: 403 });
    }

    const body = await request.json();
    const { require_detection, default_threshold, enabled } = body;

    const config = {
      require_detection: require_detection || DEFAULT_CONFIG.require_detection,
      default_threshold: default_threshold ?? DEFAULT_CONFIG.default_threshold,
      enabled: enabled ?? DEFAULT_CONFIG.enabled,
    };

    const client = getSupabaseClient();

    // Upsert config
    const { data: existing } = await client
      .from('system_config')
      .select('id')
      .eq('config_key', CONFIG_KEY)
      .maybeSingle();

    if (existing) {
      await client.from('system_config').update({ config_value: JSON.stringify(config) }).eq('config_key', CONFIG_KEY);
    } else {
      await client.from('system_config').insert({ config_key: CONFIG_KEY, config_value: JSON.stringify(config), description: 'AI检测报告配置' });
    }

    return NextResponse.json({ success: true, config });
  } catch (error) {
    console.error('AI detection config PUT error:', error);
    return NextResponse.json({ error: '保存失败' }, { status: 500 });
  }
}
