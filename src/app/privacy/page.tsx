/**
 * 隐私政策页面
 * 路由：/privacy
 * 功能：完整的隐私政策文本
 */
'use client';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-page-gradient py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 md:p-12">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">隐私政策</h1>
          <p className="text-slate-400 text-sm mb-8">最后更新：2025年1月</p>

          <div className="prose prose-slate max-w-none space-y-6 text-sm leading-relaxed text-slate-700">
            <section>
              <h2 className="text-lg font-bold text-slate-800 mb-3">一、信息收集</h2>
              <p>奕诺平台（以下简称「本平台」）在您使用服务过程中，会收集以下信息：</p>
              <ul className="list-disc pl-5 space-y-1 mt-2">
                <li><strong>注册信息</strong>：手机号码、密码（加密存储）、昵称</li>
                <li><strong>服务单信息</strong>：买家联系方式、服务类型、需求描述、预计交付时间</li>
                <li><strong>操作记录</strong>：进度推进、审核操作、登录记录等操作日志</li>
                <li><strong>设备信息</strong>：浏览器类型、访问时间等用于安全防护的信息</li>
              </ul>
              <p className="mt-2">本平台不会收集您的身份证号、银行卡号等敏感金融信息。</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-800 mb-3">二、信息使用</h2>
              <p>我们收集的信息将用于以下目的：</p>
              <ul className="list-disc pl-5 space-y-1 mt-2">
                <li>提供、维护和改善我们的服务</li>
                <li>创建和管理您的账户</li>
                <li>处理服务单和进度跟踪</li>
                <li>生成交付报告和公证凭证</li>
                <li>发送与您账户相关的通知和消息</li>
                <li>保障平台安全，防止欺诈和违规行为</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-800 mb-3">三、数据保护</h2>
              <p>我们采取以下措施保护您的数据安全：</p>
              <ul className="list-disc pl-5 space-y-1 mt-2">
                <li><strong>加密存储</strong>：所有密码使用bcrypt算法加密，不以明文形式存储</li>
                <li><strong>安全传输</strong>：使用HTTPS加密传输，保护数据在网络中的安全</li>
                <li><strong>访问控制</strong>：采用JWT+httpOnly Cookie认证机制，防止未授权访问</li>
                <li><strong>操作留痕</strong>：所有操作记录完整保存，支持审计追溯</li>
                <li><strong>数据隔离</strong>：不同用户的数据严格隔离，防止越权访问</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-800 mb-3">四、用户权利</h2>
              <p>您对自己的个人信息享有以下权利：</p>
              <ul className="list-disc pl-5 space-y-1 mt-2">
                <li><strong>查阅权</strong>：您有权查看自己的个人信息和操作记录</li>
                <li><strong>更正权</strong>：您有权要求更正不准确的个人信息</li>
                <li><strong>删除权</strong>：在法律允许的范围内，您有权要求删除您的个人信息</li>
                <li><strong>导出权</strong>：您有权导出自己的服务记录和交付报告</li>
                <li><strong>注销权</strong>：您有权注销账户，注销后个人信息将按法规处理</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-800 mb-3">五、信息共享</h2>
              <p>除以下情况外，我们不会与第三方共享您的个人信息：</p>
              <ul className="list-disc pl-5 space-y-1 mt-2">
                <li>经您明确同意</li>
                <li>法律法规要求或政府主管部门强制要求</li>
                <li>为维护本平台及用户的合法权益</li>
              </ul>
              <p className="mt-2">买家查询服务单进度时，仅展示与该订单相关的必要信息，不会暴露卖家的全部个人信息。</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-800 mb-3">六、Cookie使用</h2>
              <p>本平台使用httpOnly Cookie进行身份认证，该Cookie无法被客户端脚本读取，有效防止XSS攻击。我们不使用第三方追踪Cookie或广告Cookie。</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-800 mb-3">七、政策更新</h2>
              <p>我们可能会不时更新本隐私政策。更新后的政策将在本页面发布，重大变更将通过站内消息或短信通知您。继续使用本平台即表示您同意更新后的隐私政策。</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-800 mb-3">八、联系我们</h2>
              <p>如果您对本隐私政策有任何疑问，请通过以下方式联系我们：</p>
              <ul className="list-disc pl-5 space-y-1 mt-2">
                <li>邮箱：support@yinuo.com</li>
                <li>电话：400-888-9999</li>
                <li>工作时间：周一至周五 9:00-18:00</li>
              </ul>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
