/**
 * @api GET /api/admin/dashboard — 仪表盘统计数据
 * @cookie admin_token - 需管理员登录
 * @returns {{ totalUsers, todayNewUsers, weekNewUsers, totalOrders, todayOrders,
 *             pendingOrders, avgProcessingHours, activeSellers, testUsers }}
 */
import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

export async function GET() {
  const supabase = getSupabaseClient();
  if (!supabase) return NextResponse.json({ error: 'DB连接失败' }, { status: 500 });

  try {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = weekAgo.toISOString();

    // Total users
    const { count: totalUsers } = await supabase
      .from('users').select('*', { count: 'exact', head: true });

    // Today's new users
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
    const { count: todayNewUsers } = await supabase
      .from('users').select('*', { count: 'exact', head: true })
      .gte('created_at', todayStart);

    // Week's new users
    const { count: weekNewUsers } = await supabase
      .from('users').select('*', { count: 'exact', head: true })
      .gte('created_at', sevenDaysAgo);

    // Total orders
    const { count: totalOrders } = await supabase
      .from('service_orders').select('*', { count: 'exact', head: true });

    // Today's orders
    const { count: todayOrders } = await supabase
      .from('service_orders').select('*', { count: 'exact', head: true })
      .gte('created_at', todayStart);

    // Pending orders (nodes 1-3, not completed)
    const { count: pendingOrders } = await supabase
      .from('service_orders').select('*', { count: 'exact', head: true })
      .in('current_node', [1, 2, 3]);

    // Average processing time (from created_at to current_node=7)
    const { data: completedOrders } = await supabase
      .from('service_orders').select('created_at, updated_at')
      .eq('current_node', 7)
      .not('updated_at', 'is', null)
      .limit(100);

    let avgProcessingHours = 0;
    if (completedOrders && completedOrders.length > 0) {
      const totalHours = completedOrders.reduce((sum: number, o: { created_at: string; updated_at: string }) => {
        const created = new Date(o.created_at).getTime();
        const updated = new Date(o.updated_at).getTime();
        return sum + (updated - created) / (1000 * 60 * 60);
      }, 0);
      avgProcessingHours = Math.round((totalHours / completedOrders.length) * 10) / 10;
    }

    // Seller activity (sellers with orders in last 7 days)
    const { data: recentOrders } = await supabase
      .from('service_orders').select('seller_id')
      .gte('created_at', sevenDaysAgo);
    const activeSellers = recentOrders ? new Set(recentOrders.map((o: { seller_id: string }) => o.seller_id)).size : 0;

    // Test version users
    const { count: testUsers } = await supabase
      .from('users').select('*', { count: 'exact', head: true })
      .eq('membership_level', 'free');

    return NextResponse.json({
      totalUsers: totalUsers || 0,
      todayNewUsers: todayNewUsers || 0,
      weekNewUsers: weekNewUsers || 0,
      totalOrders: totalOrders || 0,
      todayOrders: todayOrders || 0,
      pendingOrders: pendingOrders || 0,
      avgProcessingHours,
      activeSellers,
      testUsers: testUsers || 0,
    });
  } catch {
    return NextResponse.json({ error: '获取统计数据失败' }, { status: 500 });
  }
}
