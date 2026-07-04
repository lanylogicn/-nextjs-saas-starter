/**
 * @api POST /api/auth/register — 用户注册
 * @body {string} phone - 手机号（必填）
 * @body {string} verificationCode - 手机验证码（测试模式固定123456）
 * @body {string} password - 密码
 * @body {string} nickname - 昵称
 * @returns {{ success: boolean, user?: object, error?: string }}
 */
import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';
import { hashPassword, createToken, setAuthCookie } from '@/lib/auth';
import { validatePhone, verifyCode } from '@/lib/verification';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { phone, email, password, nickname, verificationCode, avatar_url } = body;

    if (!password || !nickname) {
      return NextResponse.json({ success: false, error: '请填写完整信息' }, { status: 400 });
    }
    if (!phone) {
      return NextResponse.json({ success: false, error: '手机号为必填项' }, { status: 400 });
    }
    if (!validatePhone(phone)) {
      return NextResponse.json({ success: false, error: '手机号格式不正确，请输入11位中国大陆手机号' }, { status: 400 });
    }
    if (!verificationCode) {
      return NextResponse.json({ success: false, error: '请输入验证码' }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ success: false, error: '密码至少6位' }, { status: 400 });
    }

    // Verify the code
    const codeValid = await verifyCode(phone, verificationCode);
    if (!codeValid) {
      return NextResponse.json({ success: false, error: '验证码错误或已过期' }, { status: 400 });
    }

    const client = getSupabaseClient();

    // Check if user already exists
    const { data: existingPhone } = await client.from('users').select('id').eq('phone', phone).limit(1);
    if (existingPhone && existingPhone.length > 0) {
      return NextResponse.json({ success: false, error: '该手机号已注册' }, { status: 400 });
    }
    if (email) {
      const { data: existingEmail } = await client.from('users').select('id').eq('email', email).limit(1);
      if (existingEmail && existingEmail.length > 0) {
        return NextResponse.json({ success: false, error: '该邮箱已注册' }, { status: 400 });
      }
    }

    const passwordHash = await hashPassword(password);

    // Generate unique 6-digit seller_id
    let sellerId = '';
    for (let attempt = 0; attempt < 10; attempt++) {
      const candidate = String(Math.floor(100000 + Math.random() * 900000));
      const { data: existing } = await client.from('users').select('id').eq('seller_id', candidate).limit(1);
      if (!existing || existing.length === 0) {
        sellerId = candidate;
        break;
      }
    }
    if (!sellerId) sellerId = String(Date.now()).slice(-6);

    const { data: newUser, error } = await client
      .from('users')
      .insert({
        phone,
        email: email || null,
        password_hash: passwordHash,
        nickname,
        membership_level: 'free',
        is_frozen: false,
        avatar_url: avatar_url || null,
        seller_id: sellerId,
      })
      .select('id, nickname, membership_level, email, phone, avatar_url, seller_id')
      .single();

    if (error) throw new Error(`注册失败: ${error.message}`);

    const token = await createToken({
      userId: newUser.id,
      role: 'seller',
      nickname: newUser.nickname,
    });

    await setAuthCookie(token);

    return NextResponse.json({
      success: true,
      user: {
        userId: newUser.id,
        role: 'seller',
        nickname: newUser.nickname,
        membership_level: newUser.membership_level,
        email: newUser.email,
        phone: newUser.phone,
        avatar_url: newUser.avatar_url,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : '注册失败';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
