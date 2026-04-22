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
import WorkflowControls from "./_components/WorkflowControls";
import { useDispatch, useSelector } from "react-redux";
import { setNodes, setEdges, selectEdge, selectNode, setLayoutDir } from "../../../redux/slices/workflowSlice";

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

function WorkflowBuilderInner() {

  const { nodes, edges, selectedNode, selectedEdge, layoutDir, isLoading, isSaving, isDirty, error } = useSelector((state) => state.workflow);


  const dispatch = useDispatch();
  const onNodesChange = useCallback(
    (changes) => {
      const updatedNodes = applyNodeChanges(changes, nodes);
      dispatch(setNodes(updatedNodes));
    },
    [nodes, dispatch]
  );

  const onEdgesChange = useCallback(
    (changes) => {
      const updatedEdges = applyEdgeChanges(changes, edges);
      dispatch(setEdges(updatedEdges));
    },
    [edges, dispatch]
  );

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
      dispatch(setEdges((eds) => {
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
      })),
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
    dispatch(setLayoutDir("LR"));
    const layoutedNodes = getLayoutedElements(nodes, edges, "LR");

    setNodes([...layoutedNodes]);

    fitView({
      padding: 0.2,
      duration: 500,
    });
  };

  const handleVerticalView = () => {
    if (!nodes.length) return;
    dispatch(setLayoutDir("TB"));

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
      duration: 500,
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
              dispatch(selectNode((node)));
              selectEdge(null);
            }}
            onEdgeClick={(e, edge) => {
              selectEdge(edge);
              dispatch(selectNode((null)));
            }}
            onPaneClick={() => {
              dispatch(selectNode((null)));
              selectEdge(null);
            }}
          >
            <Controls />
            <Background gap={20} size={1} />
          </ReactFlow>
        </Box>
      </Box>

      <WorkflowControls workflowActions={actions} />

      <WorkflowSidebar
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