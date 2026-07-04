/**
 * @api GET|POST /api/admin/announcements — 公告管理
 * @cookie admin_token - 需管理员登录
 *
 * GET: 获取所有公告
 * @returns {{ announcements: Announcement[] }}
 *
 * POST: 创建公告
 * @body {string} title - 公告标题
 * @body {string} content - 公告内容
 * @returns {{ success: boolean, announcement?: object }}
 */
import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';
import { getCurrentUser } from '@/lib/auth';

// GET: List announcements
export async function GET() {
  try {
    const tokenUser = await getCurrentUser();
    if (!tokenUser || tokenUser.role !== 'admin') {
      return NextResponse.json({ error: '无权访问' }, { status: 403 });
    }

    const client = getSupabaseClient();
    const { data: announcements, error } = await client
      .from('announcements')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw new Error(`查询失败: ${error.message}`);

    return NextResponse.json({ announcements: announcements || [] });
  } catch (err) {
    const message = err instanceof Error ? err.message : '查询失败';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// POST: Create announcement and optionally push to users
export async function POST(request: Request) {
  try {
    const tokenUser = await getCurrentUser();
    if (!tokenUser || tokenUser.role !== 'admin') {
      return NextResponse.json({ error: '无权访问' }, { status: 403 });
    }

    const body = await request.json();
    const { title, content, push_to, target_user_id } = body;

    if (!title || !content) {
      return NextResponse.json({ error: '请填写标题和内容' }, { status: 400 });
    }

    const client = getSupabaseClient();

    // Create announcement
    const { data: announcement, error } = await client
      .from('announcements')
      .insert({ title, content })
      .select()
      .single();

    if (error) throw new Error(`创建失败: ${error.message}`);

    // Push to users if requested
    if (push_to === 'all') {
      const { data: allUsers } = await client
        .from('users')
        .select('id')
        .eq('is_frozen', false)
        .limit(500);

      if (allUsers && allUsers.length > 0) {
        const messages = allUsers.map((u) => ({
          user_id: u.id,
          title: `系统公告: ${title}`,
          content,
          type: 'system',
          is_read: false,
        }));
        await client.from('messages').insert(messages);
      }
    } else if (push_to === 'specific' && target_user_id) {
      await client.from('messages').insert({
        user_id: target_user_id,
        title: `系统公告: ${title}`,
        content,
        type: 'system',
        is_read: false,
      });
    }

    // Log admin operation
    await client.from('operation_logs').insert({
      admin_id: tokenUser.userId,
      action: 'create_announcement',
      detail: `标题: ${title}, 推送: ${push_to || '无'}`,
    });

    return NextResponse.json({ success: true, announcement });
  } catch (err) {
    const message = err instanceof Error ? err.message : '操作失败';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
