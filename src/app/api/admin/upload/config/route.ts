/**
 * @api GET|PUT /api/admin/upload/config — 文件上传配置
 * GET: 获取各节点允许的文件类型和大小限制
 * PUT: 更新上传配置
 */
import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';
import { getCurrentUser } from '@/lib/auth';

const CONFIG_KEY = 'upload_config';

const DEFAULT_CONFIG = {
  max_file_size: 10 * 1024 * 1024, // 10MB
  allowed_types: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation', 'text/plain'],
  max_files_per_upload: 5,
  node_restrictions: {
    payment: { types: ['image/jpeg', 'image/png', 'image/webp'], label: '付款截图' },
    progress: { types: null, label: '进展附件' },
    delivery: { types: null, label: '交付物' },
  },
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
    console.error('Upload config GET error:', error);
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
    const config = { ...DEFAULT_CONFIG, ...body };

    const client = getSupabaseClient();
    const { data: existing } = await client
      .from('system_config')
      .select('id')
      .eq('config_key', CONFIG_KEY)
      .maybeSingle();

    if (existing) {
      await client.from('system_config').update({ config_value: JSON.stringify(config) }).eq('config_key', CONFIG_KEY);
    } else {
      await client.from('system_config').insert({ config_key: CONFIG_KEY, config_value: JSON.stringify(config), description: '文件上传配置' });
    }

    return NextResponse.json({ success: true, config });
  } catch (error) {
    console.error('Upload config PUT error:', error);
    return NextResponse.json({ error: '保存失败' }, { status: 500 });
  }
}
