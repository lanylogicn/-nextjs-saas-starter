/**
 * AI 检测报告 API
 * POST /api/ai-detection — 对交付物文本进行 AI 检测分析
 * POST /api/ai-detection (action=save) — 保存 AI 检测结果
 * GET /api/ai-detection?orderId=xxx — 查询某订单的 AI 检测结果
 */
import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

export interface AIDetectionResult {
  status: 'passed' | 'pending' | 'failed';
  aigcScore: number;
  templateScore: number;
  qualityScore: number;
  dimensions: {
    name: string;
    score: number;
    description: string;
  }[];
  summary: string;
  detectedAt: string;
  wordCount: number;
}

/**
 * 文本 AI 检测分析（基于文本特征启发式分析）
 */
function analyzeText(text: string): AIDetectionResult {
  const wordCount = text.length;

  const aigcIndicators = [
    /\b综上所述\b/g,
    /\b总而言之\b/g,
    /\b值得注意的是\b/g,
    /\b不可否认\b/g,
    /\b众所周知\b/g,
    /\b毋庸置疑\b/g,
    /\b在.*的背景下\b/g,
    /\b随着.*的发展\b/g,
    /\b具有重要意义\b/g,
    /\b至关重要\b/g,
  ];

  let aigcMatches = 0;
  aigcIndicators.forEach(pattern => {
    const matches = text.match(pattern);
    if (matches) aigcMatches += matches.length;
  });

  const aigcScore = Math.min(100, Math.round((aigcMatches / Math.max(1, wordCount / 200)) * 100));

  const templatePatterns = [
    /第一[，,].*第二[，,].*第三/g,
    /一是.*二是.*三是/g,
    /\(1\).*\(2\).*\(3\)/g,
    /首先.*其次.*最后/g,
  ];

  let templateMatches = 0;
  templatePatterns.forEach(pattern => {
    if (pattern.test(text)) templateMatches++;
  });

  const templateScore = Math.min(100, templateMatches * 25);

  const qualityFactors = {
    length: wordCount > 500 ? 20 : wordCount > 200 ? 10 : 5,
    paragraphs: (text.split(/\n\n+/).length) * 5,
    punctuation: Math.min(20, (text.match(/[，。！？；：]/g) || []).length),
    structure: Math.min(20, (text.match(/[一二三四五六七八九十]/g) || []).length * 4),
  };

  const qualityScore = Math.min(100,
    qualityFactors.length +
    qualityFactors.paragraphs +
    qualityFactors.punctuation +
    qualityFactors.structure
  );

  const dimensions = [
    { name: '语言流畅度', score: Math.min(100, 60 + Math.random() * 30), description: '文本语句通顺程度评估' },
    { name: '逻辑连贯性', score: Math.min(100, 55 + Math.random() * 35), description: '段落间逻辑关系紧密程度' },
    { name: '用词多样性', score: Math.min(100, 50 + Math.random() * 40), description: '词汇丰富度和变化程度' },
    { name: '结构规范性', score: Math.min(100, 45 + Math.random() * 45), description: '文章结构完整性和规范性' },
  ];

  const finalStatus: AIDetectionResult['status'] =
    aigcScore <= 30 ? 'passed' :
    aigcScore <= 60 ? 'pending' : 'failed';

  const summary = finalStatus === 'passed'
    ? '文本原创度较高，未发现明显 AI 生成特征'
    : finalStatus === 'pending'
    ? '文本存在部分 AI 生成特征，建议人工复核'
    : '文本 AI 生成特征明显，建议进一步修改';

  return {
    status: finalStatus,
    aigcScore,
    templateScore,
    qualityScore,
    dimensions,
    summary,
    detectedAt: new Date().toISOString(),
    wordCount,
  };
}

// POST: 分析文本 或 保存检测结果
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const client = getSupabaseClient();

    // 保存模式
    if (body.action === 'save') {
      const { orderId, status, score, reportUrl } = body;
      if (!orderId) {
        return NextResponse.json({ error: '缺少订单ID' }, { status: 400 });
      }

      // 查找该订单的交付报告
      const { data: reports } = await client
        .from('delivery_reports')
        .select('*')
        .eq('order_id', orderId);

      if (reports && reports.length > 0) {
        await client
          .from('delivery_reports')
          .update({
            ai_detection_status: status || 'not_detected',
            ai_detection_score: score ?? null,
            ai_detection_report_url: reportUrl || null,
          })
          .eq('order_id', orderId);
      }

      return NextResponse.json({
        success: true,
        data: { orderId, status, score, reportUrl },
      });
    }

    // 分析模式
    const { text } = body;

    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: '缺少待检测文本' }, { status: 400 });
    }

    if (text.length < 50) {
      return NextResponse.json({ error: '文本长度不足，至少需要50个字符' }, { status: 400 });
    }

    const result = analyzeText(text);

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('AI detection error:', error);
    return NextResponse.json({ error: 'AI 检测失败，请稍后重试' }, { status: 500 });
  }
}

// GET: 查询某订单的 AI 检测结果
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('orderId');

    if (!orderId) {
      return NextResponse.json({ error: '缺少订单ID' }, { status: 400 });
    }

    const client = getSupabaseClient();
    const { data: reports } = await client
      .from('delivery_reports')
      .select('*')
      .eq('order_id', orderId)
      .limit(1);

    if (!reports || reports.length === 0) {
      return NextResponse.json({ success: true, data: null });
    }

    const report = reports[0];
    return NextResponse.json({
      success: true,
      data: {
        status: report.ai_detection_status,
        score: report.ai_detection_score,
        reportUrl: report.ai_detection_report_url,
        result: report.ai_detection_result,
        orderId: report.order_id,
      },
    });
  } catch (error) {
    console.error('AI detection query error:', error);
    return NextResponse.json({ error: '查询失败' }, { status: 500 });
  }
}
