/**
 * @api PUT|DELETE /api/admin/survey/questions/[id] — 更新/删除问卷题目
 * @cookie admin_token - 需管理员登录
 * @param {string} id - 题目ID
 *
 * PUT: 更新题目（含启用/禁用切换）
 * DELETE: 删除题目
 */
import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';
import { getCurrentUser } from '@/lib/auth';

async function checkAdmin() {
  const tokenUser = await getCurrentUser();
  if (!tokenUser || tokenUser.role !== 'admin') return false;
  return true;
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await checkAdmin())) {
    return NextResponse.json({ error: '无权访问' }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json();
  const { question_text, question_type, options, is_required, sort_order, is_active } = body;

  const supabase = getSupabaseClient();
  const updateData: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (question_text !== undefined) updateData.question_text = question_text;
  if (question_type !== undefined) updateData.question_type = question_type;
  if (options !== undefined) updateData.options = options;
  if (is_required !== undefined) updateData.is_required = is_required;
  if (sort_order !== undefined) updateData.sort_order = sort_order;
  if (is_active !== undefined) updateData.is_active = is_active;

  const { data, error } = await supabase
    .from('survey_questions')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: '更新问题失败' }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await checkAdmin())) {
    return NextResponse.json({ error: '无权访问' }, { status: 403 });
  }

  const { id } = await params;
  const supabase = getSupabaseClient();
  const { error } = await supabase
    .from('survey_questions')
    .delete()
    .eq('id', id);

  if (error) {
    return NextResponse.json({ error: '删除问题失败' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
