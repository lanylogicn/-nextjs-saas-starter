'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TemplatePreview } from '@/components/templates/template-preview';

interface Template {
  id: string;
  name: string;
  category: string;
  description: string;
  fields: { key: string; label: string; type: 'text' | 'textarea' | 'date' | 'select'; required: boolean; options?: string[] }[];
  tags: string[];
}

const templates: Template[] = [
  {
    id: 'academic-paper',
    name: '学术论文交付',
    category: '学术',
    description: '适用于毕业论文、期刊投稿等学术场景，包含标题、摘要、正文、参考文献等完整结构。',
    fields: [
      { key: 'title', label: '论文标题', type: 'text', required: true },
      { key: 'author', label: '作者姓名', type: 'text', required: true },
      { key: 'institution', label: '所属机构', type: 'text', required: false },
      { key: 'abstract', label: '摘要', type: 'textarea', required: true },
      { key: 'keywords', label: '关键词', type: 'text', required: true },
      { key: 'submitDate', label: '提交日期', type: 'date', required: true },
    ],
    tags: ['论文', '学术', '期刊'],
  },
  {
    id: 'design-delivery',
    name: '设计稿交付',
    category: '设计',
    description: '适用于 UI 设计、品牌设计、海报设计等视觉类交付，包含设计说明、源文件清单、版本记录。',
    fields: [
      { key: 'projectName', label: '项目名称', type: 'text', required: true },
      { key: 'clientName', label: '客户名称', type: 'text', required: true },
      { key: 'designType', label: '设计类型', type: 'select', required: true, options: ['UI设计', '品牌设计', '海报设计', '包装设计', '其他'] },
      { key: 'description', label: '设计说明', type: 'textarea', required: true },
      { key: 'fileList', label: '交付文件清单', type: 'textarea', required: true },
      { key: 'version', label: '版本号', type: 'text', required: true },
    ],
    tags: ['设计', 'UI', '品牌'],
  },
  {
    id: 'code-delivery',
    name: '代码项目交付',
    category: '开发',
    description: '适用于软件开发、网站搭建、小程序开发等技术类交付，包含技术栈、部署说明、源码结构。',
    fields: [
      { key: 'projectName', label: '项目名称', type: 'text', required: true },
      { key: 'techStack', label: '技术栈', type: 'text', required: true },
      { key: 'description', label: '功能描述', type: 'textarea', required: true },
      { key: 'deployGuide', label: '部署说明', type: 'textarea', required: false },
      { key: 'repoUrl', label: '仓库地址', type: 'text', required: false },
      { key: 'deliverDate', label: '交付日期', type: 'date', required: true },
    ],
    tags: ['代码', '开发', '技术'],
  },
  {
    id: 'copywriting',
    name: '文案内容交付',
    category: '文案',
    description: '适用于营销文案、品牌故事、公众号文章等内容类交付，包含创作brief、修改记录、终稿确认。',
    fields: [
      { key: 'title', label: '内容标题', type: 'text', required: true },
      { key: 'clientName', label: '客户/品牌', type: 'text', required: true },
      { key: 'contentType', label: '内容类型', type: 'select', required: true, options: ['营销文案', '品牌故事', '公众号文章', '产品描述', '新闻稿', '其他'] },
      { key: 'brief', label: '创作需求', type: 'textarea', required: true },
      { key: 'content', label: '终稿内容', type: 'textarea', required: true },
      { key: 'deliverDate', label: '交付日期', type: 'date', required: true },
    ],
    tags: ['文案', '营销', '内容'],
  },
  {
    id: 'translation',
    name: '翻译服务交付',
    category: '翻译',
    description: '适用于文档翻译、本地化、字幕翻译等翻译类交付，包含原文、译文、术语表、质量评估。',
    fields: [
      { key: 'projectName', label: '项目名称', type: 'text', required: true },
      { key: 'sourceLang', label: '源语言', type: 'text', required: true },
      { key: 'targetLang', label: '目标语言', type: 'text', required: true },
      { key: 'wordCount', label: '字数', type: 'text', required: true },
      { key: 'description', label: '内容概述', type: 'textarea', required: true },
      { key: 'deliverDate', label: '交付日期', type: 'date', required: true },
    ],
    tags: ['翻译', '本地化', '多语言'],
  },
  {
    id: 'consulting',
    name: '咨询报告交付',
    category: '咨询',
    description: '适用于行业分析、市场调研、战略规划等咨询类交付，包含研究方法论、核心发现、建议方案。',
    fields: [
      { key: 'reportTitle', label: '报告标题', type: 'text', required: true },
      { key: 'clientName', label: '委托方', type: 'text', required: true },
      { key: 'researchScope', label: '研究范围', type: 'textarea', required: true },
      { key: 'methodology', label: '研究方法', type: 'textarea', required: true },
      { key: 'keyFindings', label: '核心发现', type: 'textarea', required: true },
      { key: 'deliverDate', label: '交付日期', type: 'date', required: true },
    ],
    tags: ['咨询', '报告', '研究'],
  },
];

const categories = ['全部', '学术', '设计', '开发', '文案', '翻译', '咨询'];

export default function TemplatesPage() {
  const [selectedCategory, setSelectedCategory] = useState('全部');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);

  const filtered = templates.filter((t) => {
    const matchCategory = selectedCategory === '全部' || t.category === selectedCategory;
    const matchSearch =
      !searchQuery ||
      t.name.includes(searchQuery) ||
      t.description.includes(searchQuery) ||
      t.tags.some((tag) => tag.includes(searchQuery));
    return matchCategory && matchSearch;
  });

  if (selectedTemplate) {
    return (
      <TemplatePreview
        template={selectedTemplate}
        onBack={() => setSelectedTemplate(null)}
      />
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-bold text-foreground">
          品类化交付模板
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          覆盖主流代做品类，提供标准化交付模板，确保交付物结构完整、格式规范、可验收
        </p>
      </div>

      {/* Filters */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`rounded-md px-3 py-1.5 text-sm transition-colors ${
                selectedCategory === cat
                  ? 'bg-primary text-primary-foreground font-medium'
                  : 'bg-card text-muted-foreground hover:text-foreground border border-border'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
        <Input
          placeholder="搜索模板..."
          value={searchQuery}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
          className="max-w-xs"
        />
      </div>

      {/* Template Grid */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((template) => (
          <Card
            key={template.id}
            className="group cursor-pointer transition-all duration-200 hover:border-amber/30 hover:shadow-sm"
            onClick={() => setSelectedTemplate(template)}
          >
            <CardContent className="p-5">
              <div className="mb-3 flex items-center justify-between">
                <Badge variant="secondary" className="text-xs">
                  {template.category}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {template.fields.length} 个字段
                </span>
              </div>
              <h3 className="font-serif text-base font-semibold text-foreground group-hover:text-amber transition-colors">
                {template.name}
              </h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed line-clamp-2">
                {template.description}
              </p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {template.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded bg-accent px-1.5 py-0.5 text-xs text-muted-foreground"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <div className="mt-4 text-xs font-medium text-amber opacity-0 transition-opacity group-hover:opacity-100">
                使用模板 &rarr;
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="py-20 text-center">
          <p className="text-sm text-muted-foreground">
            未找到匹配的模板，请调整筛选条件
          </p>
        </div>
      )}
    </div>
  );
}
