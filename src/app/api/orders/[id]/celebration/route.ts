/**
 * @api GET /api/orders/[id]/celebration — 交付喜报数据
 * @param {string} id - 服务单ID
 * @cookie token - 需登录
 * 需卖家开通 delivery_celebration 功能
 * @returns {{ seller, order, stats: { first_pass, early_delivery, total_days } }}
 * 交付喜报核心数据：是否一次过稿、是否提前交付、总耗时
 */
import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: orderId } = await params;
  const supabase = getSupabaseClient();

  // Get order info
  const { data: order, error: orderError } = await supabase
    .from('service_orders')
    .select('id, order_no, seller_id, service_type, current_node, created_at, updated_at, estimated_delivery')
    .eq('id', orderId)
    .eq('is_deleted', false)
    .single();

  if (orderError || !order) {
    return NextResponse.json({ error: '订单不存在' }, { status: 404 });
  }

  if (order.current_node !== 7) {
    return NextResponse.json({ error: '订单尚未完成' }, { status: 400 });
  }

  // Check if delivery celebration feature is enabled for this seller
  const { data: featureGrant } = await supabase
    .from('seller_feature_grants')
    .select('expires_at')
    .eq('user_id', order.seller_id)
    .eq('feature_key', 'delivery_celebration')
    .maybeSingle();

  const { data: featureConfig } = await supabase
    .from('seller_features')
    .select('is_enabled')
    .eq('feature_key', 'delivery_celebration')
    .maybeSingle();

  const hasAccess = featureConfig?.is_enabled && featureGrant && (!featureGrant.expires_at || new Date(featureGrant.expires_at) > new Date());

  if (!hasAccess) {
    return NextResponse.json({ error: '该卖家未开通交付喜报功能' }, { status: 403 });
  }

  // Get seller info
  const { data: seller } = await supabase
    .from('users')
    .select('nickname, avatar_url')
    .eq('id', order.seller_id)
    .single();

  // Get progress logs to determine key metrics
  const { data: logs } = await supabase
    .from('progress_logs')
    .select('action, node, created_at')
    .eq('order_id', orderId)
    .order('created_at', { ascending: true });

  const rejectLogs = (logs || []).filter((l: { action: string }) => l.action === 'reject');
  const isOnePass = rejectLogs.length === 0;

  // Check if delivered before estimated time
  let isFastDelivery = false;
  if (order.estimated_delivery && order.updated_at) {
    const estDate = new Date(order.estimated_delivery);
    const actualDate = new Date(order.updated_at);
    isFastDelivery = actualDate < estDate;
  }

  // Calculate duration
  const createDate = new Date(order.created_at);
  const completeDate = new Date(order.updated_at);
  const durationDays = Math.round((completeDate.getTime() - createDate.getTime()) / (1000 * 60 * 60 * 24 * 10)) / 10;

  // Get achievements
  const { data: achievementGrants } = await supabase
    .from('seller_achievement_grants')
    .select('seller_achievements(achievement_key, achievement_name, icon)')
    .eq('user_id', order.seller_id);

  const badges = (achievementGrants || []).map((g: Record<string, unknown>) => {
    const ach = g.seller_achievements as Record<string, unknown>;
    return { key: ach.achievement_key, name: ach.achievement_name, icon: ach.icon };
  });

  // Build celebration tags
  const tags: string[] = [];
  if (isOnePass) tags.push('一次过稿');
  if (isFastDelivery) tags.push('提前交付');
  if (durationDays <= 1) tags.push('极速交付');
  if (badges.length > 0) tags.push(`${badges.length}枚徽章`);

  // Share copy text
  const shareText = `🎉 在奕诺又完成了一单！${tags.length > 0 ? tags.map(t => `【${t}】`).join('') : ''} 服务类型：${order.service_type}，耗时${durationDays}天。来奕诺，让每一次交付都有据可查！`;

  return NextResponse.json({
    order: {
      order_no: order.order_no,
      service_type: order.service_type,
      duration_days: durationDays,
      created_at: order.created_at,
      updated_at: order.updated_at,
    },
    seller: {
      nickname: seller?.nickname || '匿名卖家',
      avatar_url: seller?.avatar_url,
      id: order.seller_id,
    },
    celebration: {
      tags,
      is_one_pass: isOnePass,
      is_fast_delivery: isFastDelivery,
      badges,
    },
    share_text: shareText,
  });
}
