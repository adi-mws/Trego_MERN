import mongoose from "mongoose";
import { Project } from "./project.model.js";
import { ProjectMember } from "./projectMember.model.js";
import { WorkspaceMember } from "../workspaces/workspaceMember.model.js";
import { Task } from "../tasks/task.model.js";
import TaskCategory from "../tasks/taskCategory.model.js";
import { TaskComment } from "../tasks/taskComment.model.js";
import { TaskStateHistory } from "../tasks/taskStateHistory.model.js";
import { WorkflowTemplate } from "../workflows/workflowTemplate.model.js";
import { WorkflowStage } from "../workflows/workflowStage.model.js";
import { WorkflowTransition } from "../workflows/workflowTransition.model.js";
import { PROJECT_CLIENT_ROLE_NAME } from "./projectRole.constants.js";

const DEFAULT_MODEL = process.env.GEMINI_MODEL || "gemini-flash-latest";
const DEFAULT_TEMPERATURE = Number(process.env.GEMINI_TEMPERATURE || 0.35);
const DEFAULT_MAX_OUTPUT_TOKENS = Number(process.env.GEMINI_MAX_OUTPUT_TOKENS || 700);

function normalizeText(value) {
  return String(value || "").trim();
}

function mapUser(user) {
  if (!user) return null;
  return {
    id: String(user._id || user.id || ""),
    name: user.name || "",
    avatar: user.avatar || "",
  };
}

function mapRole(role) {
  if (!role) return null;
  return {
    id: String(role._id || role.id || ""),
    name: role.name || "",
  };
}

function mapTask(task) {
  return {
    id: String(task._id),
    title: task.title,
    priority: task.priority,
    isBlocked: Boolean(task.isBlocked),
    blockedReason: task.blockedReason || "",
    deadline: task.deadline || null,
    category: task.categoryId
      ? {
          id: String(task.categoryId._id || task.categoryId.id || task.categoryId),
          name: task.categoryId.name || "",
          color: task.categoryId.color || "",
        }
      : null,
    workflow: task.workflowId
      ? {
          id: String(task.workflowId._id || task.workflowId.id || task.workflowId),
          name: task.workflowId.name || "",
        }
      : null,
    currentStage: task.currentStageId
      ? {
          id: String(task.currentStageId._id || task.currentStageId.id || task.currentStageId),
          name: task.currentStageId.name || "",
        }
      : null,
    updatedAt: task.updatedAt || null,
  };
}

function mapComment(comment) {
  return {
    id: String(comment._id),
    taskId: comment.taskId
      ? {
          id: String(comment.taskId._id || comment.taskId.id || comment.taskId),
          title: comment.taskId.title || "",
        }
      : null,
    user: mapUser(comment.user),
    content: comment.content || "",
    type: comment.type || "COMMENT",
    createdAt: comment.createdAt || null,
  };
}

function mapHistory(entry) {
  return {
    id: String(entry._id),
    taskId: entry.taskId
      ? {
          id: String(entry.taskId._id || entry.taskId.id || entry.taskId),
          title: entry.taskId.title || "",
        }
      : null,
    fromStage: entry.fromStage
      ? {
          id: String(entry.fromStage._id || entry.fromStage.id || entry.fromStage),
          name: entry.fromStage.name || "",
        }
      : null,
    toStage: entry.toStage
      ? {
          id: String(entry.toStage._id || entry.toStage.id || entry.toStage),
          name: entry.toStage.name || "",
        }
      : null,
    triggeredBy: mapUser(entry.triggeredBy),
    comment: entry.comment || "",
    wasDelayed: Boolean(entry.wasDelayed),
    enteredAt: entry.enteredAt || null,
    exitedAt: entry.exitedAt || null,
  };
}

function toGeminiRole(role) {
  return role === "assistant" ? "model" : "user";
}

function buildHistoryParts(history = []) {
  return history
    .filter((entry) => normalizeText(entry?.text))
    .slice(-8)
    .map((entry) => ({
      role: toGeminiRole(entry.role),
      parts: [{ text: normalizeText(entry.text) }],
    }));
}

