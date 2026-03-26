

export const MARKETING_ROUTES = {
    home: "/", 
    about: "/about", 
}

export const AUTH_ROUTES = {
    signIn: '/sign-in',
    signUp: '/sign-up', 
    forgotPassword: '/forgot-password', 
    resetPassword: '/reset-password',
}


export const WORKSPACE_ROUTES = {
    workspaceMembers: "/workspaces", 
    workspace: (workspaceSlug) => `/workspaces/${workspaceSlug}`, 
    workspaceMembers: (workspaceSlug) => `/workspaces/${workspaceSlug}/members`, 
    workspaceRoles: (workspaceSlug) => `/workspaces/${workspaceSlug}/roles`, 
    workspaceSettings: (workspaceSlug) => `/workspaces/${workspaceSlug}/settings`, 
}

