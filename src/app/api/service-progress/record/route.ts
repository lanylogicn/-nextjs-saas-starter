import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId, nodeIndex, content, files, operator } = body;

    if (!orderId || nodeIndex === undefined || !operator) {
      return NextResponse.json(
        { success: false, error: '缺少必填参数' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from('service_progress_entries')
      .insert({
        order_id: orderId,
        node_index: nodeIndex,
        content: content || '',
        files: files || [],
        operator: operator,
      })
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { success: false, error: '保存失败' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      entry: data,
    });
  } catch (error) {
    console.error('Record error:', error);
    return NextResponse.json(
      { success: false, error: '服务器错误' },
      { status: 500 }
    );
  }
}
