/**
 * 管理员文档下载 API
 *
 * GET /api/admin/docs/download?type=full|api|guide|tutorial|quickref|detailedguide
 *
 * 根据类型参数返回对应的 Markdown 文件下载。
 * 认证：需管理员 cookie
 */

import { NextRequest, NextResponse } from 'next/server';
import * as fs from 'fs';
import * as path from 'path';

/** 读取 docs/ 目录下的 Markdown 文件 */
function readDoc(filename: string): string {
  try {
    const filePath = path.join(process.cwd(), 'docs', filename);
    return fs.readFileSync(filePath, 'utf-8');
  } catch {
    return `文档加载失败：${filename} 不存在`;
  }
}

export async function GET(request: NextRequest) {

  const type = new URL(request.url).searchParams.get('type') || 'full';
  const now = new Date().toLocaleString('zh-CN');

  let content: string;
  let filename: string;

  switch (type) {
    case 'api':
      content = readDoc('api.md');
      filename = 'yinuo-api-docs.md';
      break;

    case 'guide':
      content = readDoc('guide.md');
      filename = 'yinuo-modification-guide.md';
      break;

    case 'tutorial':
      content = readDoc('tutorial.md');
      filename = 'yinuo-tutorial.md';
      break;

    case 'quickref':
      content = readDoc('quick-ref.md');
      filename = 'yinuo-quick-ref.md';
      break;

    case 'detailedguide':
      content = readDoc('detailed-guide.md');
      filename = 'yinuo-detailed-modification-guide.md';
      break;

    case 'full':
    default:
      content = [
        `# 奕诺 — 完整项目文档\n\n> 生成时间：${now}\n\n---\n`,
        readDoc('overview.md'),
        '\n\n---\n\n',
        readDoc('quick-ref.md'),
        '\n\n---\n\n',
        readDoc('directory.md'),
        '\n\n---\n\n',
        readDoc('modules.md'),
        '\n\n---\n\n',
        readDoc('api.md'),
        '\n\n---\n\n',
        readDoc('guide.md'),
        '\n\n---\n\n',
        readDoc('tutorial.md'),
        '\n\n---\n\n',
        readDoc('detailed-guide.md'),
      ].join('');
      filename = 'yinuo-full-docs.md';
      break;
  }

  return new NextResponse(content, {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  });
}
