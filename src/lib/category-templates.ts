/**
 * 品类化交付模板数据
 * 定义各品类的标准交付清单，卖家交付时可勾选已完成项
 */

export type CategoryKey = 'ppt' | 'paper' | 'copywriting' | 'design' | 'code' | 'resume';

export interface ChecklistItem {
  id: string;
  label: string;
  description?: string;
  required: boolean;
}

export interface CategoryTemplate {
  key: CategoryKey;
  name: string;
  icon: string;
  description: string;
  checklist: ChecklistItem[];
}

export const CATEGORY_TEMPLATES: CategoryTemplate[] = [
  {
    key: 'ppt',
    name: 'PPT演示文稿',
    icon: '📊',
    description: '商务演示、学术汇报、产品发布等演示文稿',
    checklist: [
      { id: 'ppt-1', label: '封面页设计完成', description: '包含标题、副标题、日期等', required: true },
      { id: 'ppt-2', label: '目录页/导航结构', description: '清晰的内容导航', required: true },
      { id: 'ppt-3', label: '内容页排版完成', description: '文字、图表、图片排版', required: true },
      { id: 'ppt-4', label: '图表/数据可视化', description: '数据图表、流程图等', required: false },
      { id: 'ppt-5', label: '动画/转场效果', description: '页面切换和内容动画', required: false },
      { id: 'ppt-6', label: '母版/主题统一', description: '整体风格一致性', required: true },
      { id: 'ppt-7', label: '字体/配色规范', description: '使用统一字体和配色方案', required: true },
      { id: 'ppt-8', label: '结束页/致谢页', description: '联系方式或Q&A引导', required: false },
      { id: 'ppt-9', label: '源文件交付', description: '提供可编辑的源文件', required: true },
      { id: 'ppt-10', label: 'PDF备份版本', description: '提供PDF格式备份', required: false },
    ],
  },
  {
    key: 'paper',
    name: '学术论文/报告',
    icon: '📝',
    description: '学术论文、研究报告、课程作业等',
    checklist: [
      { id: 'paper-1', label: '标题/摘要完成', description: '中英文标题和摘要', required: true },
      { id: 'paper-2', label: '关键词设定', description: '3-5个关键词', required: true },
      { id: 'paper-3', label: '引言/背景章节', description: '研究背景和意义', required: true },
      { id: 'paper-4', label: '文献综述完成', description: '相关研究梳理', required: true },
      { id: 'paper-5', label: '研究方法/正文', description: '核心内容章节', required: true },
      { id: 'paper-6', label: '数据/案例分析', description: '实证或案例分析', required: false },
      { id: 'paper-7', label: '结论/总结', description: '研究结论和展望', required: true },
      { id: 'paper-8', label: '参考文献格式', description: '符合引用规范', required: true },
      { id: 'paper-9', label: '查重报告', description: '提供查重结果', required: false },
      { id: 'paper-10', label: '排版格式规范', description: '符合学校/期刊要求', required: true },
    ],
  },
  {
    key: 'copywriting',
    name: '文案/内容创作',
    icon: '✍️',
    description: '营销文案、品牌故事、社交媒体内容等',
    checklist: [
      { id: 'copy-1', label: '需求理解确认', description: '明确目标受众和调性', required: true },
      { id: 'copy-2', label: '核心卖点提炼', description: '产品/服务核心优势', required: true },
      { id: 'copy-3', label: '标题/开头创作', description: '吸引注意力的开头', required: true },
      { id: 'copy-4', label: '正文内容完成', description: '主体内容撰写', required: true },
      { id: 'copy-5', label: 'CTA行动号召', description: '引导用户行动', required: false },
      { id: 'copy-6', label: 'SEO关键词优化', description: '搜索引擎优化', required: false },
      { id: 'copy-7', label: '多版本交付', description: '提供不同风格版本', required: false },
      { id: 'copy-8', label: '配图建议', description: '配图方向或素材建议', required: false },
      { id: 'copy-9', label: '字数达标', description: '符合约定字数要求', required: true },
      { id: 'copy-10', label: '原创性保证', description: '确保内容原创', required: true },
    ],
  },
  {
    key: 'design',
    name: '设计/视觉作品',
    icon: '🎨',
    description: 'Logo设计、海报、UI设计、品牌VI等',
    checklist: [
      { id: 'design-1', label: '需求调研完成', description: '了解品牌调性和偏好', required: true },
      { id: 'design-2', label: '风格参考确认', description: '确认设计方向', required: true },
      { id: 'design-3', label: '初稿方案提交', description: '提供2-3个方案', required: true },
      { id: 'design-4', label: '修改反馈处理', description: '根据反馈调整', required: true },
      { id: 'design-5', label: '终稿确认', description: '客户确认最终方案', required: true },
      { id: 'design-6', label: '源文件整理', description: 'AI/PSD/Figma源文件', required: true },
      { id: 'design-7', label: '多格式导出', description: 'PNG/JPG/SVG/PDF等', required: true },
      { id: 'design-8', label: '尺寸规范', description: '各场景尺寸适配', required: false },
      { id: 'design-9', label: '配色/字体说明', description: '品牌色值和字体说明', required: false },
      { id: 'design-10', label: '使用指南', description: '设计使用说明文档', required: false },
    ],
  },
  {
    key: 'code',
    name: '代码/技术开发',
    icon: '💻',
    description: '网站开发、小程序、脚本工具、API开发等',
    checklist: [
      { id: 'code-1', label: '需求文档确认', description: '功能需求明确', required: true },
      { id: 'code-2', label: '技术方案设计', description: '技术选型和架构', required: true },
      { id: 'code-3', label: '核心功能实现', description: '主要功能开发完成', required: true },
      { id: 'code-4', label: 'UI/前端页面', description: '界面开发完成', required: false },
      { id: 'code-5', label: '接口/后端逻辑', description: '服务端逻辑完成', required: false },
      { id: 'code-6', label: '数据库设计', description: '数据表结构', required: false },
      { id: 'code-7', label: '功能测试通过', description: '主要功能测试', required: true },
      { id: 'code-8', label: 'Bug修复', description: '已知问题修复', required: true },
      { id: 'code-9', label: '代码注释', description: '关键代码有注释', required: true },
      { id: 'code-10', label: '部署文档', description: '部署和运行说明', required: true },
      { id: 'code-11', label: '源码交付', description: '完整源代码', required: true },
      { id: 'code-12', label: '使用说明', description: '用户使用文档', required: false },
    ],
  },
  {
    key: 'resume',
    name: '简历/求职材料',
    icon: '📋',
    description: '个人简历、求职信、作品集等',
    checklist: [
      { id: 'resume-1', label: '个人信息整理', description: '联系方式、教育背景', required: true },
      { id: 'resume-2', label: '工作经历梳理', description: '工作经历和项目经验', required: true },
      { id: 'resume-3', label: '技能清单', description: '专业技能展示', required: true },
      { id: 'resume-4', label: '项目经历描述', description: 'STAR法则描述', required: false },
      { id: 'resume-5', label: '排版设计', description: '专业美观的排版', required: true },
      { id: 'resume-6', label: '关键词优化', description: 'ATS系统友好', required: false },
      { id: 'resume-7', label: '多格式交付', description: 'Word/PDF格式', required: true },
      { id: 'resume-8', label: '求职信', description: '配套求职信', required: false },
      { id: 'resume-9', label: '作品集整理', description: '作品展示页面', required: false },
      { id: 'resume-10', label: '面试建议', description: '面试注意事项', required: false },
    ],
  },
];

/**
 * 根据品类key获取模板
 */
export function getCategoryTemplate(key: CategoryKey | string): CategoryTemplate | undefined {
  return CATEGORY_TEMPLATES.find(t => t.key === key);
}

/**
 * 根据服务类型推断品类
 */
export function inferCategory(serviceType: string): CategoryKey {
  const type = serviceType.toLowerCase();
  if (type.includes('ppt') || type.includes('演示') || type.includes('幻灯片') || type.includes('汇报')) {
    return 'ppt';
  }
  if (type.includes('论文') || type.includes('学术') || type.includes('报告') || type.includes('作业')) {
    return 'paper';
  }
  if (type.includes('文案') || type.includes('内容') || type.includes('写作') || type.includes('文章')) {
    return 'copywriting';
  }
  if (type.includes('设计') || type.includes('logo') || type.includes('海报') || type.includes('ui') || type.includes('vi')) {
    return 'design';
  }
  if (type.includes('代码') || type.includes('开发') || type.includes('程序') || type.includes('网站') || type.includes('小程序')) {
    return 'code';
  }
  if (type.includes('简历') || type.includes('求职') || type.includes('面试')) {
    return 'resume';
  }
  // 默认返回PPT
  return 'ppt';
}
