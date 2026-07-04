/**
 * 公证编号搜索API
 * GET /api/verify/search?notaryNo=YN-xxx
 * 根据公证编号查找对应的verify_token
 * 无需登录
 */
import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const notaryNo = searchParams.get('notaryNo');
    if (!notaryNo) {
      return NextResponse.json({ error: '请输入公证编号' }, { status: 400 });
    }
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('delivery_reports')
      .select('verify_token')
      .eq('notarization_no', notaryNo)
      .limit(1);

    if (error || !data || data.length === 0) {
      return NextResponse.json({ verify_token: null });
    }
    return NextResponse.json({ verify_token: data[0].verify_token });
  } catch {
    return NextResponse.json({ error: '查询失败' }, { status: 500 });
  }
}
