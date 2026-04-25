import { createSelector } from "@reduxjs/toolkit";
import { MarkerType } from "reactflow";

export const selectStyledEdges = createSelector(
    [(state) => state.workflow.edges],
    (edges) =>
        edges.map((e) => {
            const color = e.data?.meta?.color || "#f97316";
            // 'label' is the descriptive note about the transition
            // 'action' is shown inside the edge editor, not as the canvas label
            const displayLabel = e.data?.action
                ? e.data.action + (e.data?.label ? ` — ${e.data.label}` : "")
                : "Action Required";
            return {
                ...e,
                style: {
                    stroke: color,
                    strokeWidth: 2,
                },
                label: displayLabel,
                labelStyle: { fill: "#fff", fontWeight: 700, fontSize: 11 },
                labelBgStyle: { fill: "#222", fillOpacity: 0.85 },
                labelBgPadding: [6, 4],
                labelBgBorderRadius: 4,
                markerEnd: {
                    type: MarkerType.ArrowClosed,
                    width: 20,
                    height: 20,
                    color: color,
                },
            };
        })
);


export const selectWorkflowEligibility = createSelector(
    [(state) => state.workflow.nodes, (state) => state.workflow.edges],
    (nodes, edges) => {
        const errors = [];
        
        // 1. Exactly one isStart
        const startNodes = nodes.filter(n => n.data?.isStart);
        if (startNodes.length === 0) errors.push("There must be a Start stage.");
        if (startNodes.length > 1) errors.push("There can only be one Start stage.");

        // 2. At least one isEnd
        const endNodes = nodes.filter(n => n.data?.isEnd);
        if (endNodes.length === 0) errors.push("There must be at least one End stage.");

        // 3. No missing actions on edges
        const edgesWithoutAction = edges.filter(e => !e.data?.action || e.data.action.trim() === "");
        if (edgesWithoutAction.length > 0) errors.push("All transitions must have an action defined.");

        // 4. All nodes except 'isEnd' must have outgoing edges
        const nodesWithoutOutgoing = nodes.filter(n => !n.data?.isEnd && !edges.some(e => e.source === n.id));
        if (nodesWithoutOutgoing.length > 0) errors.push("All non-end stages must have at least one outgoing transition.");

        return {
            isEligible: errors.length === 0,
            errors
        };
    }
);
