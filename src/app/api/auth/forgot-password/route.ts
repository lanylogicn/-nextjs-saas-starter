/**
 * @api POST /api/auth/forgot-password — 忘记密码
 * @body {string} phone - 手机号
 * @body {string} verificationCode - 验证码
 * @returns {{ success: boolean, user?: object, error?: string }}
 * 验证通过后重置密码并自动登录（设置cookie）
 */
import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';
import { hashPassword, createToken, setAuthCookie } from '@/lib/auth';
import { validatePhone, verifyCode } from '@/lib/verification';

// POST: Verify phone + code, login directly and optionally reset password
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { phone, verificationCode, newPassword } = body;

    if (!phone) {
      return NextResponse.json({ success: false, error: '请输入手机号' }, { status: 400 });
    }
    if (!validatePhone(phone)) {
      return NextResponse.json({ success: false, error: '手机号格式不正确' }, { status: 400 });
    }
    if (!verificationCode) {
      return NextResponse.json({ success: false, error: '请输入验证码' }, { status: 400 });
    }

    // Verify the code
    const codeValid = await verifyCode(phone, verificationCode);
    if (!codeValid) {
      return NextResponse.json({ success: false, error: '验证码错误或已过期' }, { status: 400 });
    }

    const client = getSupabaseClient();

    // Find user by phone
    const { data: users, error } = await client
      .from('users')
      .select('id, nickname, membership_level, is_frozen, email, phone')
      .eq('phone', phone)
      .limit(1);

    if (error) throw new Error(`查询失败: ${error.message}`);
    if (!users || users.length === 0) {
      return NextResponse.json({ success: false, error: '该手机号未注册' }, { status: 404 });
    }

    const user = users[0];
    if (user.is_frozen) {
      return NextResponse.json({ success: false, error: '账号已被冻结，请联系管理员' }, { status: 403 });
    }

    // If newPassword provided, update password
    if (newPassword) {
      if (newPassword.length < 6) {
        return NextResponse.json({ success: false, error: '新密码至少6位' }, { status: 400 });
      }
      const passwordHash = await hashPassword(newPassword);
      await client
        .from('users')
        .update({ password_hash: passwordHash, updated_at: new Date().toISOString() })
        .eq('id', user.id);
    }

    // Login the user
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
      },
      passwordReset: !!newPassword,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : '操作失败';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
