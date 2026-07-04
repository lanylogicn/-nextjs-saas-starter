/**
 * @api GET|POST /api/admin/survey/questions — 问卷题目管理
 * @cookie admin_token - 需管理员登录
 *
 * GET: 获取所有问卷题目
 * @returns {SurveyQuestion[]}
 *
 * POST: 创建问卷题目
 * @body {string} question_text - 题目文字
 * @body {string} question_type - 题目类型（single_choice/multiple_choice/text）
 * @body {string[]} options - 选项数组
 * @body {boolean} is_required - 是否必填
 * @returns {{ success: boolean, question?: object }}
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
  const { data, error } = await supabase
    .from('survey_questions')
    .select('*')
    .order('sort_order');

  if (error) {
    return NextResponse.json({ error: '获取问卷失败' }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(request: Request) {
  if (!(await checkAdmin())) {
    return NextResponse.json({ error: '无权访问' }, { status: 403 });
  }

  const body = await request.json();
  const { question_text, question_type, options, is_required, sort_order } = body;

  if (!question_text || !question_type) {
    return NextResponse.json({ error: '问题内容和类型不能为空' }, { status: 400 });
  }

  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('survey_questions')
    .insert({
      question_text,
      question_type,
      options: options || null,
      is_required: is_required !== false,
      sort_order: sort_order || 0,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: '创建问题失败' }, { status: 500 });
  }

  return NextResponse.json(data);
}
