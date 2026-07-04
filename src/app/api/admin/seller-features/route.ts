/**
 * @api GET|PUT /api/admin/seller-features — 卖家高级功能配置
 * @cookie admin_token - 需管理员登录
 *
 * GET: 获取7个卖家功能配置（功能名/最低等级/开关/排序）
 * @returns {SellerFeature[]}
 *
 * PUT: 更新卖家功能配置
 * @body {string} [id] - 功能ID
 * @body {string} [feature_key] - 功能键名（id和feature_key二选一）
 * @body {string} [min_level] - 最低等级
 * @body {boolean} [is_enabled] - 是否启用
 * @returns {{ success: boolean }}
 */
import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  const user = await getCurrentUser();
  if (!user || user.role !== 'admin') return NextResponse.json({ error: '无权访问' }, { status: 403 });

  const client = getSupabaseClient();
  const { data, error } = await client
    .from('seller_features')
    .select('*')
    .order('sort_order');

  if (error) return NextResponse.json({ error: '获取卖家功能列表失败' }, { status: 500 });
  return NextResponse.json(data);
}

export async function PUT(request: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== 'admin') return NextResponse.json({ error: '无权访问' }, { status: 403 });

  const client = getSupabaseClient();
  const body = await request.json();
  const { id, feature_key, min_level, is_enabled } = body;

  if (!id && !feature_key) return NextResponse.json({ error: '缺少功能ID或标识' }, { status: 400 });

  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (min_level !== undefined) updates.min_level = min_level;
  if (is_enabled !== undefined) updates.is_enabled = is_enabled;

  const filter = id ? { column: 'id', value: id } : { column: 'feature_key', value: feature_key };
  const { error } = await client.from('seller_features').update(updates).eq(filter.column, filter.value);
  if (error) return NextResponse.json({ error: '更新失败' }, { status: 500 });
  return NextResponse.json({ success: true });
}
