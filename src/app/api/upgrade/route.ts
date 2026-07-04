/**
 * @api POST /api/upgrade — 会员升级（联系客服）
 * @cookie token - 需登录
 * @body {string} plan - 目标计划（pro/flagship）
 * @returns {{ success: boolean, message: string }}
 * 不做在线支付，仅记录升级意向并返回客服联系方式
 */
import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';
import { getCurrentUser } from '@/lib/auth';

// POST: Upgrade membership (simulate payment)
export async function POST(request: Request) {
  try {
    const tokenUser = await getCurrentUser();
    if (!tokenUser || tokenUser.role !== 'seller') {
      return NextResponse.json({ error: '请先登录' }, { status: 401 });
    }

    const body = await request.json();
    const { level } = body; // 'pro' or 'flagship'

    if (!level || !['pro', 'flagship'].includes(level)) {
      return NextResponse.json({ error: '无效的会员等级' }, { status: 400 });
    }

    const client = getSupabaseClient();

    // Get price from config
    const priceKey = level === 'pro' ? 'pro_price' : 'flagship_price';
    const { data: priceConfig } = await client
      .from('system_config')
      .select('config_value')
      .eq('config_key', priceKey)
      .maybeSingle();

    const price = priceConfig?.config_value || (level === 'pro' ? '19.9' : '39.9');

    // Check simulate payment
    const { data: simConfig } = await client
      .from('system_config')
      .select('config_value')
      .eq('config_key', 'simulate_payment')
      .maybeSingle();

    const isSimulated = simConfig?.config_value !== 'false';

    // Record transaction
    await client.from('transactions').insert({
      user_id: tokenUser.userId,
      type: 'membership_upgrade',
      amount: price,
      item_name: `${level === 'pro' ? '普通版' : '完整版'}月度订阅`,
      status: 'paid',
      metadata: { simulated: isSimulated },
    });

    // Update user membership
    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + 1);

    const { error: updateErr } = await client
      .from('users')
      .update({
        membership_level: level,
        membership_expires_at: expiresAt.toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', tokenUser.userId);

    if (updateErr) throw new Error(`升级失败: ${updateErr.message}`);

    return NextResponse.json({
      success: true,
      message: isSimulated ? '支付成功（测试模式），已升级服务计划' : '支付成功，已升级服务计划',
      level,
      expires_at: expiresAt.toISOString(),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : '升级失败';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
