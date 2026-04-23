import React, { useCallback, useEffect } from "react";
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
import { Box } from "@mui/material";

import WorkflowNode from "./_components/WorkflowNode";
import WorkflowSidebar from "./_components/WorkflowSidebar";
import WorkflowControls from "./_components/WorkflowControls";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { PROJECT_ROUTES } from "../../../lib/routes";
import { fetchWorkflowDetails, setEdges, setIsDirty, setLayoutDir, selectEdge, selectNode, setNodes, clearSelection } from "../../../redux/slices/workflowSlice";

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
  const { _id: reduxWorkflowId, nodes, edges: rawEdges, selectedNode, selectedEdge, layoutDir, isLoading, isSaving, isDirty, error, isEditable } = useSelector((state) => state.workflow);
  const edges = useSelector(selectStyledEdges)

  const dispatch = useDispatch();

  useEffect(() => {
    if (workflowId) {
      dispatch(fetchWorkflowDetails(workflowId));
    }
  }, [dispatch, workflowId]);

  useEffect(() => {
    // If the backend auto-cloned the workflow to a V2 during a save, redirect seamlessly!
    if (reduxWorkflowId && workflowId && reduxWorkflowId !== workflowId) {
      navigate(PROJECT_ROUTES.projectWorkflowDetail(workspaceSlug, projectSlug, reduxWorkflowId), { replace: true });
    }
  }, [reduxWorkflowId, workflowId, navigate, workspaceSlug, projectSlug]);

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
      const updatedNodes = applyNodeChanges(changes, nodes);
      dispatch(setNodes(updatedNodes));

      const dirtyTypes = ["remove", "add", "reset", "position"];
      const hasDirtyChange = changes.some((change) => dirtyTypes.includes(change.type) && (!change.dragging));
      if (hasDirtyChange) {
        dispatch(setIsDirty(true));
      }
    },
    [nodes, dispatch]
  );

  const onEdgesChange = useCallback(
    (changes) => {
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
    (nds = nodes, eds = edges) => {
      const layoutedNodes = getLayoutedElements(nds, eds, "TB");
      dispatch(setNodes(layoutedNodes));

      setTimeout(() => {
        fitView({ padding: 0.2 });
      }, 50);
    },
    [nodes, edges, dispatch, fitView]
  );

  useEffect(() => {
    if (nodes.length === 0) return;
    const allAtOrigin = nodes.every(n => n.position.x === 0 && n.position.y === 0);
    if (allAtOrigin) {
      layoutGraph();
    } else {
      setTimeout(() => fitView({ padding: 0.2 }), 50);
    }
  }, [nodes.length]);

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
      layoutGraph(nodes, newEdges);
    },
    [rawEdges, nodes, dispatch, layoutGraph]
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

    dispatch(setNodes(layoutedNodes));

    fitView({
      padding: 0.2,
      duration: 500,
    });
  };

  const handleHorizontalView = () => {
    if (!nodes.length) return;
    dispatch(setLayoutDir("LR"));
    const layoutedNodes = getLayoutedElements(nodes, edges, "LR");

    dispatch(setNodes(layoutedNodes));

    fitView({
      padding: 0.2,
      duration: 500,
    });
  };

  const handleVerticalView = () => {
    if (!nodes.length) return;
    dispatch(setLayoutDir("TB"));

    const layoutedNodes = getLayoutedElements(nodes, edges, "TB");

    dispatch(setNodes(layoutedNodes));

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

    dispatch(setNodes(layoutedNodes));

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
            onNodesChange={isEditable ? onNodesChange : undefined}
            onEdgesChange={isEditable ? onEdgesChange : undefined}
            onConnect={isEditable ? onConnect : undefined}
            nodesDraggable={isEditable}
            nodesConnectable={isEditable}
            elementsSelectable={true}
            fitView
            onNodeClick={(e, node) => {
              e.stopPropagation();
              // console.log('onNodeClick fired', node);
              dispatch(selectNode(node));
            }}
            onEdgeClick={(e, edge) => {
              e.stopPropagation();
              // console.log('onEdgeClick fired', edge);
              dispatch(selectEdge(edge));
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
  );
}

export default function WorkflowBuilder() {
  return (
    <ReactFlowProvider>
      <WorkflowBuilderInner />
    </ReactFlowProvider>
  );
}