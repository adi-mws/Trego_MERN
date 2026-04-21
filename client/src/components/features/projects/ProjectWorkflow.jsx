import React, { useState, useCallback, useEffect } from "react";
import ReactFlow, {
  addEdge,
  Background,
  Controls,
  useNodesState,
  useEdgesState,
  MarkerType,
  useReactFlow,
  ReactFlowProvider,
} from "reactflow";
import "reactflow/dist/style.css";

import dagre from "dagre";

import { Box, Button } from "@mui/material";

import WorkflowNode from "./_components/WorkflowNode";
import WorkflowSidebar from "./_components/WorkflowSidebar";

const nodeTypes = { workflow: WorkflowNode };

const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

const nodeWidth = 172;
const nodeHeight = 36;

const getLayoutedElements = (nodes, edges, direction = "TB") => {
  dagreGraph.setGraph({
    rankdir: direction,
    nodesep: 200,
    ranksep: 140,
  });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  return nodes.map((node) => {
    const pos = dagreGraph.node(node.id);

    return {
      ...node,
      position: {
        x: pos.x - nodeWidth / 2,
        y: pos.y - nodeHeight / 2,
      },
      targetPosition: direction === "TB" ? "top" : "left",
      sourcePosition: direction === "TB" ? "bottom" : "right",
    };
  });
};

const initialNodes = [
  { id: "start", type: "workflow", position: { x: 0, y: 0 }, data: { label: "Start" } },
  { id: "dev", type: "workflow", position: { x: 0, y: 0 }, data: { label: "Development" } },
  { id: "test", type: "workflow", position: { x: 0, y: 0 }, data: { label: "Testing" } },
  { id: "qa", type: "workflow", position: { x: 0, y: 0 }, data: { label: "QA Review" } },
  { id: "bug", type: "workflow", position: { x: 0, y: 0 }, data: { label: "Bug Fix" } },
  { id: "staging", type: "workflow", position: { x: 0, y: 0 }, data: { label: "Staging" } },
  { id: "prod", type: "workflow", position: { x: 0, y: 0 }, data: { label: "Production" } },
  { id: "done", type: "workflow", position: { x: 0, y: 0 }, data: { label: "Done" } },
];

const initialEdges = [
  {
    id: "start-dev",
    source: "start",
    target: "dev",
    type: "smoothstep",
    curvature: 0.2,
    style: { stroke: "#21ce21", strokeWidth: 2 },
  },
  {
    id: "dev-test",
    source: "dev",
    target: "test",
    type: "smoothstep",
    curvature: 0.2,
    style: { stroke: "#21ce21", strokeWidth: 2 },
  },
  {
    id: "test-qa",
    source: "test",
    target: "qa",
    type: "smoothstep",
    curvature: 0.2,
    style: { stroke: "#218fce", strokeWidth: 2 },
  },
  {
    id: "qa-staging",
    source: "qa",
    target: "staging",
    type: "smoothstep",
    curvature: 0.2,
    style: { stroke: "#9ace21", strokeWidth: 2 },
  },
  {
    id: "staging-prod",
    source: "staging",
    target: "prod",
    type: "smoothstep",
    curvature: 0.2,
    style: { stroke: "#21ce21", strokeWidth: 2 },
  },
  {
    id: "prod-done",
    source: "prod",
    target: "done",
    type: "smoothstep",
    curvature: 0.2,
    style: { stroke: "#21ce21", strokeWidth: 2 },
  },

  {
    id: "test-dev-back",
    source: "test",
    target: "dev",
    type: "smoothstep",
    curvature: -0.5,
    label: "Fail",
    style: { stroke: "#ff4d4f", strokeWidth: 2 },
  },
  {
    id: "qa-bug",
    source: "qa",
    target: "bug",
    type: "smoothstep",
    curvature: 0.4,
    label: "Issues Found",
    style: { stroke: "#ff4d4f", strokeWidth: 2 },
  },
  {
    id: "bug-dev",
    source: "bug",
    target: "dev",
    type: "smoothstep",
    curvature: -0.4,
    label: "Fix & Retry",
    style: { stroke: "#ff4d4f", strokeWidth: 2 },
  },
  {
    id: "staging-qa-back",
    source: "staging",
    target: "qa",
    type: "smoothstep",
    curvature: -0.5,
    label: "Recheck",
    style: { stroke: "#c420d3", strokeWidth: 2 },
  },
];


