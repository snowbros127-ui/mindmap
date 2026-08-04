import { create } from 'zustand';
import {
  NodeChange,
  EdgeChange,
  applyNodeChanges,
  applyEdgeChanges,
  Connection,
  addEdge,
} from '@xyflow/react';
import { CustomNode, CustomEdge, MindMap, NodeColorPreset, Collaborator } from '@/types/mindmap';
import { getLayoutedElements } from '@/lib/layoutUtils';
import { RealtimeSession, RealtimeEvent } from '@/lib/realtime';

const PRESET_COLORS: Record<string, string> = {
  indigo: '#6366f1',
  emerald: '#10b981',
  cyan: '#06b6d4',
  amber: '#f59e0b',
  crimson: '#f43f5e',
  violet: '#a855f7',
  slate: '#64748b',
};

interface HistoryState {
  nodes: CustomNode[];
  edges: CustomEdge[];
}

interface MindMapStoreState {
  mindMapId: string;
  title: string;
  description: string;
  isPublic: boolean;
  nodes: CustomNode[];
  edges: CustomEdge[];
  edgeType: 'smoothstep' | 'bezier' | 'straight';
  selectedNodeId: string | null;
  searchQuery: string;
  isReadOnly: boolean;
  history: HistoryState[];
  historyIndex: number;

  // Realtime Collaboration State
  isRealtimeActive: boolean;
  realtimeSession: RealtimeSession | null;
  collaborators: Record<string, Collaborator>;

  // Actions
  setMindMap: (mindMap: MindMap, readOnly?: boolean) => void;
  setTitle: (title: string) => void;
  setDescription: (desc: string) => void;
  setIsPublic: (isPublic: boolean) => void;
  setSearchQuery: (query: string) => void;
  setSelectedNodeId: (nodeId: string | null) => void;
  setEdgeType: (type: 'smoothstep' | 'bezier' | 'straight') => void;

  // Realtime Actions
  initRealtimeSession: (roomId: string, studentName?: string) => void;
  leaveRealtimeSession: () => void;
  broadcastCursor: (x: number, y: number) => void;

  // React Flow Handlers
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (connection: Connection) => void;

  // Node Mutations
  updateNodeData: (id: string, data: Partial<CustomNode['data']>) => void;
  setNodeColorPreset: (id: string, preset: NodeColorPreset) => void;
  setNodeFontSize: (id: string, size: 'sm' | 'md' | 'lg' | 'xl') => void;
  setNodeEmoji: (id: string, emoji: string) => void;
  toggleCollapseNode: (id: string) => void;

  // Shortcut Actions
  addFreeNode: (position?: { x: number; y: number }) => void;
  addChildNode: (parentNodeId?: string) => void;
  addSiblingNode: (currentNodeId?: string) => void;
  deleteSelectedNodes: () => void;
  autoLayout: (direction?: 'BOTH' | 'LR' | 'TB') => void;

  // Undo / Redo
  saveHistoryStep: () => void;
  undo: () => void;
  redo: () => void;
}

const DEFAULT_INITIAL_NODES: CustomNode[] = [
  {
    id: 'node-root',
    type: 'mindMapNode',
    position: { x: 0, y: 0 },
    data: { label: '중심 학습 주제 💡', emoji: '💡', colorPreset: 'indigo', fontSize: 'xl', isRoot: true },
  },
  {
    id: 'node-sub-1',
    type: 'mindMapNode',
    position: { x: -280, y: 0 },
    data: { label: '핵심 개념 1 📚', emoji: '📚', colorPreset: 'emerald', fontSize: 'lg' },
  },
  {
    id: 'node-sub-2',
    type: 'mindMapNode',
    position: { x: 280, y: 0 },
    data: { label: '핵심 개념 2 🧪', emoji: '🧪', colorPreset: 'cyan', fontSize: 'lg' },
  },
];

const DEFAULT_INITIAL_EDGES: CustomEdge[] = [
  { id: 'edge-root-sub1', source: 'node-root', target: 'node-sub-1', type: 'smoothstep', style: { stroke: '#6366f1', strokeWidth: 2.5 } },
  { id: 'edge-root-sub2', source: 'node-root', target: 'node-sub-2', type: 'smoothstep', style: { stroke: '#6366f1', strokeWidth: 2.5 } },
];

