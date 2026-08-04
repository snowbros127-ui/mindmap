import { create } from 'zustand';
import { MindMap, CustomNode, CustomEdge } from '@/types/mindmap';
import { MINDMAP_TEMPLATES } from '@/lib/templates';

const STORAGE_KEY = 'learning_mindmaps_db_v1';

interface DashboardStoreState {
  mindMaps: MindMap[];
  searchQuery: string;
  categoryFilter: string;
  isLoading: boolean;

  // Actions
  loadMindMaps: () => void;
  saveMindMap: (map: MindMap) => void;
  deleteMindMap: (id: string) => void;
  duplicateMindMap: (id: string) => MindMap | null;
  createFromTemplate: (templateId: string) => MindMap;
  createEmptyMap: () => MindMap;
  setSearchQuery: (query: string) => void;
  setCategoryFilter: (category: string) => void;
}

const SAMPLE_INITIAL_MAPS: MindMap[] = [
  {
    id: 'sample-exam',
    title: MINDMAP_TEMPLATES[0].title,
    description: MINDMAP_TEMPLATES[0].description,
    nodes: MINDMAP_TEMPLATES[0].nodes,
    edges: MINDMAP_TEMPLATES[0].edges,
    updatedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    isPublic: true,
    category: 'study',
  },
  {
    id: 'sample-book',
    title: MINDMAP_TEMPLATES[1].title,
    description: MINDMAP_TEMPLATES[1].description,
    nodes: MINDMAP_TEMPLATES[1].nodes,
    edges: MINDMAP_TEMPLATES[1].edges,
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    isPublic: true,
    category: 'book',
  },
];

export const useDashboardStore = create<DashboardStoreState>((set, get) => ({
  mindMaps: [],
  searchQuery: '',
  categoryFilter: 'all',
  isLoading: true,

  loadMindMaps: () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        set({ mindMaps: JSON.parse(stored), isLoading: false });
      } else {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(SAMPLE_INITIAL_MAPS));
        set({ mindMaps: SAMPLE_INITIAL_MAPS, isLoading: false });
      }
    } catch (e) {
      console.error('Error loading mindmaps from localStorage', e);
      set({ mindMaps: SAMPLE_INITIAL_MAPS, isLoading: false });
    }
  },

  saveMindMap: (updatedMap) => {
    const { mindMaps } = get();
    const existingIndex = mindMaps.findIndex((m) => m.id === updatedMap.id);
    let newMaps: MindMap[];

    const timeStamp = new Date().toISOString();
    const mapToSave = { ...updatedMap, updatedAt: timeStamp };

    if (existingIndex >= 0) {
      newMaps = [...mindMaps];
      newMaps[existingIndex] = mapToSave;
    } else {
      newMaps = [mapToSave, ...mindMaps];
    }

    set({ mindMaps: newMaps });
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newMaps));
    } catch (e) {
      console.error('LocalStorage write error', e);
    }
  },

  deleteMindMap: (id) => {
    const newMaps = get().mindMaps.filter((m) => m.id !== id);
    set({ mindMaps: newMaps });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newMaps));
  },

  duplicateMindMap: (id) => {
    const target = get().mindMaps.find((m) => m.id === id);
    if (!target) return null;

    const newId = `map-${Date.now()}`;
    const duplicated: MindMap = {
      ...target,
      id: newId,
      title: `${target.title} (사본)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    get().saveMindMap(duplicated);
    return duplicated;
  },

  createFromTemplate: (templateId) => {
    const template = MINDMAP_TEMPLATES.find((t) => t.id === templateId) || MINDMAP_TEMPLATES[0];
    const newId = `map-${Date.now()}`;

    const newMap: MindMap = {
      id: newId,
      title: template.title,
      description: template.description,
      nodes: JSON.parse(JSON.stringify(template.nodes)),
      edges: JSON.parse(JSON.stringify(template.edges)),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isPublic: false,
      category: template.category,
    };

    get().saveMindMap(newMap);
    return newMap;
  },

  createEmptyMap: () => {
    const newId = `map-${Date.now()}`;
    const initialNodes: CustomNode[] = [
      {
        id: 'node-root',
        type: 'mindMapNode',
        position: { x: 0, y: 0 },
        data: { label: '새 학습 주제 💡', emoji: '💡', colorPreset: 'indigo', fontSize: 'xl', isRoot: true },
      },
    ];
    const initialEdges: CustomEdge[] = [];

    const newMap: MindMap = {
      id: newId,
      title: '새 마인드맵',
      nodes: initialNodes,
      edges: initialEdges,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isPublic: false,
      category: 'general',
    };

    get().saveMindMap(newMap);
    return newMap;
  },

  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setCategoryFilter: (categoryFilter) => set({ categoryFilter }),
}));
