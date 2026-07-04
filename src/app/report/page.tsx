'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DetectResult, type DetectResponse } from '@/components/report/detect-result';

type DetectState = 'idle' | 'detecting' | 'done' | 'error';

export default function ReportPage() {
  const [text, setText] = useState('');
  const [category, setCategory] = useState('general');
  const [state, setState] = useState<DetectState>('idle');
  const [result, setResult] = useState<DetectResponse | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const handleDetect = useCallback(async () => {
    if (!text.trim()) return;
    setState('detecting');
    setResult(null);
    setErrorMsg('');

    try {
      const res = await fetch('/api/detect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, category }),
      });
      const data = await res.json() as DetectResponse & { error?: string };
      if (!res.ok) {
        setState('error');
        setErrorMsg(data.error || '检测失败，请重试');
        return;
      }
      setResult(data);
      setState('done');
    } catch {
      setState('error');
      setErrorMsg('网络异常，请检查连接后重试');
    }
  }, [text, category]);

  const handleReset = useCallback(() => {
    setText('');
    setCategory('general');
    setState('idle');
    setResult(null);
    setErrorMsg('');
  }, []);

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-bold text-foreground">
          AI 检测报告
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          上传或粘贴待检测内容，系统将进行多维度 AI 生成概率分析，出具权威检测报告
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Input Panel */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="font-serif text-lg">待检测内容</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                内容品类
              </label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="选择品类" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">通用文本</SelectItem>
                  <SelectItem value="academic">学术论文</SelectItem>
                  <SelectItem value="code">代码片段</SelectItem>
                  <SelectItem value="copywriting">营销文案</SelectItem>
                  <SelectItem value="translation">翻译内容</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-foreground">
                  文本内容
                </label>
                <span className="text-xs text-muted-foreground">
                  {text.length} 字
                </span>
              </div>
              <Textarea
                placeholder="请粘贴需要检测的文本内容，建议不少于 100 字以获得更准确的检测结果..."
                value={text}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setText(e.target.value)}
                className="min-h-[240px] resize-y text-sm leading-relaxed"
                disabled={state === 'detecting'}
              />
            </div>

            <div className="flex gap-3">
              <Button
                onClick={handleDetect}
                disabled={!text.trim() || state === 'detecting'}
                className="flex-1"
              >
                {state === 'detecting' ? '检测中...' : '开始检测'}
              </Button>
              <Button
                variant="outline"
                onClick={handleReset}
                disabled={state === 'detecting'}
              >
                重置
              </Button>
            </div>

            {state === 'detecting' && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>正在进行多维度分析...</span>
                </div>
                <Progress value={65} className="h-1.5" />
              </div>
            )}

            {state === 'error' && (
              <div className="rounded-md border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                {errorMsg}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Result Panel */}
        <div className="lg:col-span-2">
          {state === 'idle' && (
            <Card className="flex h-full items-center justify-center border-dashed">
              <div className="p-8 text-center">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-accent">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-6 w-6 text-amber">
                    <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <p className="text-sm text-muted-foreground">
                  检测报告将在此处展示
                </p>
              </div>
            </Card>
          )}

          {state === 'done' && result && <DetectResult data={result} />}

          {state === 'detecting' && (
            <Card className="flex h-full items-center justify-center">
              <div className="p-8 text-center">
                <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-border border-t-amber" />
                <p className="text-sm text-muted-foreground">
                  正在分析内容特征...
                </p>
                <div className="mt-3 flex flex-wrap justify-center gap-1.5">
                  {['语言模式', '逻辑结构', '用词分布', '风格一致性'].map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs animate-pulse">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
