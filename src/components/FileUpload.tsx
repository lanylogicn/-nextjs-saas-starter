'use client';

import { useState, useRef, useCallback } from 'react';
import { Upload, X, File, Image, FileText, Film, Archive, CheckCircle } from 'lucide-react';

export interface UploadResult {
  success: boolean;
  url?: string;
  filename?: string;
  originalName?: string;
  size?: number;
  type?: string;
  error?: string;
}

export interface UploadedFile {
  url: string;
  filename: string;
  originalName: string;
  size: number;
  type: string;
}

export interface FileUploadProps {
  orderId?: string;
  nodeIndex?: number;
  type: string;
  onUploadSuccess?: (result: UploadResult) => void;
  onFileRemove?: (file: UploadedFile) => void;
  multiple?: boolean;
  accept?: string;
  maxFiles?: number;
  label?: string;
  className?: string;
}

// 支持的文件类型描述
const ACCEPTED_TYPES = {
  'image/*': ['jpg', 'jpeg', 'png', 'gif', 'webp'],
  'application/pdf': ['pdf'],
  'application/msword': ['doc', 'docx'],
  'application/vnd.ms-powerpoint': ['ppt', 'pptx'],
  'application/vnd.ms-excel': ['xls', 'xlsx'],
  'application/zip': ['zip', 'rar'],
};

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB

/**
 * 格式化文件大小
 */
function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * 获取文件图标
 */
function getFileIcon(type: string) {
  if (type.startsWith('image/')) return Image;
  if (type === 'application/pdf') return FileText;
  if (type.includes('zip') || type.includes('rar')) return Archive;
  if (type.includes('video')) return Film;
  return File;
}

/**
 * 判断是否为图片类型
 */
function isImageType(type: string): boolean {
  return type.startsWith('image/');
}

export function FileUpload({
  orderId,
  nodeIndex,
  type,
  onUploadSuccess,
  onFileRemove,
  multiple = false,
  accept = 'image/*,application/pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.zip,.rar',
  maxFiles = 10,
  label = '上传文件',
  className = '',
}: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = useCallback(async (file: File) => {
    // 检查文件大小
    if (file.size > MAX_FILE_SIZE) {
      setError(`文件 "${file.name}" 超过大小限制（最大 20MB）`);
      return;
    }

    // 检查文件数量
    if (!multiple && uploadedFiles.length >= 1) {
      setError('只能上传一个文件');
      return;
    }
    if (uploadedFiles.length >= maxFiles) {
      setError(`最多只能上传 ${maxFiles} 个文件`);
      return;
    }

    setUploading(true);
    setError(null);
    setProgress(0);

    const formData = new FormData();
    formData.append('file', file);
    if (orderId) formData.append('orderId', orderId);
    if (nodeIndex !== undefined) formData.append('nodeIndex', String(nodeIndex));
    formData.append('type', type);

    try {
      // 模拟上传进度
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);
      const result: UploadResult = await response.json();

      if (result.success && result.url) {
        setProgress(100);
        const newFile: UploadedFile = {
          url: result.url,
          filename: result.filename || '',
          originalName: result.originalName || file.name,
          size: result.size || file.size,
          type: result.type || type,
        };
        setUploadedFiles((prev) => [...prev, newFile]);
        onUploadSuccess?.(result);
        
        // 重置进度
        setTimeout(() => setProgress(0), 1000);
      } else {
        setError(result.error || '上传失败');
      }
    } catch (err) {
      setError('上传失败，请重试');
    } finally {
      setUploading(false);
    }
  }, [orderId, nodeIndex, type, multiple, maxFiles, uploadedFiles.length, onUploadSuccess]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      handleUpload(file);
    });

    // 重置 input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);

    const files = e.dataTransfer.files;
    Array.from(files).forEach((file) => {
      handleUpload(file);
    });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleRemoveFile = (file: UploadedFile) => {
    setUploadedFiles((prev) => prev.filter((f) => f.url !== file.url));
    onFileRemove?.(file);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* 上传区域 */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => !uploading && fileInputRef.current?.click()}
        className={`
          relative cursor-pointer rounded-xl border-2 border-dashed p-6 transition-all duration-300
          ${dragOver 
            ? 'border-indigo-400 bg-indigo-500/10' 
            : 'border-[#2a3a5f] bg-[#0f1629]/50 hover:border-indigo-500/50 hover:bg-[#0f1629]'
          }
          ${uploading ? 'pointer-events-none opacity-60' : ''}
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleFileSelect}
          className="hidden"
        />

        <div className="flex flex-col items-center gap-3 text-center">
          {/* 图标 */}
          <div className={`
            w-12 h-12 rounded-full flex items-center justify-center
            ${dragOver ? 'bg-indigo-500/20' : 'bg-slate-800/50'}
            transition-all duration-300
          `}>
            <Upload 
              className={`w-6 h-6 ${dragOver ? 'text-indigo-400' : 'text-slate-400'}`}
              style={dragOver ? { animation: 'bounce 1s infinite' } : undefined}
            />
          </div>

          {/* 文字 */}
          <div>
            <p className="text-sm font-medium text-slate-200">
              {dragOver ? '释放以上传文件' : '拖拽文件到此处，或点击选择'}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              支持图片、PDF、Office文档、压缩包等，单个文件最大 20MB
            </p>
          </div>

          {/* 进度条 */}
          {uploading && (
            <div className="w-full max-w-xs">
              <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-xs text-slate-400 mt-1 text-center">{progress}%</p>
            </div>
          )}
        </div>
      </div>

      {/* 错误提示 */}
      {error && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20">
          <X className="w-4 h-4 text-red-400" />
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {/* 已上传文件列表 */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-slate-400 flex items-center gap-1">
            <CheckCircle className="w-3 h-3 text-emerald-400" />
            已上传 {uploadedFiles.length} 个文件
          </p>
          <div className="space-y-2">
            {uploadedFiles.map((file) => {
              const Icon = getFileIcon(file.type);
              const isImage = isImageType(file.type);
              
              return (
                <div
                  key={file.url}
                  className="flex items-center gap-3 p-2 rounded-lg bg-slate-800/50 border border-slate-700/50 group hover:bg-slate-800/80 transition-colors"
                >
                  {/* 缩略图或图标 */}
                  {isImage ? (
                    <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-900 flex-shrink-0">
                      <img
                        src={file.url}
                        alt={file.originalName}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-slate-900 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-5 h-5 text-indigo-400" />
                    </div>
                  )}

                  {/* 文件信息 */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-200 truncate">{file.originalName}</p>
                    <p className="text-xs text-slate-500">{formatSize(file.size)}</p>
                  </div>

                  {/* 删除按钮 */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveFile(file);
                    }}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default FileUpload;
