import {
  Card,
  Box,
  Typography,
  LinearProgress,
  Chip,
  Stack,
} from "@mui/material"
import {
  TrendingUp as TrendingUpIcon,
  WarningAmber as WarningIcon,
  CheckCircle as CheckIcon,
} from "@mui/icons-material"

export const ProfileCompletedCard = () => {
  const profileCompleted = 15.5 // from backend

  // Dynamic state
  const getprofileCompletedMeta = () => {
    if (profileCompleted >= 85)
      return {
        label: "Excellent",
        color: "success",
        icon: <CheckIcon fontSize="small" />,
        gradient: "linear-gradient(90deg, #00c853, #69f0ae)",
      }
    if (profileCompleted >= 60)
      return {
        label: "Moderate",
        color: "warning",
        icon: <WarningIcon fontSize="small" />,
        gradient: "linear-gradient(90deg, #ffb300, #ffd54f)",
      }

    return {
      label: "Critical",
      color: "error",
      icon: <WarningIcon fontSize="small" />,
      gradient: "linear-gradient(90deg, #d32f2f, #ff5252)",
    }
  }

  const meta = getprofileCompletedMeta()

  return (
    <Card
      sx={{
        p: 3,
        borderRadius: 4,
        position: "relative",
        overflow: "hidden",
        transition: "0.3s",
        background: "linear-gradient(135deg, #1e1e2f, #2a2a40)",
        color: "#fff",
        "&:hover": {
          transform: "translateY(-5px)",
          boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
        },
      }}
    >
      {/* Top Glow Effect */}
      <Box
        sx={{
          position: "absolute",
          top: -40,
          right: -40,
          width: 120,
          height: 120,
          background: meta.gradient,
          opacity: 0.2,
          borderRadius: "50%",
          filter: "blur(40px)",
        }}
      />

      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="h6" fontWeight={600}>
          Workspace profileCompleted
        </Typography>

        <Chip
          icon={meta.icon}
          label={meta.label}
          color={meta.color}
          size="small"
          sx={{ fontWeight: 600 }}
        />
      </Stack>

      {/* Main Value */}
      <Box mt={3}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Typography variant="h2" fontWeight={800}>
            {profileCompleted}
          </Typography>
          <Typography variant="h5" sx={{ opacity: 0.7 }}>
            %
          </Typography>
        </Stack>

        {/* Progress Bar */}
        <Box mt={2}>
          <LinearProgress
            variant="determinate"
            value={profileCompleted}
            sx={{
              height: 12,
              borderRadius: 6,
              backgroundColor: "rgba(255,255,255,0.1)",
              "& .MuiLinearProgress-bar": {
                borderRadius: 6,
                background: meta.gradient,
              },
            }}
          />
        </Box>
      </Box>

      {/* Footer Insight */}
      <Stack direction="row" alignItems="center" spacing={1} mt={3}>
        <TrendingUpIcon fontSize="small" sx={{ opacity: 0.7 }} />
        <Typography variant="body2" sx={{ opacity: 0.8 }}>
          profileCompletedy with minor delays in testing stage
        </Typography>
      </Stack>
    </Card>
  )
}