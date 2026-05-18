import { WorkflowTemplate } from "./workflowTemplate.model.js";
import { WorkflowStage } from "./workflowStage.model.js";
import { WorkflowTransition } from "./workflowTransition.model.js";
import { Task } from "../tasks/task.model.js";
import TaskCategory from "../tasks/taskCategory.model.js";
import mongoose from "mongoose";

const normalizeRefId = (value) => {
  if (!value) return null;
  if (typeof value === "object") {
    return String(value._id || value.id || "");
  }
  return String(value);
};

export const getWorkflowUsageSummary = async ({ projectId, workflowId }) => {
  if (!projectId || !workflowId) {
    return { taskCount: 0, categoryCount: 0, totalCount: 0, isUsed: false };
  }

  const [taskCount, categoryCount] = await Promise.all([
    Task.countDocuments({
      projectId: new mongoose.Types.ObjectId(projectId),
      workflowId: new mongoose.Types.ObjectId(workflowId),
    }),
    TaskCategory.countDocuments({
      projectId: new mongoose.Types.ObjectId(projectId),
      defaultWorkflowId: new mongoose.Types.ObjectId(workflowId),
    }),
  ]);

  const totalCount = taskCount + categoryCount;

  return {
    taskCount,
    categoryCount,
    totalCount,
    isUsed: totalCount > 0,
  };
};

export const createWorkflow = async ({ name, description, projectId, userId }) => {
  const workflow = new WorkflowTemplate({
    name: name || "Untitled Workflow",
    description,
    projectId,
    createdBy: userId,
    version: 1,
    isEditable: true,
    isActive: false,
  });
  await workflow.save();

  // Create a default Start Stage
  const startStage = new WorkflowStage({
    workflowId: workflow._id,
    name: "Start",
    isStart: true,
    position: { x: 250, y: 50 }
  });
  await startStage.save();

  return workflow;
};

export const getWorkflowsByProject = async (projectId) => {
  const workflows = await WorkflowTemplate.find({ projectId }).sort({ createdAt: -1 }).lean();

  const withUsage = await Promise.all(
    workflows.map(async (workflow) => {
      const usage = await getWorkflowUsageSummary({ projectId, workflowId: workflow._id });
      return {
        ...workflow,
        usage,
      };
    })
  );

  return withUsage;
};

export const getWorkflowDetails = async (workflowId) => {
  const workflow = await WorkflowTemplate.findById(workflowId).lean();
  if (!workflow) throw new Error("Workflow not found");

  const stages = await WorkflowStage.find({ workflowId }).lean();
  const transitions = (await WorkflowTransition.find({ workflowId }).lean()).map((transition) => ({
    ...transition,
    fromStage: normalizeRefId(transition.fromStage),
    toStage: normalizeRefId(transition.toStage),
  }));
  const usage = await getWorkflowUsageSummary({
    projectId: workflow.projectId,
    workflowId: workflow._id,
  });

  return { workflow: { ...workflow, usage }, stages, transitions };
};

