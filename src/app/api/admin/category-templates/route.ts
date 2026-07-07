/**
 * @api GET|PUT /api/admin/category-templates — 品类模板管理
 * GET: 获取所有品类模板
 * PUT: 更新品类模板（启用/禁用、修改节点描述、清单、标准）
 */
import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';
import { getCurrentUser } from '@/lib/auth';
import { CATEGORY_TEMPLATES } from '@/lib/category-templates';

const CONFIG_KEY = 'category_templates_config';

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

    // Merge stored overrides with default templates
    const overrides: Record<string, { enabled?: boolean; customChecklist?: unknown; customCriteria?: unknown }> =
      data?.config_value ? JSON.parse(data.config_value) : {};

    const templates = CATEGORY_TEMPLATES.map((t) => ({
      ...t,
      enabled: overrides[t.key]?.enabled !== false, // default enabled
      customChecklist: overrides[t.key]?.customChecklist,
      customCriteria: overrides[t.key]?.customCriteria,
    }));

    return NextResponse.json({ success: true, templates });
  } catch (error) {
    console.error('Category templates GET error:', error);
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
    const { key, enabled, customChecklist, customCriteria } = body;

    if (!key) {
      return NextResponse.json({ error: '缺少品类标识' }, { status: 400 });
    }

    const client = getSupabaseClient();

    // Get existing overrides
    const { data } = await client
      .from('system_config')
      .select('config_value')
      .eq('config_key', CONFIG_KEY)
      .maybeSingle();

    const overrides: Record<string, unknown> = data?.config_value ? JSON.parse(data.config_value) : {};

    if (!overrides[key]) overrides[key] = {};
    if (enabled !== undefined) (overrides[key] as Record<string, unknown>).enabled = enabled;
    if (customChecklist !== undefined) (overrides[key] as Record<string, unknown>).customChecklist = customChecklist;
    if (customCriteria !== undefined) (overrides[key] as Record<string, unknown>).customCriteria = customCriteria;

    // Upsert
    if (data) {
      await client.from('system_config').update({ config_value: JSON.stringify(overrides) }).eq('config_key', CONFIG_KEY);
    } else {
      await client.from('system_config').insert({ config_key: CONFIG_KEY, config_value: JSON.stringify(overrides), description: '品类模板配置' });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Category templates PUT error:', error);
    return NextResponse.json({ error: '保存失败' }, { status: 500 });
  }
}
