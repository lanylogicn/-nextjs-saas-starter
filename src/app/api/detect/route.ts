import { NextResponse } from 'next/server';

interface DetectRequest {
  text: string;
  category: string;
}

interface DimensionResult {
  name: string;
  score: number;
  description: string;
}

function generateReportId(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = 'YN-';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function analyzeText(text: string, category: string): {
  aiProbability: number;
  dimensions: DimensionResult[];
  summary: string;
} {
  const len = text.length;
  const sentences = text.split(/[。！？.!?\n]/).filter((s) => s.trim().length > 0);
  const avgSentenceLen = len / Math.max(sentences.length, 1);

  // Character frequency analysis
  const charFreq: Record<string, number> = {};
  for (const char of text) {
    charFreq[char] = (charFreq[char] || 0) + 1;
  }
  const uniqueChars = Object.keys(charFreq).length;
  const entropy = uniqueChars / Math.max(len, 1);

  // Repetition detection
  const repeatedPhrases = new Set<string>();
  for (let i = 0; i < text.length - 4; i++) {
    const phrase = text.slice(i, i + 4);
    if (text.indexOf(phrase) !== text.lastIndexOf(phrase)) {
      repeatedPhrases.add(phrase);
    }
  }

  // Score dimensions
  const languageScore = Math.min(10, Math.max(1, Math.round(entropy * 50)));
  const structureScore = Math.min(10, Math.max(1, Math.round(10 - Math.abs(avgSentenceLen - 20) / 5)));
  const vocabScore = Math.min(10, Math.max(1, Math.round(uniqueChars / Math.max(len / 10, 1))));
  const consistencyScore = Math.min(10, Math.max(1, Math.round(10 - repeatedPhrases.size / 3)));
  const depthScore = Math.min(10, Math.max(1, Math.round(len / 100)));

  // Compute AI probability based on heuristics
  let aiBase = 30;

  // Very uniform sentence lengths suggest AI
  const sentenceLengths = sentences.map((s) => s.length);
  const avgLen = sentenceLengths.reduce((a, b) => a + b, 0) / Math.max(sentenceLengths.length, 1);
  const variance = sentenceLengths.reduce((sum, l) => sum + Math.pow(l - avgLen, 2), 0) / Math.max(sentenceLengths.length, 1);
  if (variance < 50) aiBase += 15;
  if (variance > 200) aiBase -= 10;

  // Low repetition suggests AI (humans repeat more)
  if (repeatedPhrases.size < 3) aiBase += 10;

  // Very high vocabulary diversity can suggest AI
  if (entropy > 0.8) aiBase += 10;

  // Category adjustments
  if (category === 'academic') aiBase += 5;
  if (category === 'code') aiBase -= 5;

  // Clamp
  const aiProbability = Math.min(95, Math.max(5, Math.round(aiBase + (Math.random() * 10 - 5))));

  const dimensions: DimensionResult[] = [
    {
      name: '语言模式',
      score: languageScore,
      description: languageScore >= 7 ? '用词多样，表达丰富' : languageScore >= 4 ? '用词较为常规' : '用词较为单一，存在重复模式',
    },
    {
      name: '逻辑结构',
      score: structureScore,
      description: structureScore >= 7 ? '句式变化丰富，节奏自然' : structureScore >= 4 ? '句式较为规整' : '句式过于均匀，缺乏变化',
    },
    {
      name: '词汇分布',
      score: vocabScore,
      description: vocabScore >= 7 ? '词汇分布自然，有个性化用词' : vocabScore >= 4 ? '词汇使用较为标准' : '词汇分布过于均匀',
    },
    {
      name: '风格一致性',
      score: consistencyScore,
      description: consistencyScore >= 7 ? '风格自然波动，符合人类写作' : consistencyScore >= 4 ? '风格较为稳定' : '风格过于一致，疑似机器生成',
    },
    {
      name: '内容深度',
      score: depthScore,
      description: depthScore >= 7 ? '内容详实，有具体细节' : depthScore >= 4 ? '内容较为充实' : '内容较为表面',
    },
  ];

  let summary = '';
  if (aiProbability <= 20) {
    summary = '该文本呈现出较强的人类原创特征，用词和句式具有自然波动，整体风格一致性好。';
  } else if (aiProbability <= 50) {
    summary = '该文本存在部分 AI 生成特征，但同时也包含人类写作的典型模式，可能为混合内容。';
  } else {
    summary = '该文本呈现出较强的 AI 生成特征，句式均匀、用词标准化程度高，建议进一步核实。';
  }

  return { aiProbability, dimensions, summary };
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as DetectRequest;
    const { text, category } = body;

    if (!text || typeof text !== 'string' || text.trim().length < 10) {
      return NextResponse.json(
        { error: '文本内容不能少于 10 个字符' },
        { status: 400 }
      );
    }

    const analysis = analyzeText(text, category || 'general');

    const humanProbability = Math.max(0, Math.round((100 - analysis.aiProbability) * 0.7));
    const mixedProbability = Math.max(0, 100 - analysis.aiProbability - humanProbability);

    const now = new Date();
    const timestamp = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const confidence = Math.min(98, Math.max(75, Math.round(70 + text.length / 100)));

    return NextResponse.json({
      reportId: generateReportId(),
      aiProbability: analysis.aiProbability,
      humanProbability,
      mixedProbability,
      confidence,
      dimensions: analysis.dimensions,
      summary: analysis.summary,
      timestamp,
      wordCount: text.length,
      category: category || 'general',
    });
  } catch {
    return NextResponse.json(
      { error: '检测服务异常，请稍后重试' },
      { status: 500 }
    );
  }
}
