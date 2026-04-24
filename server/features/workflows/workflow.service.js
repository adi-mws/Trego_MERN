import { WorkflowTemplate } from "./workflowTemplate.model.js";
import { WorkflowStage } from "./workflowStage.model.js";
import { WorkflowTransition } from "./workflowTransition.model.js";
import mongoose from "mongoose";

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id) && String(new mongoose.Types.ObjectId(id)) === String(id);

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
  return WorkflowTemplate.find({ projectId }).sort({ createdAt: -1 });
};

export const getWorkflowDetails = async (workflowId) => {
  const workflow = await WorkflowTemplate.findById(workflowId).lean();
  if (!workflow) throw new Error("Workflow not found");

  const stages = await WorkflowStage.find({ workflowId }).lean();
  const transitions = await WorkflowTransition.find({ workflowId }).lean();

  return { workflow, stages, transitions };
};

export const saveWorkflowDetails = async (workflowId, payload) => {
  const { name, description, isActive, stages = [], transitions = [] } = payload;

  let workflow = await WorkflowTemplate.findById(workflowId);
  if (!workflow) throw new Error("Workflow not found");
  if (!workflow.isEditable) throw new Error("Cannot save a read-only workflow version");

  let targetWorkflowId = workflowId;
  let forceAllNew = false;

  // Auto-V2 Logic: If workflow is in use (has categories), we clone it to a V2 and save edits there.
  if (workflow.categoryIds && workflow.categoryIds.length > 0) {
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

  // Create new stages and map temp UUID/Old ID → new ObjectId
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
    const fromStageId = stageIdMap.get(String(t.fromStage)) || String(t.fromStage);
    const toStageId   = stageIdMap.get(String(t.toStage))   || String(t.toStage);
    await WorkflowTransition.findByIdAndUpdate(t._id, {
      fromStage: fromStageId,
      toStage: toStageId,
      action: t.action || "",
      label: t.label || "",
      allowedRoles: t.allowedRoles || [],
      requireComment: t.requireComment || false,
      meta: t.meta || {}
    });
  }

  // Create new transitions
  for (const t of newTransitions) {
    const fromStageId = stageIdMap.get(String(t.fromStage)) || String(t.fromStage);
    const toStageId   = stageIdMap.get(String(t.toStage))   || String(t.toStage);
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
  }

  return getWorkflowDetails(targetWorkflowId);
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
    const newEdge = new WorkflowTransition({
      workflowId: newWorkflow._id,
      fromStage: stageIdMap.get(t.fromStage.toString()),
      toStage: stageIdMap.get(t.toStage.toString()),
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

  if (workflow.categoryIds && workflow.categoryIds.length > 0) {
    throw new Error("Cannot delete a workflow that is currently in use.");
  }

  // Delete all stages and transitions associated with this workflow
  await WorkflowStage.deleteMany({ workflowId });
  await WorkflowTransition.deleteMany({ workflowId });

  // Delete the workflow template itself
  await WorkflowTemplate.findByIdAndDelete(workflowId);

  return { success: true };
};
