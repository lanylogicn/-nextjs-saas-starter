/**
 * @api POST /api/survey/submit — 提交问卷回复
 * @cookie token - 需登录
 * @body {string} question_id - 题目ID
 * @body {string|string[]} answer - 答案（单选为string，多选为string[]）
 * @returns {{ success: boolean, error?: string }}
 */
import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';
import { getCurrentUser } from '@/lib/auth';

export async function POST(request: Request) {
  const user = await getCurrentUser();
  const body = await request.json();
  const { answers } = body;

  if (!answers || typeof answers !== 'object') {
    return NextResponse.json({ error: '请填写问卷' }, { status: 400 });
  }

  const supabase = getSupabaseClient();
  const { error } = await supabase
    .from('survey_responses')
    .insert({
      user_id: user?.userId || null,
      answers: answers,
      submitted_at: new Date().toISOString(),
    });

  if (error) {
    return NextResponse.json({ error: '提交失败，请重试' }, { status: 500 });
  }

  return NextResponse.json({ success: true, message: '感谢您的反馈！' });
}
