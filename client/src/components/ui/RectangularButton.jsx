import {
  Button,
  Stack,
  Typography,
} from "@mui/material";

export default function RectangularButton({
  icon,
  text,
  sx,
  ...props
}) {
  return (
    <Button
      {...props}
      disableRipple
      disableElevation
      sx={{
        p: 3,
        minWidth: 250,
        minHeight: 130,
        borderRadius: 2, // rectangular, not pill
        backgroundColor: "background.paper",
        color: "text.primary",
        textTransform: "none",
        boxShadow: 0,
        border: "1px solid",
        borderColor: "divider",

        "&:hover": {
          backgroundColor: "action.hover",
        },

        ...sx,
      }}
    >
      <Stack
        direction="column"
        spacing={2}
        alignItems="center"
        justifyContent="center"
      >
        {icon}

        <Typography
          variant="body2"
          fontSize={15}
          fontWeight={300}
          textAlign="center"
        >
          {text}
        </Typography>
      </Stack>
    </Button>
  );
}
