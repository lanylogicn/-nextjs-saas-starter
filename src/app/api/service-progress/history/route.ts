import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('orderId');
    const nodeIndex = searchParams.get('nodeIndex');

    if (!orderId) {
      return NextResponse.json(
        { success: false, error: '缺少订单ID' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient();

    let query = supabase
      .from('service_progress_entries')
      .select('*')
      .eq('order_id', orderId)
      .order('created_at', { ascending: false });

    if (nodeIndex !== null && nodeIndex !== undefined && nodeIndex !== '') {
      query = query.eq('node_index', parseInt(nodeIndex, 10));
    }

    const { data, error } = await query;

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { success: false, error: '查询失败' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      entries: data || [],
    });
  } catch (error) {
    console.error('History error:', error);
    return NextResponse.json(
      { success: false, error: '服务器错误' },
      { status: 500 }
    );
  }
}
