import Link from 'next/link';

const features = [
  {
    title: 'AI 检测报告',
    desc: '基于多维度分析引擎，对交付内容进行 AI 生成概率检测，出具权威检测报告，为交易双方提供客观参考依据。',
    href: '/report',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-6 w-6">
        <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    title: '品类化交付模板',
    desc: '覆盖论文、设计、代码、文案等主流品类，提供标准化交付模板，确保交付物结构完整、格式规范、可验收。',
    href: '/templates',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-6 w-6">
        <path d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zm0 8a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zm10 0a1 1 0 011-1h4a1 1 0 011 1v6a1 1 0 01-1 1h-4a1 1 0 01-1-1v-6z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    title: '版权声明生成',
    desc: '一键生成具备法律参考价值的版权声明文件，明确知识产权归属、使用范围和授权条款，为交付物提供法律保障。',
    href: '/copyright',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-6 w-6">
        <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
];

const stats = [
  { value: '99.2%', label: '检测准确率' },
  { value: '50+', label: '交付模板品类' },
  { value: '10万+', label: '累计服务订单' },
  { value: '7x24', label: '全天候可验证' },
];

export default function Home() {
  return (
    <div>
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-accent/30 to-transparent pointer-events-none" />
        <div className="relative mx-auto max-w-6xl px-6 py-24 md:py-32">
          <div className="mx-auto max-w-2xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-xs text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-amber animate-pulse" />
              代做服务信任基础设施
            </div>
            <h1 className="font-serif text-4xl font-bold tracking-tight text-foreground md:text-5xl lg:text-6xl">
              一诺千金
              <br />
              <span className="text-amber">信誉如金</span>
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
              奕诺为代做服务提供 AI 检测、标准化交付、版权声明三大信任支柱。
              <br className="hidden md:block" />
              让每一笔交易都有据可查、有证可依。
            </p>
            <div className="mt-10 flex items-center justify-center gap-4">
              <Link
                href="/report"
                className="inline-flex h-11 items-center rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground transition-all duration-200 hover:opacity-90"
              >
                开始检测
              </Link>
              <Link
                href="/templates"
                className="inline-flex h-11 items-center rounded-md border border-border bg-card px-6 text-sm font-medium text-foreground transition-all duration-200 hover:bg-accent"
              >
                浏览模板
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-border bg-card">
        <div className="mx-auto max-w-6xl px-6 py-10">
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="font-serif text-2xl font-bold text-amber md:text-3xl">
                  {stat.value}
                </div>
                <div className="mt-1 text-xs text-muted-foreground">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="mb-12 text-center">
          <h2 className="font-serif text-2xl font-semibold text-foreground md:text-3xl">
            三大信任支柱
          </h2>
          <p className="mt-3 text-sm text-muted-foreground">
            从检测到交付到确权，构建完整的信任闭环
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {features.map((feature) => (
            <Link
              key={feature.title}
              href={feature.href}
              className="group rounded-lg border border-border bg-card p-6 transition-all duration-200 hover:border-amber/30 hover:shadow-sm"
            >
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-md bg-accent text-amber transition-colors group-hover:bg-amber group-hover:text-amber-foreground">
                {feature.icon}
              </div>
              <h3 className="font-serif text-lg font-semibold text-foreground">
                {feature.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {feature.desc}
              </p>
              <div className="mt-4 text-xs font-medium text-amber opacity-0 transition-opacity group-hover:opacity-100">
                了解更多 &rarr;
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="border-t border-border bg-card">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <div className="mb-12 text-center">
            <h2 className="font-serif text-2xl font-semibold text-foreground md:text-3xl">
              信任，只需三步
            </h2>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {[
              { step: '01', title: '提交检测', desc: '上传交付内容，系统自动进行多维度 AI 生成概率分析' },
              { step: '02', title: '获取报告', desc: '生成带时间戳的权威检测报告，数据全程加密不可篡改' },
              { step: '03', title: '确权交付', desc: '搭配版权声明与标准化模板，完成有信誉保障的交付' },
            ].map((item) => (
              <div key={item.step} className="relative text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full border-2 border-amber/30 font-serif text-lg font-bold text-amber">
                  {item.step}
                </div>
                <h3 className="font-serif text-base font-semibold text-foreground">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
