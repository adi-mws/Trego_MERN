import { createSlice } from '@reduxjs/toolkit'

function normalizeProjects(projects) {
  if (Array.isArray(projects)) return projects
  if (!projects) return []

  if (Array.isArray(projects.items)) return projects.items
  if (Array.isArray(projects.projects)) return projects.projects

  if (typeof projects === "object") {
    return Object.values(projects).filter((item) => item && typeof item === "object")
  }

  return []
}

const initialState = {
  currentWorkspace: null,
  name: null,
  _id: null,
  role: null,
  slug: null,
  avatar: null,
  members: [],
  projects: [],
  invites: [],
  totalMembers: 0,
  isLoading: false,
  error: null,
}

const workspaceSlice = createSlice({
  name: 'workspace',
  initialState,

  reducers: {
    setWorkspace: (state, action) => {
      const ws = action.payload

      state.currentWorkspace = ws
      state.name = ws?.name || null
      state.slug = ws?.slug || null
      state.role = ws?.currentUserRole || null
      state.avatar = ws?.avatar || null
      state._id = ws?._id || null
      state.members = ws?.members || []
      state.invites = ws?.invites || []
      state.projects = normalizeProjects(ws?.projects)
      state.totalMembers = ws?.totalMembers || 0
      state.isLoading = false
      state.error = null;
    },

    setLoading: (state, action) => {
      state.isLoading = action.payload
    },

    setError: (state, action) => {
      state.error = action.payload
      state.isLoading = false
    },



    clearWorkspace: (state) => {
      state.currentWorkspace = null
      state.members = []
      state.projects = []
      state.invites = []
      state._id = null
      state.role = null
      state.avatar = null
      state.name = null
      state.slug = null
      state.isLoading = false
      state.error = null
      state.totalMembers = 0
    },

    updateMemberRoleGlobal: (state, action) => {
      const { userId, role } = action.payload;

      state.members = state.members.map((member) =>
        member.user?._id === userId || member._id === userId
          ? { ...member, role }
          : member
      );
    },
    updateRole: (state, action) => {
      const { role, userId } = action.payload;
      member.role = role;
    
    },

    addMember: (state, action) => {
      const newMember = action.payload;

      const exists = state.members.some(
        (m) => m.user?._id === newMember.user?._id || m._id === newMember._id
      );

      if (!exists) {
        state.members.unshift(newMember);
        state.totalMembers += 1;
      }
    },

    removeMember: (state, action) => {
      const userId = action.payload;

      state.members = state.members.filter(
        (m) => m.user?._id !== userId && m._id !== userId
      );

      state.totalMembers = Math.max(0, state.totalMembers - 1);
    },


    addProject: (state, action) => {
      const payload = action.payload;

      if (!payload) return;

      const projectsToAdd = normalizeProjects(payload);

      projectsToAdd.forEach((project) => {
        const exists = state.projects.some(
          (p) => p._id === project._id
        );

        if (!exists) {
          state.projects.unshift(project);
        }
      });
    },

    setProjects: (state, action) => {
      state.projects = normalizeProjects(action.payload);
    },
  },
})

export const {
  setWorkspace,
  setLoading,
  setError,
  clearWorkspace,
  updatedMemberRoleGlobal,
  addMember,
  removeMember,
  addProject,
  setProjects,
} = workspaceSlice.actions

export default workspaceSlice.reducer