function WorkflowBuilderInner() {
  const [selectedNode, setSelectedNode] = useState(null);
  const [selectedEdge, setSelectedEdge] = useState(null);
  const [layoutDir, setLayoutDir] = useState("TB"); // default vertical
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const { fitView, getNodes } = useReactFlow();

  const layoutGraph = useCallback(
    (nds = nodes, eds = edges) => {
      const layoutedNodes = getLayoutedElements(nodes, edges, "TB");
      setNodes([...layoutedNodes]);

      setTimeout(() => {
        fitView({ padding: 0.2 });
      }, 50);
    },
    [nodes, edges, fitView]
  );

  useEffect(() => {
    if (nodes.length > 0) {
      layoutGraph();
    }
  }, [nodes.length, edges.length]);

  const onConnect = useCallback(
    (params) =>
      setEdges((eds) => {
        const newEdges = addEdge(
          {
            ...params,
            id: `${params.source}-${params.target}-${Date.now()}`,
            type: "smoothstep",
            label: "New Transition",
            data: { requireComment: false },
            markerEnd: {
              type: MarkerType.ArrowClosed,
              width: 20,
              height: 20,
              color: "#21ce21",
            },
            curvature: 0.5,
            style: { stroke: "#21ce21", strokeWidth: 2 },
            labelStyle: { fill: "#fff", fontWeight: 700 },
            labelBgStyle: { fill: "#222", fillOpacity: 0.7 },
          },
          eds
        );

        layoutGraph(nodes, newEdges);

        return newEdges;
      }),
    [nodes, layoutGraph]
  );



  const handleCenterView = () => {
    const nodes = getNodes();

    if (!nodes.length) return;

    fitView({
      nodes,
      padding: 0.3,
      duration: 600,
    });
  };
  const addNode = () => {
    const newNode = {
      id: `stage-${Date.now()}`,
      type: "workflow",
      position: { x: 0, y: 0 },
      data: { label: `Stage ${nodes.length + 1}` },
    };

    setNodes((nds) => [...nds, newNode]);
  };

  const updateNode = (updated) => {
    setNodes((nds) => nds.map((n) => (n.id === updated.id ? updated : n)));
  };

  const updateEdge = (updated) => {
    setEdges((eds) => eds.map((e) => (e.id === updated.id ? updated : e)));
  };

  const deleteNode = (id) => {
    const filteredNodes = nodes.filter((n) => n.id !== id);
    const filteredEdges = edges.filter(
      (e) => e.source !== id && e.target !== id
    );

    setNodes(filteredNodes);
    setEdges(filteredEdges);

    layoutGraph(filteredNodes, filteredEdges);

    setSelectedNode(null);
  };

  const deleteEdge = (id) => {
    const filteredEdges = edges.filter((e) => e.id !== id);
    setEdges(filteredEdges);

    layoutGraph(nodes, filteredEdges);

    setSelectedEdge(null);
  };
  const handleAutoLayout = () => {
    if (!nodes.length) return;

    const layoutedNodes = getLayoutedElements(
      nodes.map((n) => ({ ...n })),
      edges,
      layoutDir
    );

    setNodes([...layoutedNodes]);

    fitView({
      padding: 0.2,
      duration: 500,
    });
  };

  const handleHorizontalView = () => {
    if (!nodes.length) return;
    setLayoutDir("LR");
    const layoutedNodes = getLayoutedElements(nodes, edges, "LR");

    setNodes([...layoutedNodes]);

    fitView({
      padding: 0.2,
      duration: 500,
    });
  };

  const handleVerticalView = () => {
    if (!nodes.length) return;
    setLayoutDir("TB");

    const layoutedNodes = getLayoutedElements(nodes, edges, "TB");

    setNodes([...layoutedNodes]);

    fitView({
      padding: 0.2,
      duration: 500,
    });

  };

  const handleRecalculateFlow = () => {
    if (!nodes.length) return;

    const direction = layoutDir || "TB";

    const layoutedNodes = getLayoutedElements(
      nodes.map((n) => ({ ...n, position: { x: 0, y: 0 } })),
      edges,
      direction
    );

    setNodes(layoutedNodes);

    setTimeout(() => {
      fitView({ padding: 0.25, duration: 600 });
    }, 50);
  };

  const handleFitToScreen = () => {
    fitView({
      padding: 0.2,
      duration: 500, // smooth zoom
    });
  };

  const actions = {
    centerView: handleCenterView,
    horizontalView: handleHorizontalView,
    verticalView: handleVerticalView,
    recalculateFlow: handleRecalculateFlow,
    fitToScreen: handleFitToScreen,
    autoLayout: handleAutoLayout
  }

  return (
    <Box sx={{ display: "flex", height: "100%", overflow: 'hidden', minHeight: 0 }}>
      <Box sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <Box sx={{ flex: 1, minHeight: 0 }}>
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
        nodes={nodes}
        edges={edges}
        workflowActions={actions}
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