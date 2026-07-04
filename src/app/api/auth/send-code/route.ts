/**
 * @api POST /api/auth/send-code — 发送手机验证码
 * @body {string} phone - 手机号
 * @returns {{ success: boolean, error?: string }}
 * 测试模式：固定验证码123456，不会真正发送短信
 * 冷却时间：60秒内不可重复发送
 */
import { NextResponse } from 'next/server';
import { validatePhone, createVerificationCode } from '@/lib/verification';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { phone } = body;

    if (!phone) {
      return NextResponse.json({ success: false, error: '请输入手机号' }, { status: 400 });
    }

    if (!validatePhone(phone)) {
      return NextResponse.json({ success: false, error: '手机号格式不正确，请输入11位中国大陆手机号' }, { status: 400 });
    }

    const result = await createVerificationCode(phone);

    if (!result.success) {
      const status = result.cooldown ? 429 : 500;
      return NextResponse.json(
        { success: false, error: result.error, cooldown: result.cooldown },
        { status }
      );
    }

    return NextResponse.json({
      success: true,
      message: '验证码已发送到您的手机（测试模式：123456）',
      cooldown: result.cooldown,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : '发送验证码失败';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
