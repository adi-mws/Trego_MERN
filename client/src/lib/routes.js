

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



export const NOTIFICATION_ROUTES = {
    root: '/app/notifications',
}

export const APP_ROUTES = {
    root: '/app'
}


export const WORKSPACE_ROUTES = {
    workspace: (workspaceSlug) => `${APP_ROUTES.root}/${workspaceSlug}`, 
    workspaceMembers: (workspaceSlug) => `${APP_ROUTES.root}/${workspaceSlug}/members`, 
    workspaceRoles: (workspaceSlug) => `${APP_ROUTES.root}/${workspaceSlug}/roles`, 
    workspaceSettings: (workspaceSlug) => `${APP_ROUTES.root}/${workspaceSlug}/settings`, 
}



