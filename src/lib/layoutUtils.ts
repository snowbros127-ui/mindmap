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
  direction: 'TB' | 'LR' | 'RL' | 'BT' = 'LR'
): { nodes: CustomNode[]; edges: CustomEdge[] } {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));

  const nodeWidth = 230;
  const nodeHeight = 65;

  dagreGraph.setGraph({
    rankdir: direction,
    nodesep: 45,
    ranksep: 110,
  });

  // Filter out hidden nodes if collapsed
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

  // Color code edges to match their parent node color to eliminate visual clutter
  const nodeColorMap = new Map<string, string>();
  nodes.forEach((n) => {
    const preset = n.data.colorPreset || 'indigo';
    nodeColorMap.set(n.id, PRESET_COLORS[preset] || '#3b82f6');
  });

  const coloredEdges = edges.map((edge) => {
    const parentColor = nodeColorMap.get(edge.source) || '#3b82f6';
    return {
      ...edge,
      style: {
        ...edge.style,
        stroke: parentColor,
        strokeWidth: 2.5,
      },
    };
  });

  return { nodes: layoutedNodes, edges: coloredEdges };
}
