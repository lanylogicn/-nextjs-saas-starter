/**
 * @api GET|POST /api/orders — 卖家订单列表 / 创建服务单
 *
 * GET: 获取当前登录卖家的所有服务单
 * @cookie token - 需登录
 * @returns {{ orders: ServiceOrder[] }}
 *
 * POST: 创建服务单
 * @cookie token - 需登录
 * @body {string} buyer_nickname - 买家昵称
 * @body {string} service_type - 服务类型
 * @body {string} service_content - 服务内容
 * @body {string} estimated_delivery - 预计交付日期
 * @returns {{ success: boolean, order?: object, error?: string }}
 * 创建时自动检查会员等级最大单数限制
 */
import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';
import { getCurrentUser, generateOrderNo, NODE_LABELS } from '@/lib/auth';
import { inferCategory } from '@/lib/category-templates';

// GET: List seller's orders
export async function GET() {
  try {
    const tokenUser = await getCurrentUser();
    if (!tokenUser || tokenUser.role !== 'seller') {
      return NextResponse.json({ error: '请先登录' }, { status: 401 });
    }

    const client = getSupabaseClient();

    const { data: orders, error } = await client
      .from('service_orders')
      .select('*')
      .eq('seller_id', tokenUser.userId)
      .eq('is_deleted', false)
      .order('created_at', { ascending: false });

    if (error) throw new Error(`查询失败: ${error.message}`);

    return NextResponse.json({ orders: orders || [] });
  } catch (err) {
    const message = err instanceof Error ? err.message : '查询失败';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// POST: Create a new service order
export async function POST(request: Request) {
  try {
    const tokenUser = await getCurrentUser();
    if (!tokenUser || tokenUser.role !== 'seller') {
      return NextResponse.json({ error: '请先登录' }, { status: 401 });
    }

    const body = await request.json();
    const { service_type, buyer_nickname, service_content, estimated_delivery } = body;

    if (!service_type || !buyer_nickname || !service_content) {
      return NextResponse.json({ error: '请填写完整信息' }, { status: 400 });
    }

    const client = getSupabaseClient();

    // Check membership limits
    const { data: user, error: userErr } = await client
      .from('users')
      .select('membership_level, membership_expires_at, is_frozen')
      .eq('id', tokenUser.userId)
      .maybeSingle();
    if (userErr) throw new Error(`查询用户失败: ${userErr.message}`);
    if (!user) return NextResponse.json({ error: '用户不存在' }, { status: 404 });
    if (user.is_frozen) return NextResponse.json({ error: '账号已被冻结' }, { status: 403 });

    // Check if membership is expired — treat as free tier
    let effectiveLevel = user.membership_level;
    if (effectiveLevel !== 'free' && user.membership_expires_at && new Date(user.membership_expires_at) < new Date()) {
      effectiveLevel = 'free';
    }

    // Count existing active orders
    const { count, error: countErr } = await client
      .from('service_orders')
      .select('*', { count: 'exact', head: true })
      .eq('seller_id', tokenUser.userId)
      .eq('is_deleted', false);
    if (countErr) throw new Error(`统计失败: ${countErr.message}`);

    // Get max orders limit from config based on membership level
    const maxOrderConfigKey = effectiveLevel === 'flagship' ? 'flagship_max_orders' :
                              effectiveLevel === 'pro' ? 'pro_max_orders' : 'free_max_orders';
    const { data: configVal } = await client
      .from('system_config')
      .select('config_value')
      .eq('config_key', maxOrderConfigKey)
      .maybeSingle();
    const maxOrders = parseInt(configVal?.config_value || (effectiveLevel === 'free' ? '5' : effectiveLevel === 'pro' ? '50' : '-1'), 10);

    // -1 means unlimited
    if (maxOrders !== -1 && (count || 0) >= maxOrders) {
      const levelName = effectiveLevel === 'free' ? '测试版' : effectiveLevel === 'pro' ? '普通版' : '完整版';
      return NextResponse.json({
        error: `${levelName}最多创建${maxOrders}个服务单，请升级继续使用`,
        needUpgrade: true,
      }, { status: 403 });
    }

    const orderNo = generateOrderNo();

    const { data: order, error } = await client
      .from('service_orders')
      .insert({
        order_no: orderNo,
        seller_id: tokenUser.userId,
        buyer_nickname,
        service_type,
        category: inferCategory(service_type),
        service_content,
        current_node: 1,
        estimated_delivery: estimated_delivery || null,
        is_deleted: false,
      })
      .select()
      .single();

    if (error) throw new Error(`创建失败: ${error.message}`);

    // Log the initial progress
    await client.from('progress_logs').insert({
      order_id: order.id,
      node: 1,
      action: 'advance',
      operator_id: tokenUser.userId,
      operator_type: 'seller',
    });

    return NextResponse.json({ order }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : '创建失败';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
