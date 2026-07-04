/**
 * @module auth（认证工具库）
 * @description
 * 服务端认证工具集，提供：
 * - JWT 签发与验证（jose库，HS256算法）
 * - 密码哈希与比对（bcryptjs）
 * - Cookie 读写（httpOnly, secure, sameSite=Lax）
 * - getCurrentUser()：从请求cookie解析当前用户（用于API路由鉴权）
 * - TOTAL_NODES = 7：进度节点总数常量
 *
 * Token结构：{ userId, role, exp }
 * Cookie名：token（普通用户），admin_token（管理员）
 */
import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'yinuo-secret-key-change-in-production-2024'
);

const TOKEN_NAME = 'yinuo_token';

export interface TokenPayload {
  userId: string;
  role: 'seller' | 'admin';
  nickname?: string;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function createToken(payload: TokenPayload): Promise<string> {
  return new SignJWT(payload as unknown as Record<string, unknown>)
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('7d')
    .setIssuedAt()
    .sign(JWT_SECRET);
}

export async function verifyToken(token: string): Promise<TokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as TokenPayload;
  } catch {
    return null;
  }
}

export async function setAuthCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(TOKEN_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  });
}

export async function clearAuthCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(TOKEN_NAME);
}

export async function getCurrentUser(): Promise<TokenPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(TOKEN_NAME)?.value;
  if (!token) return null;
  return verifyToken(token);
}

export function generateOrderNo(): string {
  const now = new Date();
  const dateStr = now.getFullYear().toString().slice(2) +
    (now.getMonth() + 1).toString().padStart(2, '0') +
    now.getDate().toString().padStart(2, '0');
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `SV${dateStr}${random}`;
}

export const NODE_LABELS: Record<number, string> = {
  1: '订单接收',
  2: '需求梳理',
  3: '制作中',
  4: '初稿完成，等待客户审核',
  5: '审核通过，终稿输出',
  6: '终稿已交付',
  7: '确认完成',
};

export const TOTAL_NODES = 7;
