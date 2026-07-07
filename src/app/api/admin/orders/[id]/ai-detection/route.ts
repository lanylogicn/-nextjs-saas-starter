/**
 * @api PUT /api/admin/orders/[id]/ai-detection — 管理员修改订单AI检测状态
 */
import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';
import { getCurrentUser } from '@/lib/auth';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const tokenUser = await getCurrentUser();
    if (!tokenUser || tokenUser.role !== 'admin') {
      return NextResponse.json({ error: '无权访问' }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const { ai_detection_status, ai_detection_score } = body;

    const validStatuses = ['detected', 'human_original', 'not_detected', null];
    if (ai_detection_status && !validStatuses.includes(ai_detection_status)) {
      return NextResponse.json({ error: '无效的检测状态' }, { status: 400 });
    }

    const client = getSupabaseClient();

    // Check if delivery report exists
    const { data: report } = await client
      .from('delivery_reports')
      .select('id')
      .eq('order_id', id)
      .maybeSingle();

    const updateData: Record<string, unknown> = {};
    if (ai_detection_status !== undefined) updateData.ai_detection_status = ai_detection_status;
    if (ai_detection_score !== undefined) updateData.ai_detection_score = ai_detection_score;

    if (report) {
      const { error } = await client
        .from('delivery_reports')
        .update(updateData)
        .eq('order_id', id);
      if (error) throw new Error(error.message);
    } else {
      // Create delivery report with AI detection data
      const notarizationNo = `DR${Date.now().toString(36).toUpperCase()}`;
      const { error } = await client
        .from('delivery_reports')
        .insert({ order_id: id, notarization_no: notarizationNo, ...updateData });
      if (error) throw new Error(error.message);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Admin AI detection update error:', error);
    return NextResponse.json({ error: '更新失败' }, { status: 500 });
  }
}
