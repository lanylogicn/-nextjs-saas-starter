/**
 * AI 检测报告 API
 * POST /api/ai-detection
 * 对交付物文本进行 AI 检测分析
 */
import { NextRequest, NextResponse } from 'next/server';

export interface AIDetectionResult {
  // 检测状态: passed | pending | failed
  status: 'passed' | 'pending' | 'failed';
  // AIGC 疑似度 (0-100, 越低越好)
  aigcScore: number;
  // 模板套用检测 (0-100, 越低越好)
  templateScore: number;
  // 质量评分 (0-100, 越高越好)
  qualityScore: number;
  // 检测维度详情
  dimensions: {
    name: string;
    score: number;
    description: string;
  }[];
  // 检测摘要
  summary: string;
  // 检测时间
  detectedAt: string;
  // 文本字数
  wordCount: number;
}

/**
 * 简单的文本分析算法（模拟 AI 检测）
 * 实际生产环境可接入专业 AI 检测 API
 */
function analyzeText(text: string): AIDetectionResult {
  const wordCount = text.length;

  // 1. AIGC 疑似度分析
  // 基于文本特征：词汇多样性、句式复杂度、个性化表达
  const words = text.split(/\s+/);
  const uniqueWords = new Set(words);
  const vocabularyRichness = uniqueWords.size / Math.max(words.length, 1);

  // 检测常见 AI 生成特征
  const aiPatterns = [
    /综上所述/g, /总而言之/g, /值得注意的是/g,
    /不可否认/g, /众所周知/g, /毫无疑问/g,
    /首先[\s\S]*其次[\s\S]*最后/g, /一方面[\s\S]*另一方面/g,
  ];
  const aiPatternMatches = aiPatterns.filter(p => p.test(text)).length;

  // AIGC 疑似度计算（越低越好）
  let aigcScore = 50; // 基础分
  aigcScore -= vocabularyRichness * 30; // 词汇丰富度降低疑似度
  aigcScore += aiPatternMatches * 8; // AI 模式增加疑似度
  aigcScore -= Math.min(wordCount / 100, 10); // 长文本降低疑似度
  aigcScore = Math.max(0, Math.min(100, aigcScore));

  // 2. 模板套用检测
  // 检测是否有明显的模板痕迹
  const templateIndicators = [
    /尊敬的.*客户/g, /尊敬的.*先生\/女士/g,
    /附件.*请查收/g, /如有.*请联系/g,
    /此致[\s\S]*敬礼/g, /祝.*商祺/g,
  ];
  const templateMatches = templateIndicators.filter(p => p.test(text)).length;

  // 检测重复段落
  const paragraphs = text.split(/\n\n+/);
  const uniqueParagraphs = new Set(paragraphs);
  const paragraphRepetition = 1 - (uniqueParagraphs.size / Math.max(paragraphs.length, 1));

  let templateScore = 30 + templateMatches * 15 + paragraphRepetition * 30;
  templateScore = Math.max(0, Math.min(100, templateScore));

  // 3. 质量评分
  // 基于：字数、结构完整性、格式规范
  let qualityScore = 60; // 基础分
  if (wordCount > 500) qualityScore += 10;
  if (wordCount > 1000) qualityScore += 5;
  if (paragraphs.length > 3) qualityScore += 10; // 有分段
  if (text.includes('。') || text.includes('.')) qualityScore += 5; // 有标点
  if (/[一-龥]/.test(text)) qualityScore += 5; // 有中文
  if (/^\d+[\.\、\)]/.test(text)) qualityScore += 5; // 有序号
  qualityScore = Math.max(0, Math.min(100, qualityScore));

  // 检测维度详情
  const dimensions = [
    {
      name: '词汇多样性',
      score: Math.round(vocabularyRichness * 100),
      description: vocabularyRichness > 0.5 ? '用词丰富，表达多样' : '用词较为单一',
    },
    {
      name: '句式复杂度',
      score: Math.round(Math.min(wordCount / 20, 100)),
      description: wordCount > 500 ? '句式较为复杂' : '句式较为简单',
    },
    {
      name: '个性化表达',
      score: Math.round(100 - aiPatternMatches * 20),
      description: aiPatternMatches === 0 ? '表达个性化强' : '存在模板化表达',
    },
    {
      name: '结构完整性',
      score: Math.round(Math.min(paragraphs.length * 20, 100)),
      description: paragraphs.length > 3 ? '结构完整' : '结构较简单',
    },
    {
      name: '格式规范',
      score: qualityScore,
      description: qualityScore > 80 ? '格式规范' : '格式有待改进',
    },
  ];

  // 综合判定状态
  let status: 'passed' | 'pending' | 'failed';
  if (aigcScore < 30 && qualityScore > 70) {
    status = 'passed';
  } else if (aigcScore > 60 || qualityScore < 50) {
    status = 'failed';
  } else {
    status = 'pending';
  }

  // 生成摘要
  let summary = '';
  if (status === 'passed') {
    summary = '检测通过：文本原创性较高，质量良好，符合交付标准。';
  } else if (status === 'failed') {
    summary = '检测未通过：文本存在较高 AI 生成嫌疑或质量问题，建议修改后重新提交。';
  } else {
    summary = '检测中：文本特征介于原创与 AI 生成之间，建议人工复核。';
  }

  return {
    status,
    aigcScore: Math.round(aigcScore),
    templateScore: Math.round(templateScore),
    qualityScore: Math.round(qualityScore),
    dimensions,
    summary,
    detectedAt: new Date().toISOString(),
    wordCount,
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text, orderId } = body;

    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: '请提供要检测的文本内容' },
        { status: 400 }
      );
    }

    if (text.length < 50) {
      return NextResponse.json(
        { error: '文本内容过短，至少需要50字' },
        { status: 400 }
      );
    }

    // 执行 AI 检测
    const result = analyzeText(text);

    return NextResponse.json({
      success: true,
      orderId,
      ...result,
    });
  } catch (error) {
    console.error('AI detection error:', error);
    return NextResponse.json(
      { error: '检测失败，请稍后重试' },
      { status: 500 }
    );
  }
}
