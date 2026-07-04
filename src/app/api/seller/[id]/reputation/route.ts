/**
 * @api GET /api/seller/[id]/reputation — 卖家信誉数据
 * @param {string} id - 卖家用户ID
 * 需卖家开通 reputation_card 功能
 * @returns {{ user, stats, badges, recent_activity }} 或 {{ error: string }}
 * stats包含：completed_orders, total_orders, approval_rate, avg_revisions
 */
import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: userId } = await params;
  const supabase = getSupabaseClient();

  // Get user info
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('id, nickname, avatar_url, created_at, membership_level, seller_id')
    .eq('id', userId)
    .single();

  if (userError || !user) {
    return NextResponse.json({ error: '用户不存在' }, { status: 404 });
  }

  // Check if reputation card feature is enabled for this seller
  const { data: featureGrant } = await supabase
    .from('seller_feature_grants')
    .select('expires_at')
    .eq('user_id', userId)
    .eq('feature_key', 'reputation_card')
    .maybeSingle();

  const { data: featureConfig } = await supabase
    .from('seller_features')
    .select('is_enabled, min_level')
    .eq('feature_key', 'reputation_card')
    .maybeSingle();

  const hasAccess = featureConfig?.is_enabled && (
    featureGrant && (!featureGrant.expires_at || new Date(featureGrant.expires_at) > new Date())
  );

  if (!hasAccess) {
    return NextResponse.json({ error: '该卖家未开通信誉名片功能' }, { status: 403 });
  }

  // Get completed orders count
  const { count: completedOrders } = await supabase
    .from('service_orders')
    .select('*', { count: 'exact', head: true })
    .eq('seller_id', userId)
    .eq('current_node', 7)
    .eq('is_deleted', false);

  // Get total orders
  const { count: totalOrders } = await supabase
    .from('service_orders')
    .select('*', { count: 'exact', head: true })
    .eq('seller_id', userId)
    .eq('is_deleted', false);

  // Get progress logs for approval rate calculation
  const { data: reviewLogs } = await supabase
    .from('progress_logs')
    .select('action')
    .eq('operator_id', userId)
    .in('action', ['approve', 'reject']);

  const approveCount = reviewLogs?.filter((l: { action: string }) => l.action === 'approve').length || 0;
  const rejectCount = reviewLogs?.filter((l: { action: string }) => l.action === 'reject').length || 0;
  const approvalRate = (approveCount + rejectCount) > 0
    ? Math.round((approveCount / (approveCount + rejectCount)) * 100)
    : 100;

  // Calculate average revision count
  const { data: allOrders } = await supabase
    .from('service_orders')
    .select('id')
    .eq('seller_id', userId)
    .eq('is_deleted', false);

  let totalRejections = 0;
  if (allOrders && allOrders.length > 0) {
    const orderIds = allOrders.map((o: { id: string }) => o.id);
    const { count: rejectionCount } = await supabase
      .from('progress_logs')
      .select('*', { count: 'exact', head: true })
      .in('order_id', orderIds)
      .eq('action', 'reject');
    totalRejections = rejectionCount || 0;
  }
  const avgRevisions = totalOrders ? Math.round((totalRejections / totalOrders) * 10) / 10 : 0;

  // Get achievements
  const { data: achievementGrants } = await supabase
    .from('seller_achievement_grants')
    .select('achievement_id, granted_at, seller_achievements(achievement_key, achievement_name, icon, description)')
    .eq('user_id', userId);

  const badges = (achievementGrants || []).map((g: Record<string, unknown>) => {
    const ach = g.seller_achievements as Record<string, unknown>;
    return {
      key: ach.achievement_key,
      name: ach.achievement_name,
      icon: ach.icon,
      description: ach.description,
      granted_at: g.granted_at,
    };
  });

  // Get recent delivery activity (last 5 completed orders)
  const { data: recentOrders } = await supabase
    .from('service_orders')
    .select('order_no, service_type, current_node, updated_at')
    .eq('seller_id', userId)
    .eq('is_deleted', false)
    .order('updated_at', { ascending: false })
    .limit(5);

  const recentActivity = (recentOrders || []).map((o: { order_no: string; service_type: string; current_node: number; updated_at: string }) => ({
    order_no: o.order_no,
    service_type: o.service_type,
    status: o.current_node === 7 ? '已完成' : '进行中',
    updated_at: o.updated_at,
  }));

  // Calculate days since joining
  const joinDate = new Date(user.created_at);
  const now = new Date();
  const daysSinceJoin = Math.floor((now.getTime() - joinDate.getTime()) / (1000 * 60 * 60 * 24));

  return NextResponse.json({
    user: {
      id: user.id,
      nickname: user.nickname || '匿名卖家',
      avatar_url: user.avatar_url,
      membership_level: user.membership_level,
      seller_id: user.seller_id,
      days_since_join: daysSinceJoin,
    },
    stats: {
      completed_orders: completedOrders || 0,
      total_orders: totalOrders || 0,
      approval_rate: approvalRate,
      avg_revisions: avgRevisions,
    },
    badges,
    recent_activity: recentActivity,
  });
}
