'use client';

import React, { useCallback, useMemo } from 'react';
import {
  ReactFlow,
  Controls,
  MiniMap,
  Background,
  BackgroundVariant,
  NodeTypes,
  ReactFlowProvider,
} from '@xyflow/react';
import { useMindMapStore } from '@/store/useMindMapStore';
import { CustomMindNode } from './CustomMindNode';
import { NodeStyleMenu } from './NodeStyleMenu';
import { TouchToolbar } from './TouchToolbar';
import { RemoteCursors } from './RemoteCursors';

export function MindMapCanvas() {
  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    setSelectedNodeId,
    broadcastCursor,
    isReadOnly,
  } = useMindMapStore();

  const nodeTypes = useMemo<NodeTypes>(
    () => ({
      mindMapNode: CustomMindNode,
    }),
    []
  );

  const handleNodeClick = useCallback(
    (_: React.MouseEvent | React.TouchEvent, node: { id: string }) => {
      setSelectedNodeId(node.id);
    },
    [setSelectedNodeId]
  );

  const handlePaneClick = useCallback(() => {
    setSelectedNodeId(null);
  }, [setSelectedNodeId]);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      broadcastCursor(e.clientX, e.clientY);
    },
    [broadcastCursor]
  );

  return (
    <div
      onMouseMove={handleMouseMove}
      className="relative w-full h-screen bg-[#0b0f19] overflow-hidden select-none touch-pan-x touch-pan-y"
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={handleNodeClick}
        onPaneClick={handlePaneClick}
        nodesDraggable={!isReadOnly}
        nodesConnectable={!isReadOnly}
        elementsSelectable={true}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.15}
        maxZoom={3.0}
        panOnScroll={true}
        zoomOnPinch={true}
        preventScrolling={true}
        zoomOnDoubleClick={false}
        defaultEdgeOptions={{
          type: 'smoothstep',
          style: { stroke: '#3b82f6', strokeWidth: 2.5 },
          animated: false,
        }}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={24}
          size={1.5}
          color="#1e293b"
        />
        <Controls showInteractive={false} position="bottom-right" className="!mb-16 !mr-4" />
        <MiniMap
          nodeColor={(node) => {
            const data = node.data as any;
            if (data?.colorPreset === 'emerald') return '#10b981';
            if (data?.colorPreset === 'cyan') return '#06b6d4';
            if (data?.colorPreset === 'amber') return '#f59e0b';
            if (data?.colorPreset === 'crimson') return '#f43f5e';
            if (data?.colorPreset === 'violet') return '#a855f7';
            return '#6366f1';
          }}
          maskColor="rgba(15, 23, 42, 0.75)"
          position="bottom-left"
          className="!mb-16 !ml-4"
        />

        {/* Touch & Trackpad Quick Dock */}
        <TouchToolbar />
      </ReactFlow>

      {/* Live Remote Cursors Overlay */}
      <RemoteCursors />

      {/* Floating style toolbar */}
      <NodeStyleMenu />
    </div>
  );
}

export function MindMapCanvasWrapper() {
  return (
    <ReactFlowProvider>
      <MindMapCanvas />
    </ReactFlowProvider>
  );
}
