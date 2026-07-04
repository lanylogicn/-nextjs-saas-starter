/**
 * @api GET /api/admin/survey/responses — 问卷回复统计
 * @cookie admin_token - 需管理员登录
 * @returns {{ responses: SurveyResponse[], total: number }}
 * 返回所有问卷回复数据，用于统计分析和导出
 */
import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';
import { getCurrentUser } from '@/lib/auth';

async function checkAdmin() {
  const tokenUser = await getCurrentUser();
  if (!tokenUser || tokenUser.role !== 'admin') return false;
  return true;
}

export async function GET() {
  if (!(await checkAdmin())) {
    return NextResponse.json({ error: '无权访问' }, { status: 403 });
  }

  const supabase = getSupabaseClient();

  // Get all responses with user info
  const { data: responses, error } = await supabase
    .from('survey_responses')
    .select('id, user_id, answers, submitted_at')
    .order('submitted_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: '获取回复失败' }, { status: 500 });
  }

  // Get user nicknames for display
  const userIds = [...new Set(responses?.map((r: { user_id: string | null }) => r.user_id).filter(Boolean))];
  let userMap: Record<string, string> = {};
  if (userIds.length > 0) {
    const { data: users } = await supabase
      .from('users')
      .select('id, nickname')
      .in('id', userIds);
    if (users) {
      userMap = Object.fromEntries(users.map((u: { id: string; nickname: string }) => [u.id, u.nickname]));
    }
  }

  // Calculate stats for single_choice questions
  const { data: questions } = await supabase
    .from('survey_questions')
    .select('*')
    .eq('is_active', true);

  const stats: Record<string, Record<string, number>> = {};
  if (questions && responses) {
    for (const q of questions) {
      if (q.question_type === 'single_choice' || q.question_type === 'multiple_choice') {
        stats[q.id] = {};
        if (q.options) {
          for (const opt of q.options) {
            stats[q.id][opt] = 0;
          }
        }
      }
    }

    for (const resp of responses) {
      const ans = resp.answers || {};
      for (const [qId, value] of Object.entries(ans)) {
        if (stats[qId]) {
          if (Array.isArray(value)) {
            for (const v of value) {
              if (stats[qId][v] !== undefined) stats[qId][v]++;
            }
          } else if (typeof value === 'string' && stats[qId][value] !== undefined) {
            stats[qId][value]++;
          }
        }
      }
    }
  }

  return NextResponse.json({
    responses: responses?.map((r: { id: string; user_id: string | null; answers: Record<string, unknown>; submitted_at: string }) => ({
      ...r,
      nickname: r.user_id ? userMap[r.user_id] || '未知用户' : '匿名用户',
    })),
    stats,
    totalResponses: responses?.length || 0,
  });
}
