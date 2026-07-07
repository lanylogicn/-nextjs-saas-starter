/**
 * 文件上传 API
 * POST /api/upload
 * 接收 multipart/form-data 格式的文件上传
 */
import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir, access } from 'fs/promises';
import { join } from 'path';
import { constants } from 'fs';

// 文件大小限制：20MB
const MAX_FILE_SIZE = 20 * 1024 * 1024;

// 支持的文件类型
const ALLOWED_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/webp',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/zip',
  'application/x-rar-compressed',
  'application/octet-stream', // 通用二进制流
];

// 文件扩展名映射
const EXTENSION_MAP: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/jpg': '.jpg',
  'image/png': '.png',
  'image/gif': '.gif',
  'image/webp': '.webp',
  'application/pdf': '.pdf',
  'application/msword': '.doc',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
  'application/vnd.ms-powerpoint': '.ppt',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': '.pptx',
  'application/vnd.ms-excel': '.xls',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '.xlsx',
  'application/zip': '.zip',
  'application/x-rar-compressed': '.rar',
};

export interface UploadResult {
  success: boolean;
  url?: string;
  filename?: string;
  originalName?: string;
  size?: number;
  type?: string;
  error?: string;
}

/**
 * 检查文件类型是否支持
 */
function isAllowedType(mimeType: string): boolean {
  return ALLOWED_TYPES.includes(mimeType) || mimeType.startsWith('image/');
}

/**
 * 获取文件扩展名
 */
function getExtension(mimeType: string, originalName: string): string {
  // 先从原始文件名获取扩展名
  const ext = originalName.toLowerCase().match(/\.[^.]+$/)?.[0];
  if (ext) return ext;
  
  // 从 MIME 类型获取
  return EXTENSION_MAP[mimeType] || '';
}

/**
 * 确保目录存在
 */
async function ensureDir(dirPath: string): Promise<void> {
  try {
    await access(dirPath, constants.F_OK);
  } catch {
    await mkdir(dirPath, { recursive: true });
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    // 获取文件
    const file = formData.get('file') as File | null;
    if (!file) {
      return NextResponse.json<UploadResult>(
        { success: false, error: '未找到上传文件' },
        { status: 400 }
      );
    }

    // 获取可选参数
    const orderId = formData.get('orderId') as string | null;
    const nodeIndex = formData.get('nodeIndex') as string | null;
    const type = formData.get('type') as string | null;

    // 检查文件大小
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json<UploadResult>(
        { success: false, error: `文件大小超过限制（最大 ${MAX_FILE_SIZE / 1024 / 1024}MB）` },
        { status: 413 }
      );
    }

    // 检查文件类型
    if (!isAllowedType(file.type)) {
      return NextResponse.json<UploadResult>(
        { success: false, error: `不支持的文件类型: ${file.type}` },
        { status: 400 }
      );
    }

    // 构建存储路径
    const uploadDir = orderId ? `uploads/${orderId}` : 'uploads/general';
    const fullUploadDir = join(process.cwd(), 'public', uploadDir);
    
    // 确保目录存在
    await ensureDir(fullUploadDir);

    // 生成文件名：时间戳_原始文件名
    const timestamp = Date.now();
    const ext = getExtension(file.type, file.name);
    const baseName = file.name.replace(/\.[^.]+$/, '').replace(/[^a-zA-Z0-9\u4e00-\u9fa5_-]/g, '_');
    const filename = `${timestamp}_${baseName}${ext}`;
    const filepath = join(fullUploadDir, filename);

    // 读取文件内容并写入
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filepath, buffer);

    // 构建返回 URL
    const url = `/${uploadDir}/${filename}`;

    return NextResponse.json<UploadResult>({
      success: true,
      url,
      filename,
      originalName: file.name,
      size: file.size,
      type: type || 'general',
    });

  } catch (error) {
    console.error('文件上传失败:', error);
    return NextResponse.json<UploadResult>(
      { success: false, error: '文件上传失败，请重试' },
      { status: 500 }
    );
  }
}

// 获取上传文件列表（可选）
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const orderId = searchParams.get('orderId');
  
  if (!orderId) {
    return NextResponse.json({ success: false, error: '缺少 orderId 参数' }, { status: 400 });
  }

  try {
    const uploadDir = join(process.cwd(), 'public', 'uploads', orderId);
    
    // 检查目录是否存在
    try {
      await access(uploadDir, constants.F_OK);
    } catch {
      return NextResponse.json({ success: true, files: [] });
    }

    // 读取目录内容
    const { readdir, stat } = await import('fs/promises');
    const files = await readdir(uploadDir);
    
    const fileList = await Promise.all(
      files.map(async (filename) => {
        const filepath = join(uploadDir, filename);
        const stats = await stat(filepath);
        return {
          filename,
          url: `/uploads/${orderId}/${filename}`,
          size: stats.size,
          uploadedAt: stats.birthtime.toISOString(),
        };
      })
    );

    return NextResponse.json({ success: true, files: fileList });
  } catch (error) {
    console.error('获取文件列表失败:', error);
    return NextResponse.json({ success: false, error: '获取文件列表失败' }, { status: 500 });
  }
}
