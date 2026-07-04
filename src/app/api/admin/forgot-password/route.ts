/**
 * @api POST /api/admin/forgot-password — 管理员忘记密码
 * @body {string} phone - 管理员绑定的手机号（15816734348）
 * @body {string} verificationCode - 验证码
 * @returns {{ success: boolean, user?: object, error?: string }}
 * 验证通过后重置密码并自动登录
 */
import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';
import { createToken, setAuthCookie } from '@/lib/auth';
import { validatePhone, verifyCode } from '@/lib/verification';

// POST: Admin password recovery via phone + verification code
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { phone, verificationCode } = body;

    if (!phone) {
      return NextResponse.json({ success: false, error: '请输入管理员绑定手机号' }, { status: 400 });
    }
    if (!validatePhone(phone)) {
      return NextResponse.json({ success: false, error: '手机号格式不正确' }, { status: 400 });
    }

    // Get admin bound phone from system_config
    const client = getSupabaseClient();
    const { data: phoneConfig } = await client
      .from('system_config')
      .select('config_value')
      .eq('config_key', 'admin_phone')
      .limit(1);

    const boundPhone = phoneConfig && phoneConfig.length > 0 ? phoneConfig[0].config_value : '15816734348';

    if (phone !== boundPhone) {
      return NextResponse.json({ success: false, error: '手机号与管理员绑定手机号不匹配' }, { status: 400 });
    }
    if (!verificationCode) {
      return NextResponse.json({ success: false, error: '请输入验证码' }, { status: 400 });
    }

    // Verify the code
    const codeValid = await verifyCode(phone, verificationCode);
    if (!codeValid) {
      return NextResponse.json({ success: false, error: '验证码错误或已过期' }, { status: 400 });
    }

    // Login as admin
    const token = await createToken({
      userId: 'admin',
      role: 'admin',
      nickname: '管理员',
    });

    await setAuthCookie(token);

    return NextResponse.json({
      success: true,
      user: {
        userId: 'admin',
        role: 'admin',
        nickname: '管理员',
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : '操作失败';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