export const saveWorkflowDetails = async (workflowId, payload) => {
  const { name, description, isActive, stages = [], transitions = [] } = payload;

  let workflow = await WorkflowTemplate.findById(workflowId);
  if (!workflow) throw new Error("Workflow not found");
  if (!workflow.isEditable) throw new Error("Cannot save a read-only workflow version");

  let targetWorkflowId = workflowId;
  let forceAllNew = false;
  const usage = await getWorkflowUsageSummary({
    projectId: workflow.projectId,
    workflowId: workflow._id,
  });

  // Auto-V2 Logic: If workflow is already in use by tasks or categories, clone it to the next version and save edits there.
  if (usage.isUsed) {
    workflow.isEditable = false; // Lock V1
    await workflow.save();

    const rootWorkflowId = workflow.originalWorkflowId || workflow._id;
    const maxVersionWorkflow = await WorkflowTemplate.findOne({
      $or: [{ _id: rootWorkflowId }, { originalWorkflowId: rootWorkflowId }]
    }).sort({ version: -1 });

    const newVersion = (maxVersionWorkflow?.version || workflow.version) + 1;

    workflow = new WorkflowTemplate({
      name: name !== undefined ? name : workflow.name,
      description: description !== undefined ? description : workflow.description,
      projectId: workflow.projectId,
      createdBy: workflow.createdBy, 
      version: newVersion,
      originalWorkflowId: rootWorkflowId,
      isEditable: true,
      isActive: isActive !== undefined ? isActive : false,
      categoryIds: []
    });
    await workflow.save();

    targetWorkflowId = workflow._id.toString();
    forceAllNew = true; // All stages/transitions from frontend become NEW instances for V2
  } else {
    // 1. Update Workflow Metadata normally
    if (name !== undefined) workflow.name = name;
    if (description !== undefined) workflow.description = description;
    if (isActive !== undefined) workflow.isActive = isActive;
    await workflow.save();
  }

  // 2. Handle Stages — use isNew from frontend payload explicitly (or forceAllNew if creating V2)
  const existingStages = forceAllNew ? [] : stages.filter(s => !s.isNew);
  const newStages      = forceAllNew ? stages : stages.filter(s => s.isNew);

  const existingStageIds = existingStages.map(s => new mongoose.Types.ObjectId(s._id));

  // Only delete stages that are no longer referenced — guard against empty $nin
  if (existingStageIds.length > 0) {
    await WorkflowStage.deleteMany({
      workflowId: new mongoose.Types.ObjectId(targetWorkflowId),
      _id: { $nin: existingStageIds }
    });
  } else if (!forceAllNew) {
    // All stages are new — delete every existing stage for this workflow (unless we are building a brand new V2)
    await WorkflowStage.deleteMany({ workflowId: new mongoose.Types.ObjectId(targetWorkflowId) });
  }

  // Map: frontend ID (string) → real DB ObjectId string
  const stageIdMap = new Map();

  // Update existing stages
  for (const stage of existingStages) {
    await WorkflowStage.findByIdAndUpdate(stage._id, {
      name: stage.name,
      isStart: stage.isStart || false,
      isEnd: stage.isEnd || false,
      position: stage.position || { x: 0, y: 0 },
      allowedRoles: stage.allowedRoles || []
    });
    stageIdMap.set(String(stage._id), String(stage._id));
  }

  // Create new stages and map temp UUID/Old ID 
  for (const stage of newStages) {
    const newStage = new WorkflowStage({
      workflowId: targetWorkflowId,
      name: stage.name,
      isStart: stage.isStart || false,
      isEnd: stage.isEnd || false,
      position: stage.position || { x: 0, y: 0 },
      allowedRoles: stage.allowedRoles || []
    });
    await newStage.save();
    stageIdMap.set(String(stage._id), newStage._id.toString());
  }

  // 3. Handle Transitions — use isNew from frontend explicitly (or forceAllNew)
  const existingTransitions = forceAllNew ? [] : transitions.filter(t => !t.isNew);
  const newTransitions      = forceAllNew ? transitions : transitions.filter(t => t.isNew);
  const transitionIdMap = new Map();

  const existingTransitionIds = existingTransitions.map(t => new mongoose.Types.ObjectId(t._id));

  // Guard against $nin: [] deleting everything
  if (existingTransitionIds.length > 0) {
    await WorkflowTransition.deleteMany({
      workflowId: new mongoose.Types.ObjectId(targetWorkflowId),
      _id: { $nin: existingTransitionIds }
    });
  } else if (!forceAllNew) {
    await WorkflowTransition.deleteMany({ workflowId: new mongoose.Types.ObjectId(targetWorkflowId) });
  }

  // Update existing transitions
  for (const t of existingTransitions) {
    const fromStageId = stageIdMap.get(normalizeRefId(t.fromStage)) || normalizeRefId(t.fromStage);
    const toStageId   = stageIdMap.get(normalizeRefId(t.toStage))   || normalizeRefId(t.toStage);
    await WorkflowTransition.findByIdAndUpdate(t._id, {
      fromStage: fromStageId,
      toStage: toStageId,
      action: t.action || "",
      label: t.label || "",
      allowedRoles: t.allowedRoles || [],
      requireComment: t.requireComment || false,
      meta: t.meta || {}
    });
    transitionIdMap.set(String(t._id), String(t._id));
  }

  // Create new transitions
  for (const t of newTransitions) {
    const fromStageId = stageIdMap.get(normalizeRefId(t.fromStage)) || normalizeRefId(t.fromStage);
    const toStageId   = stageIdMap.get(normalizeRefId(t.toStage))   || normalizeRefId(t.toStage);
    if (!fromStageId || !toStageId) {
      console.warn("[SAVE] Skipping transition — missing stage reference:", t);
      continue;
    }
    const newEdge = new WorkflowTransition({
      workflowId: targetWorkflowId,
      fromStage: fromStageId,
      toStage: toStageId,
      action: t.action || "",
      label: t.label || "",
      allowedRoles: t.allowedRoles || [],
      requireComment: t.requireComment || false,
      meta: t.meta || {}
    });
    await newEdge.save();
    transitionIdMap.set(String(t._id), newEdge._id.toString());
  }

  const data = await getWorkflowDetails(targetWorkflowId);
  return {
    ...data,
    idMap: {
      stages: Object.fromEntries(stageIdMap.entries()),
      transitions: Object.fromEntries(transitionIdMap.entries()),
    },
  };
};


