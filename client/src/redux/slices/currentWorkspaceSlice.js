import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  currentWorkspace: null,
  name: null, 
  slug: null,
  avatar: null, 
  members: [],
  totalMembers: 0,
  isLoading: false,
  error: null,
}

const currentWorkspaceSlice = createSlice({
  name: 'workspace',
  initialState,

  reducers: {
    setWorkspace: (state, action) => {
      const ws = action.payload

      state.currentWorkspace = ws
      state.name = ws?.name || null
      state.slug = ws?.slug || null
      state.avatar = ws?.avatar || null
      state.members = ws?.members || []
      state.totalMembers = ws?.totalMembers || 0
      state.isLoading = false
      state.error = null
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
      state.avatar = null   
      state.name = null
      state.slug = null 
      state.isLoading = false
      state.error = null
      state.totalMembers = 0
    },
  },
})

export const {
  setWorkspace,
  setLoading,
  setError,
  clearWorkspace,
} = currentWorkspaceSlice.actions

export default currentWorkspaceSlice.reducer