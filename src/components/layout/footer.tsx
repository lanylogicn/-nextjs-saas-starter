export function Footer() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground font-serif text-xs font-bold">
                奕
              </div>
              <span className="font-serif text-lg font-semibold text-foreground">
                奕诺
              </span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              代做服务信任基础设施
              <br />
              让每一笔交易都有据可查、有证可依
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-foreground mb-3">
              服务
            </h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a href="/report" className="hover:text-foreground transition-colors">
                  AI 检测报告
                </a>
              </li>
              <li>
                <a href="/templates" className="hover:text-foreground transition-colors">
                  品类化交付模板
                </a>
              </li>
              <li>
                <a href="/copyright" className="hover:text-foreground transition-colors">
                  版权声明生成
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-foreground mb-3">
              信任承诺
            </h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>检测数据全程加密</li>
              <li>报告不可篡改存证</li>
              <li>7x24 小时可验证</li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-border pt-6 text-center text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} 奕诺 YiNuo. 一诺千金，信誉如金。
        </div>
      </div>
    </footer>
  );
}
