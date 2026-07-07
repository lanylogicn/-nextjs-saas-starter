'use client';

import { useState } from 'react';
import { File, Image, FileText, Film, Archive, Download, X, ZoomIn, Calendar, HardDrive } from 'lucide-react';

export interface FileItem {
  url: string;
  filename: string;
  originalName?: string;
  type: string;
  size?: number;
  uploadedAt?: string;
}

export interface FileListProps {
  files: FileItem[];
  canDelete?: boolean;
  onDelete?: (file: FileItem) => void;
  className?: string;
  emptyText?: string;
}

/**
 * 格式化文件大小
 */
function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * 格式化日期
 */
function formatDate(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    return date.toLocaleString('zh-CN', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateStr;
  }
}

/**
 * 获取文件图标
 */
function getFileIcon(type: string) {
  if (type.startsWith('image/')) return Image;
  if (type === 'application/pdf') return FileText;
  if (type.includes('zip') || type.includes('rar')) return Archive;
  if (type.includes('video')) return Film;
  if (type.includes('word') || type.includes('document')) return FileText;
  if (type.includes('excel') || type.includes('sheet')) return FileText;
  if (type.includes('powerpoint') || type.includes('presentation')) return FileText;
  return File;
}

/**
 * 获取文件图标颜色
 */
function getIconColor(type: string): string {
  if (type.startsWith('image/')) return 'text-pink-400';
  if (type === 'application/pdf') return 'text-red-400';
  if (type.includes('zip') || type.includes('rar')) return 'text-amber-400';
  if (type.includes('video')) return 'text-purple-400';
  if (type.includes('word') || type.includes('document')) return 'text-blue-400';
  if (type.includes('excel') || type.includes('sheet')) return 'text-emerald-400';
  if (type.includes('powerpoint') || type.includes('presentation')) return 'text-orange-400';
  return 'text-indigo-400';
}

/**
 * 判断是否为图片类型
 */
function isImageType(type: string): boolean {
  return type.startsWith('image/');
}

/**
 * 判断是否为PDF类型
 */
function isPdfType(type: string): boolean {
  return type === 'application/pdf';
}

/**
 * 文件列表组件
 */
export function FileList({
  files,
  canDelete = false,
  onDelete,
  className = '',
  emptyText = '暂无文件',
}: FileListProps) {
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const handleDownload = (file: FileItem) => {
    const link = document.createElement('a');
    link.href = file.url;
    link.download = file.originalName || file.filename;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePreview = (file: FileItem) => {
    if (isImageType(file.type)) {
      setPreviewImage(file.url);
    } else {
      // 非图片类型直接打开
      window.open(file.url, '_blank');
    }
  };

  if (files.length === 0) {
    return (
      <div className={`flex flex-col items-center justify-center py-8 ${className}`}>
        <div className="w-12 h-12 rounded-full bg-slate-800/50 flex items-center justify-center mb-3">
          <File className="w-6 h-6 text-slate-500" />
        </div>
        <p className="text-sm text-slate-500">{emptyText}</p>
      </div>
    );
  }

  return (
    <>
      <div className={`space-y-2 ${className}`}>
        {files.map((file, index) => {
          const Icon = getFileIcon(file.type);
          const iconColor = getIconColor(file.type);
          const isImage = isImageType(file.type);
          const isPdf = isPdfType(file.type);

          return (
            <div
              key={`${file.url}-${index}`}
              className="group relative flex items-center gap-3 p-3 rounded-xl bg-[#0f1629]/50 border border-[#2a3a5f]/50 hover:border-indigo-500/30 hover:bg-[#0f1629] transition-all duration-200"
            >
              {/* 缩略图或图标 */}
              {isImage ? (
                <div
                  onClick={() => handlePreview(file)}
                  className="w-12 h-12 rounded-lg overflow-hidden bg-slate-900 flex-shrink-0 cursor-pointer group-hover:ring-2 group-hover:ring-indigo-500/50 transition-all"
                >
                  <img
                    src={file.url}
                    alt={file.originalName || file.filename}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div
                  onClick={() => handlePreview(file)}
                  className="w-12 h-12 rounded-lg bg-slate-900/80 flex items-center justify-center flex-shrink-0 cursor-pointer hover:bg-slate-800 transition-colors"
                >
                  <Icon className={`w-6 h-6 ${iconColor}`} />
                </div>
              )}

              {/* 文件信息 */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-200 truncate group-hover:text-white transition-colors">
                  {file.originalName || file.filename}
                </p>
                <div className="flex items-center gap-3 mt-1">
                  {file.size !== undefined && (
                    <span className="flex items-center gap-1 text-xs text-slate-500">
                      <HardDrive className="w-3 h-3" />
                      {formatSize(file.size)}
                    </span>
                  )}
                  {file.uploadedAt && (
                    <span className="flex items-center gap-1 text-xs text-slate-500">
                      <Calendar className="w-3 h-3" />
                      {formatDate(file.uploadedAt)}
                    </span>
                  )}
                  {isPdf && (
                    <span className="text-xs text-red-400/80 bg-red-500/10 px-1.5 py-0.5 rounded">
                      PDF
                    </span>
                  )}
                </div>
              </div>

              {/* 操作按钮 */}
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {/* 预览/放大按钮（仅图片） */}
                {isImage && (
                  <button
                    onClick={() => setPreviewImage(file.url)}
                    className="p-2 rounded-lg text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 transition-all"
                    title="放大预览"
                  >
                    <ZoomIn className="w-4 h-4" />
                  </button>
                )}

                {/* 下载按钮 */}
                <button
                  onClick={() => handleDownload(file)}
                  className="p-2 rounded-lg text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 transition-all"
                  title="下载"
                >
                  <Download className="w-4 h-4" />
                </button>

                {/* 删除按钮 */}
                {canDelete && onDelete && (
                  <button
                    onClick={() => onDelete(file)}
                    className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
                    title="删除"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* 图片预览弹窗 */}
      {previewImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={() => setPreviewImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh]">
            <img
              src={previewImage}
              alt="预览"
              className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
            />
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default FileList;
