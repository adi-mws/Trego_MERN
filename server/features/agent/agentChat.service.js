import mongoose from "mongoose";
import { Workspace } from "../workspaces/workspace.model.js";
import { WorkspaceMember } from "../workspaces/workspaceMember.model.js";
import { Project } from "../projects/project.model.js";
import { ProjectMember } from "../projects/projectMember.model.js";
import { ProjectRole } from "../projects/projectRole.model.js";
import TaskCategory from "../tasks/taskCategory.model.js";
import { Task } from "../tasks/task.model.js";
import { TaskComment } from "../tasks/taskComment.model.js";
import { TaskStateHistory } from "../tasks/taskStateHistory.model.js";
import { WorkflowTemplate } from "../workflows/workflowTemplate.model.js";
import { WorkflowStage } from "../workflows/workflowStage.model.js";
import { WorkflowTransition } from "../workflows/workflowTransition.model.js";
import { AgentChat } from "./agentChat.model.js";

const DEFAULT_MODEL = process.env.GEMINI_MODEL || "gemini-flash-latest";
const DEFAULT_TEMPERATURE = Number(process.env.GEMINI_TEMPERATURE || 0.35);
const DEFAULT_MAX_OUTPUT_TOKENS = Number(process.env.GEMINI_MAX_OUTPUT_TOKENS || 700);
const ADMIN_ROLES = ["OWNER", "ADMIN"];

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

function mapMessage(message) {
  return {
    id: String(message._id || message.id || ""),
    role: message.role,
    text: message.text || "",
    meta: message.meta || "",
    createdAt: message.createdAt || null,
  };
}

function mapChat(chat) {
  const lastMessage = chat.messages?.length ? chat.messages[chat.messages.length - 1] : null;
  return {
    id: String(chat._id),
    workspaceId: String(chat.workspaceId || ""),
    userId: String(chat.userId || ""),
    title: chat.title || "New chat",
    scope: chat.scope || "workspace",
    mode: chat.mode || "ask",
    projectId: chat.projectId ? String(chat.projectId) : null,
    contexts: Array.isArray(chat.contexts) ? chat.contexts : [],
    messagesCount: Array.isArray(chat.messages) ? chat.messages.length : 0,
    lastMessageAt: chat.lastMessageAt || chat.updatedAt || null,
    updatedAt: chat.updatedAt || null,
    lastMessage: lastMessage ? mapMessage(lastMessage) : null,
  };
}

function toGeminiRole(role) {
  return role === "assistant" ? "model" : "user";
}

function buildHistoryParts(messages = []) {
  return messages
    .filter((entry) => normalizeText(entry?.text))
    .slice(-12)
    .map((entry) => ({
      role: toGeminiRole(entry.role),
      parts: [{ text: normalizeText(entry.text) }],
    }));
}

async function verifyWorkspaceAgentAccess(workspaceSlug, userId) {
  if (!workspaceSlug || !userId) {
    throw new Error("Workspace slug and user id are required");
  }

  const workspace = await Workspace.findOne({ slug: workspaceSlug }).lean();
  if (!workspace) {
    throw new Error("Workspace not found");
  }

  const membership = await WorkspaceMember.findOne({
    workspaceId: workspace._id,
    userId,
  }).lean();

  if (!membership) {
    throw new Error("Access denied");
  }

  const workspaceRole = String(membership.role || "").toUpperCase();
  if (!ADMIN_ROLES.includes(workspaceRole)) {
    throw new Error("Workspace agents are available only for owners and admins");
  }

  return { workspace, membership, workspaceRole };
}

function includeContextKey(payloadContexts = [], key) {
  if (!Array.isArray(payloadContexts) || payloadContexts.length === 0) return true;
  return payloadContexts.includes(key);
}

