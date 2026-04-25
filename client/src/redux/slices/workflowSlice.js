// store/workflowSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { v4 as uuidv4 } from 'uuid';
import { callApi } from "../../api/api";

export const fetchWorkflowDetails = createAsyncThunk(
    "workflow/fetchDetails",
    async (workflowId, { rejectWithValue }) => {
        const res = await callApi({
            method: "get",
            url: `/workflows/${workflowId}`
        });
        if (!res.success) return rejectWithValue(res.message);

        const { workflow, stages, transitions } = res.data.data;

        const nodes = stages.map(s => ({
            id: s._id,
            _id: s._id,
            type: "workflow",
            position: s.position || { x: 0, y: 0 },
            data: {
                label: s.name,
                isStart: s.isStart,
                isEnd: s.isEnd,
                allowedRoles: s.allowedRoles || [],
                actions: s.actions || [],
            }
        }));

        const edges = transitions.map(t => ({
            id: t._id,
            _id: t._id,
            source: t.fromStage.toString(),
            target: t.toStage.toString(),
            type: "smoothstep",
            curvature: 0.2,
            data: {
                action: t.action,
                label: t.label || "",
                allowedRoles: t.allowedRoles || [],
                requireComment: t.requireComment || false,
                meta: t.meta || {},
            }
        }));

        return { workflow, nodes, edges };
    }
);

export const saveWorkflowTemplate = createAsyncThunk(
    "workflow/saveTemplate",
    async (workflowId, { getState, rejectWithValue }) => {
        const { workflow } = getState();
        // A valid MongoDB ObjectId is a 24-char hex string
        const isMongoId = (id) => /^[a-f\d]{24}$/i.test(id);

        const payload = {
            name: workflow.name,
            description: workflow.description || "",
            isActive: workflow.isActive,
            stages: workflow.nodes.map(n => ({
                id: n.id,
                _id: n.id,
                isNew: !isMongoId(n.id),
                name: n.data.label,
                isStart: n.data.isStart || false,
                isEnd: n.data.isEnd || false,
                position: n.position,
                allowedRoles: n.data.allowedRoles || [],
                actions: n.data.actions || [],
            })),
            transitions: workflow.edges.map(e => ({
                id: e.id,
                _id: e.id,
                isNew: !isMongoId(e.id),
                fromStage: e.source,
                toStage: e.target,
                action: e.data?.action || "",
                label: e.data?.label || "",
                allowedRoles: e.data?.allowedRoles || [],
                requireComment: e.data?.requireComment || false,
                meta: e.data?.meta || {},
            }))
        };

        const res = await callApi({
            method: "put",
            url: `/workflows/${workflowId}`,
            data: payload
        });

        if (!res.success) {
            return rejectWithValue(res.error?.message || res.error || "Save failed");
        }
        return res.data.data;
    }
);

export const cloneWorkflowVersion = createAsyncThunk(
    "workflow/cloneVersion",
    async (workflowId, { rejectWithValue }) => {
        const res = await callApi({
            method: "post",
            url: `/workflows/${workflowId}/clone`
        });
        if (!res.success) return rejectWithValue(res.message);
        return res.data.data;
    }
);

function reconcileSavedWorkflow(state, payload) {
    const { workflow, stages = [], transitions = [], idMap = {} } = payload || {};
    if (!workflow) return;

    const stageById = new Map(stages.map((stage) => [String(stage._id), stage]));
    const transitionById = new Map(transitions.map((transition) => [String(transition._id), transition]));
    const stageIdMap = idMap.stages || {};
    const transitionIdMap = idMap.transitions || {};

    const remapId = (id, map) => map[String(id)] || String(id);

    const previousSelectedNodeId = state.selectedNode?.id || null;
    const previousSelectedEdgeId = state.selectedEdge?.id || null;

    state.nodes = state.nodes.map((node) => {
        const nextId = remapId(node.id, stageIdMap);
        const stage = stageById.get(nextId) || stageById.get(String(node.id));

        if (!stage) {
            return nextId === node.id ? node : { ...node, id: nextId, _id: nextId };
        }

        return {
            ...node,
            id: nextId,
            _id: nextId,
            type: "workflow",
            position: stage.position || node.position || { x: 0, y: 0 },
            data: {
                ...node.data,
                label: stage.name,
                isStart: stage.isStart,
                isEnd: stage.isEnd,
                allowedRoles: stage.allowedRoles || [],
                actions: stage.actions || [],
            },
        };
    });

    state.edges = state.edges.map((edge) => {
        const nextId = remapId(edge.id, transitionIdMap);
        const transition = transitionById.get(nextId) || transitionById.get(String(edge.id));

        if (!transition) {
            return nextId === edge.id ? edge : { ...edge, id: nextId, _id: nextId };
        }

        return {
            ...edge,
            id: nextId,
            _id: nextId,
            source: transition.fromStage.toString(),
            target: transition.toStage.toString(),
            type: "smoothstep",
            curvature: 0.2,
            data: {
                ...edge.data,
                action: transition.action,
                label: transition.label || "",
                allowedRoles: transition.allowedRoles || [],
                requireComment: transition.requireComment || false,
                meta: transition.meta || {},
            },
        };
    });

    const remappedSelectedNodeId = previousSelectedNodeId ? remapId(previousSelectedNodeId, stageIdMap) : null;
    const remappedSelectedEdgeId = previousSelectedEdgeId ? remapId(previousSelectedEdgeId, transitionIdMap) : null;

    state.selectedNode =
        state.nodes.find((node) => node.id === remappedSelectedNodeId) ||
        state.nodes.find((node) => node.id === previousSelectedNodeId) ||
        null;

    state.selectedEdge =
        state.edges.find((edge) => edge.id === remappedSelectedEdgeId) ||
        state.edges.find((edge) => edge.id === previousSelectedEdgeId) ||
        null;
}