async function buildProjectChatContext(projectId, userId) {
  if (!mongoose.Types.ObjectId.isValid(projectId)) {
    throw new Error("Invalid project id");
  }

  const project = await Project.findById(projectId)
    .select("_id name slug description avatar workspace createdBy isActive createdAt updatedAt")
    .lean();

  if (!project) {
    throw new Error("Project not found");
  }

  const workspaceMember = await WorkspaceMember.findOne({
    workspaceId: project.workspace,
    userId,
  }).lean();

  if (!workspaceMember) {
    throw new Error("Access denied");
  }

  const membership = await ProjectMember.findOne({
    project: project._id,
    user: userId,
  })
    .populate("roles", "name")
    .populate("user", "name email avatar")
    .lean();

  const roleNames = Array.isArray(membership?.roles)
    ? membership.roles.map((role) => String(role?.name || "").trim()).filter(Boolean)
    : [];

  const isProjectClient = roleNames.some(
    (roleName) => roleName.toLowerCase() === PROJECT_CLIENT_ROLE_NAME.toLowerCase()
  );

  if (!membership || !isProjectClient) {
    throw new Error("Project chat is reserved for project clients");
  }

  const projectObjectId = new mongoose.Types.ObjectId(project._id);
  const now = new Date();
  const workflowIds = await WorkflowTemplate.find({ projectId: projectObjectId }).distinct("_id");

  const [
    members,
    categories,
    workflows,
    tasks,
    comments,
    history,
    taskCount,
    blockedCount,
    overdueCount,
    categoryCount,
    workflowCount,
    stageCount,
    transitionCount,
    commentCount,
    historyCount,
    highPriorityCount,
    mediumPriorityCount,
    lowPriorityCount,
  ] = await Promise.all([
    ProjectMember.find({ project: projectObjectId })
      .populate("user", "name email avatar")
      .populate("roles", "name")
      .sort({ createdAt: 1 })
      .lean(),
    TaskCategory.find({ projectId: projectObjectId }).sort({ createdAt: -1 }).limit(6).lean(),
    WorkflowTemplate.find({ projectId: projectObjectId })
      .select("_id name description version isActive updatedAt")
      .sort({ updatedAt: -1 })
      .limit(5)
      .lean(),
    Task.find({ projectId: projectObjectId })
      .select(
        "_id title priority isBlocked blockedReason deadline categoryId workflowId currentStageId updatedAt"
      )
      .populate("categoryId", "name color")
      .populate("workflowId", "name")
      .populate("currentStageId", "name")
      .sort({ updatedAt: -1 })
      .limit(8)
      .lean(),
    TaskComment.find({ projectId: projectObjectId })
      .populate("taskId", "title")
      .populate("user", "name email avatar")
      .sort({ createdAt: -1 })
      .limit(8)
      .lean(),
    TaskStateHistory.find({ projectId: projectObjectId })
      .populate("taskId", "title")
      .populate("fromStage", "name")
      .populate("toStage", "name")
      .populate("triggeredBy", "name email avatar")
      .sort({ createdAt: -1 })
      .limit(8)
      .lean(),
    Task.countDocuments({ projectId: projectObjectId }),
    Task.countDocuments({ projectId: projectObjectId, isBlocked: true }),
    Task.countDocuments({
      projectId: projectObjectId,
      deadline: { $lt: now },
      isBlocked: false,
    }),
    TaskCategory.countDocuments({ projectId: projectObjectId }),
    workflowIds.length,
    WorkflowStage.countDocuments({
      workflowId: {
        $in: workflowIds,
      },
    }),
    WorkflowTransition.countDocuments({
      workflowId: {
        $in: workflowIds,
      },
    }),
    TaskComment.countDocuments({ projectId: projectObjectId }),
    TaskStateHistory.countDocuments({ projectId: projectObjectId }),
    Task.countDocuments({ projectId: projectObjectId, priority: "HIGH" }),
    Task.countDocuments({ projectId: projectObjectId, priority: "MEDIUM" }),
    Task.countDocuments({ projectId: projectObjectId, priority: "LOW" }),
  ]);

  const context = {
    project: {
      id: String(project._id),
      name: project.name || "",
      slug: project.slug || "",
      description: project.description || "",
      avatar: project.avatar || "",
      isActive: Boolean(project.isActive),
      createdAt: project.createdAt || null,
      updatedAt: project.updatedAt || null,
    },
    access: {
      workspaceRole: String(workspaceMember.role || "").toUpperCase(),
      projectRoleNames: roleNames,
      isProjectClient,
      viewer: {
        id: String(userId),
        name: membership?.user?.name || "",
      },
    },
    stats: {
      members: members.length,
      tasks: taskCount,
      blockedTasks: blockedCount,
      overdueTasks: overdueCount,
      categories: categoryCount,
      workflows: workflowCount,
      stages: stageCount,
      transitions: transitionCount,
      comments: commentCount,
      historyEntries: historyCount,
      byPriority: {
        high: highPriorityCount,
        medium: mediumPriorityCount,
        low: lowPriorityCount,
      },
    },
    members: members.slice(0, 10).map((member) => ({
      id: String(member._id),
      user: mapUser(member.user),
      roles: Array.isArray(member.roles) ? member.roles.map(mapRole).filter(Boolean) : [],
      joinedAt: member.joinedAt || null,
    })),
    categories: categories.map((category) => ({
      id: String(category._id),
      name: category.name || "",
      description: category.description || "",
      color: category.color || "",
      defaultWorkflowId: category.defaultWorkflowId || null,
    })),
    workflows: workflows.map((workflow) => ({
      id: String(workflow._id),
      name: workflow.name || "",
      description: workflow.description || "",
      version: workflow.version || 1,
      isActive: Boolean(workflow.isActive),
      updatedAt: workflow.updatedAt || null,
    })),
    recentTasks: tasks.map(mapTask),
    recentComments: comments.map(mapComment),
    recentHistory: history.map(mapHistory),
  };

  return {
    context,
    systemPrompt: [
      "You are Trego Project AI.",
      "You are speaking to a project client, so keep the response client-facing, concise, and practical.",
      "Answer only with the data supplied in the project context.",
      "If the project context does not contain the answer, say you do not have that information.",
      "Never reveal hidden internal ids, emails, or workspace-only data.",
      "Keep the response concise, practical, and friendly.",
      "Never mention workspace-wide or unrelated data.",
    ].join(" "),
  };
}

