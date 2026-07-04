/**
 * 服务条款页面
 * 路由：/terms
 * 功能：完整的服务条款文本
 */
'use client';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-page-gradient py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 md:p-12">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">服务条款</h1>
          <p className="text-slate-400 text-sm mb-8">最后更新：2025年1月</p>

          <div className="prose prose-slate max-w-none space-y-6 text-sm leading-relaxed text-slate-700">
            <section>
              <h2 className="text-lg font-bold text-slate-800 mb-3">一、服务范围</h2>
              <p>奕诺平台（以下简称「本平台」）是一个面向闲鱼等平台卖家和买家的定制服务交付进度管理工具。本平台提供以下服务：</p>
              <ul className="list-disc pl-5 space-y-1 mt-2">
                <li>服务单创建和管理</li>
                <li>7节点进度跟踪和展示</li>
                <li>买家审核功能</li>
                <li>专业交付报告生成和公证查验</li>
                <li>卖家信誉名片和成就徽章系统</li>
                <li>站内消息通知</li>
                <li>管理员后台管理</li>
              </ul>
              <p className="mt-2">本平台仅提供进度管理工具，不参与交易本身的撮合、支付或纠纷处理。</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-800 mb-3">二、用户责任</h2>
              <p>使用本平台时，您同意：</p>
              <ul className="list-disc pl-5 space-y-1 mt-2">
                <li>提供真实、准确的注册信息</li>
                <li>妥善保管账户密码，因密码保管不善导致的损失由用户自行承担</li>
                <li>不得利用本平台从事违法或侵权活动</li>
                <li>不得恶意刷单、伪造进度或操纵评价</li>
                <li>不得使用自动化工具批量操作或攻击平台</li>
                <li>遵守平台功能的使用限制（如服务单数量上限）</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-800 mb-3">三、账户管理</h2>
              <ul className="list-disc pl-5 space-y-1 mt-2">
                <li>每位用户只能注册一个账户</li>
                <li>用户可申请升级会员等级以获得更多功能</li>
                <li>管理员有权冻结违规账户</li>
                <li>用户有权注销账户，注销后数据按法规处理</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-800 mb-3">四、服务单管理</h2>
              <ul className="list-disc pl-5 space-y-1 mt-2">
                <li>卖家创建服务单时需填写完整、真实的信息</li>
                <li>服务单进度由卖家推进，买家在审核节点进行审核</li>
                <li>审核驳回后订单退回修改阶段，卖家可重新推进</li>
                <li>所有操作记录完整保存，不可删除或修改</li>
                <li>管理员有权对异常订单进行强制操作</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-800 mb-3">五、免责声明</h2>
              <ul className="list-disc pl-5 space-y-1 mt-2">
                <li>本平台仅提供进度管理工具，不保证服务本身的完成质量</li>
                <li>因不可抗力导致的服务中断，本平台不承担责任</li>
                <li>用户间的交易纠纷由双方自行解决，本平台不承担调解责任</li>
                <li>因用户自身原因导致的数据丢失，本平台不承担责任</li>
                <li>本平台保留随时修改服务内容和价格的权利</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-800 mb-3">六、知识产权</h2>
              <p>本平台的所有内容，包括但不限于软件、设计、文案、标识等，均受知识产权法保护。未经授权，不得复制、修改、传播或用于商业目的。</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-800 mb-3">七、争议解决</h2>
              <ul className="list-disc pl-5 space-y-1 mt-2">
                <li>因使用本平台产生的争议，双方应友好协商解决</li>
                <li>协商不成的，任一方可向本平台所在地人民法院提起诉讼</li>
                <li>本条款的解释和执行适用中华人民共和国法律</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-800 mb-3">八、条款修改</h2>
              <p>本平台有权随时修改本服务条款。修改后的条款将在本页面发布，重大变更将通过站内消息通知。继续使用本平台即表示您同意修改后的条款。</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-slate-800 mb-3">九、联系方式</h2>
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
