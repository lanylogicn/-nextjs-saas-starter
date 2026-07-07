'use client';

import React, { useState, useRef } from 'react';
import { Send, Paperclip, X, Image, FileText, Film, Music } from 'lucide-react';

const NODE_LABELS = [
  '订单接收',
  '需求梳理',
  '制作中',
  '初稿完成等待审核',
  '审核通过终稿输出',
  '终稿已交付',
  '确认完成',
];

interface ServiceProgressEntryProps {
  orderId: string;
  currentNodeIndex: number;
  onEntryAdded?: () => void;
}

export function ServiceProgressEntry({
  orderId,
  currentNodeIndex,
  onEntryAdded,
}: ServiceProgressEntryProps) {
  const [content, setContent] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length === 0) return;

    const newFiles = [...files, ...selectedFiles];
    setFiles(newFiles);

    // Generate previews for images
    selectedFiles.forEach((file) => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (ev) => {
          setPreviews((prev) => [...prev, ev.target?.result as string]);
        };
        reader.readAsDataURL(file);
      }
    });
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!content.trim() && files.length === 0) return;
    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('orderId', orderId);
      formData.append('nodeIndex', currentNodeIndex.toString());
      formData.append('content', content);

      files.forEach((file) => {
        formData.append('files', file);
      });

      const response = await fetch('/api/service-progress/record', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        setContent('');
        setFiles([]);
        setPreviews([]);
        setExpanded(false);
        onEntryAdded?.();
      } else {
        alert(result.error || '提交失败');
      }
    } catch (error) {
      console.error('Submit error:', error);
      alert('提交失败，请重试');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <Image size={14} />;
    if (type.startsWith('video/')) return <Film size={14} />;
    if (type.startsWith('audio/')) return <Music size={14} />;
    return <FileText size={14} />;
  };

  return (
    <div className="bg-[#141c2e]/80 backdrop-blur-xl border border-[#2a3a5f] rounded-xl overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-[#1a2540]/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <Send size={14} className="text-white" />
          </div>
          <span className="text-sm font-medium text-white">
            记录进展 - {NODE_LABELS[currentNodeIndex]}
          </span>
        </div>
        <svg
          className={`w-4 h-4 text-slate-400 transition-transform ${expanded ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Expanded Content */}
      {expanded && (
        <div className="px-4 pb-4 space-y-3 border-t border-[#2a3a5f]/50 pt-3">
          {/* Text Input */}
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="描述当前进展...（如：已完成初稿设计，请查看附件）"
            className="w-full bg-[#0d1322] border border-[#2a3a5f] rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 resize-none focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20"
            rows={3}
          />

          {/* File Previews */}
          {previews.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {previews.map((preview, index) => (
                <div key={index} className="relative group">
                  <img
                    src={preview}
                    alt={`preview-${index}`}
                    className="w-16 h-16 object-cover rounded-lg border border-[#2a3a5f]"
                  />
                  <button
                    onClick={() => removeFile(index)}
                    className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={12} className="text-white" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* File List (non-image) */}
          {files.filter((f) => !f.type.startsWith('image/')).length > 0 && (
            <div className="space-y-1">
              {files
                .filter((f) => !f.type.startsWith('image/'))
                .map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-[#0d1322] rounded-lg px-3 py-2"
                  >
                    <div className="flex items-center gap-2 text-slate-300 text-xs">
                      {getFileIcon(file.type)}
                      <span className="truncate max-w-[200px]">{file.name}</span>
                      <span className="text-slate-500">
                        ({(file.size / 1024).toFixed(1)}KB)
                      </span>
                    </div>
                    <button onClick={() => removeFile(index)}>
                      <X size={14} className="text-slate-400 hover:text-red-400" />
                    </button>
                  </div>
                ))}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1a2540] border border-[#2a3a5f] rounded-lg text-xs text-slate-300 hover:bg-[#2a3a5f] transition-colors"
              >
                <Paperclip size={14} />
                添加附件
              </button>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={handleFileSelect}
                className="hidden"
                accept="image/*,video/*,.pdf,.doc,.docx,.zip,.rar"
              />
              <span className="text-xs text-slate-500">
                支持图片、视频、文档，单个≤10MB
              </span>
            </div>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || (!content.trim() && files.length === 0)}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg text-xs font-medium text-white disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-blue-500/25 transition-all"
            >
              {isSubmitting ? (
                <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Send size={14} />
              )}
              {isSubmitting ? '提交中...' : '提交记录'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
