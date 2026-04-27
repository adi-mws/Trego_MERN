import { useState } from "react";
import { Box, useMediaQuery, useTheme } from "@mui/material";
import { useParams } from "react-router-dom";
import MembersSidebar from "./MembersSidebar";
import ProjectSidebar from "../../features/projects/_components/ProjectSidebar";

export default function RightSidebar() {
    const { projectSlug } = useParams();
    const isProjectView = Boolean(projectSlug);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

    const [activePanel, setActivePanel] = useState(() =>
        isProjectView ? "project" : "members"
    );

    return (
        <Box
            sx={{
                height: "100dvh",
                maxHeight: "100dvh",
                width: "fit-content",
                minHeight: 0,
                overflow: "hidden",
                display: "flex",
                justifyContent: "flex-end",
                flexShrink: 0,
                alignSelf: "stretch",
            }}
        >
            {isProjectView ? (
                activePanel === "project" ? (
                    <ProjectSidebar
                        forceCollapsed={isMobile}
                        onOpenMembers={() => setActivePanel("members")}
                    />
                ) : (
                    <MembersSidebar
                        forceCollapsed={isMobile}
                        onBack={() => setActivePanel("project")}
                    />
                )
            ) : (
                <MembersSidebar forceCollapsed={isMobile} />
            )}
        </Box>
    );
}
