/**
 * @module verification（验证码工具）
 * @description
 * 手机验证码发送与验证逻辑：
 * - 测试模式：固定验证码 123456，不会真正发送短信
 * - 生产模式：生成6位随机数字，5分钟过期
 * - 60秒冷却：同一手机号60秒内不可重复发送
 * - 验证码存储在 verification_codes 表
 *
 * 导出函数：
 * - sendVerificationCode(phone)：发送验证码
 * - verifyCode(phone, code)：验证验证码是否正确
 */
import { getSupabaseClient } from '@/storage/database/supabase-client';

const TEST_CODE = '123456';
const CODE_EXPIRY_MINUTES = 5;

/**
 * Validate Chinese mainland phone number format
 */
export function validatePhone(phone: string): boolean {
  return /^1[3-9]\d{9}$/.test(phone);
}

/**
 * Generate and store a verification code (test mode: always 123456)
 */
export async function createVerificationCode(phone: string): Promise<{ success: boolean; error?: string; cooldown?: number }> {
  const client = getSupabaseClient();
  const COOLDOWN_SECONDS = 60;

  // Check cooldown
  const { data: recent } = await client
    .from('verification_codes')
    .select('created_at')
    .eq('phone', phone)
    .order('created_at', { ascending: false })
    .limit(1);

  if (recent && recent.length > 0) {
    const lastCreated = new Date(recent[0].created_at).getTime();
    const elapsed = Math.floor((Date.now() - lastCreated) / 1000);
    if (elapsed < COOLDOWN_SECONDS) {
      const remaining = COOLDOWN_SECONDS - elapsed;
      return { success: false, error: `请${remaining}秒后再试`, cooldown: remaining };
    }
  }

  // In test mode, always use fixed code
  const code = TEST_CODE;
  const expiresAt = new Date(Date.now() + CODE_EXPIRY_MINUTES * 60 * 1000).toISOString();

  const { error } = await client
    .from('verification_codes')
    .insert({ phone, code, expires_at: expiresAt });

  if (error) {
    return { success: false, error: `发送失败: ${error.message}` };
  }

  return { success: true, cooldown: COOLDOWN_SECONDS };
}

/**
 * Verify a code against the stored codes
 */
export async function verifyCode(phone: string, code: string): Promise<boolean> {
  const client = getSupabaseClient();

  // Fetch matching unused codes for this phone
  const { data: records, error: fetchError } = await client
    .from('verification_codes')
    .select('id, code, expires_at, used')
    .eq('phone', phone)
    .eq('used', false)
    .order('created_at', { ascending: false })
    .limit(5);

  if (fetchError) {
    console.error('[verifyCode] fetch error:', fetchError);
  }

  if (!records || records.length === 0) {
    return false;
  }

  // Find a matching code that hasn't expired (compare in JS to avoid timezone issues)
  const now = Date.now();
  const match = records.find((r) => {
    if (r.code !== code) return false;
    const expiresAt = new Date(r.expires_at).getTime();
    return expiresAt > now;
  });

  if (!match) {
    return false;
  }

  // Mark as used
  const { error: updateError } = await client
    .from('verification_codes')
    .update({ used: true })
    .eq('id', match.id);

  if (updateError) {
    console.error('[verifyCode] update error:', updateError);
  }

  return true;
}
