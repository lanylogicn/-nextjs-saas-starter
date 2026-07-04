/**
 * @api GET /api/verify/[token] — 交付报告公证查验
 * @param {string} token - 查验token（delivery_reports表中的verify_token字段）
 * 公开接口，无需登录，用于第三方验证交付报告真伪
 * @returns {{ valid: true, report, order }} 或 {{ valid: false, error: string }}
 */
import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const supabase = getSupabaseClient();

  const { data: report, error } = await supabase
    .from('delivery_reports')
    .select('id, notarization_no, summary, generated_at, verify_token, order_id, service_orders(order_no, service_type, buyer_nickname, seller_id, created_at, updated_at)')
    .eq('verify_token', token)
    .single();

  if (error || !report) {
    return NextResponse.json({ error: '无效的查验链接' }, { status: 404 });
  }

  const order = (report.service_orders as Record<string, unknown>[])?.[0] as Record<string, unknown>;

  // Get seller nickname
  const { data: seller } = await supabase
    .from('users')
    .select('nickname, seller_id')
    .eq('id', order.seller_id)
    .single();

  return NextResponse.json({
    valid: true,
    report: {
      notarization_no: report.notarization_no,
      summary: report.summary,
      generated_at: report.generated_at,
    },
    order: {
      order_no: order.order_no,
      service_type: order.service_type,
      buyer_nickname: order.buyer_nickname,
      seller_nickname: seller?.nickname || '未知',
      seller_id: seller?.seller_id || '',
      created_at: order.created_at,
      updated_at: order.updated_at,
    },
  });
}
