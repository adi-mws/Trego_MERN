import { Box, Grid, Typography, Stack, Paper } from "@mui/material";

export default function AgentInActionSection() {
  const items = [
    "AI creates tasks from your goals",
    "Assigns work based on team capacity",
    "Reorders priorities automatically",
    "Detects blockers before they happen",
  ];

  return (
    <Box sx={{ py: 10 }}>
      <Stack spacing={2} textAlign="center" mb={6}>
        <Typography variant="h4" fontWeight={500}>
          AI That Actually Works For You
        </Typography>
        <Typography color="text.secondary">
          Not just suggestions — real execution.
        </Typography>
      </Stack>

      <Grid container spacing={3} justifyContent="center">
        {items.map((item, i) => (
          <Grid item xs={12} md={3} key={i}>
            <Paper
              sx={{
                p: 3,
                borderRadius: 3,
                height: "100%",
              }}
            >
              <Typography fontSize={14}>{item}</Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
