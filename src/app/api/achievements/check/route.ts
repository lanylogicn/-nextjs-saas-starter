/**
 * @api POST /api/achievements/check — 检查并自动发放成就徽章
 * @body {string} userId - 卖家用户ID
 * @body {string} featureKey - 功能键名（应为 achievement_badge）
 * 需卖家开通 achievement_badge 功能
 * @returns {{ checked: number, granted: number }}
 * 自动检测3种成就：fast_delivery(10次提前24h), first_pass(连续5次过稿), gold_reputation(20次好评)
 */
import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

export async function POST() {
  const supabase = getSupabaseClient();

  // Check all achievement conditions for all sellers
  const { data: achievements } = await supabase
    .from('seller_achievements')
    .select('*')
    .eq('is_enabled', true);

  if (!achievements || achievements.length === 0) {
    return NextResponse.json({ checked: 0, granted: 0 });
  }

  // Get all sellers who have the achievement_badge feature
  const { data: grantedSellers } = await supabase
    .from('seller_feature_grants')
    .select('user_id, expires_at')
    .eq('feature_key', 'achievement_badge');

  const activeSellerIds = (grantedSellers || [])
    .filter((g: { expires_at: string | null }) => !g.expires_at || new Date(g.expires_at) > new Date())
    .map((g: { user_id: string }) => g.user_id);

  if (activeSellerIds.length === 0) {
    return NextResponse.json({ checked: 0, granted: 0 });
  }

  let totalGranted = 0;

  for (const sellerId of activeSellerIds) {
    for (const achievement of achievements) {
      // Check if already has this achievement
      const { data: existingGrant } = await supabase
        .from('seller_achievement_grants')
        .select('id')
        .eq('user_id', sellerId)
        .eq('achievement_id', achievement.id)
        .maybeSingle();

      if (existingGrant) continue;

      // Check condition
      let conditionMet = false;

      switch (achievement.condition_type) {
        case 'fast_delivery_count': {
          const { data: sellerOrders } = await supabase
            .from('service_orders')
            .select('id, estimated_delivery, updated_at')
            .eq('seller_id', sellerId)
            .eq('current_node', 7)
            .eq('is_deleted', false);
          
          let fastCount = 0;
          for (const order of (sellerOrders || [])) {
            if (order.estimated_delivery && order.updated_at) {
              const estDate = new Date(order.estimated_delivery);
              const actualDate = new Date(order.updated_at);
              const twentyFourHours = 24 * 60 * 60 * 1000;
              if (actualDate.getTime() < estDate.getTime() - twentyFourHours) {
                fastCount++;
              }
            }
          }
          conditionMet = fastCount >= achievement.condition_value;
          break;
        }

        case 'consecutive_first_pass': {
          const { data: sellerOrders } = await supabase
            .from('service_orders')
            .select('id')
            .eq('seller_id', sellerId)
            .eq('is_deleted', false)
            .order('created_at', { ascending: false })
            .limit(10);

          if (!sellerOrders || sellerOrders.length < achievement.condition_value) {
            conditionMet = false;
            break;
          }

          let consecutive = 0;
          let maxConsecutive = 0;
          for (const order of sellerOrders) {
            const { data: logs } = await supabase
              .from('progress_logs')
              .select('action')
              .eq('order_id', order.id)
              .eq('node', 4)
              .order('created_at', { ascending: true });
            
            const hasReject = (logs || []).some((l: { action: string }) => l.action === 'reject');
            if (!hasReject && (logs || []).some((l: { action: string }) => l.action === 'approve')) {
              consecutive++;
              maxConsecutive = Math.max(maxConsecutive, consecutive);
            } else {
              consecutive = 0;
            }
          }
          conditionMet = maxConsecutive >= achievement.condition_value;
          break;
        }

        case 'good_review_count': {
          const { count } = await supabase
            .from('service_orders')
            .select('*', { count: 'exact', head: true })
            .eq('seller_id', sellerId)
            .eq('current_node', 7)
            .eq('is_deleted', false);
          
          conditionMet = (count || 0) >= achievement.condition_value;
          break;
        }
      }

      if (conditionMet) {
        const { error: grantError } = await supabase
          .from('seller_achievement_grants')
          .insert({
            user_id: sellerId,
            achievement_id: achievement.id,
            is_notified: false,
          });

        if (!grantError) {
          totalGranted++;
          await supabase.from('messages').insert({
            user_id: sellerId,
            title: '恭喜获得新成就！',
            content: `您已达成成就「${achievement.achievement_name}」：${achievement.description}`,
            type: 'achievement',
          });
        }
      }
    }
  }

  return NextResponse.json({ checked: activeSellerIds.length, granted: totalGranted });
}
