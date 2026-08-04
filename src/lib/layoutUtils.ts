import dagre from 'dagre';
import { CustomNode, CustomEdge } from '@/types/mindmap';

const PRESET_COLORS: Record<string, string> = {
  indigo: '#6366f1',
  emerald: '#10b981',
  cyan: '#06b6d4',
  amber: '#f59e0b',
  crimson: '#f43f5e',
  violet: '#a855f7',
  slate: '#64748b',
};

export function getLayoutedElements(
  nodes: CustomNode[],
  edges: CustomEdge[],
  direction: 'BOTH' | 'LR' | 'TB' = 'BOTH'
): { nodes: CustomNode[]; edges: CustomEdge[] } {
  const visibleNodes = nodes.filter((n) => !n.hidden);
  const visibleEdges = edges.filter((e) => !e.hidden);

  const rootNode = visibleNodes.find((n) => n.data?.isRoot) || visibleNodes[0];

  if (!rootNode || direction === 'LR' || direction === 'TB') {
    return runDagreLayout(nodes, edges, direction === 'TB' ? 'TB' : 'LR');
  }

  // Symmetrical Bi-Directional Layout ('BOTH')
  const rootId = rootNode.id;
  const mainBranchEdges = visibleEdges.filter((e) => e.source === rootId);
  const mainBranchIds = mainBranchEdges.map((e) => e.target);

  const leftBranchIds: string[] = [];
  const rightBranchIds: string[] = [];

  mainBranchIds.forEach((id, idx) => {
    if (idx % 2 === 0) {
      rightBranchIds.push(id);
    } else {
      leftBranchIds.push(id);
    }
  });

  const getSubTreeIds = (startIds: string[]): Set<string> => {
    const subTree = new Set<string>(startIds);
    let queue = [...startIds];

    while (queue.length > 0) {
      const current = queue.shift()!;
      const childEdges = visibleEdges.filter((e) => e.source === current);
      childEdges.forEach((e) => {
        if (!subTree.has(e.target)) {
          subTree.add(e.target);
          queue.push(e.target);
        }
      });
    }
    return subTree;
  };

  const rightSubTreeIds = getSubTreeIds(rightBranchIds);
  const leftSubTreeIds = getSubTreeIds(leftBranchIds);

  const rightNodes = visibleNodes.filter((n) => rightSubTreeIds.has(n.id));
  const rightEdges = visibleEdges.filter((e) => rightSubTreeIds.has(e.source) && rightSubTreeIds.has(e.target));

  const leftNodes = visibleNodes.filter((n) => leftSubTreeIds.has(n.id));
  const leftEdges = visibleEdges.filter((e) => leftSubTreeIds.has(e.source) && leftSubTreeIds.has(e.target));

  const layoutedRight = runDagreSubLayout(rightNodes, rightEdges);
  const layoutedLeft = runDagreSubLayout(leftNodes, leftEdges);

  const nodePositionMap = new Map<string, { x: number; y: number }>();
  nodePositionMap.set(rootId, { x: 0, y: 0 });

  layoutedRight.nodes.forEach((n) => {
    nodePositionMap.set(n.id, {
      x: n.position.x + 280,
      y: n.position.y,
    });
  });

  layoutedLeft.nodes.forEach((n) => {
    nodePositionMap.set(n.id, {
      x: -n.position.x - 280,
      y: n.position.y,
    });
  });

  const updatedNodes = nodes.map((node) => {
    if (nodePositionMap.has(node.id)) {
      return {
        ...node,
        position: nodePositionMap.get(node.id)!,
      };
    }
    return node;
  });

  const nodeColorMap = new Map<string, string>();
  nodes.forEach((n) => {
    const preset = n.data.colorPreset || 'indigo';
    nodeColorMap.set(n.id, PRESET_COLORS[preset] || '#3b82f6');
  });

  const coloredEdges = edges.map((edge) => {
    const parentColor = nodeColorMap.get(edge.source) || '#3b82f6';
    const isLeftEdge = leftSubTreeIds.has(edge.target) || leftBranchIds.includes(edge.target);

    return {
      ...edge,
      sourceHandle: isLeftEdge ? 'left-out' : 'right-out',
      targetHandle: isLeftEdge ? 'right-in' : 'left-in',
      style: {
        ...edge.style,
        stroke: parentColor,
        strokeWidth: 2.5,
      },
    };
  });

  return { nodes: updatedNodes, edges: coloredEdges };
}

function runDagreLayout(nodes: CustomNode[], edges: CustomEdge[], rankdir: 'LR' | 'TB') {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));

  const nodeWidth = 230;
  const nodeHeight = 65;

  dagreGraph.setGraph({
    rankdir,
    nodesep: 45,
    ranksep: 120,
  });

  const visibleNodes = nodes.filter((n) => !n.hidden);
  const visibleEdges = edges.filter((e) => !e.hidden);

  visibleNodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  visibleEdges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const layoutedNodes = nodes.map((node) => {
    if (node.hidden) return node;
    const nodeWithPosition = dagreGraph.node(node.id);
    if (!nodeWithPosition) return node;

    return {
      ...node,
      position: {
        x: nodeWithPosition.x - nodeWidth / 2,
        y: nodeWithPosition.y - nodeHeight / 2,
      },
    };
  });

  const nodeColorMap = new Map<string, string>();
  nodes.forEach((n) => {
    const preset = n.data.colorPreset || 'indigo';
    nodeColorMap.set(n.id, PRESET_COLORS[preset] || '#3b82f6');
  });

  const coloredEdges = edges.map((edge) => {
    const parentColor = nodeColorMap.get(edge.source) || '#3b82f6';
    return {
      ...edge,
      sourceHandle: rankdir === 'TB' ? 'bottom-out' : 'right-out',
      targetHandle: rankdir === 'TB' ? 'top-in' : 'left-in',
      style: {
        ...edge.style,
        stroke: parentColor,
        strokeWidth: 2.5,
      },
    };
  });

  return { nodes: layoutedNodes, edges: coloredEdges };
}

function runDagreSubLayout(nodes: CustomNode[], edges: CustomEdge[]) {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));

  const nodeWidth = 230;
  const nodeHeight = 65;

  dagreGraph.setGraph({
    rankdir: 'LR',
    nodesep: 50,
    ranksep: 110,
  });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    if (!nodeWithPosition) return node;

    return {
      ...node,
      position: {
        x: nodeWithPosition.x - nodeWidth / 2,
        y: nodeWithPosition.y - nodeHeight / 2,
      },
    };
  });

  return { nodes: layoutedNodes, edges };
}
