

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


export const PROJECT_ROUTES = {
    overview: (workspaceSlug, projectSlug) => `${WORKSPACE_ROUTES.workspace(workspaceSlug)}/projects/${projectSlug}`,
    projectSettings: (workspaceSlug, projectSlug) => `${WORKSPACE_ROUTES.workspace(workspaceSlug)}/projects/${projectSlug}/settings`,
    projectMembers: (workspaceSlug, projectSlug) => `${WORKSPACE_ROUTES.workspace(workspaceSlug)}/projects/${projectSlug}/members`,
    projectRoles: (workspaceSlug, projectSlug) => `${WORKSPACE_ROUTES.workspace(workspaceSlug)}/projects/${projectSlug}/roles`,
    projectTasks: (workspaceSlug, projectSlug) => `${WORKSPACE_ROUTES.workspace(workspaceSlug)}/projects/${projectSlug}/tasks`,
    projectTaskBoard: (workspaceSlug, projectSlug) => `${WORKSPACE_ROUTES.workspace(workspaceSlug)}/projects/${projectSlug}/board`,
    projectWorkflow: (workspaceSlug, projectSlug) => `${WORKSPACE_ROUTES.workspace(workspaceSlug)}/projects/${projectSlug}/workflow`,
    projectGantt: (workspaceSlug, projectSlug) => `${WORKSPACE_ROUTES.workspace(workspaceSlug)}/projects/${projectSlug}/gantt`,
    projectTaskStateHistory: (workspaceSlug, projectSlug) => `${WORKSPACE_ROUTES.workspace(workspaceSlug)}/projects/${projectSlug}/task-state-history`,
    projectTimeline: (workspaceSlug, projectSlug) => `${WORKSPACE_ROUTES.workspace(workspaceSlug)}/projects/${projectSlug}/timeline`,
}
