/**
 * @api GET /api/survey — 获取活跃问卷题目
 * 公开接口，无需登录
 * @returns {SurveyQuestion[]} 只返回is_active=true的题目
 */
import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

export async function GET() {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('survey_questions')
    .select('*')
    .eq('is_active', true)
    .order('sort_order');

  if (error) {
    return NextResponse.json({ error: '获取问卷失败' }, { status: 500 });
  }

  return NextResponse.json(data);
}
