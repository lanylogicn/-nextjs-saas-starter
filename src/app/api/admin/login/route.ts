/**
 * @api POST /api/admin/login — 管理员登录
 * @body {string} username - 管理员账号（默认 admin）
 * @body {string} password - 密码（默认 St86330068）
 * @returns {{ success: boolean, user?: { userId, role, nickname }, error?: string }}
 * 登录成功后设置 httpOnly cookie（admin_token）
 */
import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';
import { verifyPassword, createToken, setAuthCookie } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json({ success: false, error: '请输入账号和密码' }, { status: 400 });
    }

    const client = getSupabaseClient();

    // Get admin credentials from system_config
    const { data: configUsername, error: err1 } = await client
      .from('system_config')
      .select('config_value')
      .eq('config_key', 'admin_username')
      .maybeSingle();
    if (err1) throw new Error(`查询失败: ${err1.message}`);

    const { data: configPasswordHash, error: err2 } = await client
      .from('system_config')
      .select('config_value')
      .eq('config_key', 'admin_password_hash')
      .maybeSingle();
    if (err2) throw new Error(`查询失败: ${err2.message}`);

    const storedUsername = configUsername?.config_value || 'admin';
    const storedPasswordHash = configPasswordHash?.config_value;

    if (username !== storedUsername) {
      return NextResponse.json({ success: false, error: '管理员账号不存在' }, { status: 401 });
    }

    // First login: hash the default password and store it
    if (!storedPasswordHash || storedPasswordHash === '$2a$10$placeholder_will_be_updated') {
      const defaultPassword = 'St86330068';
      if (password !== defaultPassword) {
        return NextResponse.json({ success: false, error: '密码错误' }, { status: 401 });
      }
      // Hash and store the password
      const { hashPassword } = await import('@/lib/auth');
      const hashed = await hashPassword(defaultPassword);
      await client
        .from('system_config')
        .update({ config_value: hashed, updated_at: new Date().toISOString() })
        .eq('config_key', 'admin_password_hash');
    } else {
      const valid = await verifyPassword(password, storedPasswordHash);
      if (!valid) {
        return NextResponse.json({ success: false, error: '密码错误' }, { status: 401 });
      }
    }

    const token = await createToken({
      userId: 'admin',
      role: 'admin',
      nickname: '管理员',
    });

    await setAuthCookie(token);

    return NextResponse.json({
      success: true,
      user: { userId: 'admin', role: 'admin', nickname: '管理员' },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : '登录失败';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
