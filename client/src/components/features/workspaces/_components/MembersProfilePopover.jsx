import {
  Popover,
  Box,
  Avatar,
  Typography,
  Stack,
  Divider,
  Chip,
  CircularProgress,
  IconButton,
  Tooltip,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { callApi } from "../../../../api/api";
import { getImageUrl } from "../../../../utils/image.utils";

// Icons
import GitHubIcon from "@mui/icons-material/GitHub";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import FacebookIcon from "@mui/icons-material/Facebook";
import LanguageIcon from "@mui/icons-material/Language";

export const MemberProfilePopover = ({
  anchorEl,
  onClose,
  memberId,
}) => {
  const open = Boolean(anchorEl);

  const workspaceId = useSelector((state) => state.workspace._id);

  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!memberId || !workspaceId || !open) return;

    const fetchMember = async () => {
      try {
        setLoading(true);

        const res = await callApi({
          url: `/workspaces/members/profile`,
          method: "post",
          data: { userId: memberId, workspaceId },
          withCredentials: true,
        });

        if (res.success) {
          setMember(res.data.data);
        }
      } catch (err) {
        console.error("Failed to fetch member profile:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMember();
  }, [memberId, workspaceId, open]);

  if (!memberId) return null;

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
      PaperProps={{
        sx: {
          borderRadius: 3,
          width: 360,
          overflow: "hidden",
          boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
        },
      }}
    >
      <Box>

        {/* HEADER */}
        <Box sx={{ height: 90, bgcolor: "primary.main" }} />

        {/* AVATAR */}
        <Box sx={{ px: 3, mt: -5 }}>
          <Avatar
            src={getImageUrl(member?.avatar)}
            sx={{
              width: 76,
              height: 76,
              border: "3px solid white",
              fontSize: 28,
            }}
          >
            {member?.name?.[0]}
          </Avatar>
        </Box>

        {/* LOADING */}
        {loading && (
          <Box sx={{ p: 3, textAlign: "center" }}>
            <CircularProgress size={24} />
          </Box>
        )}

        {!loading && member && (
          <>
            {/* BASIC INFO */}
            <Box sx={{ px: 3, pt: 1.5, pb: 2 }}>
              <Stack spacing={1}>
                <Typography fontWeight={600} fontSize={18}>
                  {member.name}
                </Typography>

                <Stack direction="row" spacing={1} alignItems="center">
                  <Chip label={member.role} size="small" />

                  {member.availabilityStatus && (
                    <Typography variant="caption" color="text.secondary">
                      • {member.availabilityStatus}
                    </Typography>
                  )}
                </Stack>
              </Stack>
            </Box>

            <Divider />

            {/* ABOUT */}
            {member.about && (
              <Box sx={{ px: 3, py: 2 }}>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ lineHeight: 1.6 }}
                >
                  {member.about}
                </Typography>
              </Box>
            )}

            {/* SOCIAL ICONS */}
            {(member.githubUrl ||
              member.linkedinUrl ||
              member.facebookUrl ||
              member.websiteUrl) && (
              <>
                <Divider />
                <Box sx={{ px: 3, py: 2 }}>
                  <Stack direction="row" spacing={1}>

                    {member.githubUrl && (
                      <Tooltip title="GitHub">
                        <IconButton
                          size="small"
                          onClick={() => window.open(member.githubUrl, "_blank")}
                        >
                          <GitHubIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}

                    {member.linkedinUrl && (
                      <Tooltip title="LinkedIn">
                        <IconButton
                          size="small"
                          onClick={() => window.open(member.linkedinUrl, "_blank")}
                        >
                          <LinkedInIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}

                    {member.facebookUrl && (
                      <Tooltip title="Facebook">
                        <IconButton
                          size="small"
                          onClick={() => window.open(member.facebookUrl, "_blank")}
                        >
                          <FacebookIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}

                    {member.websiteUrl && (
                      <Tooltip title="Website">
                        <IconButton
                          size="small"
                          onClick={() => window.open(member.websiteUrl, "_blank")}
                        >
                          <LanguageIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}

                  </Stack>
                </Box>
              </>
            )}

            {/* MUTUAL WORKSPACES */}
            {member.mutualWorkspaces?.length > 0 && (
              <>
                <Divider />
                <Box sx={{ px: 3, py: 2 }}>
                  <Typography
                    variant="caption"
                    sx={{ fontWeight: 600, opacity: 0.7 }}
                  >
                    Mutual Workspaces
                  </Typography>

                  <Stack direction="row" alignItems="center" mt={1}>
                    <Stack direction="row" spacing={-1}>
                      {member.mutualWorkspaces.slice(0, 4).map((ws, index) => (
                        <Avatar
                          key={ws._id}
                          src={getImageUrl(ws.avatar)}
                          sx={{
                            width: 28,
                            height: 28,
                            fontSize: 12,
                            border: "2px solid white",
                            zIndex: 5 - index,
                          }}
                        >
                          {ws.name?.[0]}
                        </Avatar>
                      ))}
                    </Stack>

                    {member.mutualWorkspaces.length > 4 && (
                      <Typography
                        variant="caption"
                        sx={{ ml: 1, fontWeight: 600 }}
                      >
                        +{member.mutualWorkspaces.length - 4}
                      </Typography>
                    )}
                  </Stack>
                </Box>
              </>
            )}

            <Divider />

            {/* FOOTER */}
            <Box sx={{ px: 3, py: 2 }}>
              <Stack spacing={0.5}>
                <Typography variant="caption" color="text.secondary">
                  Joined{" "}
                  {member.joinedAt
                    ? new Date(member.joinedAt).toLocaleDateString()
                    : "-"}
                </Typography>
              </Stack>
            </Box>
          </>
        )}
      </Box>
    </Popover>
  );
};