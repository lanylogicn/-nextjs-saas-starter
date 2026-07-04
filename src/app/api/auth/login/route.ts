/**
 * @api POST /api/auth/login — 用户登录
 * @body {string} emailOrPhone - 邮箱或手机号
 * @body {string} password - 密码
 * @returns {{ success: boolean, user?: { userId, role, nickname }, error?: string }}
 * 登录成功后设置 httpOnly cookie（token）
 */
import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';
import { hashPassword, verifyPassword, createToken, setAuthCookie } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { emailOrPhone, password } = body;

    if (!emailOrPhone || !password) {
      return NextResponse.json({ success: false, error: '请输入账号和密码' }, { status: 400 });
    }

    const client = getSupabaseClient();

    // Try to find user by email or phone
    const isEmail = emailOrPhone.includes('@');
    const queryField = isEmail ? 'email' : 'phone';
    const { data: users, error } = await client
      .from('users')
      .select('id, password_hash, nickname, membership_level, is_frozen, email, phone, avatar_url')
      .eq(queryField, emailOrPhone)
      .limit(1);

    if (error) throw new Error(`查询失败: ${error.message}`);
    if (!users || users.length === 0) {
      return NextResponse.json({ success: false, error: '账号不存在' }, { status: 401 });
    }

    const user = users[0];
    if (user.is_frozen) {
      return NextResponse.json({ success: false, error: '账号已被冻结，请联系管理员' }, { status: 403 });
    }

    const valid = await verifyPassword(password, user.password_hash);
    if (!valid) {
      return NextResponse.json({ success: false, error: '密码错误' }, { status: 401 });
    }

    const token = await createToken({
      userId: user.id,
      role: 'seller',
      nickname: user.nickname,
    });

    await setAuthCookie(token);

    return NextResponse.json({
      success: true,
      user: {
        userId: user.id,
        role: 'seller',
        nickname: user.nickname,
        membership_level: user.membership_level,
        email: user.email,
        phone: user.phone,
        avatar_url: user.avatar_url,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : '登录失败';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