export const cloneWorkflowVersion = async (workflowId, userId) => {
  const originalWorkflow = await WorkflowTemplate.findById(workflowId).lean();
  if (!originalWorkflow) throw new Error("Workflow not found");

  const rootWorkflowId = originalWorkflow.originalWorkflowId || originalWorkflow._id;

  const maxVersionWorkflow = await WorkflowTemplate.findOne({
    $or: [{ _id: rootWorkflowId }, { originalWorkflowId: rootWorkflowId }]
  }).sort({ version: -1 });

  const newVersion = (maxVersionWorkflow?.version || originalWorkflow.version) + 1;

  const newWorkflow = new WorkflowTemplate({
    name: originalWorkflow.name,
    description: originalWorkflow.description,
    projectId: originalWorkflow.projectId,
    createdBy: userId,
    version: newVersion,
    originalWorkflowId: rootWorkflowId,
    isEditable: true,
    isActive: false,
    categoryIds: []
  });
  await newWorkflow.save();

  const originalStages = await WorkflowStage.find({ workflowId }).lean();
  const stageIdMap = new Map();

  for (const stage of originalStages) {
    const newStage = new WorkflowStage({
      workflowId: newWorkflow._id,
      name: stage.name,
      isStart: stage.isStart,
      isEnd: stage.isEnd,
      position: stage.position,
      allowedRoles: stage.allowedRoles,
      actions: stage.actions
    });
    await newStage.save();
    stageIdMap.set(stage._id.toString(), newStage._id.toString());
  }

  const originalTransitions = await WorkflowTransition.find({ workflowId }).lean();
  for (const t of originalTransitions) {
    const fromStageId = normalizeRefId(t.fromStage);
    const toStageId = normalizeRefId(t.toStage);
    const newEdge = new WorkflowTransition({
      workflowId: newWorkflow._id,
      fromStage: stageIdMap.get(fromStageId) || fromStageId,
      toStage: stageIdMap.get(toStageId) || toStageId,
      action: t.action,
      label: t.label,
      allowedRoles: t.allowedRoles,
      requireComment: t.requireComment,
      meta: t.meta,
      style: t.style
    });
    await newEdge.save();
  }

  return newWorkflow;
};

export const deleteWorkflow = async (workflowId) => {
  const workflow = await WorkflowTemplate.findById(workflowId);
  if (!workflow) throw new Error("Workflow not found");

  const usage = await getWorkflowUsageSummary({
    projectId: workflow.projectId,
    workflowId: workflow._id,
  });

  if (usage.isUsed) {
    throw new Error("Cannot delete a workflow that is currently in use.");
  }

  // Delete all stages and transitions associated with this workflow
  await WorkflowStage.deleteMany({ workflowId });
  await WorkflowTransition.deleteMany({ workflowId });

  // Delete the workflow template itself
  await WorkflowTemplate.findByIdAndDelete(workflowId);

  return { success: true };
};
