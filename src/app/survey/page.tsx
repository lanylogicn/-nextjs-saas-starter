'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { Send, CheckCircle2 } from 'lucide-react';

interface SurveyQuestion {
  id: string;
  question_text: string;
  question_type: string;
  options: string[] | null;
  is_required: boolean;
  sort_order: number;
}

export default function SurveyPage() {
  const { user } = useAuth();
  const [questions, setQuestions] = useState<SurveyQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/survey')
      .then(res => res.json())
      .then(data => {
        if (data.questions) setQuestions(data.questions);
      })
      .catch(() => {});
  }, []);

  const handleSingleChoice = (qId: string, option: string) => {
    setAnswers(prev => ({ ...prev, [qId]: option }));
  };

  const handleMultipleChoice = (qId: string, option: string) => {
    setAnswers(prev => {
      const current = (prev[qId] as string[]) || [];
      const updated = current.includes(option)
        ? current.filter(o => o !== option)
        : [...current, option];
      return { ...prev, [qId]: updated };
    });
  };

  const handleText = (qId: string, value: string) => {
    setAnswers(prev => ({ ...prev, [qId]: value }));
  };

  const handleSubmit = async () => {
    // Validate required questions
    for (const q of questions) {
      if (q.is_required) {
        const answer = answers[q.id];
        if (!answer || (Array.isArray(answer) && answer.length === 0)) {
          setError(`请回答：${q.question_text}`);
          return;
        }
      }
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/survey/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ answers }),
      });
      const data = await res.json();
      if (data.success) {
        setSubmitted(true);
      } else {
        setError(data.error || '提交失败');
      }
    } catch {
      setError('提交失败，请稍后再试');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <CheckCircle2 className="w-16 h-16 text-emerald-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-indigo-900 mb-2">感谢您的反馈！</h2>
          <p className="text-stone-600">您的建议对我们非常重要，我们会认真对待每一条反馈。</p>
          <Link href="/" className="inline-block mt-6 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
            返回首页
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[60vh] py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-indigo-900 mb-2">用户建议</h1>
          <p className="text-stone-600">您的每一条反馈都在帮助奕諾变得更好</p>
        </div>

        {!user && (
          <div className="bg-indigo-50 border border-indigo-200 text-indigo-800 p-4 rounded-lg mb-6 text-sm">
            提示：登录后提交问卷，方便我们跟进您的反馈。未登录用户也可以提交匿名问卷。
          </div>
        )}

        {questions.length === 0 ? (
          <div className="text-center text-stone-500 py-12">暂无问卷</div>
        ) : (
          <div className="space-y-6">
            {questions.map((q, idx) => (
              <div key={q.id} className="bg-white border border-stone-200 rounded-xl p-5 shadow-sm">
                <div className="flex items-start gap-2 mb-3">
                  <span className="bg-indigo-100 text-indigo-700 text-sm font-bold px-2 py-0.5 rounded">
                    {idx + 1}
                  </span>
                  <h3 className="font-medium text-stone-800">
                    {q.question_text}
                    {q.is_required && <span className="text-red-500 ml-1">*</span>}
                  </h3>
                </div>

                {/* Single choice */}
                {q.question_type === 'single_choice' && q.options && (
                  <div className="space-y-2 ml-8">
                    {(q.options as string[]).map(opt => (
                      <label key={opt} className="flex items-center gap-3 cursor-pointer group">
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${
                          answers[q.id] === opt ? 'border-indigo-600 bg-indigo-600' : 'border-stone-300 group-hover:border-indigo-400'
                        }`}>
                          {answers[q.id] === opt && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                        </div>
                        <span className="text-stone-700">{opt}</span>
                      </label>
                    ))}
                  </div>
                )}

                {/* Multiple choice */}
                {q.question_type === 'multiple_choice' && q.options && (
                  <div className="space-y-2 ml-8">
                    {(q.options as string[]).map(opt => {
                      const selected = ((answers[q.id] as string[]) || []).includes(opt);
                      return (
                        <label key={opt} className="flex items-center gap-3 cursor-pointer group">
                          <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors ${
                            selected ? 'border-indigo-600 bg-indigo-600' : 'border-stone-300 group-hover:border-indigo-400'
                          }`}>
                            {selected && (
                              <svg className="w-3 h-3 text-white" viewBox="0 0 12 12" fill="none">
                                <path d="M2 6L5 9L10 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            )}
                          </div>
                          <span className="text-stone-700">{opt}</span>
                        </label>
                      );
                    })}
                  </div>
                )}

                {/* Text */}
                {q.question_type === 'text' && (
                  <div className="ml-8">
                    <textarea
                      className="w-full border border-stone-300 rounded-lg p-3 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 resize-none"
                      rows={3}
                      placeholder="请输入您的想法..."
                      value={(answers[q.id] as string) || ''}
                      onChange={e => handleText(q.id, e.target.value)}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg mt-4 text-sm">
            {error}
          </div>
        )}

        {questions.length > 0 && (
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full mt-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Send className="w-4 h-4" />
            {loading ? '提交中...' : '提交反馈'}
          </button>
        )}
      </div>
    </div>
  );
}
