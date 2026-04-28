import React, { useCallback, useEffect, useRef, useState } from "react";
import ReactFlow, {
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  Background,
  Controls,
  useReactFlow,
  ReactFlowProvider,
} from "reactflow";
import "reactflow/dist/style.css";
import { selectStyledEdges } from "../../../redux/selectors/workflowSelectors";
import dagre from "dagre";
import { Box, Button, Chip, Stack, Typography } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

import WorkflowNode from "./_components/WorkflowNode";
import WorkflowSidebar from "./_components/WorkflowSidebar";
import WorkflowControls from "./_components/WorkflowControls";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { PROJECT_ROUTES } from "../../../lib/routes";
import { fetchWorkflowDetails, setEdges, setIsDirty, setLayoutDir, selectEdge, selectNode, setNodes, clearSelection, resetWorkflow } from "../../../redux/slices/workflowSlice";
import ProjectPermissionGate from "./_components/ProjectPermissionGate";

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
  const { workspaceSlug, projectSlug, workflowId } = useParams();
  const navigate = useNavigate();
  const { redirectWorkflowId, edges: rawEdges, layoutDir, isDirty, isEditable, isLoading, _id: loadedWorkflowId, name, version, usage, selectedNode, selectedEdge } = useSelector((state) => state.workflow);
  const workflowNodes = useSelector((state) => state.workflow.nodes);
  const edges = useSelector(selectStyledEdges)

  const dispatch = useDispatch();
  const hasRedirected = useRef(false);
  const hasLoadedCurrentWorkflow = useRef(false);
  const isInitialLayout = useRef(true);
  const [flowNodes, setFlowNodes] = useState([]);
  const canvasNodes = flowNodes.length > 0 ? flowNodes : workflowNodes;

  // Reset redirect guard when URL workflowId changes
  useEffect(() => {
    hasRedirected.current = false;
    hasLoadedCurrentWorkflow.current = false;
    isInitialLayout.current = true;
  }, [workflowId]);

  useEffect(() => {
    if (workflowId) {
      dispatch(fetchWorkflowDetails(workflowId));
    }
    // Clean up stale state when leaving this workflow
    return () => {
      dispatch(resetWorkflow());
    };
  }, [dispatch, workflowId]);

  useEffect(() => {
    if (
      workflowId &&
      loadedWorkflowId &&
      String(loadedWorkflowId) === String(workflowId) &&
      !isLoading
    ) {
      hasLoadedCurrentWorkflow.current = true;
    }
  }, [workflowId, loadedWorkflowId, isLoading]);

  useEffect(() => {
    // If the backend auto-cloned the workflow to a V2 during a save, redirect ONCE.
    if (
      hasLoadedCurrentWorkflow.current &&
      redirectWorkflowId &&
      workflowId &&
      redirectWorkflowId !== workflowId &&
      !hasRedirected.current
    ) {
      hasRedirected.current = true;
      navigate(PROJECT_ROUTES.projectWorkflowDetail(workspaceSlug, projectSlug, redirectWorkflowId), { replace: true });
    }
  }, [redirectWorkflowId, workflowId, navigate, workspaceSlug, projectSlug]);

  useEffect(() => {
    const handleBeforeUnload = (event) => {
      if (isDirty) {
        event.preventDefault();
        event.returnValue = "";
        return "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [isDirty]);

  const onNodesChange = useCallback(
    (changes) => {
      const updatedNodes = applyNodeChanges(changes, canvasNodes);

      const hasMeaningfulChange = changes.some((change) => {
        if (change.type !== "position") return true;
        const previousNode = canvasNodes.find((node) => node.id === change.id);
        const nextNode = updatedNodes.find((node) => node.id === change.id);
        if (!previousNode || !nextNode) return true;
        return (
          previousNode.position?.x !== nextNode.position?.x ||
          previousNode.position?.y !== nextNode.position?.y
        );
      });

      if (!hasMeaningfulChange) {
        return;
      }

      setFlowNodes(updatedNodes);

      const structuralChanges = changes.some((change) => ["add", "remove", "reset"].includes(change.type));
      if (structuralChanges) {
        dispatch(setNodes(updatedNodes));
        if (!isInitialLayout.current) {
          dispatch(setIsDirty(true));
        }
      }
    },
    [canvasNodes, dispatch]
  );

  const onEdgesChange = useCallback(
    (changes) => {
      const structuralChanges = changes.filter((change) =>
        ["add", "remove", "reset"].includes(change.type)
      );

      if (structuralChanges.length === 0) {
        return;
      }

      // Operate on RAW edges (not styled) so we don't persist visual decorations to state
      const updatedEdges = applyEdgeChanges(changes, rawEdges);
      dispatch(setEdges(updatedEdges));

      const dirtyTypes = ["add", "remove", "reset"];
      const hasDirtyChange = changes.some((change) => dirtyTypes.includes(change.type));
      if (hasDirtyChange) {
        dispatch(setIsDirty(true));
      }
    },
    [rawEdges, dispatch]
  );

  const { fitView, getNodes } = useReactFlow();


  const layoutGraph = useCallback(
    (nds = canvasNodes, eds = edges) => {
      const layoutedNodes = getLayoutedElements(nds, eds, "TB");
      setFlowNodes(layoutedNodes);
      dispatch(setNodes(layoutedNodes));

      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => {
          fitView({ nodes: layoutedNodes, padding: 0.2, duration: 500 });
        });
      });
    },
    [canvasNodes, edges, dispatch, fitView]
  );

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (workflowNodes.length === 0) {
        setFlowNodes([]);
        return;
      }

      const nextNodes = workflowNodes.map((node) => ({ ...node }));

      if (isInitialLayout.current) {
        const layoutedNodes = getLayoutedElements(nextNodes, edges, "TB");
        setFlowNodes(layoutedNodes);
        dispatch(setNodes(layoutedNodes));
        isInitialLayout.current = false;
        window.requestAnimationFrame(() => {
          window.requestAnimationFrame(() => {
            fitView({ nodes: layoutedNodes, padding: 0.2, duration: 500 });
          });
        });
        return;
      }

      setFlowNodes(nextNodes);
    }, 0);

    return () => window.clearTimeout(timer);
  }, [workflowNodes, edges, dispatch, fitView]);

  const onConnect = useCallback(
    (params) => {
      // Store ONLY data fields — visual styles come from the selector, not state
      const newEdge = {
        id: `${params.source}-${params.target}-${Date.now()}`,
        source: params.source,
        target: params.target,
        sourceHandle: params.sourceHandle,
        targetHandle: params.targetHandle,
        type: "smoothstep",
        curvature: 0.2,
        data: {
          action: "",
          label: "",
          requireComment: false,
          allowedRoles: [],
          meta: { color: "#21ce21" },
        },
      };

      const newEdges = addEdge(newEdge, rawEdges);
      dispatch(setEdges(newEdges));
      dispatch(setIsDirty(true));
      layoutGraph(canvasNodes, newEdges);
    },
    [rawEdges, canvasNodes, dispatch, layoutGraph]
  );



  const handleCenterView = () => {
    const visibleNodes = getNodes();

    if (!canvasNodes.length || !visibleNodes.length) return;

    fitView({
      nodes: canvasNodes,
      padding: 0.3,
      duration: 600,
    });
  };



  const handleAutoLayout = () => {
    if (!canvasNodes.length) return;

    const layoutedNodes = getLayoutedElements(
      canvasNodes.map((n) => ({ ...n })),
      edges,
      layoutDir
    );

    setFlowNodes(layoutedNodes);
    dispatch(setNodes(layoutedNodes));

    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        fitView({
          nodes: layoutedNodes,
          padding: 0.2,
          duration: 500,
        });
      });
    });
  };

  const handleHorizontalView = () => {
    if (!canvasNodes.length) return;
    dispatch(setLayoutDir("LR"));
    const layoutedNodes = getLayoutedElements(canvasNodes, edges, "LR");

    setFlowNodes(layoutedNodes);
    dispatch(setNodes(layoutedNodes));

    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        fitView({
          nodes: layoutedNodes,
          padding: 0.2,
          duration: 500,
        });
      });
    });
  };

  const handleVerticalView = () => {
    if (!canvasNodes.length) return;
    dispatch(setLayoutDir("TB"));

    const layoutedNodes = getLayoutedElements(canvasNodes, edges, "TB");

    setFlowNodes(layoutedNodes);
    dispatch(setNodes(layoutedNodes));

    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        fitView({
          nodes: layoutedNodes,
          padding: 0.2,
          duration: 500,
        });
      });
    });

  };

  const handleRecalculateFlow = () => {
    if (!canvasNodes.length) return;

    const direction = layoutDir || "TB";

    const layoutedNodes = getLayoutedElements(
      canvasNodes.map((n) => ({ ...n, position: { x: 0, y: 0 } })),
      edges,
      direction
    );

    setFlowNodes(layoutedNodes);
    dispatch(setNodes(layoutedNodes));

    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        fitView({ nodes: layoutedNodes, padding: 0.25, duration: 600 });
      });
    });
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
    <ProjectPermissionGate
      permission="canManageProject"
      title="You do not have permission to manage workflows"
      message="Ask a project admin to edit the workflow designer."
    >
    <Box sx={{ display: "flex", height: "100%", overflow: 'hidden', minHeight: 0, flexDirection: 'column', minWidth: 0 }}>
      <Box
        sx={{
          px: { xs: 1.5, md: 1.75 },
          py: 0.75,
          borderBottom: "1px solid",
          borderColor: "divider",
          bgcolor: "background.paper",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 2,
          flexShrink: 0,
          flexWrap: "wrap",
        }}
      >
        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" sx={{ minWidth: 0 }}>
          <Button
            variant="text"
            size="small"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate(PROJECT_ROUTES.projectWorkflows(workspaceSlug, projectSlug))}
          >
            Back to workflows
          </Button>
          <Typography variant="body2" fontWeight={700} noWrap>
            {name || "Untitled Workflow"}
          </Typography>
        </Stack>
        <Stack direction="row" spacing={0.75} useFlexGap flexWrap="wrap">
          <Chip label={`V${version || 1}`} size="small" color="primary" variant="outlined" />
          {usage?.totalCount > 0 && (
            <Chip
              label={`Used by ${usage.taskCount || 0} tasks, ${usage.categoryCount || 0} categories`}
              size="small"
              color="warning"
              variant="outlined"
            />
          )}
        </Stack>
      </Box>
      <Box sx={{ flex: 1, display: "flex", minHeight: 0, minWidth: 0, flexDirection: { xs: "column", lg: "row" } }}>
        <Box sx={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
          <Box sx={{ flex: 1, minHeight: 0 }}>
          <ReactFlow
            nodes={canvasNodes}
            edges={edges}
            nodeTypes={nodeTypes}
            onNodesChange={isEditable ? onNodesChange : undefined}
            onEdgesChange={isEditable ? onEdgesChange : undefined}
            onConnect={isEditable ? onConnect : undefined}
            nodesDraggable={isEditable}
            nodesConnectable={isEditable}
            elementsSelectable={true}
            onNodeClick={(e, node) => {
              e.stopPropagation();
              if (selectedNode?.id !== node.id) {
                dispatch(selectNode(node));
              }
            }}
            onEdgeClick={(e, edge) => {
              e.stopPropagation();
              if (selectedEdge?.id !== edge.id) {
                dispatch(selectEdge(edge));
              }
            }}
            onPaneClick={(event) => {
              const target = event.target;
              const insideNode = target.closest?.(".react-flow__node") || target.closest?.(".react-flow__handle");
              if (insideNode) return;
              dispatch(clearSelection());
            }}
          >
            <Controls />
            <Background gap={20} size={1} />
          </ReactFlow>
          </Box>
        </Box>

        {isEditable && <WorkflowControls workflowActions={actions} />}
        <WorkflowSidebar />
      </Box>
    </Box>
    </ProjectPermissionGate>
  );
}

export default function WorkflowBuilder() {
  return (
    <ReactFlowProvider>
      <WorkflowBuilderInner />
    </ReactFlowProvider>
  );
}
