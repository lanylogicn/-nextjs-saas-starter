/**
 * 标准化版权声明文本生成器
 */

export interface CopyrightDeclarationData {
  materialSource: 'original' | 'ai_assisted' | 'stock' | 'mixed';
  fontLicense: 'licensed' | 'free' | 'uncertain' | 'not_applicable';
  copyrightOwnership: 'full_transfer' | 'licensed_use' | 'seller_retain';
  additionalNotes: string;
}

const MATERIAL_SOURCE_LABELS: Record<string, string> = {
  original: '完全原创',
  ai_assisted: 'AI辅助创作',
  stock: '素材库素材',
  mixed: '混合使用',
};

const FONT_LICENSE_LABELS: Record<string, string> = {
  licensed: '已获商业授权',
  free: '免费商用字体',
  uncertain: '待确认授权状态',
  not_applicable: '不涉及字体使用',
};

const OWNERSHIP_LABELS: Record<string, string> = {
  full_transfer: '完全转让',
  licensed_use: '授权使用',
  seller_retain: '卖家保留',
};

export function generateCopyrightText(declaration: CopyrightDeclarationData): string {
  const lines: string[] = [];

  lines.push('═══════════════════════════════════════');
  lines.push('          版 权 声 明');
  lines.push('     Copyright Declaration');
  lines.push('═══════════════════════════════════════');
  lines.push('');

  // 一、素材来源声明
  lines.push('一、素材来源声明');
  lines.push('─────────────────────────────────────');
  switch (declaration.materialSource) {
    case 'original':
      lines.push('本交付物所有内容为创作者独立完成的原原创作品，');
      lines.push('未使用任何第三方素材、模板或AI生成工具。');
      lines.push('内容的原创性和独创性由创作者本人负责。');
      break;
    case 'ai_assisted':
      lines.push('本交付物在创作过程中使用了AI辅助工具进行内容生成，');
      lines.push('包括但不限于文本生成、图像生成、代码辅助等。');
      lines.push('创作者已对AI生成内容进行了人工审核、修改和完善，');
      lines.push('确保最终交付物符合质量标准和使用要求。');
      lines.push('AI工具仅作为辅助手段，核心创意和最终决策由创作者完成。');
      break;
    case 'stock':
      lines.push('本交付物中使用了来自正规素材库的第三方素材，');
      lines.push('所有素材均已获得合法的商业使用授权。');
      lines.push('素材来源包括但不限于：正版图片库、字体库、图标库等。');
      lines.push('使用者应遵守相应素材库的授权协议和使用条款。');
      break;
    case 'mixed':
      lines.push('本交付物采用混合创作方式，包含以下组成部分：');
      lines.push('  - 创作者原创内容');
      lines.push('  - 经授权的第三方素材');
      lines.push('  - 可能包含AI辅助生成的内容');
      lines.push('各部分均已在交付物中明确标注来源，');
      lines.push('使用者应根据不同部分的权利状态分别遵守相关规定。');
      break;
  }
  lines.push('');

  // 二、字体授权说明
  lines.push('二、字体授权说明');
  lines.push('─────────────────────────────────────');
  switch (declaration.fontLicense) {
    case 'licensed':
      lines.push('本交付物中使用的所有字体均已获得合法的商业使用授权。');
      lines.push('授权范围涵盖本交付物的使用场景，包括但不限于：');
      lines.push('印刷、网络展示、商业推广等。');
      lines.push('字体授权证明文件可在需要时提供。');
      break;
    case 'free':
      lines.push('本交付物中使用的字体均为免费商用字体，');
      lines.push('遵循相应字体的开源协议或免费商用许可。');
      lines.push('字体来源可靠，授权状态明确。');
      break;
    case 'uncertain':
      lines.push('本交付物中部分字体的授权状态尚待确认。');
      lines.push('建议使用者在实际商用前，核实相关字体的授权情况，');
      lines.push('必要时替换为已获授权的字体以规避风险。');
      break;
    case 'not_applicable':
      lines.push('本交付物不涉及字体文件的直接使用或嵌入。');
      break;
  }
  lines.push('');

  // 三、版权归属约定
  lines.push('三、版权归属约定');
  lines.push('─────────────────────────────────────');
  switch (declaration.copyrightOwnership) {
    case 'full_transfer':
      lines.push('本交付物的全部知识产权（包括但不限于著作权、');
      lines.push('修改权、改编权、信息网络传播权等）自交付完成之日起');
      lines.push('完全转让给委托方（买方）。');
      lines.push('创作者保留署名权，但不再对交付物行使其他任何权利。');
      lines.push('委托方有权以任何方式使用、修改、传播本交付物。');
      break;
    case 'licensed_use':
      lines.push('本交付物的知识产权归创作者所有，');
      lines.push('委托方（买方）获得以下使用授权：');
      lines.push('  - 使用范围：商业及非商业用途');
      lines.push('  - 使用期限：永久');
      lines.push('  - 使用地域：全球');
      lines.push('  - 是否可转授权：否');
      lines.push('  - 是否可修改：是');
      lines.push('未经创作者书面同意，委托方不得将本交付物转授权给第三方。');
      break;
    case 'seller_retain':
      lines.push('本交付物的全部知识产权由创作者保留。');
      lines.push('委托方（买方）仅获得本交付物在约定用途内的使用权。');
      lines.push('未经创作者书面许可，委托方不得：');
      lines.push('  - 将交付物用于约定范围以外的用途');
      lines.push('  - 将交付物转让、转授权给第三方');
      lines.push('  - 对交付物进行修改、改编或衍生创作');
      break;
  }
  lines.push('');

  // 四、免责声明
  lines.push('四、免责声明');
  lines.push('─────────────────────────────────────');
  lines.push('1. 创作者保证交付物不侵犯任何第三方的合法权益，');
  lines.push('   包括但不限于著作权、商标权、专利权等。');
  lines.push('2. 因交付物引发的知识产权纠纷，由责任方承担相应法律责任。');
  lines.push('3. 委托方应按照本声明约定的范围和方式使用交付物，');
  lines.push('   超出约定范围使用所产生的法律后果由委托方自行承担。');
  lines.push('4. 本声明一式两份，买卖双方各执一份，具有同等法律效力。');
  lines.push('');
  lines.push('═══════════════════════════════════════');

  // 补充说明
  if (declaration.additionalNotes.trim()) {
    lines.push('');
    lines.push('【补充说明】');
    lines.push(declaration.additionalNotes.trim());
  }

  return lines.join('\n');
}

export function getMaterialSourceLabel(key: string): string {
  return MATERIAL_SOURCE_LABELS[key] || key;
}

export function getFontLicenseLabel(key: string): string {
  return FONT_LICENSE_LABELS[key] || key;
}

export function getOwnershipLabel(key: string): string {
  return OWNERSHIP_LABELS[key] || key;
}
