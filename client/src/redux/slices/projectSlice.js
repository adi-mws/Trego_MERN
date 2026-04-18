import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  currentProject: null,

  _id: null,
  name: null,
  slug: null,
  avatar: null,
  role: null,
  description: null,

  memberships: [],
  totalMembers: 0,

  isLoading: false,
  error: null,
};

const projectSlice = createSlice({
  name: "project",
  initialState,

  reducers: {
    setProject: (state, action) => {
      const payload = action.payload;

      state.currentProject = project;

      state._id = payload?.project?._id || null;
      state.name = payload?.project?.name || null;
      state.slug = payload?.project?.slug || null;
      state.avatar = payload?.project?.avatar || null;
      state.description = payload?.project?.description || null
      // TODO: to check that whether the data is setting correctly or not
      state.role = payload?.currentUserRole || null;

      state.memberships = project?.memberships || [];
      state.totalMembers = project?.totalMembers || 0;

      state.isLoading = false;
      state.error = null;
    },

    setMemberships: (state, action) => {
      state.memberships = action.payload || [];
      state.totalMembers = action.payload?.length || 0;
    },

    addMembership: (state, action) => {
      state.memberships.unshift(action.payload);
      state.totalMembers += 1;
    },

    removeMembership: (state, action) => {
      state.memberships = state.memberships.filter(
        (m) => m.user !== action.payload // userId
      );
      state.totalMembers -= 1;
    },

    updateMembershipRole: (state, action) => {
      const { userId, role } = action.payload;

      const member = state.memberships.find(
        (m) => m.user === userId
      );

      if (member) {
        member.role = role;
      }
    },

    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },

    setError: (state, action) => {
      state.error = action.payload;
      state.isLoading = false;
    },

    clearProject: (state) => {
      Object.assign(state, initialState);
    },
  },
});

export const {
  setProject,
  setMemberships,
  addMembership,
  removeMembership,
  updateMembershipRole,
  setLoading,
  setError,
  clearProject,
} = projectSlice.actions;

export default projectSlice.reducer;