/**
 * @api GET|POST|DELETE /api/admin/seller-features/grants — 卖家功能授权管理
 * @cookie admin_token - 需管理员登录
 *
 * GET: 获取所有卖家功能授权列表
 * @returns {SellerFeatureGrant[]}
 *
 * POST: 为卖家开通功能（upsert，支持设置到期时间）
 * @body {string} user_id - 用户ID
 * @body {string} feature_key - 功能键名
 * @body {string} [expires_at] - 到期时间
 * @returns {{ success: boolean }}
 *
 * DELETE: 撤销功能授权
 * @query {string} id - 授权记录ID
 * @returns {{ success: boolean }}
 */
import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  const tokenUser = await getCurrentUser();
  if (!tokenUser || tokenUser.role !== 'admin') return NextResponse.json({ error: '无权访问' }, { status: 403 });

  const client = getSupabaseClient();
  const { data, error } = await client
    .from('seller_feature_grants')
    .select('id, user_id, feature_key, expires_at, created_at, users(nickname), seller_features(feature_name)')
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: '获取授权列表失败' }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const tokenUser = await getCurrentUser();
  if (!tokenUser || tokenUser.role !== 'admin') return NextResponse.json({ error: '无权访问' }, { status: 403 });

  const client = getSupabaseClient();
  const body = await request.json();
  const { user_id, feature_key, expires_at } = body;

  if (!user_id || !feature_key) return NextResponse.json({ error: '缺少参数' }, { status: 400 });

  const { error } = await client
    .from('seller_feature_grants')
    .upsert({ user_id, feature_key, granted_by: tokenUser.userId, expires_at: expires_at || null }, { onConflict: 'user_id,feature_key' });

  if (error) {
    console.error('[seller-features/grants] POST error:', error.message);
    return NextResponse.json({ error: `授权失败: ${error.message}` }, { status: 500 });
  }
  return NextResponse.json({ success: true });
}

export async function DELETE(request: Request) {
  const tokenUser = await getCurrentUser();
  if (!tokenUser || tokenUser.role !== 'admin') return NextResponse.json({ error: '无权访问' }, { status: 403 });

  const client = getSupabaseClient();
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: '缺少ID' }, { status: 400 });

  const { error } = await client.from('seller_feature_grants').delete().eq('id', id);
  if (error) {
    console.error('[seller-features/grants] DELETE error:', error.message);
    return NextResponse.json({ error: `删除失败: ${error.message}` }, { status: 500 });
  }
  return NextResponse.json({ success: true });
}
