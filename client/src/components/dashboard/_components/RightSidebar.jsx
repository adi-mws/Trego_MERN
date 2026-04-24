import { useState, useEffect } from "react";
import { Box } from "@mui/material";
import { useParams } from "react-router-dom";
import MembersSidebar from "./MembersSidebar";
import ProjectSidebar from "../../features/projects/_components/ProjectSidebar";

export default function RightSidebar() {
    const { projectSlug } = useParams();
    const isProjectView = Boolean(projectSlug);

    const [activePanel, setActivePanel] = useState("members");

    // sync when route changes
    useEffect(() => {
        if (isProjectView) {
            setActivePanel("project"); 
        } else {
            setActivePanel("members");
        }
    }, [isProjectView]);

    return (
        <Box sx={{ height: "100%", minHeight: 0, overflow: "hidden" }}>
            {isProjectView ? (
                activePanel === "project" ? (
                    <ProjectSidebar
                        onOpenMembers={() => setActivePanel("members")}
                    />
                ) : (
                    <MembersSidebar
                        onBack={() => setActivePanel("project")}
                    />
                )
            ) : (
                <MembersSidebar />
            )}
        </Box>
    );
}
