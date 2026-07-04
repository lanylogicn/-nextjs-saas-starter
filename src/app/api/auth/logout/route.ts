/**
 * @api POST /api/auth/logout — 用户登出
 * @returns {{ success: boolean }}
 * 清除 httpOnly cookie（token）
 */
import { NextResponse } from 'next/server';
import { clearAuthCookie } from '@/lib/auth';

export async function POST() {
  await clearAuthCookie();
  return NextResponse.json({ success: true });
}
