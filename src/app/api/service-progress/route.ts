import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';
import { serviceProgress, serviceOrders } from '@/storage/database/shared/schema';
import { eq, desc, and } from 'drizzle-orm';

// 节点名称定义
const NODE_NAMES = [
  '', // 0 占位
  '下单支付',
  '需求确认',
  '制作中',
  '初稿交付',
  '修改调整',
  '终稿交付',
  '确认收货',
];

// 虚拟子节点定义
const VIRTUAL_NODES: Record<number, { name: string; description: string }[]> = {
  1: [
    { name: '订单已创建', description: '买家已下单并支付，等待卖家确认' },
    { name: '卖家已接单', description: '卖家已确认订单，准备开始服务' },
  ],
  2: [
    { name: '开始梳理需求', description: '卖家正在与买家沟通确认具体需求' },
    { name: '需求已确认', description: '双方已就服务内容达成一致' },
  ],
  3: [
    { name: '开始制作', description: '卖家已开始进行内容制作' },
    { name: '完成框架', description: '已完成基础框架搭建' },
    { name: '填充内容', description: '正在进行内容填充和完善' },
    { name: '美化排版', description: '正在进行细节优化和排版' },
  ],
  4: [
    { name: '初稿已完成', description: '初稿已完成，等待买家审核' },
  ],
  5: [
    { name: '收到修改意见', description: '已收到买家的修改意见' },
    { name: '正在修改', description: '卖家正在根据意见进行修改' },
    { name: '修改完成', description: '修改已完成，等待买家再次确认' },
  ],
  6: [
    { name: '终稿已交付', description: '终稿已交付，等待买家确认收货' },
  ],
  7: [
    { name: '买家已确认', description: '买家已确认收货，订单完成' },
  ],
};

// GET - 获取服务单进展时间线
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('orderId');

    if (!orderId) {
      return NextResponse.json({ error: '缺少订单ID' }, { status: 400 });
    }

    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('service_progress')
      .select('*')
      .eq('order_id', orderId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('查询进展记录失败:', error);
      return NextResponse.json({ error: '查询失败' }, { status: 500 });
    }

    // 获取订单当前节点
    const { data: orderData } = await supabase
      .from('service_orders')
      .select('current_node')
      .eq('id', orderId)
      .single();

    const currentNode = orderData?.current_node || 1;

    // 生成虚拟子节点
    const progressWithVirtual = generateVirtualProgress(data || [], currentNode);

    return NextResponse.json({
      progress: progressWithVirtual,
      currentNode,
    });
  } catch (error) {
    console.error('获取进展记录失败:', error);
    return NextResponse.json({ error: '服务器错误' }, { status: 500 });
  }
}

// POST - 添加进展记录
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId, nodeIndex, title, description, imageUrls, operatorType, operatorId } = body;

    if (!orderId || !nodeIndex || !title) {
      return NextResponse.json({ error: '缺少必要参数' }, { status: 400 });
    }

    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('service_progress')
      .insert({
        order_id: orderId,
        node_index: nodeIndex,
        title,
        description: description || null,
        image_urls: imageUrls || null,
        operator_type: operatorType || 'system',
        operator_id: operatorId || null,
        is_virtual: false,
      })
      .select()
      .single();

    if (error) {
      console.error('添加进展记录失败:', error);
      return NextResponse.json({ error: '添加失败' }, { status: 500 });
    }

    return NextResponse.json({ success: true, progress: data });
  } catch (error) {
    console.error('添加进展记录失败:', error);
    return NextResponse.json({ error: '服务器错误' }, { status: 500 });
  }
}

// 生成带虚拟子节点的进展记录
function generateVirtualProgress(
  existingProgress: any[],
  currentNode: number
): any[] {
  const result: any[] = [];
  const now = new Date();

  // 添加现有记录
  result.push(...existingProgress);

  // 为每个已完成的节点添加虚拟子节点
  for (let node = 1; node <= currentNode; node++) {
    const virtualNodes = VIRTUAL_NODES[node] || [];
    const nodeProgress = existingProgress.filter(p => p.node_index === node && !p.is_virtual);

    // 如果该节点没有实际记录，添加虚拟子节点
    if (nodeProgress.length === 0) {
      virtualNodes.forEach((vn, index) => {
        // 计算虚拟时间（假设每个子节点间隔2-4小时）
        const virtualTime = new Date(now.getTime() - (currentNode - node) * 24 * 60 * 60 * 1000 - (virtualNodes.length - index) * 3 * 60 * 60 * 1000);
        result.push({
          id: `virtual-${node}-${index}`,
          order_id: '',
          node_index: node,
          sub_node_index: index + 1,
          title: vn.name,
          description: vn.description,
          image_urls: null,
          operator_type: 'system',
          is_virtual: true,
          created_at: virtualTime.toISOString(),
        });
      });
    }
  }

  // 按时间倒序排列
  result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  return result;
}
