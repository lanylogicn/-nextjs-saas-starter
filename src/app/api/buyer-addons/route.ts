/**
 * @api POST /api/buyer-addons — 买家高级功能使用
 * @cookie token - 需登录
 * @body {string} orderNo - 服务单编号
 * @body {string} addonType - 功能类型：'priority_review'(优先审核)/'delivery_report'(专业交付报告)/'progress_card'(进度卡片)
 * @returns {{ success: boolean, error?: string, needLogin?: boolean }}
 * 检查买家是否有权限使用对应功能
 */
import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';
import { getCurrentUser } from '@/lib/auth';

// POST: Buyer purchase add-ons (requires admin-granted permission)
export async function POST(request: Request) {
  try {
    const tokenUser = await getCurrentUser();
    if (!tokenUser) {
      return NextResponse.json({ error: '请先注册登录', needLogin: true }, { status: 401 });
    }

    const body = await request.json();
    const { order_id, addon_type } = body;
    // addon_type: 'urgent_review', 'delivery_cert', 'share_card'

    if (!order_id || !addon_type) {
      return NextResponse.json({ error: '参数不完整' }, { status: 400 });
    }

    const client = getSupabaseClient();

    // Check if user has permission to use this addon
    const { data: permData } = await client
      .from('buyer_addon_permissions')
      .select('expires_at')
      .eq('user_id', tokenUser.userId)
      .eq('addon_type', addon_type)
      .maybeSingle();

    if (!permData) {
      return NextResponse.json({
        error: '此功能需联系客服开通，请联系获取使用权限。',
        needPermission: true,
      }, { status: 403 });
    }

    // Check if permission has expired
    if (permData.expires_at && new Date(permData.expires_at) < new Date()) {
      return NextResponse.json({
        error: '此功能使用权限已过期，请联系客服续期。',
        needPermission: true,
      }, { status: 403 });
    }

    // Get price from config
    const priceKey = `${addon_type}_price`;
    const { data: priceConfig } = await client
      .from('system_config')
      .select('config_value')
      .eq('config_key', priceKey)
      .maybeSingle();

    const priceMap: Record<string, { price: string; name: string }> = {
      urgent_review: { price: priceConfig?.config_value || '9.9', name: '优先审核' },
      delivery_cert: { price: priceConfig?.config_value || '19.9', name: '专业交付报告' },
      share_card: { price: priceConfig?.config_value || '3.9', name: '进度卡片生成' },
    };

    const addonInfo = priceMap[addon_type];
    if (!addonInfo) {
      return NextResponse.json({ error: '无效的高级功能' }, { status: 400 });
    }

    // Record transaction
    await client.from('transactions').insert({
      user_id: tokenUser.userId,
      type: 'buyer_addon',
      amount: addonInfo.price,
      item_name: addonInfo.name,
      status: 'paid',
      metadata: { order_id, addon_type, simulated: true },
    });

    // If urgent review, notify the seller
    if (addon_type === 'urgent_review') {
      const { data: order } = await client
        .from('service_orders')
        .select('seller_id, order_no')
        .eq('id', order_id)
        .maybeSingle();

      if (order) {
        await client.from('messages').insert({
          user_id: order.seller_id,
          title: '买家已付费优先审核',
          content: `服务单 ${order.order_no} 的买家已购买优先审核服务，请尽快处理！`,
          type: 'urgent_notification',
          is_read: false,
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: `支付成功（测试模式），${addonInfo.name}已购买`,
      addon_type,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : '购买失败';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
