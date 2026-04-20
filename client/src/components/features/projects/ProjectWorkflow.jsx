import React, { useState, useCallback } from "react";
import ReactFlow, {
  addEdge,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  MarkerType,
  useReactFlow,
  ReactFlowProvider,
} from "reactflow";
import "reactflow/dist/style.css";

import { Box, Button } from "@mui/material";

import WorkflowNode from "./_components/WorkflowNode";
import WorkflowSidebar from "./_components/WorkflowSidebar";

const nodeTypes = { workflow: WorkflowNode };

const initialNodes = [
  {
    id: "start",
    type: "workflow",
    position: { x: 100, y: 150 },
    data: { label: "Start" },
  },
  {
    id: "dev",
    type: "workflow",
    position: { x: 320, y: 150 },
    data: { label: "Development" },
  },
  {
    id: "test",
    type: "workflow",
    position: { x: 540, y: 150 },
    data: { label: "Testing" },
  },
  {
    id: "done",
    type: "workflow",
    position: { x: 760, y: 150 },
    data: { label: "Done" },
  },
];

const initialEdges = [
  {
    id: "start-dev",
    source: "start",
    target: "dev",
    label: "Start Work",
    data: { requireComment: false },
    markerEnd: { type: MarkerType.ArrowClosed },
  },
  {
    id: "dev-test",
    source: "dev",
    target: "test",
    label: "Send to Testing",
    data: { requireComment: false },
    markerEnd: { type: MarkerType.ArrowClosed },
  },
  {
    id: "test-dev",
    source: "test",
    target: "dev",
    label: "Send Back",
    data: { requireComment: true },
    markerEnd: { type: MarkerType.ArrowClosed },
  },
  {
    id: "test-done",
    source: "test",
    target: "done",
    label: "Approve",
    data: { requireComment: false },
    markerEnd: { type: MarkerType.ArrowClosed },
  },
];

function WorkflowBuilderInner() {
  const [selectedNode, setSelectedNode] = useState(null);
  const [selectedEdge, setSelectedEdge] = useState(null);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const { fitView } = useReactFlow();

  const onConnect = useCallback(
    (params) =>
      setEdges((eds) =>
        addEdge(
          {
            ...params,
            id: `${params.source}-${params.target}-${Date.now()}`,
            label: "New Transition",
            data: { requireComment: false },
            markerEnd: { type: MarkerType.ArrowClosed },
          },
          eds
        )
      ),
    []
  );

  const addNode = () => {
    const gapX = 240;
    const gapY = 160;
    const perRow = 4;

    const index = nodes.length;

    const newNode = {
      id: `stage-${Date.now()}`,
      type: "workflow",
      position: {
        x: 100 + (index % perRow) * gapX,
        y: 120 + Math.floor(index / perRow) * gapY,
      },
      data: { label: `Stage ${index + 1}` },
    };

    setNodes((nds) => [...nds, newNode]);

    setTimeout(() => fitView(), 100);
  };

  const updateNode = (updated) => {
    setNodes((nds) =>
      nds.map((n) => (n.id === updated.id ? updated : n))
    );
  };

  const updateEdge = (updated) => {
    setEdges((eds) =>
      eds.map((e) => (e.id === updated.id ? updated : e))
    );
  };

  const deleteNode = (id) => {
    setNodes((nds) => nds.filter((n) => n.id !== id));
    setEdges((eds) =>
      eds.filter((e) => e.source !== id && e.target !== id)
    );
    setSelectedNode(null);
  };

  const deleteEdge = (id) => {
    setEdges((eds) => eds.filter((e) => e.id !== id));
    setSelectedEdge(null);
  };

  return (
    <Box sx={{ display: "flex", height: "100vh" }}>
      <Box sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <Box sx={{ p: 1, borderBottom: "1px solid", borderColor: "divider" }}>
          <Button variant="contained" onClick={addNode}>
            Add Stage
          </Button>
        </Box>

        <Box sx={{ flex: 1 }}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            fitView
            onNodeClick={(e, node) => {
              setSelectedNode(node);
              setSelectedEdge(null);
            }}
            onEdgeClick={(e, edge) => {
              setSelectedEdge(edge);
              setSelectedNode(null);
            }}
            onPaneClick={() => {
              setSelectedNode(null);
              setSelectedEdge(null);
            }}
          >
            <MiniMap />
            <Controls />
            <Background gap={20} size={1} />
          </ReactFlow>
        </Box>
      </Box>

      <WorkflowSidebar
        node={selectedNode}
        edge={selectedEdge}
        onUpdateNode={updateNode}
        onUpdateEdge={updateEdge}
        onDeleteNode={deleteNode}
        onDeleteEdge={deleteEdge}
      />
    </Box>
  );
}

export default function WorkflowBuilder() {
  return (
    <ReactFlowProvider>
      <WorkflowBuilderInner />
    </ReactFlowProvider>
  );
}