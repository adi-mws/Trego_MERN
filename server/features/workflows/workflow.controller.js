import * as workflowService from "./workflow.service.js";

export const getProjectWorkflows = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const workflows = await workflowService.getWorkflowsByProject(projectId);
    res.status(200).json({ success: true, data: workflows });
  } catch (error) {
    next(error);
  }
};

export const getWorkflow = async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = await workflowService.getWorkflowDetails(id);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const createWorkflow = async (req, res, next) => {
  try {
    const { projectId, name, description } = req.body;
    const userId = req.user.userId;

    const workflow = await workflowService.createWorkflow({
      name,
      description,
      projectId,
      userId
    });

    res.status(201).json({ success: true, data: workflow });
  } catch (error) {
    next(error);
  }
};

export const saveWorkflow = async (req, res, next) => {
  try {
    const { id } = req.params;
    console.log("\n=== SAVE WORKFLOW ===");
    console.log("ID:", id);
    console.log("Body stages count:", req.body.stages?.length);
    console.log("Body transitions count:", req.body.transitions?.length);
    console.log("Stage IDs:", req.body.stages?.map(s => s._id));
    console.log("Transition IDs:", req.body.transitions?.map(t => t._id));
    const data = await workflowService.saveWorkflowDetails(id, req.body);
    console.log("=== SAVE SUCCESS ===\n");
    res.status(200).json({ success: true, data });
  } catch (error) {
    console.error("=== SAVE ERROR ===", error.message, error.stack);
    next(error);
  }
};

export const cloneWorkflow = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    const newWorkflow = await workflowService.cloneWorkflowVersion(id, userId);
    res.status(201).json({ success: true, data: newWorkflow });
  } catch (error) {
    next(error);
  }
};

export const deleteWorkflow = async (req, res, next) => {
  try {
    const { id } = req.params;
    await workflowService.deleteWorkflow(id);
    res.status(200).json({ success: true, message: "Workflow deleted successfully" });
  } catch (error) {
    next(error);
  }
};
