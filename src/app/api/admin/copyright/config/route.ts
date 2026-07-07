/**
 * @api GET|PUT /api/admin/copyright/config — 版权声明模板配置
 * GET: 获取版权声明模板文本
 * PUT: 更新版权声明模板
 */
import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';
import { getCurrentUser } from '@/lib/auth';

const CONFIG_KEY = 'copyright_template_config';

const DEFAULT_TEMPLATE = {
  header: '版权声明',
  sections: [
    '本交付物为委托创作作品，版权归委托方所有。',
    '交付物中使用的素材均已获得合法授权。',
    '未经版权方书面许可，任何第三方不得复制、传播或用于商业用途。',
  ],
  footer: '本声明自交付之日起生效。',
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

    const config = data?.config_value ? JSON.parse(data.config_value) : DEFAULT_TEMPLATE;
    return NextResponse.json({ success: true, config });
  } catch (error) {
    console.error('Copyright config GET error:', error);
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
    const { header, sections, footer } = body;

    const config = {
      header: header || DEFAULT_TEMPLATE.header,
      sections: sections || DEFAULT_TEMPLATE.sections,
      footer: footer || DEFAULT_TEMPLATE.footer,
    };

    const client = getSupabaseClient();
    const { data: existing } = await client
      .from('system_config')
      .select('id')
      .eq('config_key', CONFIG_KEY)
      .maybeSingle();

    if (existing) {
      await client.from('system_config').update({ config_value: JSON.stringify(config) }).eq('config_key', CONFIG_KEY);
    } else {
      await client.from('system_config').insert({ config_key: CONFIG_KEY, config_value: JSON.stringify(config), description: '版权声明模板配置' });
    }

    return NextResponse.json({ success: true, config });
  } catch (error) {
    console.error('Copyright config PUT error:', error);
    return NextResponse.json({ error: '保存失败' }, { status: 500 });
  }
}