export const useMindMapStore = create<MindMapStoreState>((set, get) => ({
  mindMapId: 'new-map',
  title: '새 마인드맵',
  description: '',
  isPublic: false,
  nodes: DEFAULT_INITIAL_NODES,
  edges: DEFAULT_INITIAL_EDGES,
  edgeType: 'smoothstep',
  selectedNodeId: null,
  searchQuery: '',
  isReadOnly: false,
  history: [{ nodes: DEFAULT_INITIAL_NODES, edges: DEFAULT_INITIAL_EDGES }],
  historyIndex: 0,

  isRealtimeActive: false,
  realtimeSession: null,
  collaborators: {},

  setMindMap: (mindMap, readOnly = false) => {
    const layouted = getLayoutedElements(mindMap.nodes, mindMap.edges, 'BOTH');
    set({
      mindMapId: mindMap.id,
      title: mindMap.title,
      description: mindMap.description || '',
      isPublic: mindMap.isPublic,
      nodes: layouted.nodes,
      edges: layouted.edges,
      edgeType: mindMap.edgeType || 'smoothstep',
      isReadOnly: readOnly,
      selectedNodeId: null,
      history: [{ nodes: layouted.nodes, edges: layouted.edges }],
      historyIndex: 0,
    });
  },

  setTitle: (title) => set({ title }),
  setDescription: (description) => set({ description }),
  setIsPublic: (isPublic) => set({ isPublic }),
  setSearchQuery: (query) => {
    const trimmed = query.toLowerCase();
    const updatedNodes = get().nodes.map((node) => {
      const labelMatch = node.data.label.toLowerCase().includes(trimmed);
      return {
        ...node,
        data: {
          ...node.data,
          isHighlighted: trimmed ? labelMatch : false,
        },
      };
    });
    set({ searchQuery: query, nodes: updatedNodes });
  },

  setSelectedNodeId: (selectedNodeId) => set({ selectedNodeId }),

  setEdgeType: (edgeType) => {
    const updatedEdges = get().edges.map((e) => ({
      ...e,
      type: edgeType,
    }));
    set({ edgeType, edges: updatedEdges });
    get().saveHistoryStep();
  },

  initRealtimeSession: (roomId, studentName) => {
    const existing = get().realtimeSession;
    if (existing) existing.leave();

    const session = new RealtimeSession(roomId, studentName);
    session.subscribe((event: RealtimeEvent) => {
      if (event.senderId === session.userId) return;

      if (event.type === 'USER_JOINED' || event.type === 'CURSOR_MOVE') {
        const currentCollabs = { ...get().collaborators };
        currentCollabs[event.senderId] = {
          id: event.senderId,
          name: event.senderName,
          color: event.senderColor,
          cursor: event.type === 'CURSOR_MOVE' ? event.payload : currentCollabs[event.senderId]?.cursor,
          lastActive: Date.now(),
        };
        set({ collaborators: currentCollabs });
      } else if (event.type === 'USER_LEFT') {
        const currentCollabs = { ...get().collaborators };
        delete currentCollabs[event.senderId];
        set({ collaborators: currentCollabs });
      } else if (event.type === 'NODE_UPDATE') {
        if (event.payload?.nodes && event.payload?.edges) {
          set({
            nodes: event.payload.nodes,
            edges: event.payload.edges,
          });
        }
      }
    });

    set({ realtimeSession: session, isRealtimeActive: true });
  },

  leaveRealtimeSession: () => {
    const session = get().realtimeSession;
    if (session) session.leave();
    set({ realtimeSession: null, isRealtimeActive: false, collaborators: {} });
  },

  broadcastCursor: (x, y) => {
    const session = get().realtimeSession;
    if (session && get().isRealtimeActive) {
      session.broadcast({
        type: 'CURSOR_MOVE',
        payload: { x, y },
      });
    }
  },

  broadcastNodeState: () => {
    const session = get().realtimeSession;
    if (session && get().isRealtimeActive) {
      session.broadcast({
        type: 'NODE_UPDATE',
        payload: {
          nodes: get().nodes,
          edges: get().edges,
        },
      });
    }
  },

  saveHistoryStep: () => {
    const { nodes, edges, history, historyIndex } = get();
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push({ nodes: JSON.parse(JSON.stringify(nodes)), edges: JSON.parse(JSON.stringify(edges)) });
    if (newHistory.length > 30) newHistory.shift();
    set({ history: newHistory, historyIndex: newHistory.length - 1 });
    (get() as any).broadcastNodeState();
  },

  undo: () => {
    const { historyIndex, history } = get();
    if (historyIndex > 0) {
      const prevStep = history[historyIndex - 1];
      set({
        nodes: JSON.parse(JSON.stringify(prevStep.nodes)),
        edges: JSON.parse(JSON.stringify(prevStep.edges)),
        historyIndex: historyIndex - 1,
      });
      (get() as any).broadcastNodeState();
    }
  },

  redo: () => {
    const { historyIndex, history } = get();
    if (historyIndex < history.length - 1) {
      const nextStep = history[historyIndex + 1];
      set({
        nodes: JSON.parse(JSON.stringify(nextStep.nodes)),
        edges: JSON.parse(JSON.stringify(nextStep.edges)),
        historyIndex: historyIndex + 1,
      });
      (get() as any).broadcastNodeState();
    }
  },

  onNodesChange: (changes) => {
    const updatedNodes = applyNodeChanges(changes, get().nodes as any) as CustomNode[];
    set({ nodes: updatedNodes });
    const isDragEnd = changes.some((c) => c.type === 'position' && !c.dragging);
    if (isDragEnd) {
      (get() as any).broadcastNodeState();
    }
  },

  onEdgesChange: (changes) => {
    set({
      edges: applyEdgeChanges(changes, get().edges as any) as CustomEdge[],
    });
  },

  onConnect: (connection) => {
    const { nodes, edgeType } = get();
    const sourceNode = nodes.find((n) => n.id === connection.source);
    const parentColor = PRESET_COLORS[sourceNode?.data.colorPreset || 'indigo'] || '#3b82f6';

    const newEdge: CustomEdge = {
      ...connection,
      id: `e-${connection.source}-${connection.target}-${Date.now()}`,
      type: edgeType,
      style: { stroke: parentColor, strokeWidth: 2.5 },
    } as CustomEdge;

    const updatedEdges = addEdge(newEdge, get().edges as any) as CustomEdge[];
    set({ edges: updatedEdges });
    get().saveHistoryStep();
  },

  updateNodeData: (id, data) => {
    const { nodes, edges } = get();
    const updatedNodes = nodes.map((node) => {
      if (node.id === id) {
        return {
          ...node,
          data: { ...node.data, ...data },
        };
      }
      return node;
    });

    let updatedEdges = edges;
    if (data.colorPreset) {
      const newColor = PRESET_COLORS[data.colorPreset] || '#3b82f6';
      updatedEdges = edges.map((e) => {
        if (e.source === id) {
          return {
            ...e,
            style: { ...e.style, stroke: newColor },
          };
        }
        return e;
      });
    }

    set({ nodes: updatedNodes, edges: updatedEdges });
    get().saveHistoryStep();
  },

  setNodeColorPreset: (id, preset) => {
    get().updateNodeData(id, { colorPreset: preset });
  },

  setNodeFontSize: (id, size) => {
    get().updateNodeData(id, { fontSize: size });
  },

  setNodeEmoji: (id, emoji) => {
    get().updateNodeData(id, { emoji });
  },

  toggleCollapseNode: (nodeId) => {
    const { nodes, edges } = get();
    const targetNode = nodes.find((n) => n.id === nodeId);
    if (!targetNode) return;

    const isCollapsed = !targetNode.data.isCollapsed;

    const getDescendants = (startId: string): string[] => {
      const childEdges = edges.filter((e) => e.source === startId);
      const childIds = childEdges.map((e) => e.target);
      let descendants = [...childIds];
      childIds.forEach((cId) => {
        descendants = descendants.concat(getDescendants(cId));
      });
      return descendants;
    };

    const descendantIds = new Set(getDescendants(nodeId));

    const updatedNodes = nodes.map((n) => {
      if (n.id === nodeId) {
        return {
          ...n,
          data: { ...n.data, isCollapsed },
        };
      }
      if (descendantIds.has(n.id)) {
        return {
          ...n,
          hidden: isCollapsed,
        };
      }
      return n;
    });

    const updatedEdges = edges.map((e) => {
      if (descendantIds.has(e.target)) {
        return {
          ...e,
          hidden: isCollapsed,
        };
      }
      return e;
    });

    set({ nodes: updatedNodes, edges: updatedEdges });
    get().saveHistoryStep();
  },

  addFreeNode: (customPos) => {
    const { nodes, selectedNodeId } = get();
    const newId = `node-${Date.now()}`;
    const selectedNode = nodes.find((n) => n.id === selectedNodeId);

    const posX = customPos?.x ?? (selectedNode ? selectedNode.position.x - 200 : -100);
    const posY = customPos?.y ?? (selectedNode ? selectedNode.position.y + 120 : 0);

    const newNode: CustomNode = {
      id: newId,
      type: 'mindMapNode',
      position: { x: posX, y: posY },
      data: {
        label: '독립 박스 노드 📦',
        emoji: '📦',
        colorPreset: 'violet',
        fontSize: 'md',
      },
    };

    set({
      nodes: [...nodes, newNode],
      selectedNodeId: newId,
    });
    get().saveHistoryStep();
  },

  addChildNode: (targetNodeId) => {
    const { nodes, edges, selectedNodeId, edgeType } = get();
    const parentId = targetNodeId || selectedNodeId || nodes[0]?.id;
    if (!parentId) return;

    const parentNode = nodes.find((n) => n.id === parentId);
    if (!parentNode) return;

    const newId = `node-${Date.now()}`;
    const childCount = edges.filter((e) => e.source === parentId).length;
    const parentColor = PRESET_COLORS[parentNode.data.colorPreset || 'indigo'] || '#3b82f6';

    // Bi-directional direction check: Left side expands leftwards (-250), right side expands rightwards (+250)
    const isLeftSide = parentNode.position.x < -20;
    const xOffset = isLeftSide ? -250 : 250;

    const newNode: CustomNode = {
      id: newId,
      type: 'mindMapNode',
      position: {
        x: parentNode.position.x + xOffset,
        y: parentNode.position.y + childCount * 70 - 20,
      },
      data: {
        label: '새 하위 주제',
        colorPreset: parentNode.data.colorPreset || 'indigo',
        fontSize: 'md',
      },
    };

    const newEdge: CustomEdge = {
      id: `e-${parentId}-${newId}`,
      source: parentId,
      target: newId,
      type: edgeType,
      style: { stroke: parentColor, strokeWidth: 2.5 },
    };

    set({
      nodes: [...nodes, newNode],
      edges: [...edges, newEdge],
      selectedNodeId: newId,
    });
    get().saveHistoryStep();
  },

  addSiblingNode: (targetNodeId) => {
    const { nodes, edges, selectedNodeId, edgeType } = get();
    const currentId = targetNodeId || selectedNodeId;
    if (!currentId) return;

    const parentEdge = edges.find((e) => e.target === currentId);
    if (!parentEdge) {
      get().addChildNode(currentId);
      return;
    }

    const parentId = parentEdge.source;
    const parentNode = nodes.find((n) => n.id === parentId);
    const currentNode = nodes.find((n) => n.id === currentId);

    if (!parentNode || !currentNode) return;

    const newId = `node-${Date.now()}`;
    const parentColor = PRESET_COLORS[currentNode.data.colorPreset || 'indigo'] || '#3b82f6';

    const newNode: CustomNode = {
      id: newId,
      type: 'mindMapNode',
      position: {
        x: currentNode.position.x,
        y: currentNode.position.y + 75,
      },
      data: {
        label: '새 형제 주제',
        colorPreset: currentNode.data.colorPreset || 'indigo',
        fontSize: currentNode.data.fontSize || 'md',
      },
    };

    const newEdge: CustomEdge = {
      id: `e-${parentId}-${newId}`,
      source: parentId,
      target: newId,
      type: edgeType,
      style: { stroke: parentColor, strokeWidth: 2.5 },
    };

    set({
      nodes: [...nodes, newNode],
      edges: [...edges, newEdge],
      selectedNodeId: newId,
    });
    get().saveHistoryStep();
  },

  deleteSelectedNodes: () => {
    const { nodes, edges, selectedNodeId } = get();
    if (!selectedNodeId) return;

    const nodeToDelete = nodes.find((n) => n.id === selectedNodeId);
    if (nodeToDelete?.data.isRoot) return;

    const remainingNodes = nodes.filter((n) => n.id !== selectedNodeId);
    const remainingEdges = edges.filter(
      (e) => e.source !== selectedNodeId && e.target !== selectedNodeId
    );

    set({
      nodes: remainingNodes,
      edges: remainingEdges,
      selectedNodeId: null,
    });
    get().saveHistoryStep();
  },

  autoLayout: (direction = 'BOTH') => {
    const { nodes, edges } = get();
    const layouted = getLayoutedElements(nodes, edges, direction);
    set({ nodes: layouted.nodes, edges: layouted.edges });
    get().saveHistoryStep();
  },
}));