async function buildWorkspaceAgentContext({ workspace, userId, payload = {} }) {
  const {
    projectId = null,
    scope = "workspace",
    contexts = [],
  } = payload;

  const workspaceProjects = await Project.find({ workspace: workspace._id })
    .select("_id name slug description avatar isActive createdAt updatedAt")
    .sort({ updatedAt: -1 })
    .limit(12)
    .lean();

  const workspaceMemberCount = await WorkspaceMember.countDocuments({
    workspaceId: workspace._id,
  });

  const context = {
    workspace: {
      id: String(workspace._id),
      name: workspace.name || "",
      slug: workspace.slug || "",
      description: workspace.description || "",
      projectCount: workspaceProjects.length,
      memberCount: workspaceMemberCount,
    },
    scope,
    selectedProject: null,
    projects: workspaceProjects.map((project) => ({
      id: String(project._id),
      name: project.name || "",
      slug: project.slug || "",
      description: project.description || "",
      isActive: Boolean(project.isActive),
      updatedAt: project.updatedAt || null,
    })),
  };

  if (!projectId || scope === "workspace") {
    return context;
  }

  if (!mongoose.Types.ObjectId.isValid(projectId)) {
    throw new Error("Invalid project id");
  }

  const selectedProject = await Project.findOne({
    _id: projectId,
    workspace: workspace._id,
  })
    .select("_id name slug description avatar createdAt updatedAt isActive workspace")
    .lean();

  if (!selectedProject) {
    throw new Error("Project not found");
  }

  const includeProject = includeContextKey(contexts, "project");
  const includeMembers = includeContextKey(contexts, "members");
  const includeRoles = includeContextKey(contexts, "projectRoles");
  const includeTasks = includeContextKey(contexts, "tasks");
  const includeCategories = includeContextKey(contexts, "categories");
  const includeComments = includeContextKey(contexts, "comments");
  const includeHistory = includeContextKey(contexts, "stateHistory");
  const includeWorkflow = includeContextKey(contexts, "workflow");

  const projectObjectId = new mongoose.Types.ObjectId(selectedProject._id);
  const workflowIds = await WorkflowTemplate.find({ projectId: projectObjectId }).distinct("_id");

  const [
    members,
    roles,
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
  ] = await Promise.all([
    includeMembers
      ? ProjectMember.find({ project: projectObjectId })
          .populate("user", "name avatar")
          .populate("roles", "name")
          .sort({ createdAt: 1 })
          .limit(12)
          .lean()
      : Promise.resolve([]),
    includeRoles
      ? ProjectRole.find({ project: projectObjectId }).select("_id name").sort({ name: 1 }).lean()
      : Promise.resolve([]),
    includeCategories
      ? TaskCategory.find({ projectId: projectObjectId }).select("_id name description color defaultWorkflowId").sort({ createdAt: -1 }).limit(8).lean()
      : Promise.resolve([]),
    includeWorkflow
      ? WorkflowTemplate.find({ projectId: projectObjectId })
          .select("_id name description version isActive updatedAt")
          .sort({ updatedAt: -1 })
          .limit(6)
          .lean()
      : Promise.resolve([]),
    includeTasks
      ? Task.find({ projectId: projectObjectId })
          .select("_id title description priority isBlocked blockedReason deadline categoryId workflowId currentStageId updatedAt")
          .populate("categoryId", "name color")
          .populate("workflowId", "name")
          .populate("currentStageId", "name")
          .sort({ updatedAt: -1 })
          .limit(8)
          .lean()
      : Promise.resolve([]),
    includeComments
      ? TaskComment.find({ projectId: projectObjectId })
          .populate("taskId", "title")
          .populate("user", "name avatar")
          .sort({ createdAt: -1 })
          .limit(8)
          .lean()
      : Promise.resolve([]),
    includeHistory
      ? TaskStateHistory.find({ projectId: projectObjectId })
          .populate("taskId", "title")
          .populate("fromStage", "name")
          .populate("toStage", "name")
          .populate("triggeredBy", "name avatar")
          .sort({ createdAt: -1 })
          .limit(8)
          .lean()
      : Promise.resolve([]),
    includeTasks ? Task.countDocuments({ projectId: projectObjectId }) : Promise.resolve(0),
    includeTasks ? Task.countDocuments({ projectId: projectObjectId, isBlocked: true }) : Promise.resolve(0),
    includeTasks
      ? Task.countDocuments({
          projectId: projectObjectId,
          deadline: { $lt: new Date() },
          isBlocked: false,
        })
      : Promise.resolve(0),
    includeCategories ? TaskCategory.countDocuments({ projectId: projectObjectId }) : Promise.resolve(0),
    includeWorkflow ? Promise.resolve(workflowIds.length) : Promise.resolve(0),
    includeWorkflow
      ? WorkflowStage.countDocuments({ workflowId: { $in: workflowIds } })
      : Promise.resolve(0),
    includeWorkflow
      ? WorkflowTransition.countDocuments({ workflowId: { $in: workflowIds } })
      : Promise.resolve(0),
    includeComments ? TaskComment.countDocuments({ projectId: projectObjectId }) : Promise.resolve(0),
    includeHistory ? TaskStateHistory.countDocuments({ projectId: projectObjectId }) : Promise.resolve(0),
  ]);

  const contextDetails = {
    project: includeProject
      ? {
          id: String(selectedProject._id),
          name: selectedProject.name || "",
          slug: selectedProject.slug || "",
          description: selectedProject.description || "",
          avatar: selectedProject.avatar || "",
          isActive: Boolean(selectedProject.isActive),
          updatedAt: selectedProject.updatedAt || null,
        }
      : null,
    members: includeMembers
      ? members.map((member) => ({
          id: String(member._id),
          user: mapUser(member.user),
          roles: Array.isArray(member.roles) ? member.roles.map((role) => ({ id: String(role._id || role.id || ""), name: role.name || "" })) : [],
          joinedAt: member.joinedAt || null,
        }))
      : [],
    roles: includeRoles
      ? roles.map((role) => ({
          id: String(role._id),
          name: role.name || "",
        }))
      : [],
    categories: includeCategories
      ? categories.map((category) => ({
          id: String(category._id),
          name: category.name || "",
          description: category.description || "",
          color: category.color || "",
          defaultWorkflowId: category.defaultWorkflowId || null,
        }))
      : [],
    workflows: includeWorkflow
      ? workflows.map((workflow) => ({
          id: String(workflow._id),
          name: workflow.name || "",
          description: workflow.description || "",
          version: workflow.version || 1,
          isActive: Boolean(workflow.isActive),
          updatedAt: workflow.updatedAt || null,
        }))
      : [],
    tasks: includeTasks
      ? tasks.map((task) => ({
          id: String(task._id),
          title: task.title || "",
          description: task.description || "",
          priority: task.priority || "MEDIUM",
          isBlocked: Boolean(task.isBlocked),
          blockedReason: task.blockedReason || "",
          deadline: task.deadline || null,
          category: task.categoryId ? { id: String(task.categoryId._id || task.categoryId.id || task.categoryId), name: task.categoryId.name || "", color: task.categoryId.color || "" } : null,
          workflow: task.workflowId ? { id: String(task.workflowId._id || task.workflowId.id || task.workflowId), name: task.workflowId.name || "" } : null,
          currentStage: task.currentStageId ? { id: String(task.currentStageId._id || task.currentStageId.id || task.currentStageId), name: task.currentStageId.name || "" } : null,
          updatedAt: task.updatedAt || null,
        }))
      : [],
    comments: includeComments
      ? comments.map((comment) => ({
          id: String(comment._id),
          task: comment.taskId ? { id: String(comment.taskId._id || comment.taskId.id || comment.taskId), title: comment.taskId.title || "" } : null,
          user: mapUser(comment.user),
          content: comment.content || "",
          type: comment.type || "COMMENT",
          createdAt: comment.createdAt || null,
        }))
      : [],
    history: includeHistory
      ? history.map((entry) => ({
          id: String(entry._id),
          task: entry.taskId ? { id: String(entry.taskId._id || entry.taskId.id || entry.taskId), title: entry.taskId.title || "" } : null,
          fromStage: entry.fromStage ? { id: String(entry.fromStage._id || entry.fromStage.id || entry.fromStage), name: entry.fromStage.name || "" } : null,
          toStage: entry.toStage ? { id: String(entry.toStage._id || entry.toStage.id || entry.toStage), name: entry.toStage.name || "" } : null,
          triggeredBy: mapUser(entry.triggeredBy),
          comment: entry.comment || "",
          wasDelayed: Boolean(entry.wasDelayed),
          enteredAt: entry.enteredAt || null,
          exitedAt: entry.exitedAt || null,
        }))
      : [],
    stats: {
      tasks: taskCount,
      blockedTasks: blockedCount,
      overdueTasks: overdueCount,
      categories: categoryCount,
      workflows: workflowCount,
      stages: stageCount,
      transitions: transitionCount,
      comments: commentCount,
      historyEntries: historyCount,
    },
  };

  return {
    workspace,
    selectedProject,
    context: contextDetails,
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
        parts: [{ text: systemPrompt }],
      },
      contents: [
        ...buildHistoryParts(history),
        {
          role: "user",
          parts: [{ text: normalizeText(message) }],
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

function buildSystemPrompt({ workspace, selectedProject, context, payload }) {
  const projectName = selectedProject?.name || "workspace";
  return [
    "You are Trego Agent for workspace admins and owners.",
    "Speak like a concise, helpful internal assistant for admins and owners.",
    "Keep the response aligned to the selected workspace and project context only.",
    "Never invent data that is not present in the JSON context.",
    "Never reveal hidden ids or emails.",
    `Current scope: ${payload?.scope || "workspace"}.`,
    `Current mode: ${payload?.mode || "ask"}.`,
    `Selected project: ${projectName}.`,
    "Use the following JSON context as the source of truth:",
    JSON.stringify({ workspace, selectedProject, context }, null, 2),
  ].join("\n");
}

function deriveTitle(prompt, projectName = "") {
  const seed = normalizeText(prompt || projectName || "New chat");
  const title = seed.replace(/\s+/g, " ").slice(0, 48);
  return title || "New chat";
}

export async function listAgentChats({ workspaceSlug, userId }) {
  const { workspace } = await verifyWorkspaceAgentAccess(workspaceSlug, userId);

  const chats = await AgentChat.find({
    workspaceId: workspace._id,
    userId,
    archivedAt: null,
  })
    .sort({ updatedAt: -1 })
    .lean();

  return chats.map(mapChat);
}

export async function createAgentChat({ workspaceSlug, userId, title, scope, mode, projectId, contexts = [] }) {
  const { workspace } = await verifyWorkspaceAgentAccess(workspaceSlug, userId);

  const chat = await AgentChat.create({
    workspaceId: workspace._id,
    userId,
    title: normalizeText(title) || "New chat",
    scope: scope || "workspace",
    mode: mode || "ask",
    projectId: projectId || null,
    contexts: Array.isArray(contexts) ? contexts : [],
    messages: [],
    lastMessageAt: new Date(),
  });

  return mapChat(chat.toObject());
}

export async function getAgentChat({ workspaceSlug, userId, chatId }) {
  const { workspace } = await verifyWorkspaceAgentAccess(workspaceSlug, userId);

  const chat = await AgentChat.findOne({
    _id: chatId,
    workspaceId: workspace._id,
    userId,
    archivedAt: null,
  }).lean();

  if (!chat) {
    throw new Error("Chat not found");
  }

  return {
    ...mapChat(chat),
    messages: Array.isArray(chat.messages) ? chat.messages.map(mapMessage) : [],
  };
}

export async function sendAgentChatMessage({
  workspaceSlug,
  userId,
  chatId,
  payload = {},
}) {
  const { workspace, membership } = await verifyWorkspaceAgentAccess(workspaceSlug, userId);

  const chat = await AgentChat.findOne({
    _id: chatId,
    workspaceId: workspace._id,
    userId,
    archivedAt: null,
  });

  if (!chat) {
    throw new Error("Chat not found");
  }

  const prompt = normalizeText(payload.prompt);
  if (!prompt) {
    throw new Error("Prompt is required");
  }

  const scope = payload.scope || chat.scope || "workspace";
  const mode = payload.mode || chat.mode || "ask";
  const projectId = payload.projectId || chat.projectId || null;
  const contexts = Array.isArray(payload.contexts) ? payload.contexts : Array.isArray(chat.contexts) ? chat.contexts : [];
  const mentions = Array.isArray(payload.mentions) ? payload.mentions : [];

  if (!chat.title || chat.title === "New chat") {
    chat.title = deriveTitle(prompt, payload.projectName || "");
  }

  chat.scope = scope;
  chat.mode = mode;
  chat.projectId = projectId || null;
  chat.contexts = contexts;
  chat.lastMessageAt = new Date();

  const userMessage = {
    role: "user",
    text: prompt,
    meta: `You • ${new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`,
  };

  chat.messages.push(userMessage);
  const history = chat.messages.slice(-12).map((message) => ({
    role: message.role,
    text: message.text,
  }));

  const agentContext = await buildWorkspaceAgentContext({
    workspace,
    userId,
    payload: {
      projectId,
      scope,
      contexts,
    },
  });

  const systemPrompt = buildSystemPrompt({
    workspace: agentContext.workspace,
    selectedProject: agentContext.selectedProject,
    context: agentContext.context,
    payload,
  });

  const aiResponse = await callGemini({
    systemPrompt,
    history,
    message: prompt,
  });

  const assistantMessage = {
    role: "assistant",
    text: aiResponse.text,
    meta: `Gemini • ${new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`,
  };

  chat.messages.push(assistantMessage);

  if (chat.messages.length > 60) {
    chat.messages = chat.messages.slice(-60);
  }

  await chat.save();

  return {
    chat: {
      ...mapChat(chat.toObject()),
      messages: chat.messages.map(mapMessage),
    },
    context: agentContext.context,
    model: aiResponse.model,
    prompt,
    mentions,
    workspaceRole: membership.role,
  };
}

export async function archiveAgentChat({ workspaceSlug, userId, chatId }) {
  const { workspace } = await verifyWorkspaceAgentAccess(workspaceSlug, userId);

  const chat = await AgentChat.findOneAndUpdate(
    { _id: chatId, workspaceId: workspace._id, userId, archivedAt: null },
    { $set: { archivedAt: new Date() } },
    { new: true }
  );

  if (!chat) {
    throw new Error("Chat not found");
  }

  return mapChat(chat.toObject());
}
