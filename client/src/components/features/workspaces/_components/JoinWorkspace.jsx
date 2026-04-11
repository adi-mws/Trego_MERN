import React, { useEffect, useState } from "react";
import { Box, Typography, Button, CircularProgress } from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import { callApi } from "../../../../api/api";
import { WORKSPACE_ROUTES } from "../../../../lib/routes";

export default function JoinWorkspace() {
    const { inviteCode } = useParams();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        const joinWorkspace = async () => {
            setLoading(true);

            const res = await callApi({
                method: "post",
                url: `/workspaces/join/${inviteCode}`,
            });

            if (res.success) {
                setSuccess(true);

                setTimeout(() => {
                    navigate(`${WORKSPACE_ROUTES.workspace(res.data.workspaceSlug)}`);
                }, 1500);
            } else {
                setError(res.error.message || "Invalid invite");
                console.error(error);

                if (res?.status === 401) {
                    navigate(`/sign-in?redirect=/join/workspace/${inviteCode}`);
                    return;
                }

            }

            setLoading(false);
        }

        if (inviteCode) {
            joinWorkspace();
        }
    }, [inviteCode]);

    return (
        <Box
            sx={{
                minHeight: "100vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                px: 2,
            }}
        >
            <Box
                sx={{
                    p: 4,
                    borderRadius: 3,
                    border: "1px solid",
                    borderColor: "divider",
                    textAlign: "center",
                    maxWidth: 400,
                    width: "100%",
                }}
            >
                {/* 🔄 LOADING */}
                {loading && (
                    <>
                        <CircularProgress />
                        <Typography mt={2}>Joining workspace...</Typography>
                    </>
                )}

                {/* ❌ ERROR */}
                {!loading && error && (
                    <>
                        <Typography color="error" fontWeight={600}>
                            {error}
                        </Typography>

                        <Button
                            variant="contained"
                            sx={{ mt: 2 }}
                            onClick={() => navigate("/")}
                        >
                            Go Home
                        </Button>
                    </>
                )}

                {/* ✅ SUCCESS */}
                {!loading && success && (
                    <>
                        <Typography color="success.main" fontWeight={600}>
                            Successfully joined workspace
                        </Typography>

                        <Typography variant="body2" mt={1}>
                            Redirecting...
                        </Typography>
                    </>
                )}
            </Box>
        </Box>
    );
}