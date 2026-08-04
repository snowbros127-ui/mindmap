import { Node, Edge } from '@xyflow/react';

export type NodeColorPreset = 'indigo' | 'emerald' | 'cyan' | 'amber' | 'crimson' | 'violet' | 'slate';

export interface CustomNodeData extends Record<string, unknown> {
  label: string;
  emoji?: string;
  colorPreset?: NodeColorPreset;
  bgColor?: string;
  textColor?: string;
  borderColor?: string;
  fontSize?: 'sm' | 'md' | 'lg' | 'xl';
  isRoot?: boolean;
  notes?: string;
  tags?: string[];
  isHighlighted?: boolean;
  isCollapsed?: boolean;
  childCount?: number;
}

export type CustomNode = Node<CustomNodeData>;

export interface CustomEdgeData extends Record<string, unknown> {
  label?: string;
  color?: string;
  styleType?: 'smoothstep' | 'bezier' | 'straight';
  animated?: boolean;
}

export type CustomEdge = Edge<CustomEdgeData>;

export interface MindMap {
  id: string;
  title: string;
  description?: string;
  nodes: CustomNode[];
  edges: CustomEdge[];
  updatedAt: string;
  createdAt: string;
  isPublic: boolean;
  category?: 'study' | 'book' | 'concept' | 'general';
  thumbnailUrl?: string;
  edgeType?: 'smoothstep' | 'bezier' | 'straight';
}

export interface MindMapTemplate {
  id: string;
  title: string;
  description: string;
  category: 'study' | 'book' | 'concept';
  icon: string;
  nodes: CustomNode[];
  edges: CustomEdge[];
}

export interface Collaborator {
  id: string;
  name: string;
  color: string;
  cursor?: { x: number; y: number };
  lastActive: number;
}
