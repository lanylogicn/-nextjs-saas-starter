import type { Metadata } from 'next';
import './globals.css';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';

export const metadata: Metadata = {
  title: {
    default: '奕诺 - 代做服务信任基础设施',
    template: '%s | 奕诺',
  },
  description:
    '奕诺为代做服务提供 AI 检测报告、品类化交付模板、版权声明三大信任支柱，让每一笔交易都有据可查、有证可依。',
  keywords: ['奕诺', '代做服务', 'AI检测', '交付模板', '版权声明', '信任基础设施'],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen flex flex-col font-sans">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
