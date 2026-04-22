// store/workflowSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    nodes: [
        {
            id: "start",
            _id: "start",
            type: "workflow",
            position: { x: 0, y: 0 },
            data: {
                label: "Start",
                isStart: true,
                allowedRoles: ["admin"],  
                stageActions: [
                    {
                        id: "begin",
                        name: "Begin",
                    },
                ],
            },
        },
        {
            id: "dev",
            _id: "dev",
            type: "workflow",
            position: { x: 0, y: 0 },
            data: {
                label: "Development",
                allowedRoles: ["developer"], 
            },
        },
        {
            id: "test",
            _id: "test",
            type: "workflow",
            position: { x: 0, y: 0 },
            data: {
                label: "Testing",
                allowedRoles: ["tester"],
            },
        },
        {
            id: "qa",
            _id: "qa",
            type: "workflow",
            position: { x: 0, y: 0 },
            data: {
                label: "QA Review",
                allowedRoles: ["qa"],
            },
        },
        {
            id: "prod",
            _id: "prod",
            type: "workflow",
            position: { x: 0, y: 0 },
            data: {
                label: "Production",
                isEnd: true,
                allowedRoles: ["admin"],
            },
        },
    ],

    edges: [
        {
            id: "start-dev",
            _id: "start-dev",
            source: "start",
            target: "dev",
            type: "smoothstep",
            curvature: 0.2,
            data: {
                action: { id: "begin", name: "Begin" },
                allowedRoles: ["admin"], 
                requireComment: false,
                meta: { color: "#21ce21" },
            },
            style: { stroke: "#21ce21", strokeWidth: 2 },
        },
        {
            id: "dev-test",
            _id: "dev-test",
            source: "dev",
            target: "test",
            type: "smoothstep",
            curvature: 0.2,
            data: {
                action: { id: "submit", name: "Submit" },
                allowedRoles: ["developer"],
                requireComment: false,
                meta: { color: "#1890ff" },
            },
            style: { stroke: "#1890ff", strokeWidth: 2 },
        },
        {
            id: "test-qa",
            _id: "test-qa",
            source: "test",
            target: "qa",
            type: "smoothstep",
            curvature: 0.2,
            data: {
                action: { id: "approve", name: "Approve" },
                allowedRoles: ["tester"],
                requireComment: true,
                meta: { color: "#faad14" },
            },
            style: { stroke: "#faad14", strokeWidth: 2 },
        },
        {
            id: "qa-prod",
            _id: "qa-prod",
            source: "qa",
            target: "prod",
            type: "smoothstep",
            curvature: 0.2,
            data: {
                action: { id: "release", name: "Release" },
                allowedRoles: ["qa", "admin"],
                requireComment: false,
                meta: { color: "#52c41a" },
            },
            style: { stroke: "#52c41a", strokeWidth: 2 },
        },
        {
            id: "test-dev-reject",
            _id: "test-dev-reject",
            source: "test",
            target: "dev",
            type: "smoothstep",
            curvature: -0.4,
            data: {
                action: { id: "reject", name: "Reject" },
                allowedRoles: ["tester"],
                requireComment: true,
                meta: { color: "#ff4d4f" },
            },
            style: { stroke: "#ff4d4f", strokeWidth: 2 },
        },
    ],

    selectedNode: null,
    selectedEdge: null,
    layoutDir: "TB",
    isLoading: false,
    isSaving: false,
    isDirty: false,
    error: null,
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
        },

        setNodes(state, action) {
            state.nodes = action.payload;
        },

        setEdges(state, action) {
            state.edges = action.payload;
        },

        setLayoutDir(state, action) {
            state.layoutDir = action.payload;
        },

        selectNode(state, action) {
            state.selectedNode = action.payload;
            state.selectedEdge = null;
        },

        selectEdge(state, action) {
            state.selectedEdge = action.payload;
            state.selectedNode = null;
        },

        clearSelection(state) {
            state.selectedNode = null;
            state.selectedEdge = null;
        },
        addNode(state) {
            const newNode = {
                id: `stage-${Date.now()}`,
                type: "workflow",
                position: { x: 0, y: 0 },
                data: { label: `Stage ${state.nodes.length + 1}` },
            };

            state.nodes.push(newNode);
        },

        updateNode(state, action) {
            const updated = action.payload;

            state.nodes = state.nodes.map((n) =>
                n.id === updated.id ? updated : n
            );
        },

        deleteNode(state, action) {
            const id = action.payload;

            state.nodes = state.nodes.filter((n) => n.id !== id);
            state.edges = state.edges.filter(
                (e) => e.source !== id && e.target !== id
            );
        },
        createEdge(state, action) {
            const { source, target } = action.payload;

            const exists = state.edges.some(
                (e) => e.source === source && e.target === target
            );

            if (exists) return;

            state.edges.push({
                id: `${source}-${target}-${Date.now()}`,
                source,
                target,
                type: "smoothstep",
                curvature: 0.5,
                data: {
                    action: "",
                    requireComment: false,
                    meta: {},
                },
                style: { stroke: "#21ce21", strokeWidth: 2 },
            });
        },

        updateEdge(state, action) {
            const updated = action.payload;

            state.edges = state.edges.map((e) =>
                e.id === updated.id ? updated : e
            );
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
        },

        deleteEdge(state, action) {
            const id = action.payload;
            state.edges = state.edges.filter((e) => e.id !== id);
        },

    },
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
    setIsSaving,
    setIsLoading,
} = workflowSlice.actions;

export default workflowSlice.reducer;