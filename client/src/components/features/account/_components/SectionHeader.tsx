import {
    Stack,
    Typography
} from "@mui/material";


function SectionHeader({
    title,
    description,
}: {
    title: string;
    description?: string;
}) {
    return (
        <Stack spacing={0.3} mb={2}>
            <Typography fontWeight={600}>{title}</Typography>
            {description && (
                <Typography fontSize={14} color="text.secondary">
                    {description}
                </Typography>
            )}
        </Stack>
    );
}

export default SectionHeader;