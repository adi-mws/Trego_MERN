import { useState } from "react";
import { PieChart } from "@mui/x-charts/PieChart";
import { useTheme } from "@mui/material/styles";
import { Chip, Card, Box, Typography, Fade } from "@mui/material";
import CheckCircleOutline from "@mui/icons-material/CheckCircleOutline";
import { Warning } from "@mui/icons-material";
import { useEffect } from "react";
function TasksDoughnut({ data }) {
    const theme = useTheme();
    const chartData = [
        { id: 0, value: data.completed || 0, label: "Completed", color: theme.palette.success.main },
        { id: 1, value: data.pending || 0, label: "Pending", color: theme.palette.warning.main },
        { id: 2, value: data.delayed || 0, label: "Delayed", color: theme.palette.error.main },
    ];
    return (
        <PieChart
            series={[
                {
                    data: chartData,
                    innerRadius: 70,
                    outerRadius: 124,
                    cornerRadius: 5,
                    startAngle: -90,
                    endAngle: 90,
                    cx: 151,
                    cy: 120,
                },
            ]}
            hideLegend={{ hidden: true }}
            height={120}
            width={300}

        />
    );
}

export default function TasksStatusDoughnutChart({ data }) {
    const [status, setStatus] = useState("completed");
    const [fade, setFade] = useState(true);

    useEffect(() => {
        let counter = 0;

        const interval = setInterval(() => {
            if (!data) return;

            // trigger fade out first
            setFade(false);

            setTimeout(() => {
                const entries = ["completed", "pending", "delayed"];
                counter = (counter + 1) % entries.length; // loop infinitely
                setStatus(entries[counter]);
                setFade(true);
            }, 300);
        }, 3000);

        return () => clearInterval(interval);
    }, [data]);

    const getChipProps = () => {
        switch (status) {
            case "completed":
                return {
                    label: `${data.completed} Tasks completed`,
                    icon: <CheckCircleOutline />,
                    color: "success",
                    variant: "outlined",
                };
            case "pending":
                return {
                    label: `${data.pending} Tasks pending`,
                    icon: <Warning />,
                    color: "warning",
                    variant: "outlined",
                };
            case "delayed":
                return {
                    label: `${data.delayed} Tasks delayed`,
                    icon: <Warning />,
                    color: "error",
                    variant: "outlined",
                };
            default:
                return { label: "Loading...", color: "default" };
        }
    };
    
    return (
        <Card
            variant="outlined"
            sx={{ width: "100%", height: "100%", borderRadius: 2, p: 1 }}
        >
            <Typography
                variant="body2"
                color="text.secondary"
                sx={{ fontSize: 12, mx: 2, my: 1 }}
            >
                Task Status
            </Typography>
            <TasksDoughnut data={data} />
            <Box sx={{display: 'flex', justifyContent: 'center'}}>
                <Fade in={fade} timeout={500} key={status}>
                    <Chip {...getChipProps()} sx={{ alignSelf: "center", mx: 2, my: 2 }} />
                </Fade>
            </Box>
        </Card>
    );
}