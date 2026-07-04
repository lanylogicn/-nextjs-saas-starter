'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

export interface DetectResponse {
  reportId: string;
  aiProbability: number;
  humanProbability: number;
  mixedProbability: number;
  confidence: number;
  dimensions: {
    name: string;
    score: number;
    description: string;
  }[];
  summary: string;
  timestamp: string;
  wordCount: number;
  category: string;
}

interface DetectResultProps {
  data: DetectResponse;
}

function getRiskLevel(probability: number): { label: string; color: string } {
  if (probability <= 20) return { label: '低风险', color: 'bg-success text-white' };
  if (probability <= 50) return { label: '中风险', color: 'bg-warn text-white' };
  return { label: '高风险', color: 'bg-destructive text-white' };
}

function getCategoryLabel(category: string): string {
  const map: Record<string, string> = {
    general: '通用文本',
    academic: '学术论文',
    code: '代码片段',
    copywriting: '营销文案',
    translation: '翻译内容',
  };
  return map[category] || '通用文本';
}

export function DetectResult({ data }: DetectResultProps) {
  const risk = getRiskLevel(data.aiProbability);

  return (
    <Card className="animate-fade-up">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="font-serif text-lg">检测报告</CardTitle>
          <Badge variant="secondary" className="text-xs">
            #{data.reportId}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Score Circle */}
        <div className="flex items-center gap-5">
          <div className="relative flex h-20 w-20 shrink-0 items-center justify-center">
            <svg className="h-20 w-20 -rotate-90" viewBox="0 0 80 80">
              <circle cx="40" cy="40" r="34" fill="none" stroke="var(--border)" strokeWidth="6" />
              <circle
                cx="40"
                cy="40"
                r="34"
                fill="none"
                stroke="var(--amber)"
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={`${(data.aiProbability / 100) * 213.6} 213.6`}
                className="animate-progress"
              />
            </svg>
            <span className="absolute font-serif text-lg font-bold text-foreground">
              {data.aiProbability}%
            </span>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className={`inline-flex rounded px-2 py-0.5 text-xs font-medium ${risk.color}`}>
                {risk.label}
              </span>
              <span className="text-xs text-muted-foreground">
                置信度 {data.confidence}%
              </span>
            </div>
            <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
              {data.summary}
            </p>
          </div>
        </div>

        <Separator />

        {/* Probability Breakdown */}
        <div className="space-y-2.5">
          <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            概率分布
          </h4>
          {[
            { label: 'AI 生成', value: data.aiProbability, color: 'bg-amber' },
            { label: '人类原创', value: data.humanProbability, color: 'bg-success' },
            { label: '混合内容', value: data.mixedProbability, color: 'bg-warn' },
          ].map((item) => (
            <div key={item.label} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">{item.label}</span>
                <span className="font-medium text-foreground">{item.value}%</span>
              </div>
              <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                <div
                  className={`h-full rounded-full ${item.color} animate-progress`}
                  style={{ width: `${item.value}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        <Separator />

        {/* Dimensions */}
        <div className="space-y-2.5">
          <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            维度分析
          </h4>
          {data.dimensions.map((dim) => (
            <div key={dim.name} className="flex items-start gap-2">
              <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded bg-accent text-xs font-medium text-amber">
                {dim.score}
              </div>
              <div>
                <div className="text-xs font-medium text-foreground">{dim.name}</div>
                <div className="text-xs text-muted-foreground">{dim.description}</div>
              </div>
            </div>
          ))}
        </div>

        <Separator />

        {/* Meta Info */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div>
            <span className="text-muted-foreground">品类：</span>
            <span className="text-foreground">{getCategoryLabel(data.category)}</span>
          </div>
          <div>
            <span className="text-muted-foreground">字数：</span>
            <span className="text-foreground">{data.wordCount}</span>
          </div>
          <div>
            <span className="text-muted-foreground">时间：</span>
            <span className="text-foreground">{data.timestamp}</span>
          </div>
          <div>
            <span className="text-muted-foreground">报告编号：</span>
            <span className="font-mono text-foreground">{data.reportId}</span>
          </div>
        </div>

        <Button variant="outline" className="w-full text-sm" onClick={() => window.print()}>
          打印 / 导出报告
        </Button>
      </CardContent>
    </Card>
  );
}
