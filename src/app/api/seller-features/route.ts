/**
 * @api GET /api/seller-features — 卖家查询自己的功能权限
 * @query {string} userId - 用户ID
 * @returns {{ features: { [key: string]: { enabled, expires_at } } }}
 * 返回卖家已开通的所有高级功能及到期时间
 */
import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

// GET /api/seller-features?user_id=xxx — check which features a user has access to
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('user_id');
  if (!userId) return NextResponse.json({ error: '缺少用户ID' }, { status: 400 });

  const client = getSupabaseClient();

  // Get all enabled features
  const { data: features, error: fError } = await client
    .from('seller_features')
    .select('*')
    .eq('is_enabled', true)
    .order('sort_order');
  if (fError) return NextResponse.json({ error: '获取功能列表失败' }, { status: 500 });

  // Get user's membership level
  const { data: userData } = await client
    .from('users')
    .select('membership_level, membership_expires_at')
    .eq('id', userId)
    .maybeSingle();

  const userLevel = userData?.membership_level || 'free';
  const levelOrder = { free: 0, pro: 1, flagship: 2 };
  const userLevelNum = levelOrder[userLevel as keyof typeof levelOrder] ?? 0;

  // Check if membership expired
  let effectiveLevel = userLevel;
  if (userData?.membership_expires_at && new Date(userData.membership_expires_at) < new Date()) {
    effectiveLevel = 'free';
  }

  const effectiveLevelNum = levelOrder[effectiveLevel as keyof typeof levelOrder] ?? 0;

  // Get user's direct grants
  const { data: grants } = await client
    .from('seller_feature_grants')
    .select('feature_key, expires_at')
    .eq('user_id', userId);

  const grantMap = new Map((grants || []).map((g: { feature_key: string; expires_at: string | null }) => [g.feature_key, g.expires_at]));

  // Build result: feature accessible if (level >= min_level) OR (has direct grant)
  const result = (features || []).map((f: { feature_key: string; feature_name: string; min_level: string; description: string | null }) => {
    const hasGrant = grantMap.has(f.feature_key);
    const grantExpiry = grantMap.get(f.feature_key);
    const grantExpired = grantExpiry ? new Date(grantExpiry) < new Date() : false;
    const levelAccess = effectiveLevelNum >= (levelOrder[f.min_level as keyof typeof levelOrder] ?? 0);

    return {
      feature_key: f.feature_key,
      feature_name: f.feature_name,
      description: f.description,
      min_level: f.min_level,
      accessible: levelAccess || (hasGrant && !grantExpired),
      via_level: levelAccess,
      via_grant: hasGrant && !grantExpired,
    };
  });

  return NextResponse.json(result);
}
