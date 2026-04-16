import React, { useState, useCallback } from "react";
import ReactFlow, {
  addEdge,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  MarkerType,
} from "reactflow";
import "reactflow/dist/style.css";

import { Box, Button } from "@mui/material";

import WorkflowNode from "./_components/WorkflowNode";
import WorkflowSidebar from "./_components/WorkflowSidebar";

// 🔥 Node Types (outside component → stable)
const nodeTypes = { workflow: WorkflowNode };

// 🔥 Initial Nodes
const initialNodes = [
  {
    id: "1",
    type: "workflow",
    position: { x: 100, y: 100 },
    data: { label: "Start" },
  },
  {
    id: "2",
    type: "workflow",
    position: { x: 300, y: 100 },
    data: { label: "In Progress" },
  },
  {
    id: "3",
    type: "workflow",
    position: { x: 500, y: 100 },
    data: { label: "Review" },
  },
  {
    id: "4",
    type: "workflow",
    position: { x: 700, y: 100 },
    data: { label: "Done" },
  },
];

// 🔥 Initial Edges
const initialEdges = [
  {
    id: "e1-2",
    source: "1",
    target: "2",
    markerEnd: { type: MarkerType.ArrowClosed },
  },
  {
    id: "e2-3",
    source: "2",
    target: "3",
    markerEnd: { type: MarkerType.ArrowClosed },
  },
  {
    id: "e3-4",
    source: "3",
    target: "4",
    markerEnd: { type: MarkerType.ArrowClosed },
  },
];

export default function WorkflowBuilder() {
  const [selectedNode, setSelectedNode] = useState(null);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // 🔥 Connect nodes
  const onConnect = useCallback(
    (params) =>
      setEdges((eds) =>
        addEdge(
          {
            ...params,
            type: "bezier",
            markerEnd: { type: MarkerType.ArrowClosed },
          },
          eds
        )
      ),
    [setEdges]
  );

  // 🔥 Add node
  const addNode = () => {
    const newNode = {
      id: `${nodes.length + 1}`,
      type: "workflow",
      position: {
        x: Math.random() * 400 + 150,
        y: Math.random() * 300 + 100,
      },
      data: { label: `Stage ${nodes.length + 1}` },
    };

    setNodes((nds) => [...nds, newNode]);
  };

  return (
    <Box sx={{ display: "flex", height: "100vh" }}>
      
      <Box sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
        
        {/* Toolbar */}
        <Box sx={{ p: 1, borderBottom: "1px solid", borderColor: "divider" }}>
          <Button variant="contained" onClick={addNode}>
            Add Stage
          </Button>
        </Box>

        {/* ReactFlow */}
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
            }}
            onPaneClick={() => setSelectedNode(null)}
          >
            <MiniMap />
            <Controls />
            <Background gap={20} size={1} />
          </ReactFlow>
        </Box>
      </Box>

      {/* 🔥 RIGHT SIDE (Stable Sidebar) */}
      <WorkflowSidebar node={selectedNode} />
    </Box>
  );
}