async function callGemini({ systemPrompt, history = [], message }) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set");
  }

  const model = process.env.GEMINI_MODEL || DEFAULT_MODEL;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-goog-api-key": apiKey,
    },
    body: JSON.stringify({
      systemInstruction: {
        parts: [
          {
            text: systemPrompt,
          },
        ],
      },
      contents: [
        ...buildHistoryParts(history),
        {
          role: "user",
          parts: [
            {
              text: normalizeText(message),
            },
          ],
        },
      ],
      generationConfig: {
        temperature: Number.isFinite(DEFAULT_TEMPERATURE) ? DEFAULT_TEMPERATURE : 0.35,
        maxOutputTokens: Number.isFinite(DEFAULT_MAX_OUTPUT_TOKENS) ? DEFAULT_MAX_OUTPUT_TOKENS : 700,
      },
    }),
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    const messageText = payload?.error?.message || "Gemini request failed";
    throw new Error(messageText);
  }

  const text = payload?.candidates?.[0]?.content?.parts
    ?.map((part) => part?.text || "")
    .join("")
    .trim();

  if (!text) {
    throw new Error("Gemini returned an empty response");
  }

  return {
    text,
    model,
  };
}

export async function generateProjectChatReply({ projectId, userId, message, history = [] }) {
  const trimmedMessage = normalizeText(message);

  if (!trimmedMessage) {
    throw new Error("Message is required");
  }

  const { context, systemPrompt } = await buildProjectChatContext(projectId, userId);
  const aiResponse = await callGemini({
    systemPrompt: `${systemPrompt}\n\nProject context:\n${JSON.stringify(context, null, 2)}`,
    history,
    message: trimmedMessage,
  });

  return {
    reply: aiResponse.text,
    model: aiResponse.model,
    context,
  };
}