const initialState = {
    nodes: [],
    edges: [],

    selectedNode: null,
    selectedEdge: null,
    layoutDir: "TB",
    isLoading: false,
    isSaving: false,
    isDirty: false,
    error: null,
    
    name: "Untitled Workflow",
    description: "",
    isActive: false, 
    isWorking: false, 
    version: 1,
    isEditable: true,
    _id: null,
    redirectWorkflowId: null,
    usage: {
        taskCount: 0,
        categoryCount: 0,
        totalCount: 0,
        isUsed: false,
    },
};


const workflowSlice = createSlice({
    name: "workflow",
    initialState,

    reducers: {
        setIsLoading(state, action) {
            state.isLoading = action.payload;
        },
        setIsSaving(state, action) {
            state.isSaving = action.payload;
        },
        setIsDirty(state, action) {
            state.isDirty = action.payload;
        },
        setWorkflow(state, action) {
            state.nodes = action.payload.nodes;
            state.edges = action.payload.edges;
            if (action.payload.name) state.name = action.payload.name;
            if (action.payload.description) state.description = action.payload.description;
            if (action.payload.isActive !== undefined) state.isActive = action.payload.isActive;
            if (action.payload.isWorking !== undefined) state.isWorking = action.payload.isWorking;
            if (action.payload.version !== undefined) state.version = action.payload.version;
            if (action.payload.isEditable !== undefined) state.isEditable = action.payload.isEditable;
            state.usage = action.payload.usage || initialState.usage;
        },

        setName(state, action) {
            state.name = action.payload;
            state.isDirty = true;
        },

        setDescription(state, action) {
            state.description = action.payload;
            state.isDirty = true;
        },

        setIsActive(state, action) {
            state.isActive = action.payload;
            state.isDirty = true;
        },

        setVersion(state, action) {
            state.version = action.payload;
        },

        setIsEditable(state, action) {
            state.isEditable = action.payload;
        },

        setNodes(state, action) {
            state.nodes = action.payload;
            if (state.selectedNode) {
                state.selectedNode = state.nodes.find((n) => n.id === state.selectedNode.id) || null;
            }
        },

        setEdges(state, action) {
            state.edges = action.payload;
            if (state.selectedEdge) {
                state.selectedEdge = state.edges.find((e) => e.id === state.selectedEdge.id) || null;
            }
        },

        setLayoutDir(state, action) {
            state.layoutDir = action.payload;
        },

        selectNode(state, action) {
            // console.log('selectNode called with', action.payload);
            state.selectedNode = action.payload;
            state.selectedEdge = null;
        },

        selectEdge(state, action) {
            // console.log('selectEdge called with', action.payload);
            state.selectedEdge = action.payload;
            state.selectedNode = null;
        },

        clearSelection(state) {
            state.selectedNode = null;
            state.selectedEdge = null;
        },
        addNode(state) {
            const newNode = {
                id: uuidv4(),
                type: "workflow",
                position: { x: 0, y: 0 },
                data: { label: `Stage ${state.nodes.length + 1}` },
            };

            state.nodes.push(newNode);
            state.selectedNode = newNode;
            state.selectedEdge = null;
            state.isDirty = true;
        },

        resetWorkflow(state) {
            Object.assign(state, {
                nodes: [],
                edges: [],
                selectedNode: null,
                selectedEdge: null,
                layoutDir: "TB",
                isLoading: false,
                isSaving: false,
                isDirty: false,
                error: null,
                name: "Untitled Workflow",
                description: "",
                isActive: false,
                isWorking: false,
                version: 1,
                isEditable: true,
                _id: null,
                redirectWorkflowId: null,
                usage: initialState.usage,
            });
        },

        updateNode(state, action) {
            const updated = action.payload;

            state.nodes = state.nodes.map((n) =>
                n.id === updated.id ? updated : n
            );
            if (state.selectedNode?.id === updated.id) {
                state.selectedNode = updated;
            }
            state.isDirty = true;
        },

        deleteNode(state, action) {
            const id = action.payload;

            state.nodes = state.nodes.filter((n) => n.id !== id);
            state.edges = state.edges.filter(
                (e) => e.source !== id && e.target !== id
            );
            if (state.selectedNode?.id === id) {
                state.selectedNode = null;
            }
            state.isDirty = true;
        },
        createEdge(state, action) {
            const { source, target } = action.payload;

            const exists = state.edges.some(
                (e) => e.source === source && e.target === target
            );

            if (exists) return;

            state.edges.push({
                id: uuidv4(),
                source,
                target,
                type: "smoothstep",
                curvature: 0.5,
                data: {
                    action: "",
                    requireComment: false,
                    meta: {},
                },

            });
            state.isDirty = true;
        },

        updateEdge(state, action) {
            const updated = action.payload;

            state.edges = state.edges.map((e) =>
                e.id === updated.id ? updated : e
            );
            if (state.selectedEdge?.id === updated.id) {
                state.selectedEdge = updated;
            }
            state.isDirty = true;
        },

        updateEdgeAction(state, action) {
            const { source, target, actionName } = action.payload;

            state.edges = state.edges.map((e) => {
                if (e.source === source && e.target === target) {
                    return {
                        ...e,
                        data: {
                            ...e.data,
                            action: actionName,
                        },
                    };
                }
                return e;
            });
            state.isDirty = true;
        },

        deleteEdge(state, action) {
            const id = action.payload;
            state.edges = state.edges.filter((e) => e.id !== id);
            if (state.selectedEdge?.id === id) {
                state.selectedEdge = null;
            }
            state.isDirty = true;
        },

    },
    extraReducers: (builder) => {
        builder
            // Fetch Workflow
            .addCase(fetchWorkflowDetails.pending, (state) => {
                // Clear stale data immediately so the old workflow never flickers
                state.nodes = [];
                state.edges = [];
                state.selectedNode = null;
                state.selectedEdge = null;
                state._id = null;
                state.name = "Untitled Workflow";
                state.description = "";
                state.isActive = false;
                state.isWorking = false;
                state.version = 1;
                state.isEditable = true;
                state.isDirty = false;
                state.error = null;
                state.isLoading = true;
                state.usage = initialState.usage;
                state.redirectWorkflowId = null;
            })
            .addCase(fetchWorkflowDetails.fulfilled, (state, action) => {
                state.isLoading = false;
                state.nodes = action.payload.nodes;
                state.edges = action.payload.edges;
                const { workflow } = action.payload;
                state._id = workflow._id;
                state.name = workflow.name;
                state.description = workflow.description;
                state.isActive = workflow.isActive;
                state.version = workflow.version;
                state.isEditable = workflow.isEditable;
                state.usage = workflow.usage || initialState.usage;
                state.isWorking = Boolean(workflow.usage?.isUsed || workflow.categoryIds?.length > 0);
                state.isDirty = false;
            })
            .addCase(fetchWorkflowDetails.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            // Save Workflow
            .addCase(saveWorkflowTemplate.pending, (state) => {
                state.isSaving = true;
                state.error = null;
            })
            .addCase(saveWorkflowTemplate.fulfilled, (state, action) => {
                state.isSaving = false;
                state.isDirty = false;
                const { workflow } = action.payload;
                // Sync all metadata back from DB response
                if (workflow) {
                    state._id = workflow._id;
                    state.name = workflow.name;
                    state.description = workflow.description;
                    state.isActive = workflow.isActive;
                    state.version = workflow.version;
                    state.isEditable = workflow.isEditable;
                    state.usage = workflow.usage || initialState.usage;
                    state.isWorking = Boolean(workflow.usage?.isUsed || workflow.categoryIds?.length > 0);
                }
                state.redirectWorkflowId =
                    workflow && action.meta?.arg && String(workflow._id) !== String(action.meta.arg)
                        ? workflow._id
                        : null;
                if (action.payload?.idMap) {
                    reconcileSavedWorkflow(state, action.payload);
                }
            })
            .addCase(saveWorkflowTemplate.rejected, (state, action) => {
                state.isSaving = false;
                state.error = action.payload;
                state.redirectWorkflowId = null;
            })
            // Clone Workflow
            .addCase(cloneWorkflowVersion.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(cloneWorkflowVersion.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            });
    }
});


export const {
    setWorkflow,
    setNodes,
    setEdges,
    setLayoutDir,
    selectNode,
    selectEdge,
    clearSelection,
    addNode,
    updateNode,
    deleteNode,
    createEdge,
    updateEdge,
    updateEdgeAction,
    deleteEdge,
    setIsDirty,
    setIsSaving,
    setIsLoading,
    setName,
    setDescription,
    setIsActive,
    setVersion,
    setIsEditable,
    resetWorkflow,
} = workflowSlice.actions;

export default workflowSlice.reducer;
